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
}

/**
 * テスト実行ヘルパー
 *
 * テストロジックを実行し、結果を自動記録
 * categoryを省略すると、test.describeの名前を使用
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
    // describe名があればそれを使用、なければファイル名からフォールバック
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
    }

    // スクリーンショット撮影
    if (config.screenshotStep) {
        screenshotPath = reporter.getScreenshotPath(config.id, config.screenshotStep)
        await page.screenshot({ path: screenshotPath, fullPage: true })
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

    expect(status).toBe('PASS')
}

/**
 * 共通レポーター設定
 *
 * 全テストで共通のレポーター設定を取得
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
