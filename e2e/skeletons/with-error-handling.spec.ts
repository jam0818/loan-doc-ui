/**
 * テストスケルトン: try-catchラッパー版
 * 
 * 特徴:
 * - エラー発生時も自動でFAIL結果をレポートに記録
 * - スクリーンショット付きでエラー状態を保存
 */
import { test, expect, Page } from '@playwright/test'
import { createReporter, loginAndSetup } from '../lib'

const reporter = createReporter()

test.describe('【カテゴリ名を入力】', () => {
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    test('TEST-01: 【テスト名を入力】', async ({ page }) => {
        const testId = 'TEST-01'
        const testName = '【テスト名】'
        const testDescription = '【テストの説明】'
        const category = '【カテゴリ名】'

        const beforePath = reporter.getScreenshotPath(testId, 'before')
        const afterPath = reporter.getScreenshotPath(testId, 'after')

        let status: 'PASS' | 'FAIL' = 'PASS'
        let errorMessage: string | undefined

        try {
            // === CODEGEN START (前処理) ===

            // === CODEGEN END ===

            // 最終操作前のスクリーンショット
            await page.screenshot({ path: beforePath, fullPage: true })

            // === CODEGEN START (最終操作) ===

            // === CODEGEN END ===

            // 最終操作後のスクリーンショット
            await page.screenshot({ path: afterPath, fullPage: true })

            // === VERIFICATION ===

            // === VERIFICATION END ===

        } catch (error) {
            status = 'FAIL'
            errorMessage = error instanceof Error ? error.message : String(error)
            // エラー時もスクリーンショット
            await page.screenshot({ path: afterPath, fullPage: true }).catch(() => { })
        }

        // 結果をレポートに追加
        reporter.addResult({
            id: testId,
            category,
            name: testName,
            description: testDescription,
            status,
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
            error: errorMessage,
        })

        // 失敗時はテストを失敗させる
        if (status === 'FAIL') {
            throw new Error(errorMessage)
        }
    })
})
