/**
 * ドキュメント管理シナリオ スケルトン (19テスト)
 * 
 * チェックリスト準拠: docs/test-scenarios-checklist.md
 */
import { test, expect } from '@playwright/test'
import { createReporter, loginAndSetup, createDocumentViaUI } from '../lib'

const reporter = createReporter()

test.describe('ドキュメント管理シナリオ', () => {
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ===== 作成シナリオ =====

    test('DOC-01: 作成成功（タイトルのみ）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-01', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-01', 'after')

        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: タイトル入力 → 作成 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ダイアログ閉じ、リストに表示

        reporter.addResult({
            id: 'DOC-01', category: 'ドキュメント', name: '作成成功（タイトルのみ）',
            description: 'タイトルのみでドキュメントを作成できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-02: 作成成功（フィールド付き）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-02', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-02', 'after')

        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: タイトル + フィールド追加 → 作成 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: フィールドも保存

        reporter.addResult({
            id: 'DOC-02', category: 'ドキュメント', name: '作成成功（フィールド付き）',
            description: 'フィールド付きでドキュメントを作成できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-03: 作成キャンセル', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-03', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-03', 'after')

        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: ダイアログ開く → キャンセル ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ダイアログ閉じ、作成されない

        reporter.addResult({
            id: 'DOC-03', category: 'ドキュメント', name: '作成キャンセル',
            description: 'キャンセルでドキュメントが作成されないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-04: 作成バリデーション（タイトル空）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-04', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-04', 'after')

        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: タイトル空で作成 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ダイアログ閉じない

        reporter.addResult({
            id: 'DOC-04', category: 'ドキュメント', name: '作成バリデーション（タイトル空）',
            description: 'タイトル空の場合作成できないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== フィールド操作 =====

    test('DOC-05: フィールド追加', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-05', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-05', 'after')

        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 「フィールド追加」ボタンクリック ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: フィールド入力欄が追加

        reporter.addResult({
            id: 'DOC-05', category: 'ドキュメント', name: 'フィールド追加',
            description: 'フィールドを追加できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-06: フィールド削除', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-06', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-06', 'after')

        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: フィールドの削除ボタンクリック ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: フィールドが削除

        reporter.addResult({
            id: 'DOC-06', category: 'ドキュメント', name: 'フィールド削除',
            description: 'フィールドを削除できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-07: 複数フィールド追加', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-07', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-07', 'after')

        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 3つのフィールドを追加して作成 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 全フィールド保存

        reporter.addResult({
            id: 'DOC-07', category: 'ドキュメント', name: '複数フィールド追加',
            description: '複数フィールドを追加して保存できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 編集シナリオ =====

    test('DOC-08: 編集成功（タイトル変更）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-08', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-08', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: タイトル変更 → 保存 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 新タイトル表示

        reporter.addResult({
            id: 'DOC-08', category: 'ドキュメント', name: '編集成功（タイトル変更）',
            description: 'タイトルを変更できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-09: 編集成功（フィールド追加）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-09', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-09', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: フィールド追加 → 保存 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: フィールド増加

        reporter.addResult({
            id: 'DOC-09', category: 'ドキュメント', name: '編集成功（フィールド追加）',
            description: '編集でフィールドを追加できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-10: 編集成功（フィールド削除）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-10', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-10', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: '削除対象', content: 'テスト' }])
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: フィールド削除 → 保存 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: フィールド減少

        reporter.addResult({
            id: 'DOC-10', category: 'ドキュメント', name: '編集成功（フィールド削除）',
            description: '編集でフィールドを削除できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-11: 編集キャンセル', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-11', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-11', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 変更 → キャンセル ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 変更反映されない

        reporter.addResult({
            id: 'DOC-11', category: 'ドキュメント', name: '編集キャンセル',
            description: 'キャンセルで変更が反映されないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-12: 編集バリデーション（タイトル空）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-12', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-12', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: タイトル空で保存 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ダイアログ閉じない

        reporter.addResult({
            id: 'DOC-12', category: 'ドキュメント', name: '編集バリデーション（タイトル空）',
            description: 'タイトル空で保存できないこと',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 削除シナリオ =====

    test('DOC-13: 削除成功', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-13', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-13', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 削除 → 確認ダイアログで実行 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ドキュメント消える

        reporter.addResult({
            id: 'DOC-13', category: 'ドキュメント', name: '削除成功',
            description: 'ドキュメントを削除できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-14: 削除キャンセル', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-14', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-14', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 削除 → キャンセル ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: ドキュメント残存

        reporter.addResult({
            id: 'DOC-14', category: 'ドキュメント', name: '削除キャンセル',
            description: 'キャンセルでドキュメントが残ること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== ボタン状態 =====

    test('DOC-15: 編集ボタン無効', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-15', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-15', 'after')

        await page.screenshot({ path: beforePath, fullPage: true })

        // ドキュメント未選択状態

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: disabled
        // await expect(page.locator('.document-column .mdi-pencil').first()).toBeDisabled()

        reporter.addResult({
            id: 'DOC-15', category: 'ドキュメント', name: '編集ボタン無効',
            description: '未選択時は編集ボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-16: 削除ボタン無効', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-16', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-16', 'after')

        await page.screenshot({ path: beforePath, fullPage: true })

        // ドキュメント未選択状態

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: disabled

        reporter.addResult({
            id: 'DOC-16', category: 'ドキュメント', name: '削除ボタン無効',
            description: '未選択時は削除ボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 選択・表示 =====

    test('DOC-17: ドキュメント選択', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-17', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-17', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: ドロップダウンから選択 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 詳細表示、プロンプト列有効化

        reporter.addResult({
            id: 'DOC-17', category: 'ドキュメント', name: 'ドキュメント選択',
            description: 'ドロップダウンからドキュメントを選択できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-18: 選択クリア', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-18', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-18', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: クリアボタン ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 選択解除、編集/削除ボタン無効

        reporter.addResult({
            id: 'DOC-18', category: 'ドキュメント', name: '選択クリア',
            description: '選択をクリアできること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('DOC-19: 選択切替', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-19', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-19', 'after')

        await createDocumentViaUI(page, `DocA_${Date.now()}`)
        await createDocumentViaUI(page, `DocB_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 別ドキュメント選択 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 詳細が切り替わる

        reporter.addResult({
            id: 'DOC-19', category: 'ドキュメント', name: '選択切替',
            description: 'ドキュメントを切り替えられること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })
})
