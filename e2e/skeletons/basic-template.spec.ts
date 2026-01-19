/**
 * テストスケルトン: 基本テンプレート
 * 
 * 使い方:
 * 1. このファイルをコピーして e2e/scenarios/ に配置
 * 2. Codegenで生成したコードを「// === CODEGEN START ===」の間に貼り付け
 * 3. テストID、名前、説明を適宜変更
 * 
 * 特徴:
 * - 最終操作の前後でスクリーンショット自動撮影
 * - テスト完了後にExcelレポート自動生成
 */
import { test, expect, Page } from '@playwright/test'
import { createReporter, loginAndSetup } from '../lib'

// レポーターインスタンス（テストファイル内で共有）
const reporter = createReporter()

test.describe('【カテゴリ名を入力】', () => {
    // 各テスト前にログイン
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    // 全テスト終了後にExcelレポート生成
    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ----------------------------------------
    // テストケース1
    // ----------------------------------------
    test('TEST-01: 【テスト名を入力】', async ({ page }) => {
        // エビデンスパス生成
        const beforePath = reporter.getScreenshotPath('TEST-01', 'before')
        const afterPath = reporter.getScreenshotPath('TEST-01', 'after')

        // === CODEGEN START (前処理) ===
        // Codegenで生成したセットアップコードをここに貼り付け
        // 例: await page.goto('http://localhost:3000')
        //     await page.getByRole('button', { name: '...' }).click()
        // === CODEGEN END ===

        // 最終操作前のスクリーンショット
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN START (最終操作) ===
        // Codegenで生成した最終操作コードをここに貼り付け
        // 例: await page.getByRole('button', { name: '保存' }).click()
        // === CODEGEN END ===

        // 最終操作後のスクリーンショット
        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証
        // === VERIFICATION ===
        // await expect(page.getByText('成功')).toBeVisible()
        // === VERIFICATION END ===

        // 結果をレポートに追加
        reporter.addResult({
            id: 'TEST-01',
            category: '【カテゴリ名】',
            name: '【テスト名】',
            description: '【テストの説明】',
            status: 'PASS',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        })
    })

    // ----------------------------------------
    // テストケース2（コピーして使用）
    // ----------------------------------------
    test('TEST-02: 【テスト名を入力】', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('TEST-02', 'before')
        const afterPath = reporter.getScreenshotPath('TEST-02', 'after')

        // === CODEGEN START (前処理) ===
        // === CODEGEN END ===

        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN START (最終操作) ===
        // === CODEGEN END ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // === VERIFICATION ===
        // === VERIFICATION END ===

        reporter.addResult({
            id: 'TEST-02',
            category: '【カテゴリ名】',
            name: '【テスト名】',
            description: '【テストの説明】',
            status: 'PASS',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        })
    })
})
