/**
 * ドキュメントCRUDテスト
 *
 * 共通ライブラリのrunTestヘルパーとgetByRoleを使用
 */

import { test, expect, type Page } from '@playwright/test'
import { runTest, createReporter } from './lib'
import { setupApiMocks, resetMockData } from './mocks/api-mock'

// 共通レポーター
const reporter = createReporter()

/**
 * テスト前にログイン状態とAPIモックを設定
 */
async function setupAuthAndMocks(page: Page) {
    await setupApiMocks(page)
    await page.addInitScript(() => {
        localStorage.setItem('auth', JSON.stringify({
            isAuthenticated: true,
            user: { id: 1, username: 'admin', role: 'admin' },
            token: 'mock-token',
        }))
    })
}

/**
 * ドキュメント管理テスト
 */
test.describe('ドキュメント管理テスト', () => {
    test.beforeEach(async ({ page }) => {
        resetMockData()
        await setupAuthAndMocks(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // 2.1 ドキュメントカラム表示
    test('2.1 ドキュメントカラム表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.1',
            name: 'ドキュメントカラム表示',
            description: 'ドキュメントカラムが正しく表示される',
            screenshotStep: 'doc_column',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // ドキュメントカラムが表示される
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
            // タイトル「ドキュメント」が表示される
            await expect(page.getByText('ドキュメント').first()).toBeVisible()
        })
    })

    // 2.2 ドロップダウン表示
    test('2.2 ドロップダウン表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.2',
            name: 'ドロップダウン表示',
            description: '文書選択ドロップダウンが表示される',
            screenshotStep: 'dropdown',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // ドロップダウン（combobox）が表示される
            await expect(page.getByRole('combobox', { name: '文書を選択' })).toBeVisible({ timeout: 10000 })
        })
    })

    // 2.3 未選択時メッセージ
    test('2.3 未選択時メッセージ', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.3',
            name: '未選択時メッセージ',
            description: '文書未選択時にガイダンスが表示される',
            screenshotStep: 'empty_state',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 未選択時のメッセージ
            await expect(page.getByText('文書を選択してください')).toBeVisible({ timeout: 10000 })
        })
    })

    // 2.4 新規作成ボタン
    test('2.4 新規作成ボタン', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.4',
            name: '新規作成ボタン',
            description: '新規作成ボタン（+）が表示される',
            screenshotStep: 'create_btn',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // +ボタンが表示される
            await expect(page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-plus') })).toBeVisible({ timeout: 10000 })
        })
    })

    // 2.5 新規作成ダイアログ
    test('2.5 新規作成ダイアログ', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.5',
            name: '新規作成ダイアログ',
            description: '+ボタンクリックで作成ダイアログが開く',
            screenshotStep: 'create_dialog',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // +ボタンをクリック
            await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
            await page.waitForTimeout(500)
            // ダイアログが開く
            await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
            await expect(page.getByText('新規文書作成')).toBeVisible()
        })
    })

    // 2.6 編集ボタン無効（未選択時）
    test('2.6 編集ボタン無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.6',
            name: '編集ボタン無効',
            description: '文書未選択時は編集ボタンが無効',
            screenshotStep: 'edit_disabled',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 編集ボタンが無効
            const editBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })
            await expect(editBtn).toBeDisabled()
        })
    })

    // 2.7 削除ボタン無効（未選択時）
    test('2.7 削除ボタン無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.7',
            name: '削除ボタン無効',
            description: '文書未選択時は削除ボタンが無効',
            screenshotStep: 'delete_disabled',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 削除ボタンが無効
            const deleteBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-delete') })
            await expect(deleteBtn).toBeDisabled()
        })
    })

    // 2.8 ドロップダウンクリック
    test('2.8 ドロップダウンクリック', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.8',
            name: 'ドロップダウンクリック',
            description: 'ドロップダウンをクリックすると一覧が表示される',
            screenshotStep: 'dropdown_open',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // ドロップダウンをクリック
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.waitForTimeout(500)
            // メニュー（listbox）が表示される
            await expect(page.getByRole('listbox')).toBeVisible({ timeout: 5000 })
        })
    })
})
