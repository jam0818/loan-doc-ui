/**
 * 認証機能テスト（ライブラリ使用版）
 *
 * TestReporterライブラリを使用してExcelレポートを生成
 */

import { test, expect, type Page } from '@playwright/test'
import { TestReporter } from './lib/test-reporter'

// レポーターインスタンス（固定ファイル名 + 永続化で統合）
const reporter = new TestReporter({
    outputDir: 'test-results',
    screenshotDir: 'test-results/screenshots',
    reportPrefix: 'e2e-test-report',
    embedImages: true,
    useFixedFileName: true,   // 固定ファイル名（上書き）
    persistResults: true,     // 結果をJSONに保存・読み込み
})

/**
 * テスト実行ヘルパー
 *
 * テストロジックを実行し、結果を自動記録
 */
async function runTest(
    page: Page,
    config: {
        id: string
        category: string
        name: string
        description: string
        screenshotStep?: string
    },
    testFn: () => Promise<void>
): Promise<void> {
    let status: 'PASS' | 'FAIL' = 'FAIL'
    let screenshotPath: string | undefined
    let error: string | undefined

    try {
        await testFn()
        status = 'PASS'
    } catch (e) {
        error = String(e)
    }

    // スクリーンショット撮影
    if (config.screenshotStep) {
        screenshotPath = reporter.getScreenshotPath(config.id, config.screenshotStep)
        await page.screenshot({ path: screenshotPath, fullPage: true })
    }

    reporter.addResult({
        id: config.id,
        category: config.category,
        name: config.name,
        description: config.description,
        status,
        screenshotPath,
        error,
    })

    expect(status).toBe('PASS')
}

/**
 * 認証機能テスト
 */
test.describe('認証機能テスト', () => {
    test.afterAll(async () => {
        await reporter.generateReport()
    })

    test('1.1 ログインページ表示', async ({ page }) => {
        await runTest(page, {
            id: '1.1',
            category: '認証機能',
            name: 'ログインページ表示',
            description: 'ログインページが正しく表示される',
            screenshotStep: 'login_page',
        }, async () => {
            await page.goto('/login')
            await expect(page.locator('text=文書生成アプリケーション')).toBeVisible({ timeout: 10000 })
        })
    })

    test('1.2 空フィールドでボタン無効', async ({ page }) => {
        await runTest(page, {
            id: '1.2',
            category: '認証機能',
            name: '空フィールド無効',
            description: '入力欄が空の場合ログインボタンが無効',
            screenshotStep: 'empty_fields',
        }, async () => {
            await page.goto('/login')
            await expect(page.locator('button:has-text("ログイン")')).toBeDisabled()
        })
    })

    test('1.3 ログイン情報入力', async ({ page }) => {
        await runTest(page, {
            id: '1.3',
            category: '認証機能',
            name: 'ログイン情報入力',
            description: 'ユーザー名とパスワードを入力するとボタンが有効',
            screenshotStep: 'filled_fields',
        }, async () => {
            await page.goto('/login')
            await page.fill('input[type="text"]', 'admin')
            await page.fill('input[type="password"]', 'password')
            await expect(page.locator('button:has-text("ログイン")')).toBeEnabled()
        })
    })

    test('1.4 ログインボタンクリック', async ({ page }) => {
        await runTest(page, {
            id: '1.4',
            category: '認証機能',
            name: 'ログインボタンクリック',
            description: 'ログインボタンをクリックできる',
            screenshotStep: 'after_click',
        }, async () => {
            await page.goto('/login')
            await page.fill('input[type="text"]', 'admin')
            await page.fill('input[type="password"]', 'password')
            await page.click('button:has-text("ログイン")')
            await page.waitForTimeout(2000)
        })
    })
})
