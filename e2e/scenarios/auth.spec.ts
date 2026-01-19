/**
 * 認証シナリオテスト
 * 
 * ベストプラクティス:
 * - 各テストが独立
 * - ハッピーパス + エラーケースの網羅
 * - 各テストにbefore/afterエビデンス
 */
import { test, expect } from '@playwright/test'
import { runTest, createReporter, TEST_USER, logoutViaUI, loginViaUI, loginAndSetup } from '../lib'

const reporter = createReporter()

test.describe('認証シナリオ', () => {
    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ============================================
    // ログインシナリオ
    // ============================================

    test('AUTH-01: ログイン失敗 - 無効な認証情報', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('AUTH-01', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-01', 'after')

        await runTest(reporter, page, {
            id: 'AUTH-01',
            name: 'ログイン失敗 - 無効な認証情報',
            description: '無効なユーザー名/パスワードでログインできないこと',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            await page.goto('/login')
            await page.getByLabel('ユーザー名').fill('wrong_user')
            await page.getByLabel('パスワード', { exact: true }).fill('wrong_pass')

            // エビデンス: ログインボタンクリック前
            await page.screenshot({ path: beforePath, fullPage: true })

            await page.getByRole('button', { name: 'ログイン' }).click()

            // ログインページに留まること
            await expect(page).toHaveURL(/.*login/)

            // エビデンス: ログインボタンクリック後（エラー状態）
            await page.screenshot({ path: afterPath, fullPage: true })
        })
    })

    test('AUTH-02: ログインボタン無効 - ユーザー名空', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('AUTH-02', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-02', 'after')

        await runTest(reporter, page, {
            id: 'AUTH-02',
            name: 'ログインボタン無効 - ユーザー名空',
            description: 'ユーザー名が空の場合、ログインボタンが無効であること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            await page.goto('/login')
            // ユーザー名は空のまま
            await page.getByLabel('パスワード', { exact: true }).fill('somepass')

            // エビデンス: 入力状態
            await page.screenshot({ path: beforePath, fullPage: true })

            // ログインボタンが無効であることを確認
            await expect(page.getByRole('button', { name: 'ログイン' })).toBeDisabled()

            // エビデンス: ボタン無効状態
            await page.screenshot({ path: afterPath, fullPage: true })
        })
    })

    test('AUTH-03: ログインボタン無効 - パスワード空', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('AUTH-03', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-03', 'after')

        await runTest(reporter, page, {
            id: 'AUTH-03',
            name: 'ログインボタン無効 - パスワード空',
            description: 'パスワードが空の場合、ログインボタンが無効であること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            await page.goto('/login')
            await page.getByLabel('ユーザー名').fill('someuser')
            // パスワードは空のまま

            // エビデンス: 入力状態
            await page.screenshot({ path: beforePath, fullPage: true })

            // ログインボタンが無効であることを確認
            await expect(page.getByRole('button', { name: 'ログイン' })).toBeDisabled()

            // エビデンス: ボタン無効状態
            await page.screenshot({ path: afterPath, fullPage: true })
        })
    })

    test('AUTH-04: ログイン成功', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('AUTH-04', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-04', 'after')

        await runTest(reporter, page, {
            id: 'AUTH-04',
            name: 'ログイン成功',
            description: '正しい認証情報でログインし、メイン画面が表示されること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            await loginViaUI(page, {
                beforePath,
                afterPath,
            })
            // メイン画面が表示されていること
            await expect(page.locator('.document-column')).toBeVisible()
        })
    })

    // ============================================
    // セッションシナリオ
    // ============================================

    test('AUTH-05: セッション維持 - リロード後もログイン状態', async ({ page }) => {
        // セットアップ: ログイン
        await loginAndSetup(page)

        const beforePath = reporter.getScreenshotPath('AUTH-05', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-05', 'after')

        await runTest(reporter, page, {
            id: 'AUTH-05',
            name: 'セッション維持',
            description: 'リロードしてもログイン状態が維持されること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            // エビデンス: リロード前
            await page.screenshot({ path: beforePath, fullPage: true })

            await page.reload()
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })

            // エビデンス: リロード後
            await page.screenshot({ path: afterPath, fullPage: true })
        })
    })

    // ============================================
    // ログアウトシナリオ
    // ============================================

    test('AUTH-06: ログアウト成功', async ({ page }) => {
        // セットアップ: ログイン
        await loginAndSetup(page)

        const beforePath = reporter.getScreenshotPath('AUTH-06', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-06', 'after')

        await runTest(reporter, page, {
            id: 'AUTH-06',
            name: 'ログアウト成功',
            description: 'ログアウトしてログイン画面に戻ること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            await logoutViaUI(page, {
                beforePath,
                afterPath,
            })
            // ログインページにいること
            await expect(page).toHaveURL(/.*login/)
        })
    })
})
