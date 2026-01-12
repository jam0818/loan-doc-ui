import { test, expect, type Page } from '@playwright/test'

/**
 * 共通ヘルパー: ログイン処理
 */
async function login(page: Page, username = 'admin', password = 'password') {
    await page.goto('/login')
    await page.fill('input[type="text"], input:has-text("ユーザー名")', username)
    await page.fill('input[type="password"]', password)
    await page.click('button:has-text("ログイン")')
    // ログイン後のリダイレクトを待機
    await page.waitForURL('/')
}

/**
 * 認証テスト
 */
test.describe('認証機能', () => {
    test('ログインページが表示される', async ({ page }) => {
        await page.goto('/login')
        await expect(page.locator('text=文書生成アプリケーション')).toBeVisible()
        await expect(page.locator('input:has-text("ユーザー名"), input[type="text"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()
        await expect(page.locator('button:has-text("ログイン")')).toBeVisible()
    })

    test('未認証時はログインページにリダイレクトされる', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveURL(/.*login/)
    })

    test('ログイン後にメイン画面が表示される', async ({ page }) => {
        await login(page)
        await expect(page.locator('text=ドキュメント')).toBeVisible()
        await expect(page.locator('text=プロンプト')).toBeVisible()
    })

    test('ログアウトするとログインページに戻る', async ({ page }) => {
        await login(page)
        await page.click('button[aria-label*="logout"], button:has(svg.mdi-logout)')
        await expect(page).toHaveURL(/.*login/)
    })
})
