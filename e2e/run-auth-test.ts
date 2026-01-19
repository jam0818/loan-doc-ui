/**
 * 認証テスト実行スクリプト（ライブラリ使用版）
 *
 * TestReporterライブラリを使用してテスト実行+Excel出力
 *
 * 実行: bun e2e/run-auth-test.ts
 */

import { chromium, type Page } from 'playwright'
import { TestReporter } from './lib/test-reporter'

// レポーター初期化
const reporter = new TestReporter({
    outputDir: 'test-results',
    screenshotDir: 'test-results/screenshots',
    reportPrefix: 'auth-test-report',
    embedImages: true,
    imageSize: { width: 400, height: 180 },
    rowHeight: 150,
})

/**
 * テスト実行ヘルパー
 */
async function runTest(
    page: Page,
    config: {
        id: string
        category: string
        name: string
        description: string
        screenshotStep: string
    },
    testFn: () => Promise<boolean>
): Promise<void> {
    console.log(`\n--- ${config.id} ${config.name} ---`)

    let status: 'PASS' | 'FAIL' = 'FAIL'
    let screenshotPath: string | undefined
    let error: string | undefined

    try {
        const result = await testFn()
        status = result ? 'PASS' : 'FAIL'
    } catch (e) {
        error = String(e)
    }

    // スクリーンショット撮影
    screenshotPath = reporter.getScreenshotPath(config.id, config.screenshotStep)
    await page.screenshot({ path: screenshotPath, fullPage: true })

    reporter.addResult({
        id: config.id,
        category: config.category,
        name: config.name,
        description: config.description,
        status,
        screenshotPath,
        error,
    })
}

/**
 * メイン実行
 */
async function main() {
    console.log('🚀 認証テスト開始\n')

    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    try {
        // 1.1 ログインページ表示
        await runTest(page, {
            id: '1.1',
            category: '認証機能',
            name: 'ログインページ表示',
            description: 'ログインページが正しく表示される',
            screenshotStep: 'login_page',
        }, async () => {
            await page.goto('http://localhost:3000/login')
            await page.waitForSelector('text=文書生成アプリケーション', { timeout: 10000 })
            return true
        })

        // 1.2 空フィールドでボタン無効
        await runTest(page, {
            id: '1.2',
            category: '認証機能',
            name: '空フィールド無効',
            description: '入力欄が空の場合ログインボタンが無効',
            screenshotStep: 'empty_fields',
        }, async () => {
            await page.goto('http://localhost:3000/login')
            const button = page.locator('button:has-text("ログイン")')
            return await button.isDisabled()
        })

        // 1.3 ログイン情報入力
        await runTest(page, {
            id: '1.3',
            category: '認証機能',
            name: 'ログイン情報入力',
            description: 'ユーザー名とパスワードを入力するとボタンが有効',
            screenshotStep: 'filled_fields',
        }, async () => {
            await page.goto('http://localhost:3000/login')
            await page.fill('input[type="text"]', 'admin')
            await page.fill('input[type="password"]', 'password')
            const button = page.locator('button:has-text("ログイン")')
            return await button.isEnabled()
        })

        // 1.4 ログインボタンクリック
        await runTest(page, {
            id: '1.4',
            category: '認証機能',
            name: 'ログインボタンクリック',
            description: 'ログインボタンをクリックできる',
            screenshotStep: 'after_click',
        }, async () => {
            await page.goto('http://localhost:3000/login')
            await page.fill('input[type="text"]', 'admin')
            await page.fill('input[type="password"]', 'password')
            await page.click('button:has-text("ログイン")')
            await page.waitForTimeout(2000)
            return true
        })

    } finally {
        await browser.close()
    }

    // Excelレポート生成
    await reporter.generateReport()
}

main().catch(console.error)
