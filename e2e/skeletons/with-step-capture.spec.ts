/**
 * テストスケルトン: ステップ実行ラッパー版（推奨）
 * 
 * 特徴:
 * - captureStepヘルパーを使用して、コードをブロックごとにラップするだけ
 * - 自動的に前後スクリーンショットが撮影される
 * - コードが読みやすく、保守しやすい
 */
import { test, expect } from '@playwright/test'
import { createReporter, loginAndSetup, captureStep } from '../lib'

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

        // Step 1: 前処理（必要に応じて）
        // Codegenで生成したセットアップコード
        // await page.goto('...')

        // Step 2: メイン操作（ラップする）
        const { beforePath, afterPath } = await captureStep(page, testId, 'main_action', async () => {
            // === CODEGEN START ===
            // ここにCodegenで生成した操作コードを貼り付け
            // await page.getByRole('button', { name: '保存' }).click()
            // === CODEGEN END ===
        })

        // Step 3: 検証
        // === VERIFICATION ===
        // await expect(page.getByText('成功')).toBeVisible()
        // === VERIFICATION END ===

        // 結果保存
        reporter.addResult({
            id: testId,
            category: '【カテゴリ名】',
            name: '【テスト名】',
            description: '【テストの説明】',
            status: 'PASS',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        })
    })

    test('TEST-02: 複数ステップのテスト', async ({ page }) => {
        const testId = 'TEST-02'

        // 複数のステップを記録する場合

        // Step 1
        await captureStep(page, testId, 'step1_input', async () => {
            // Codegenコード
        })

        // Step 2
        const { beforePath, afterPath } = await captureStep(page, testId, 'step2_save', async () => {
            // Codegenコード（ここがメインの検証対象）
        })

        // レポートにはメインのステップ（Step 2）の画像を紐付ける
        reporter.addResult({
            id: testId,
            category: '【カテゴリ名】',
            name: '複数ステップテスト',
            description: '...',
            status: 'PASS',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        })
    })
})
