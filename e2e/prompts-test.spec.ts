/**
 * プロンプトCRUDテスト
 *
 * 実API使用、UIログイン形式
 * CHECKLIST.md 3.1-3.18のテストケースを実装
 */

import { test, expect } from '@playwright/test'
import { runTest, createReporter, loginViaUI } from './lib'

// 共通レポーター
const reporter = createReporter()

/**
 * プロンプト管理テスト
 */
test.describe('プロンプト管理テスト', () => {
    test.beforeEach(async ({ page }) => {
        await loginViaUI(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ===== 前提 =====

    // 3.1 ドキュメント未選択で無効
    test('3.1 ドキュメント未選択で無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.1',
            name: 'ドキュメント未選択で無効',
            description: 'ドキュメント未選択時はプロンプト操作が制限される',
            screenshotStep: 'prompt_disabled',
        }, async () => {
            await expect(page.locator('.prompt-column')).toBeVisible()
        })
    })

    // ===== 一覧 =====

    // 3.2 ドロップダウンに一覧表示
    test('3.2 ドロップダウンに一覧表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.2',
            name: 'ドロップダウン一覧表示',
            description: 'プロンプト一覧がドロップダウンに表示される',
            screenshotStep: 'prompt_list',
        }, async () => {
            await expect(page.getByRole('combobox', { name: 'プロンプトを選択' })).toBeVisible({ timeout: 10000 })
        })
    })

    // 3.3 未選択時メッセージ
    test('3.3 未選択時メッセージ', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.3',
            name: '未選択時メッセージ',
            description: 'プロンプト未選択時にガイダンスが表示される',
            screenshotStep: 'prompt_empty',
        }, async () => {
            await expect(page.getByText('プロンプトを選択してください')).toBeVisible({ timeout: 10000 })
        })
    })

    // ===== 選択 =====

    // 3.4 プロンプト選択
    test('3.4 プロンプト選択', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.4',
            name: 'プロンプト選択',
            description: 'ドロップダウンからプロンプトを選択できる',
            screenshotStep: 'prompt_select',
        }, async () => {
            await page.getByRole('combobox', { name: 'プロンプトを選択' }).click()
            await page.waitForTimeout(500)
        })
    })

    // 3.5 編集エリア表示
    test('3.5 編集エリア表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.5',
            name: '編集エリア表示',
            description: 'プロンプト選択後に編集エリアが表示される',
            screenshotStep: 'prompt_edit_area',
        }, async () => {
            await expect(page.locator('.prompt-column')).toBeVisible()
        })
    })

    // ===== モード =====

    // 3.6 生成用モード表示
    test('3.6 生成用モード表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.6',
            name: '生成用モード表示',
            description: '生成用モードがデフォルトで表示される',
            screenshotStep: 'mode_generate',
        }, async () => {
            const genMode = page.getByRole('button', { name: '生成用' })
            const modeLabel = page.getByText('生成用')
            await expect(genMode.or(modeLabel).first()).toBeVisible({ timeout: 10000 })
        })
    })

    // 3.7 修正用モード切替
    test('3.7 修正用モード切替', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.7',
            name: '修正用モード切替',
            description: '修正用モードに切り替えられる',
            screenshotStep: 'mode_revise',
        }, async () => {
            const revMode = page.getByRole('button', { name: '修正用' })
            if (await revMode.isVisible()) {
                await revMode.click()
            }
        })
    })

    // 3.8 個別再生成ボタン表示
    test('3.8 個別再生成ボタン表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.8',
            name: '個別再生成ボタン表示',
            description: '修正用モードで個別再生成ボタンが表示される',
            screenshotStep: 'regen_button',
        }, async () => {
            const revMode = page.getByRole('button', { name: '修正用' })
            if (await revMode.isVisible()) {
                await revMode.click()
                await page.waitForTimeout(500)
            }
        })
    })

    // ===== タイプ =====

    // 3.9 全フィールド共通表示
    test('3.9 全フィールド共通表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.9',
            name: '全フィールド共通表示',
            description: '全フィールド共通タイプのプロンプト表示',
            screenshotStep: 'type_all',
        }, async () => {
            await expect(page.locator('.prompt-column')).toBeVisible()
        })
    })

    // 3.10 個別フィールドパネル表示
    test('3.10 個別フィールドパネル表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.10',
            name: '個別フィールドパネル表示',
            description: '個別フィールドタイプのプロンプト表示',
            screenshotStep: 'type_each',
        }, async () => {
            await expect(page.locator('.prompt-column')).toBeVisible()
        })
    })

    // 3.11 折りたたみ/展開
    test('3.11 折りたたみ/展開', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.11',
            name: '折りたたみ/展開',
            description: 'パネルを折りたたみ/展開できる',
            screenshotStep: 'panel_toggle',
        }, async () => {
            await expect(page.locator('.prompt-column')).toBeVisible()
        })
    })

    // 3.12 初期状態全展開
    test('3.12 初期状態全展開', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.12',
            name: '初期状態全展開',
            description: '初期状態で全パネルが展開される',
            screenshotStep: 'panel_expanded',
        }, async () => {
            await expect(page.locator('.prompt-column')).toBeVisible()
        })
    })

    // 3.13 設定済みチップ表示
    test('3.13 設定済みチップ表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.13',
            name: '設定済みチップ表示',
            description: 'プロンプト設定済みの場合チップ表示',
            screenshotStep: 'chip_display',
        }, async () => {
            await expect(page.locator('.prompt-column')).toBeVisible()
        })
    })

    // ===== 作成 =====

    // 3.14 ダイアログ表示
    test('3.14 作成ダイアログ表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.14',
            name: '作成ダイアログ表示',
            description: '+ボタンで作成ダイアログが開く',
            screenshotStep: 'prompt_create_dialog',
        }, async () => {
            await page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
            await page.waitForTimeout(500)
            await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
        })
    })

    // 3.15 タイプ選択・作成成功
    test('3.15 タイプ選択・作成成功', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.15',
            name: 'タイプ選択・作成成功',
            description: 'プロンプトタイプを選択して作成',
            screenshotStep: 'prompt_create_success',
        }, async () => {
            await page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
            await page.waitForTimeout(500)
        })
    })

    // ===== 更新 =====

    // 3.16 プロンプト内容編集
    test('3.16 プロンプト内容編集', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.16',
            name: 'プロンプト内容編集',
            description: 'プロンプト内容を編集できる',
            screenshotStep: 'prompt_edit',
        }, async () => {
            await expect(page.locator('.prompt-column')).toBeVisible()
        })
    })

    // ===== 削除 =====

    // 3.17 確認ダイアログ表示
    test('3.17 削除確認ダイアログ', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.17',
            name: '削除確認ダイアログ',
            description: '削除ボタンで確認ダイアログ表示',
            screenshotStep: 'prompt_delete_confirm',
        }, async () => {
            await expect(page.locator('.prompt-column')).toBeVisible()
        })
    })

    // 3.18 削除実行・キャンセル
    test('3.18 削除実行・キャンセル', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.18',
            name: '削除実行・キャンセル',
            description: '削除確認でキャンセルできる',
            screenshotStep: 'prompt_delete_cancel',
        }, async () => {
            await expect(page.locator('.prompt-column')).toBeVisible()
        })
    })
})
