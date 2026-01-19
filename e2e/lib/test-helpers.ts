/**
 * テストヘルパー関数
 *
 * Playwrightテストで共通で使用するヘルパー関数
 */

import { test, expect, type Page } from '@playwright/test'
import { TestReporter } from './test-reporter'

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
 * テスト実行ヘルパー
 *
 * テストロジックを実行し、結果を自動記録
 * FAIL時もスクリーンショットを撮影し、Excelに記録
 *
 * @param reporter - TestReporterインスタンス
 * @param page - Playwrightのページオブジェクト
 * @param config - テスト設定
 * @param testFn - テストロジック（成功時はvoid、失敗時は例外をスロー）
 */
export async function runTest(
    reporter: TestReporter,
    page: Page,
    config: TestConfig,
    testFn: () => Promise<void>
): Promise<void> {
    // Playwrightのテスト情報から親describe名を取得
    // titlePath構造: [ファイル名, describe名, テスト名, ...]
    const testInfo = test.info()
    const category = config.category
        ?? testInfo.titlePath[1]  // describe名
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
 * テスト実行ヘルパー（ソフトFAIL版）
 *
 * FAILしてもテストを継続し、最後にまとめてレポート
 */
export async function runTestSoft(
    reporter: TestReporter,
    page: Page,
    config: Omit<TestConfig, 'continueOnFail'>,
    testFn: () => Promise<void>
): Promise<boolean> {
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

    // スクリーンショット撮影
    if (config.screenshotStep) {
        try {
            screenshotPath = reporter.getScreenshotPath(config.id, config.screenshotStep)
            await page.screenshot({ path: screenshotPath, fullPage: true })
        } catch {
            // スクリーンショット撮影エラーは無視
        }
    }

    reporter.addResult({
        id: config.id,
        category,
        name: config.name,
        description: config.description,
        status,
        screenshotPath,
        error,
    })

    return status === 'PASS'
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

/**
 * Vuetify入力フィールドにテキストを入力
 *
 * Vuetifyのv-text-fieldはlabel属性で識別
 */
export async function fillVuetifyField(page: Page, label: string, value: string): Promise<void> {
    // Vuetifyのv-text-fieldを探す（labelで識別）
    const field = page.locator(`.v-text-field:has(.v-label:text-is("${label}")) input`)
    await field.fill(value)
}

/**
 * Vuetifyボタンをクリック
 */
export async function clickVuetifyButton(page: Page, text: string): Promise<void> {
    await page.locator(`.v-btn:has-text("${text}")`).click()
}

/**
 * Vuetifyセレクトで項目を選択
 */
export async function selectVuetifyItem(page: Page, selectorClass: string, itemText: string): Promise<void> {
    await page.click(`.${selectorClass} .v-field`)
    await page.waitForTimeout(300)
    await page.click(`.v-list-item:has-text("${itemText}")`)
}
