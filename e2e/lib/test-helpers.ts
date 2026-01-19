/**
 * テストヘルパー関数
 *
 * Playwrightテストで共通で使用するヘルパー関数
 * 実API使用、UIログイン形式
 */

import { test, expect, type Page } from '@playwright/test'
import { TestReporter } from './test-reporter'

/**
 * テスト用認証情報
 */
export const TEST_USER = {
    username: 'user1',
    password: 'pass1',
}

/**
 * テスト実行設定
 */
export interface TestConfig {
    /** テストID（例: '1.1', '2.3'）*/
    id: string
    /** カテゴリ名（省略時はtest.describeから自動取得）*/
    category?: string
    /** テスト名 */
    name: string
    /** テストの説明 */
    description: string
    /** スクリーンショットのステップ名（省略時はスクリーンショットなし）*/
    screenshotStep?: string
    /** FAIL時もテストを継続するか（デフォルト: false）*/
    continueOnFail?: boolean
}

/**
 * UIを使ってログインする
 */
export async function loginViaUI(page: Page, username: string = TEST_USER.username, password: string = TEST_USER.password): Promise<void> {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByLabel('ユーザー名').fill(username)
    await page.getByLabel('パスワード').fill(password)
    await page.getByRole('button', { name: 'ログイン' }).click()
    // ログイン完了を待つ（メインページに遷移するまで）
    await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })
}

/**
 * ログイン済みの状態でメインページに移動
 */
export async function goToMainPageLoggedIn(page: Page): Promise<void> {
    await page.goto('/')
    // 未認証ならログインページにリダイレクトされるので、ログインする
    if (page.url().includes('/login')) {
        await loginViaUI(page)
    } else {
        // 既に認証済みなら3カラムが表示されるのを待つ
        await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })
    }
}

/**
 * テスト実行ヘルパー
 *
 * テストロジックを実行し、結果を自動記録
 * FAIL時もスクリーンショットを撮影し、Excelに記録
 */
export async function runTest(
    reporter: TestReporter,
    page: Page,
    config: TestConfig,
    testFn: () => Promise<void>
): Promise<void> {
    // Playwrightのテスト情報から親describe名を取得
    const testInfo = test.info()
    const category = config.category
        ?? testInfo.titlePath[1]
        ?? testInfo.titlePath[0]?.replace(/\.spec\.ts$/, '')
        ?? 'テスト'

    let status: 'PASS' | 'FAIL' = 'FAIL'
    let screenshotPath: string | undefined
    let error: string | undefined

    try {
        await testFn()
        status = 'PASS'
    } catch (e) {
        error = String(e)
        status = 'FAIL'
    }

    // スクリーンショット撮影（PASS/FAIL両方で撮影）
    if (config.screenshotStep) {
        try {
            screenshotPath = reporter.getScreenshotPath(config.id, config.screenshotStep)
            await page.screenshot({ path: screenshotPath, fullPage: true })
        } catch (e) {
            console.error(`スクリーンショット撮影エラー: ${e}`)
        }
    }

    // 結果を記録（FAIL時も必ず記録）
    reporter.addResult({
        id: config.id,
        category,
        name: config.name,
        description: config.description,
        status,
        screenshotPath,
        error,
    })

    // continueOnFailがtrueでない場合、FAILならPlaywrightエラーをスロー
    if (!config.continueOnFail) {
        expect(status, `テスト失敗: ${error}`).toBe('PASS')
    }
}

/**
 * 共通レポーター設定
 */
export function createReporter(): TestReporter {
    return new TestReporter({
        outputDir: 'test-results',
        screenshotDir: 'test-results/screenshots',
        reportPrefix: 'e2e-test-report',
        embedImages: true,
        useFixedFileName: true,
        persistResults: true,
    })
}
