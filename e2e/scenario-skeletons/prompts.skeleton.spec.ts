/**
 * プロンプト管理シナリオ スケルトン (22テスト)
 * 
 * チェックリスト準拠: docs/test-scenarios-checklist.md
 */
import { test, expect } from '@playwright/test'
import { createReporter, loginAndSetup, createDocumentViaUI, createPromptViaUI, captureStep } from '../lib'

const reporter = createReporter()

test.describe('プロンプト管理シナリオ', () => {
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ===== 作成シナリオ =====

    test('PROMPT-01: 作成成功（全体タイプ）', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-01', 'create_all', async () => {
            // === CODEGEN: 名前 + 全フィールド共通 → 作成 ===
        })

        reporter.addResult({
            id: 'PROMPT-01', category: 'プロンプト', name: '作成成功（全体タイプ）',
            description: '全フィールド共通タイプでプロンプトを作成できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-02: 作成成功（個別タイプ）', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-02', 'create_each', async () => {
            // === CODEGEN: 名前 + 個別フィールド用 → 作成 ===
        })

        reporter.addResult({
            id: 'PROMPT-02', category: 'プロンプト', name: '作成成功（個別タイプ）',
            description: '個別フィールド用タイプでプロンプトを作成できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-03: 作成キャンセル', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-03', 'create_cancel', async () => {
            // === CODEGEN: ダイアログ開く → キャンセル ===
        })

        reporter.addResult({
            id: 'PROMPT-03', category: 'プロンプト', name: '作成キャンセル',
            description: 'キャンセルでプロンプトが作成されないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-04: 作成バリデーション（名前空）', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-04', 'validation_error', async () => {
            // === CODEGEN: 名前空で作成 ===
        })

        reporter.addResult({
            id: 'PROMPT-04', category: 'プロンプト', name: '作成バリデーション（名前空）',
            description: '名前空の場合作成できないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-05: 作成ボタン無効', async ({ page }) => {
        // ドキュメント未選択時
        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-05', 'check_disabled', async () => {
            // === CODEGEN ===
        })

        reporter.addResult({
            id: 'PROMPT-05', category: 'プロンプト', name: '作成ボタン無効',
            description: 'ドキュメント未選択時は作成ボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 編集シナリオ =====

    test('PROMPT-06: 編集成功（名前変更）', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-06', 'edit_name', async () => {
            // === CODEGEN: 名前変更 → 保存 ===
        })

        reporter.addResult({
            id: 'PROMPT-06', category: 'プロンプト', name: '編集成功（名前変更）',
            description: 'プロンプト名を変更できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-07: 編集成功（タイプ変更警告）', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-07', 'change_type', async () => {
            // === CODEGEN: タイプを変更 ===
        })

        reporter.addResult({
            id: 'PROMPT-07', category: 'プロンプト', name: '編集成功（タイプ変更警告）',
            description: 'タイプ変更時に警告が表示されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-08: 編集キャンセル', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-08', 'edit_cancel', async () => {
            // === CODEGEN: 変更 → キャンセル ===
        })

        reporter.addResult({
            id: 'PROMPT-08', category: 'プロンプト', name: '編集キャンセル',
            description: 'キャンセルで変更が反映されないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-09: 編集バリデーション（名前空）', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-09', 'edit_validation', async () => {
            // === CODEGEN: 名前空で保存 ===
        })

        reporter.addResult({
            id: 'PROMPT-09', category: 'プロンプト', name: '編集バリデーション（名前空）',
            description: '名前空で保存できないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-10: 編集ボタン無効', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        // プロンプト未選択時
        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-10', 'check_edit_disabled', async () => {
            // === CODEGEN ===
        })

        reporter.addResult({
            id: 'PROMPT-10', category: 'プロンプト', name: '編集ボタン無効',
            description: 'プロンプト未選択時は編集ボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 削除シナリオ =====

    test('PROMPT-11: 削除成功', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-11', 'delete_action', async () => {
            // === CODEGEN: 削除 → 確認ダイアログで実行 ===
        })

        reporter.addResult({
            id: 'PROMPT-11', category: 'プロンプト', name: '削除成功',
            description: 'プロンプトを削除できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-12: 削除キャンセル', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-12', 'delete_cancel', async () => {
            // === CODEGEN: 削除 → キャンセル ===
        })

        reporter.addResult({
            id: 'PROMPT-12', category: 'プロンプト', name: '削除キャンセル',
            description: 'キャンセルでプロンプトが残ること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-13: 削除ボタン無効', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        // プロンプト未選択時
        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-13', 'check_delete_disabled', async () => {
            // === CODEGEN ===
        })

        reporter.addResult({
            id: 'PROMPT-13', category: 'プロンプト', name: '削除ボタン無効',
            description: 'プロンプト未選択時は削除ボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== プロンプトテキスト編集 =====

    test('PROMPT-14: 全体プロンプト入力', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-14', 'input_text', async () => {
            // === CODEGEN: テキストエリアに入力 ===
        })

        reporter.addResult({
            id: 'PROMPT-14', category: 'プロンプト', name: '全体プロンプト入力',
            description: 'テキストエリアにプロンプトを入力できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-15: 個別プロンプト入力', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-15', 'input_each', async () => {
            // === CODEGEN: フィールドごとにテキスト入力 ===
        })

        reporter.addResult({
            id: 'PROMPT-15', category: 'プロンプト', name: '個別プロンプト入力',
            description: '各フィールドに個別プロンプトを入力できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-16: プロンプト切替（選択）', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `PromptA_${Date.now()}`)
        await createPromptViaUI(page, `PromptB_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-16', 'switch_prompt', async () => {
            // === CODEGEN: ドロップダウンで別プロンプト選択 ===
        })

        reporter.addResult({
            id: 'PROMPT-16', category: 'プロンプト', name: 'プロンプト切替（選択）',
            description: 'ドロップダウンでプロンプトを切り替えられること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== モード切替 =====

    test('PROMPT-17: 生成用モード表示', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        // 初期状態で確認
        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-17', 'check_mode', async () => {
            // === CODEGEN ===
        })

        reporter.addResult({
            id: 'PROMPT-17', category: 'プロンプト', name: '生成用モード表示',
            description: '初期状態で生成用モードが表示されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-18: 修正用モード切替', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-18', 'switch_mode', async () => {
            // === CODEGEN: 「修正用」ボタンクリック ===
        })

        reporter.addResult({
            id: 'PROMPT-18', category: 'プロンプト', name: '修正用モード切替',
            description: '修正用モードに切り替えられること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-19: モード切替往復', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-19', 'toggle_mode', async () => {
            // === CODEGEN: 生成用 ↔ 修正用 ===
        })

        reporter.addResult({
            id: 'PROMPT-19', category: 'プロンプト', name: 'モード切替往復',
            description: 'モードを往復して切り替えられること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 個別フィールドプロンプト =====

    test('PROMPT-20: エキスパンションパネル展開', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-20', 'expand_panel', async () => {
            // === CODEGEN: フィールド名クリック ===
        })

        reporter.addResult({
            id: 'PROMPT-20', category: 'プロンプト', name: 'エキスパンションパネル展開',
            description: 'フィールドのパネルを展開できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-21: 設定済チップ', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-21', 'check_chip', async () => {
            // === CODEGEN: フィールドにプロンプト入力 ===
        })

        reporter.addResult({
            id: 'PROMPT-21', category: 'プロンプト', name: '設定済チップ',
            description: 'プロンプト入力後に設定済チップが表示されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-22: 再生成ボタン（修正用モード）', async ({ page }) => {
        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')

        const { beforePath, afterPath } = await captureStep(page, 'PROMPT-22', 'check_regenerate', async () => {
            // === CODEGEN: 修正用モードでフィールド展開 ===
        })

        reporter.addResult({
            id: 'PROMPT-22', category: 'プロンプト', name: '再生成ボタン（修正用モード）',
            description: '修正用モードで再生成ボタンが表示されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })
})
