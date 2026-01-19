/**
 * 統合シナリオ スケルトン (4テスト)
 * 
 * チェックリスト準拠: docs/test-scenarios-checklist.md
 */
import { test, expect } from '@playwright/test'
import { createReporter, loginAndSetup, logoutViaUI, createDocumentViaUI, createPromptViaUI, runGenerationViaUI, captureStep } from '../lib'

const reporter = createReporter()

test.describe('統合シナリオ', () => {
    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ===== End-to-Endフロー =====

    test('E2E-01: 完全ユーザーフロー', async ({ page }) => {
        await page.goto('http://localhost:3000')

        // Step 1: ログイン
        await captureStep(page, 'E2E-01', 'step1_login', async () => {
            // === CODEGEN ===
        })

        // Step 2: ドキュメント作成
        await captureStep(page, 'E2E-01', 'step2_doc', async () => {
            // === CODEGEN ===
        })

        // Step 3: プロンプト作成
        await captureStep(page, 'E2E-01', 'step3_prompt', async () => {
            // === CODEGEN ===
        })

        // Step 4: 生成実行
        await captureStep(page, 'E2E-01', 'step4_generate', async () => {
            // === CODEGEN ===
        })

        // Step 5: ログアウト
        const { beforePath, afterPath } = await captureStep(page, 'E2E-01', 'step5_logout', async () => {
            // === CODEGEN ===
        })

        // 検証: 全ステップ成功

        // 最終的な結果として最後のステップの画像を保存しますが、
        // 統合テストの場合は途中のステップも重要なので、別途stepImagesのようなフィールド拡張も検討余地あり
        // ここでは便宜上、最終ステップを登録
        reporter.addResult({
            id: 'E2E-01', category: '統合', name: '完全ユーザーフロー',
            description: 'ログインから生成・ログアウトまでの一連の流れ',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('E2E-02: 複数リソース操作', async ({ page }) => {
        await loginAndSetup(page)

        const { beforePath, afterPath } = await captureStep(page, 'E2E-02', 'multi_resource', async () => {
            // === CODEGEN: 複数Doc/Prompt作成 → 切替・編集・削除 ===
        })

        reporter.addResult({
            id: 'E2E-02', category: '統合', name: '複数リソース操作',
            description: '複数のDoc/Promptを作成・切替・編集・削除できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 状態管理 =====

    test('E2E-03: セッション復帰', async ({ page }) => {
        await loginAndSetup(page)
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'E2E-03', 'reload_recovery', async () => {
            // === CODEGEN: 操作中 → リロード ===
        })

        reporter.addResult({
            id: 'E2E-03', category: '統合', name: 'セッション復帰',
            description: 'リロード後も選択状態が復元されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('E2E-04: ドキュメント切替連動', async ({ page }) => {
        await loginAndSetup(page)

        // Doc1とPrompt1を作成
        await createDocumentViaUI(page, `Doc1_${Date.now()}`)
        await createPromptViaUI(page, `Prompt1_${Date.now()}`)

        // Doc2を作成
        await createDocumentViaUI(page, `Doc2_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'E2E-04', 'switch_check', async () => {
            // === CODEGEN: Doc1選択 → Doc2選択 ===
        })

        reporter.addResult({
            id: 'E2E-04', category: '統合', name: 'ドキュメント切替連動',
            description: 'ドキュメント切替時にプロンプト選択がリセットされること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })
})
