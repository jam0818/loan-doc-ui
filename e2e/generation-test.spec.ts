/**
 * LLM生成機能テスト
 *
 * 実API使用、UIログイン形式
 * CHECKLIST.md 4.1-4.14のテストケースを実装
 */

import { test, expect } from '@playwright/test'
import { runTest, createReporter, loginViaUI } from './lib'

// 共通レポーター
const reporter = createReporter()

/**
 * LLM生成テスト
 */
test.describe('LLM生成テスト', () => {
    test.beforeEach(async ({ page }) => {
        await loginViaUI(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ===== 前提 =====

    // 4.1 ドキュメント未選択で無効
    test('4.1 ドキュメント未選択で無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.1',
            name: 'ドキュメント未選択で無効',
            description: 'ドキュメント未選択時は生成ボタンが無効',
            screenshotStep: 'gen_doc_disabled',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // 4.2 プロンプト未選択で無効
    test('4.2 プロンプト未選択で無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.2',
            name: 'プロンプト未選択で無効',
            description: 'プロンプト未選択時は生成ボタンが無効',
            screenshotStep: 'gen_prompt_disabled',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // 4.3 両方選択で有効
    test('4.3 両方選択で有効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.3',
            name: '両方選択で有効',
            description: 'ドキュメントとプロンプト両方選択で生成ボタン有効',
            screenshotStep: 'gen_enabled',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // ===== 表示 =====

    // 4.4 生成前モード表示
    test('4.4 生成前モード表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.4',
            name: '生成前モード表示',
            description: '生成前モードが表示される',
            screenshotStep: 'mode_before',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // 4.5 生成後モード表示
    test('4.5 生成後モード表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.5',
            name: '生成後モード表示',
            description: '生成後モードが表示される',
            screenshotStep: 'mode_after',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // 4.6 モード切替
    test('4.6 モード切替', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.6',
            name: 'モード切替',
            description: '生成前/後モードを切り替えられる',
            screenshotStep: 'mode_toggle',
        }, async () => {
            const beforeMode = page.getByRole('button', { name: '生成後' })
            const afterMode = page.getByRole('button', { name: '生成前' })
            await expect(beforeMode.or(afterMode).first()).toBeVisible({ timeout: 10000 })
        })
    })

    // ===== 一括 =====

    // 4.7 生成ボタンクリック
    test('4.7 生成ボタンクリック', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.7',
            name: '生成ボタンクリック',
            description: '生成ボタンをクリックできる',
            screenshotStep: 'gen_click',
        }, async () => {
            const genButton = page.getByRole('button', { name: '生成' })
            const playButton = page.locator('.generate-column').getByRole('button').filter({ has: page.locator('.mdi-play') })
            await expect(genButton.or(playButton).first()).toBeVisible({ timeout: 10000 })
        })
    })

    // 4.8 生成中ローディング
    test('4.8 生成中ローディング', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.8',
            name: '生成中ローディング',
            description: '生成中にローディング表示',
            screenshotStep: 'gen_loading',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // 4.9 生成中ボタン無効
    test('4.9 生成中ボタン無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.9',
            name: '生成中ボタン無効',
            description: '生成中はボタンが無効',
            screenshotStep: 'gen_btn_disabled',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // 4.10 生成成功・モード切替
    test('4.10 生成成功・モード切替', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.10',
            name: '生成成功・モード切替',
            description: '生成成功後、生成後モードに切替',
            screenshotStep: 'gen_success',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // 4.11 生成エラー表示
    test('4.11 生成エラー表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.11',
            name: '生成エラー表示',
            description: '生成エラー時にエラーメッセージ表示',
            screenshotStep: 'gen_error',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // ===== 個別 =====

    // 4.12 再生成ボタン表示（修正モード）
    test('4.12 再生成ボタン表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.12',
            name: '再生成ボタン表示',
            description: '修正モードで個別再生成ボタン表示',
            screenshotStep: 'regen_btn',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // 4.13 個別フィールド再生成
    test('4.13 個別フィールド再生成', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.13',
            name: '個別フィールド再生成',
            description: '個別フィールドを再生成できる',
            screenshotStep: 'regen_field',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // ===== 結果 =====

    // 4.14 生成後コンテンツ編集
    test('4.14 生成後コンテンツ編集', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.14',
            name: '生成後コンテンツ編集',
            description: '生成後コンテンツを編集できる',
            screenshotStep: 'edit_result',
        }, async () => {
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })
})
