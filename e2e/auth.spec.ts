import { test, expect, type Page } from '@playwright/test'
import { setupApiMocks, resetMockData } from './mocks/api-mock'

/**
 * 共通ヘルパー: モック付きログイン処理
 */
async function loginWithMock(page: Page, username = 'admin', password = 'password') {
    await setupApiMocks(page)
    await page.goto('/login')
    await page.fill('input[type="text"]', username)
    await page.fill('input[type="password"]', password)
    await page.click('button:has-text("ログイン")')
    await page.waitForURL('/')
}

/**
 * 認証テスト（モック使用）
 */
test.describe('認証機能', () => {
    test.beforeEach(async () => {
        resetMockData()
    })

    // ============================================
    // 未認証状態 - ログインページ
    // ============================================
    test.describe('未認証状態 - ログインページ', () => {
        test('ログインページが正しく表示される', async ({ page }) => {
            await page.goto('/login')
            await expect(page.locator('text=文書生成アプリケーション')).toBeVisible()
            await expect(page.locator('input').first()).toBeVisible()
            await expect(page.locator('input[type="password"]')).toBeVisible()
            await expect(page.locator('button:has-text("ログイン")')).toBeVisible()
        })

        test('未認証時にメインページにアクセスするとログインページにリダイレクト', async ({ page }) => {
            await page.goto('/')
            await expect(page).toHaveURL(/.*login/)
        })
    })

    // ============================================
    // 未認証状態 - フォーム入力
    // ============================================
    test.describe('未認証状態 - フォーム入力', () => {
        test('有効な認証情報でログイン成功', async ({ page }) => {
            await loginWithMock(page)
            await expect(page.locator('text=ドキュメント')).toBeVisible()
            await expect(page.locator('text=プロンプト')).toBeVisible()
        })

        test('無効な認証情報でエラーメッセージが表示される', async ({ page }) => {
            await setupApiMocks(page)
            await page.goto('/login')
            await page.fill('input[type="text"]', 'invalid_user')
            await page.fill('input[type="password"]', 'wrong_password')
            await page.click('button:has-text("ログイン")')

            // エラーメッセージの確認
            await expect(page.locator('.v-alert')).toBeVisible({ timeout: 5000 })
        })

        test('空のフィールドではログインボタンが無効', async ({ page }) => {
            await page.goto('/login')

            const loginButton = page.locator('button:has-text("ログイン")')
            await expect(loginButton).toBeDisabled()

            await page.fill('input[type="text"]', 'admin')
            await expect(loginButton).toBeDisabled()

            await page.fill('input[type="text"]', '')
            await page.fill('input[type="password"]', 'password')
            await expect(loginButton).toBeDisabled()

            await page.fill('input[type="text"]', 'admin')
            await expect(loginButton).toBeEnabled()
        })

        test('パスワード表示/非表示を切り替えられる', async ({ page }) => {
            await page.goto('/login')
            await page.fill('input[type="password"]', 'secret123')

            const passwordInput = page.locator('input[type="password"]')
            await expect(passwordInput).toBeVisible()

            // 目のアイコンをクリック
            await page.click('.v-field__append-inner button, button:has(.mdi-eye)')

            // パスワードが表示される
            const textInput = page.locator('input[type="text"]').last()
            await expect(textInput).toHaveValue('secret123')
        })
    })

    // ============================================
    // 認証済み状態
    // ============================================
    test.describe('認証済み状態', () => {
        test('認証済み時にログインページにアクセスするとメインにリダイレクト', async ({ page }) => {
            await loginWithMock(page)
            await page.goto('/login')
            await expect(page).toHaveURL('/')
        })

        test('ヘッダーにユーザー名が表示される', async ({ page }) => {
            await loginWithMock(page, 'testuser', 'password')
            // Vuetifyのchipにユーザー名が表示される
            await expect(page.locator('.v-chip')).toContainText(/testuser|ユーザー/)
        })

        test('ログアウトするとログインページに戻る', async ({ page }) => {
            await loginWithMock(page)
            await page.click('button:has(.mdi-logout)')
            await expect(page).toHaveURL(/.*login/)
        })

        test('ログアウト後は保護されたページにアクセスできない', async ({ page }) => {
            await loginWithMock(page)
            await expect(page.locator('text=ドキュメント')).toBeVisible()

            await page.click('button:has(.mdi-logout)')
            await expect(page).toHaveURL(/.*login/)

            await page.goto('/')
            await expect(page).toHaveURL(/.*login/)
        })
    })

    // ============================================
    // セッション永続化
    // ============================================
    test.describe('セッション永続化', () => {
        test('ページリロード後も認証状態が維持される', async ({ page }) => {
            await loginWithMock(page)
            await expect(page.locator('text=ドキュメント')).toBeVisible()

            await page.reload()
            // リロード後もモックを再設定
            await setupApiMocks(page)

            await expect(page.locator('text=ドキュメント')).toBeVisible()
            await expect(page).not.toHaveURL(/.*login/)
        })

        test('LocalStorageにトークンが保存される', async ({ page }) => {
            await loginWithMock(page)

            const token = await page.evaluate(() => {
                return localStorage.getItem('loan-doc-ui:auth_token')
            })

            expect(token).not.toBeNull()
        })

        test('ログアウト後はLocalStorageからトークンが削除される', async ({ page }) => {
            await loginWithMock(page)

            let token = await page.evaluate(() => {
                return localStorage.getItem('loan-doc-ui:auth_token')
            })
            expect(token).not.toBeNull()

            await page.click('button:has(.mdi-logout)')

            token = await page.evaluate(() => {
                return localStorage.getItem('loan-doc-ui:auth_token')
            })
            expect(token).toBeNull()
        })
    })
})
