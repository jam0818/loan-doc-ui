/**
 * 複数テスト統合実行スクリプト
 *
 * 複数のテストカテゴリを順次実行し、1つのExcelレポートに統合
 *
 * 実行: bun e2e/run-all-tests.ts
 *
 * オプション:
 *   --clear  既存の結果をクリアしてから実行
 */

import { chromium, type Page } from 'playwright'
import { TestReporter } from './lib/test-reporter'

// コマンドライン引数の解析
const args = process.argv.slice(2)
const shouldClear = args.includes('--clear')

// レポーター初期化（永続化+固定ファイル名）
const reporter = new TestReporter({
    outputDir: 'test-results',
    screenshotDir: 'test-results/screenshots',
    reportPrefix: 'integrated-test-report',
    embedImages: true,
    useFixedFileName: true,     // 固定ファイル名（上書き）
    persistResults: true,       // 結果をJSONに保存・読み込み
})

// --clear オプションで既存結果をクリア
if (shouldClear) {
    reporter.clearSavedResults()
}

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
 * 認証機能テスト
 */
async function runAuthTests(page: Page) {
    console.log('\n=== 認証機能テスト ===')

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
}

/**
 * UI表示テスト（追加テストの例）
 */
async function runUITests(page: Page) {
    console.log('\n=== UI表示テスト ===')

    await runTest(page, {
        id: '2.1',
        category: 'UI表示',
        name: 'タイトル表示',
        description: 'アプリケーションタイトルが表示される',
        screenshotStep: 'title',
    }, async () => {
        await page.goto('http://localhost:3000/login')
        const title = await page.locator('text=文書生成アプリケーション').isVisible()
        return title
    })

    await runTest(page, {
        id: '2.2',
        category: 'UI表示',
        name: '入力フォーム表示',
        description: 'ユーザー名とパスワードの入力欄が表示される',
        screenshotStep: 'form',
    }, async () => {
        await page.goto('http://localhost:3000/login')
        const username = await page.locator('input[type="text"]').isVisible()
        const password = await page.locator('input[type="password"]').isVisible()
        return username && password
    })
}

/**
 * メイン実行
 */
async function main() {
    console.log('🚀 統合テスト開始\n')
    console.log(`📊 現在の結果数: ${reporter.getResults().length}件`)

    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    try {
        // 各カテゴリのテストを実行
        await runAuthTests(page)
        await runUITests(page)
    } finally {
        await browser.close()
    }

    // Excelレポート生成（結果も自動保存）
    await reporter.generateReport()
}

main().catch(console.error)
