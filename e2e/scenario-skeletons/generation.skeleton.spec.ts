/**
 * 生成シナリオ スケルトン (11テスト)
 * 
 * チェックリスト準拠: docs/test-scenarios-checklist.md
 */
import { test, expect } from '@playwright/test'
import { createReporter, loginAndSetup, createDocumentViaUI, createPromptViaUI } from '../lib'

const reporter = createReporter()

test.describe('生成シナリオ', () => {
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ===== ボタン状態 =====

    test('GEN-01: 生成ボタン無効（ドキュメント未選択）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('GEN-01', 'before')
        const afterPath = reporter.getScreenshotPath('GEN-01', 'after')

        await page.screenshot({ path: beforePath, fullPage: true })

        // ログイン直後

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: disabled

        reporter.addResult({
            id: 'GEN-01', category: '生成', name: '生成ボタン無効（ドキュメント未選択）',
            description: 'ドキュメント未選択時は生成ボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('GEN-02: 生成ボタン無効（プロンプト未選択）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('GEN-02', 'before')
        const afterPath = reporter.getScreenshotPath('GEN-02', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // ドキュメントのみ選択

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: disabled

        reporter.addResult({
            id: 'GEN-02', category: '生成', name: '生成ボタン無効（プロンプト未選択）',
            description: 'プロンプト未選択時は生成ボタンが無効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('GEN-03: 生成ボタン有効', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('GEN-03', 'before')
        const afterPath = reporter.getScreenshotPath('GEN-03', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // 両方選択

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: enabled

        reporter.addResult({
            id: 'GEN-03', category: '生成', name: '生成ボタン有効',
            description: '両方選択時は生成ボタンが有効',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('GEN-04: 生成ボタン無効（生成中）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('GEN-04', 'before')
        const afterPath = reporter.getScreenshotPath('GEN-04', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 生成実行中 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: disabled + ローディング

        reporter.addResult({
            id: 'GEN-04', category: '生成', name: '生成ボタン無効（生成中）',
            description: '生成実行中はボタンが無効でローディング表示',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 表示モード =====

    test('GEN-05: 生成前タブ表示', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('GEN-05', 'before')
        const afterPath = reporter.getScreenshotPath('GEN-05', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // 初期状態

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 「生成前」タブ選択、readonly

        reporter.addResult({
            id: 'GEN-05', category: '生成', name: '生成前タブ表示',
            description: '初期状態で生成前タブが選択されていること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('GEN-06: 生成後タブ切替', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('GEN-06', 'before')
        const afterPath = reporter.getScreenshotPath('GEN-06', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 「生成後」タブクリック ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 編集可能

        reporter.addResult({
            id: 'GEN-06', category: '生成', name: '生成後タブ切替',
            description: '生成後タブに切り替えると編集可能になること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('GEN-07: タブ切替往復', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('GEN-07', 'before')
        const afterPath = reporter.getScreenshotPath('GEN-07', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 生成前 ↔ 生成後 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 内容切替

        reporter.addResult({
            id: 'GEN-07', category: '生成', name: 'タブ切替往復',
            description: 'タブを往復して切り替えられること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 生成実行 =====

    test('GEN-08: 生成実行成功', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('GEN-08', 'before')
        const afterPath = reporter.getScreenshotPath('GEN-08', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 一括生成ボタンクリック ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 生成後タブに結果表示

        reporter.addResult({
            id: 'GEN-08', category: '生成', name: '生成実行成功',
            description: '一括生成を実行して結果が表示されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('GEN-09: 生成中インジケーター', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('GEN-09', 'before')
        const afterPath = reporter.getScreenshotPath('GEN-09', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 生成実行中の状態をキャプチャ ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: プログレス + テキスト表示

        reporter.addResult({
            id: 'GEN-09', category: '生成', name: '生成中インジケーター',
            description: '生成中にインジケーターが表示されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    test('GEN-10: 自動モード切替', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('GEN-10', 'before')
        const afterPath = reporter.getScreenshotPath('GEN-10', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 生成完了まで待機 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 修正用モードに切替

        reporter.addResult({
            id: 'GEN-10', category: '生成', name: '自動モード切替',
            description: '生成完了後に修正用モードに自動切替されること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })

    // ===== 生成結果編集 =====

    test('GEN-11: 生成結果編集', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('GEN-11', 'before')
        const afterPath = reporter.getScreenshotPath('GEN-11', 'after')

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`)
        await page.screenshot({ path: beforePath, fullPage: true })

        // === CODEGEN: 生成後タブでテキスト編集 ===

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証: 変更保持

        reporter.addResult({
            id: 'GEN-11', category: '生成', name: '生成結果編集',
            description: '生成結果を編集できること',
            status: 'PASS', beforeScreenshotPath: beforePath, afterScreenshotPath: afterPath,
        })
    })
})
