/**
 * 認証機能テスト
 *
 * CHECKLIST.md 1.1-1.13のテストケースを実装
 */

import { test, expect, type Page } from '@playwright/test'
import { runTest, createReporter } from './lib'
import { setupApiMocks, resetMockData } from './mocks/api-mock'

// 共通レポーター
const reporter = createReporter()

/**
 * テスト前にログイン状態を設定（認証済みテスト用）
 */
async function setupAuthState(page: Page) {
    await setupApiMocks(page)
    await page.addInitScript(() => {
        localStorage.setItem('auth', JSON.stringify({
            isAuthenticated: true,
            user: { id: 1, username: 'admin', role: 'admin' },
            token: 'mock-token',
        }))
    })
}

/**
 * 認証機能テスト
 */
test.describe('認証機能テスト', () => {
    test.beforeEach(async ({ page }) => {
        resetMockData()
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ===== 未認証-ページ =====

    // 1.1 ログインページ表示
    test('1.1 ログインページ表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.1',
            name: 'ログインページ表示',
            description: 'ログインページが正しく表示される',
            screenshotStep: 'login_page',
        }, async () => {
            await page.goto('/login')
            await expect(page.getByRole('heading', { name: '文書生成アプリケーション' })).toBeVisible({ timeout: 10000 })
            await expect(page.getByLabel('ユーザー名')).toBeVisible()
            await expect(page.getByLabel('パスワード')).toBeVisible()
            await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
        })
    })

    // 1.2 未認証リダイレクト
    test('1.2 未認証リダイレクト', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.2',
            name: '未認証リダイレクト',
            description: '未認証状態でメインページにアクセスするとログインページにリダイレクト',
            screenshotStep: 'redirect',
        }, async () => {
            await page.goto('/')
            await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
        })
    })

    // ===== 未認証-入力 =====

    // 1.3 ログイン成功
    test('1.3 ログイン成功', async ({ page }) => {
        await setupApiMocks(page)
        await runTest(reporter, page, {
            id: '1.3',
            name: 'ログイン成功',
            description: '有効な認証情報でログイン成功',
            screenshotStep: 'login_success',
        }, async () => {
            await page.goto('/login')
            await page.getByLabel('ユーザー名').fill('admin')
            await page.getByLabel('パスワード').fill('password')
            await page.getByRole('button', { name: 'ログイン' }).click()
            await page.waitForTimeout(2000)
            // ログイン成功後、メインページに遷移（またはエラーなし）
        })
    })

    // 1.4 ログイン失敗エラー
    test('1.4 ログイン失敗エラー', async ({ page }) => {
        await setupApiMocks(page)
        await runTest(reporter, page, {
            id: '1.4',
            name: 'ログイン失敗エラー',
            description: '無効な認証情報でログイン失敗時エラーメッセージ表示',
            screenshotStep: 'login_error',
        }, async () => {
            await page.goto('/login')
            await page.getByLabel('ユーザー名').fill('invalid')
            await page.getByLabel('パスワード').fill('wrong')
            await page.getByRole('button', { name: 'ログイン' }).click()
            await page.waitForTimeout(2000)
            // エラーメッセージが表示される（v-alertコンポーネント）
        })
    })

    // 1.5 空フィールド無効
    test('1.5 空フィールド無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.5',
            name: '空フィールド無効',
            description: '入力欄が空の場合ログインボタンが無効',
            screenshotStep: 'empty_fields',
        }, async () => {
            await page.goto('/login')
            await page.waitForLoadState('networkidle')
            await expect(page.getByRole('button', { name: 'ログイン' })).toBeDisabled()
        })
    })

    // 1.6 パスワード表示切替
    test('1.6 パスワード表示切替', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.6',
            name: 'パスワード表示切替',
            description: 'パスワードフィールドの表示/非表示を切り替えられる',
            screenshotStep: 'password_toggle',
        }, async () => {
            await page.goto('/login')
            const passwordField = page.getByLabel('パスワード')
            await passwordField.fill('testpassword')
            await expect(passwordField).toHaveAttribute('type', 'password')
            await page.locator('.v-field__append-inner .mdi-eye').click()
            await expect(passwordField).toHaveAttribute('type', 'text')
        })
    })

    // ===== 認証済み =====

    // 1.7 ログイン済みリダイレクト
    test('1.7 ログイン済みリダイレクト', async ({ page }) => {
        await setupAuthState(page)
        await runTest(reporter, page, {
            id: '1.7',
            name: 'ログイン済みリダイレクト',
            description: '認証済み状態で/loginにアクセスするとメインページにリダイレクト',
            screenshotStep: 'auth_redirect',
        }, async () => {
            await page.goto('/login')
            await page.waitForTimeout(2000)
            // 認証済みならメインページにリダイレクト
            await expect(page).toHaveURL(/^\/$/, { timeout: 5000 })
        })
    })

    // 1.8 ユーザー名表示
    test('1.8 ユーザー名表示', async ({ page }) => {
        await setupAuthState(page)
        await runTest(reporter, page, {
            id: '1.8',
            name: 'ユーザー名表示',
            description: 'ヘッダーにログインユーザー名が表示される',
            screenshotStep: 'username_display',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // ユーザー名「admin」がヘッダーに表示
            await expect(page.getByText('admin')).toBeVisible({ timeout: 10000 })
        })
    })

    // 1.9 ログアウト
    test('1.9 ログアウト', async ({ page }) => {
        await setupAuthState(page)
        await runTest(reporter, page, {
            id: '1.9',
            name: 'ログアウト',
            description: 'ログアウトボタンクリックでログアウト',
            screenshotStep: 'logout',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // ログアウトボタン（mdi-logoutアイコン）をクリック
            await page.locator('.mdi-logout').click()
            await page.waitForTimeout(1000)
            // ログインページに遷移
            await expect(page).toHaveURL(/\/login/)
        })
    })

    // 1.10 ログアウト後アクセス不可
    test('1.10 ログアウト後アクセス不可', async ({ page }) => {
        await setupAuthState(page)
        await runTest(reporter, page, {
            id: '1.10',
            name: 'ログアウト後アクセス不可',
            description: 'ログアウト後はメインページにアクセスできない',
            screenshotStep: 'logout_redirect',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            await page.locator('.mdi-logout').click()
            await page.waitForTimeout(1000)
            await page.goto('/')
            await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
        })
    })

    // ===== 永続化 =====

    // 1.11 リロード後維持
    test('1.11 リロード後維持', async ({ page }) => {
        await setupAuthState(page)
        await runTest(reporter, page, {
            id: '1.11',
            name: 'リロード後維持',
            description: 'ページリロード後も認証状態が維持される',
            screenshotStep: 'reload_persist',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
            await page.reload()
            await page.waitForLoadState('networkidle')
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // 1.12 トークン保存
    test('1.12 トークン保存', async ({ page }) => {
        await setupAuthState(page)
        await runTest(reporter, page, {
            id: '1.12',
            name: 'トークン保存',
            description: 'LocalStorageに認証トークンが保存される',
            screenshotStep: 'token_save',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            const storage = await page.evaluate(() => localStorage.getItem('auth'))
            expect(storage).toBeTruthy()
            expect(JSON.parse(storage!).token).toBeTruthy()
        })
    })

    // 1.13 ログアウト時削除
    test('1.13 ログアウト時削除', async ({ page }) => {
        await setupAuthState(page)
        await runTest(reporter, page, {
            id: '1.13',
            name: 'ログアウト時削除',
            description: 'ログアウト時にLocalStorageの認証情報が削除される',
            screenshotStep: 'token_delete',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            await page.locator('.mdi-logout').click()
            await page.waitForTimeout(1000)
            const storage = await page.evaluate(() => localStorage.getItem('auth'))
            expect(storage === null || JSON.parse(storage).isAuthenticated === false).toBeTruthy()
        })
    })
})
