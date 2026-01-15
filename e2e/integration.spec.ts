import { test, expect, type Page } from '@playwright/test'
import { setupApiMocks, resetMockData } from './mocks/api-mock'

/**
 * 共通ヘルパー: モック付きログイン処理
 */
async function loginWithMock(page: Page) {
    await setupApiMocks(page)
    await page.goto('/login')
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'password')
    await page.click('button:has-text("ログイン")')
    await page.waitForURL('/')
}

/**
 * 結合テスト（モック使用）
 */
test.describe('結合テスト', () => {
    test.beforeEach(async () => {
        resetMockData()
    })

    test.describe('エンドツーエンドフロー', () => {
        test('完全フロー: ログイン→ドキュメント選択→プロンプト選択', async ({ page }) => {
            await loginWithMock(page)

            // ドキュメント選択
            await page.click('.v-select:has-text("文書を選択")')
            await page.click('.v-list-item:first-child')
            await expect(page.locator('text=サマリー')).toBeVisible()

            // プロンプト選択
            await page.click('.v-select:has-text("プロンプトを選択")')
            await page.click('.v-list-item:first-child')
            await expect(page.locator('.v-textarea')).toBeVisible()

            // 生成ボタンが有効になる
            await expect(page.locator('button:has-text("一括生成")')).toBeEnabled()
        })

        test('ログアウト→再ログインできる', async ({ page }) => {
            await loginWithMock(page)
            await expect(page.locator('text=ドキュメント')).toBeVisible()

            await page.click('button:has(.mdi-logout)')
            await expect(page).toHaveURL(/.*login/)

            await setupApiMocks(page)
            await page.fill('input[type="text"]', 'admin')
            await page.fill('input[type="password"]', 'password')
            await page.click('button:has-text("ログイン")')
            await expect(page.locator('text=ドキュメント')).toBeVisible()
        })
    })

    test.describe('レイアウト', () => {
        test('3カラムレイアウトが表示される', async ({ page }) => {
            await loginWithMock(page)
            await expect(page.locator('text=ドキュメント')).toBeVisible()
            await expect(page.locator('text=プロンプト')).toBeVisible()
            await expect(page.locator('text=生成')).toBeVisible()
        })
    })

    test.describe('コンポーネント連携', () => {
        test('ドキュメント選択でプロンプトエリアが有効化', async ({ page }) => {
            await loginWithMock(page)

            // 初期状態ではプロンプト選択不可の可能性
            await page.click('.v-select:has-text("文書を選択")')
            await page.click('.v-list-item:first-child')

            // プロンプト選択が可能になる
            const promptSelect = page.locator('.v-select:has-text("プロンプトを選択")')
            await expect(promptSelect).toBeEnabled()
        })
    })

    test.describe('エラー処理', () => {
        test('無効な認証情報でエラー表示', async ({ page }) => {
            await setupApiMocks(page)
            await page.goto('/login')
            await page.fill('input[type="text"]', 'invalid')
            await page.fill('input[type="password"]', 'invalid')
            await page.click('button:has-text("ログイン")')

            await expect(page.locator('.v-alert')).toBeVisible({ timeout: 5000 })
        })
    })
})
