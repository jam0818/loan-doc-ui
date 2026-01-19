/**
 * 認証シナリオ スケルトン (7テスト)
 * 
 * チェックリスト準拠: docs/test-scenarios-checklist.md
 */
import { test, expect } from '@playwright/test'
import { createReporter, loginAndSetup, loginViaUI, logoutViaUI, TEST_USER } from '../lib'

const reporter = createReporter()

test.describe('認証シナリオ', () => {
    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ===== 正常系 =====

    test('AUTH-01: ログイン成功', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('AUTH-01', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-01', 'after')

        await page.goto('http://localhost:3000')
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: user1/password入力 → ログイン ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: メイン画面に遷移
        // await expect(page.getByText('ドキュメント')).toBeVisible()

        reporter.addResult({
            id: 'AUTH-01', category: '認証', name: 'ログイン成功',
            description: '有効な認証情報でログインできること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('AUTH-02: セッション維持', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('AUTH-02', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-02', 'after')

        await loginAndSetup(page)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: ページをリロード ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ログイン状態維持
        // await expect(page.getByText('user1')).toBeVisible()

        reporter.addResult({
            id: 'AUTH-02', category: '認証', name: 'セッション維持',
            description: 'リロード後もログイン状態が維持されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('AUTH-03: ログアウト成功', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('AUTH-03', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-03', 'after')

        await loginAndSetup(page)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: ログアウトボタンクリック ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ログイン画面に遷移
        // await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()

        reporter.addResult({
            id: 'AUTH-03', category: '認証', name: 'ログアウト成功',
            description: 'ログアウトしてログイン画面に遷移すること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 異常系・境界値 =====

    test('AUTH-04: ログイン失敗', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('AUTH-04', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-04', 'after')

        await page.goto('http://localhost:3000')
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: invalid/wrong入力 → ログイン ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: エラーメッセージ表示
        // await expect(page.getByText('認証失敗')).toBeVisible()

        reporter.addResult({
            id: 'AUTH-04', category: '認証', name: 'ログイン失敗',
            description: '無効な認証情報でエラーが表示されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('AUTH-05: ボタン無効（ユーザー名空）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('AUTH-05', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-05', 'after')

        await page.goto('http://localhost:3000')
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: パスワードのみ入力 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ボタンdisabled
        // await expect(page.getByRole('button', { name: 'ログイン' })).toBeDisabled()

        reporter.addResult({
            id: 'AUTH-05', category: '認証', name: 'ボタン無効（ユーザー名空）',
            description: 'ユーザー名が空の場合ログインボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('AUTH-06: ボタン無効（パスワード空）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('AUTH-06', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-06', 'after')

        await page.goto('http://localhost:3000')
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: ユーザー名のみ入力 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ボタンdisabled
        // await expect(page.getByRole('button', { name: 'ログイン' })).toBeDisabled()

        reporter.addResult({
            id: 'AUTH-06', category: '認証', name: 'ボタン無効（パスワード空）',
            description: 'パスワードが空の場合ログインボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('AUTH-07: ボタン無効（両方空）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('AUTH-07', 'before')
        const afterPath = reporter.getScreenshotPath('AUTH-07', 'after')

        await page.goto('http://localhost:3000')
        await page.screenshot({ path: beforePath, fullPage: true })

        // 何も入力しない状態

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ボタンdisabled
        // await expect(page.getByRole('button', { name: 'ログイン' })).toBeDisabled()

        reporter.addResult({
            id: 'AUTH-07', category: '認証', name: 'ボタン無効（両方空）',
            description: '両方空の場合ログインボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })
})
