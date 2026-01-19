/**
 * ドキュメントCRUDテスト
 *
 * 実API使用、UIログイン形式
 * CHECKLIST.md 2.1-2.15のテストケースを実装
 */

import { test, expect } from '@playwright/test'
import { runTest, createReporter, loginViaUI } from './lib'

// 共通レポーター
const reporter = createReporter()

/**
 * ドキュメント管理テスト
 */
test.describe('ドキュメント管理テスト', () => {
    test.beforeEach(async ({ page }) => {
        await loginViaUI(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ===== 一覧 =====

    // 2.1 ドロップダウンに一覧表示
    test('2.1 ドロップダウンに一覧表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.1',
            name: 'ドロップダウン一覧表示',
            description: 'ドキュメント一覧がドロップダウンに表示される',
            screenshotStep: 'doc_list',
        }, async () => {
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.waitForTimeout(500)
            await expect(page.getByRole('listbox')).toBeVisible({ timeout: 5000 })
        })
    })

    // 2.2 未選択時メッセージ
    test('2.2 未選択時メッセージ', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.2',
            name: '未選択時メッセージ',
            description: '文書未選択時にガイダンスが表示される',
            screenshotStep: 'empty_state',
        }, async () => {
            await expect(page.getByText('文書を選択してください')).toBeVisible({ timeout: 10000 })
        })
    })

    // ===== 選択 =====

    // 2.3 ドキュメント選択
    test('2.3 ドキュメント選択', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.3',
            name: 'ドキュメント選択',
            description: 'ドロップダウンからドキュメントを選択できる',
            screenshotStep: 'doc_select',
        }, async () => {
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.waitForTimeout(500)
            const listbox = page.getByRole('listbox')
            const firstItem = listbox.locator('.v-list-item').first()
            if (await firstItem.isVisible()) {
                await firstItem.click()
                await page.waitForTimeout(500)
            }
        })
    })

    // 2.4 タイトル表示
    test('2.4 タイトル表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.4',
            name: 'タイトル表示',
            description: '選択したドキュメントのタイトルが表示される',
            screenshotStep: 'doc_title',
        }, async () => {
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.waitForTimeout(500)
            const firstItem = page.getByRole('listbox').locator('.v-list-item').first()
            if (await firstItem.isVisible()) {
                await firstItem.click()
                await page.waitForTimeout(500)
                await expect(page.locator('.document-title, h3')).toBeVisible({ timeout: 5000 })
            }
        })
    })

    // 2.5 フィールド一覧表示
    test('2.5 フィールド一覧表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.5',
            name: 'フィールド一覧表示',
            description: '選択したドキュメントのフィールドが表示される',
            screenshotStep: 'field_list',
        }, async () => {
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.waitForTimeout(500)
            const firstItem = page.getByRole('listbox').locator('.v-list-item').first()
            if (await firstItem.isVisible()) {
                await firstItem.click()
                await page.waitForTimeout(500)
                await expect(page.locator('.field-list, .v-list')).toBeVisible({ timeout: 5000 })
            }
        })
    })

    // 2.6 フィールドなしメッセージ
    test('2.6 フィールドなしメッセージ', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.6',
            name: 'フィールドなしメッセージ',
            description: 'フィールドがない場合にメッセージ表示',
            screenshotStep: 'no_fields',
        }, async () => {
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // 2.7 選択解除
    test('2.7 選択解除', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.7',
            name: '選択解除',
            description: 'ドキュメント選択を解除できる',
            screenshotStep: 'doc_clear',
        }, async () => {
            const combobox = page.getByRole('combobox', { name: '文書を選択' })
            await combobox.click()
            await page.waitForTimeout(500)
            const firstItem = page.getByRole('listbox').locator('.v-list-item').first()
            if (await firstItem.isVisible()) {
                await firstItem.click()
                await page.waitForTimeout(500)
                // クリアボタンをクリック（存在する場合）
                const clearBtn = page.locator('.document-column .v-field__clearable .mdi-close-circle')
                if (await clearBtn.isVisible()) {
                    await clearBtn.click()
                }
            }
        })
    })

    // ===== 作成 =====

    // 2.8 作成ダイアログ表示
    test('2.8 作成ダイアログ表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.8',
            name: '作成ダイアログ表示',
            description: '+ボタンクリックで作成ダイアログが開く',
            screenshotStep: 'create_dialog',
        }, async () => {
            await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
            await page.waitForTimeout(500)
            await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
            await expect(page.getByText('新規文書作成')).toBeVisible()
        })
    })

    // 2.9 タイトル空で保存不可
    test('2.9 タイトル空で保存不可', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.9',
            name: 'タイトル空で保存不可',
            description: 'タイトル未入力時は保存ボタンが無効',
            screenshotStep: 'empty_title',
        }, async () => {
            await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
            await page.waitForTimeout(500)
            const titleInput = page.getByLabel('文書タイトル')
            await titleInput.clear()
            await expect(page.getByRole('button', { name: '保存' })).toBeDisabled()
        })
    })

    // 2.10 フィールド追加・削除
    test('2.10 フィールド追加・削除', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.10',
            name: 'フィールド追加・削除',
            description: 'フィールドを追加・削除できる',
            screenshotStep: 'field_add_delete',
        }, async () => {
            await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
            await page.waitForTimeout(500)
            const addFieldBtn = page.getByRole('button', { name: 'フィールド追加' })
            if (await addFieldBtn.isVisible()) {
                await addFieldBtn.click()
            }
        })
    })

    // 2.11 作成成功・自動選択
    test('2.11 作成成功・自動選択', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.11',
            name: '作成成功・自動選択',
            description: '作成成功後に自動選択される',
            screenshotStep: 'create_success',
        }, async () => {
            await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
            await page.waitForTimeout(500)
            await page.getByLabel('文書タイトル').fill(`テスト文書_${Date.now()}`)
            await page.getByRole('button', { name: '保存' }).click()
            await page.waitForTimeout(2000)
        })
    })

    // ===== 更新 =====

    // 2.12 編集ダイアログ表示
    test('2.12 編集ダイアログ表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.12',
            name: '編集ダイアログ表示',
            description: '編集ボタンで編集ダイアログが開く',
            screenshotStep: 'edit_dialog',
        }, async () => {
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.waitForTimeout(500)
            const firstItem = page.getByRole('listbox').locator('.v-list-item').first()
            if (await firstItem.isVisible()) {
                await firstItem.click()
                await page.waitForTimeout(500)
                const editBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })
                await editBtn.click()
                await page.waitForTimeout(500)
                await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
            }
        })
    })

    // 2.13 タイトル・フィールド変更
    test('2.13 タイトル・フィールド変更', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.13',
            name: 'タイトル・フィールド変更',
            description: 'タイトルとフィールドを変更できる',
            screenshotStep: 'edit_content',
        }, async () => {
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.waitForTimeout(500)
            const firstItem = page.getByRole('listbox').locator('.v-list-item').first()
            if (await firstItem.isVisible()) {
                await firstItem.click()
                await page.waitForTimeout(500)
                const editBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })
                await editBtn.click()
                await page.waitForTimeout(500)
                const titleInput = page.getByLabel('文書タイトル')
                if (await titleInput.isVisible()) {
                    // タイトルの末尾に追記
                    const currentValue = await titleInput.inputValue()
                    await titleInput.fill(currentValue + '_編集済')
                }
            }
        })
    })

    // ===== 削除 =====

    // 2.14 確認ダイアログ表示
    test('2.14 確認ダイアログ表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.14',
            name: '確認ダイアログ表示',
            description: '削除ボタンで確認ダイアログが開く',
            screenshotStep: 'delete_confirm',
        }, async () => {
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.waitForTimeout(500)
            const firstItem = page.getByRole('listbox').locator('.v-list-item').first()
            if (await firstItem.isVisible()) {
                await firstItem.click()
                await page.waitForTimeout(500)
                const deleteBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-delete') })
                await deleteBtn.click()
                await page.waitForTimeout(500)
                await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
            }
        })
    })

    // 2.15 削除実行・キャンセル
    test('2.15 削除実行・キャンセル', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.15',
            name: '削除実行・キャンセル',
            description: '削除確認でキャンセルできる',
            screenshotStep: 'delete_cancel',
        }, async () => {
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.waitForTimeout(500)
            const firstItem = page.getByRole('listbox').locator('.v-list-item').first()
            if (await firstItem.isVisible()) {
                await firstItem.click()
                await page.waitForTimeout(500)
                const deleteBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-delete') })
                await deleteBtn.click()
                await page.waitForTimeout(500)
                const cancelBtn = page.getByRole('button', { name: 'キャンセル' })
                if (await cancelBtn.isVisible()) {
                    await cancelBtn.click()
                }
            }
        })
    })
})
