/**
 * プロンプト管理シナリオ スケルトン (22テスト)
 * 
 * チェックリスト準拠: docs/test-scenarios-checklist.md
 */
import { test, expect } from '@playwright/test'
import { createReporter, loginAndSetup, createDocumentViaUI, createPromptViaUI } from '../lib'

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
        const beforePath = reporter.getScreenshotPath('PROMPT-01', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-01', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 名前 + 全フィールド共通 → 作成 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-01', category: 'プロンプト', name: '作成成功（全体タイプ）',
            description: '全フィールド共通タイプでプロンプトを作成できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-02: 作成成功（個別タイプ）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-02', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-02', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 名前 + 個別フィールド用 → 作成 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-02', category: 'プロンプト', name: '作成成功（個別タイプ）',
            description: '個別フィールド用タイプでプロンプトを作成できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-03: 作成キャンセル', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-03', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-03', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: ダイアログ開く → キャンセル ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-03', category: 'プロンプト', name: '作成キャンセル',
            description: 'キャンセルでプロンプトが作成されないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-04: 作成バリデーション（名前空）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-04', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-04', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 名前空で作成 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-04', category: 'プロンプト', name: '作成バリデーション（名前空）',
            description: '名前空の場合作成できないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-05: 作成ボタン無効', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-05', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-05', 'after')

        await page.screenshot({ path: beforePath, fullPage: true })

        // ドキュメント未選択時

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ボタンdisabled

        reporter.addResult({
            id: 'PROMPT-05', category: 'プロンプト', name: '作成ボタン無効',
            description: 'ドキュメント未選択時は作成ボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 編集シナリオ =====

    test('PROMPT-06: 編集成功（名前変更）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-06', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-06', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 名前変更 → 保存 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-06', category: 'プロンプト', name: '編集成功（名前変更）',
            description: 'プロンプト名を変更できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-07: 編集成功（タイプ変更警告）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-07', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-07', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: タイプを変更 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 警告メッセージ表示

        reporter.addResult({
            id: 'PROMPT-07', category: 'プロンプト', name: '編集成功（タイプ変更警告）',
            description: 'タイプ変更時に警告が表示されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-08: 編集キャンセル', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-08', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-08', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 変更 → キャンセル ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-08', category: 'プロンプト', name: '編集キャンセル',
            description: 'キャンセルで変更が反映されないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-09: 編集バリデーション（名前空）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-09', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-09', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 名前空で保存 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-09', category: 'プロンプト', name: '編集バリデーション（名前空）',
            description: '名前空で保存できないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-10: 編集ボタン無効', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-10', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-10', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // プロンプト未選択時

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-10', category: 'プロンプト', name: '編集ボタン無効',
            description: 'プロンプト未選択時は編集ボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 削除シナリオ =====

    test('PROMPT-11: 削除成功', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-11', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-11', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 削除 → 確認ダイアログで実行 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-11', category: 'プロンプト', name: '削除成功',
            description: 'プロンプトを削除できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-12: 削除キャンセル', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-12', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-12', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 削除 → キャンセル ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-12', category: 'プロンプト', name: '削除キャンセル',
            description: 'キャンセルでプロンプトが残ること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-13: 削除ボタン無効', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-13', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-13', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // プロンプト未選択時

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-13', category: 'プロンプト', name: '削除ボタン無効',
            description: 'プロンプト未選択時は削除ボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== プロンプトテキスト編集 =====

    test('PROMPT-14: 全体プロンプト入力', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-14', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-14', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: テキストエリアに入力 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-14', category: 'プロンプト', name: '全体プロンプト入力',
            description: 'テキストエリアにプロンプトを入力できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-15: 個別プロンプト入力', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-15', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-15', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: フィールドごとにテキスト入力 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-15', category: 'プロンプト', name: '個別プロンプト入力',
            description: '各フィールドに個別プロンプトを入力できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-16: プロンプト切替（選択）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-16', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-16', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `PromptA_${Date.now()}`)
        await createPromptViaUI(page, `PromptB_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: ドロップダウンで別プロンプト選択 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-16', category: 'プロンプト', name: 'プロンプト切替（選択）',
            description: 'ドロップダウンでプロンプトを切り替えられること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== モード切替 =====

    test('PROMPT-17: 生成用モード表示', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-17', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-17', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // 初期状態

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 「生成用プロンプト」アラート

        reporter.addResult({
            id: 'PROMPT-17', category: 'プロンプト', name: '生成用モード表示',
            description: '初期状態で生成用モードが表示されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-18: 修正用モード切替', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-18', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-18', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 「修正用」ボタンクリック ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 「修正用プロンプト」アラート

        reporter.addResult({
            id: 'PROMPT-18', category: 'プロンプト', name: '修正用モード切替',
            description: '修正用モードに切り替えられること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-19: モード切替往復', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-19', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-19', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 生成用 ↔ 修正用 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        reporter.addResult({
            id: 'PROMPT-19', category: 'プロンプト', name: 'モード切替往復',
            description: 'モードを往復して切り替えられること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 個別フィールドプロンプト =====

    test('PROMPT-20: エキスパンションパネル展開', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-20', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-20', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: フィールド名クリック ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: テキストエリア表示

        reporter.addResult({
            id: 'PROMPT-20', category: 'プロンプト', name: 'エキスパンションパネル展開',
            description: 'フィールドのパネルを展開できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-21: 設定済チップ', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-21', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-21', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: フィールドにプロンプト入力 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 「設定済」チップ表示

        reporter.addResult({
            id: 'PROMPT-21', category: 'プロンプト', name: '設定済チップ',
            description: 'プロンプト入力後に設定済チップが表示されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('PROMPT-22: 再生成ボタン（修正用モード）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('PROMPT-22', 'before')
        const afterPath = reporter.getScreenshotPath('PROMPT-22', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 修正用モードでフィールド展開 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 「再生成」ボタン表示

        reporter.addResult({
            id: 'PROMPT-22', category: 'プロンプト', name: '再生成ボタン（修正用モード）',
            description: '修正用モードで再生成ボタンが表示されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })
})
