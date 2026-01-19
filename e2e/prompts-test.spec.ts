/**
 * プロンプトCRUDテスト
 *
 * 共通ライブラリのrunTestヘルパーとVuetifyヘルパーを使用
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
 * プロンプト管理テスト
 */
test.describe('プロンプト管理テスト', () => {
    test.beforeEach(async ({ page }) => {
        resetMockData()
        await setupAuthAndMocks(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // 3.1 プロンプトカラム表示
    test('3.1 プロンプトカラム表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.1',
            name: 'プロンプトカラム表示',
            description: 'プロンプトカラムが正しく表示される',
            screenshotStep: 'prompt_column',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // プロンプトカラムが表示される
            await expect(page.locator('.prompt-column')).toBeVisible({ timeout: 10000 })
            // タイトル「プロンプト」が表示される
            await expect(page.locator('.prompt-column .column-title')).toContainText('プロンプト')
        })
    })

    // 3.2 プロンプトドロップダウン表示
    test('3.2 プロンプトドロップダウン表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.2',
            name: 'ドロップダウン表示',
            description: 'プロンプト選択ドロップダウンが表示される',
            screenshotStep: 'prompt_dropdown',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // ドロップダウンが表示される
            await expect(page.locator('.prompt-column .v-select')).toBeVisible({ timeout: 10000 })
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
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 未選択時のメッセージまたはガイダンス
            const emptyState = page.locator('.prompt-column .v-empty-state')
            const guidance = page.locator('.prompt-column:has-text("プロンプトを選択")')
            await expect(emptyState.or(guidance).first()).toBeVisible({ timeout: 10000 })
        })
    })

    // 3.4 新規作成ボタン
    test('3.4 新規作成ボタン', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.4',
            name: '新規作成ボタン',
            description: '新規作成ボタン（+）が表示される',
            screenshotStep: 'prompt_create_btn',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // +ボタンが表示される
            await expect(page.locator('.prompt-column .v-btn:has(.mdi-plus)')).toBeVisible({ timeout: 10000 })
        })
    })

    // 3.5 編集ボタン無効（未選択時）
    test('3.5 編集ボタン無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.5',
            name: '編集ボタン無効',
            description: 'プロンプト未選択時は編集ボタンが無効',
            screenshotStep: 'prompt_edit_disabled',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 編集ボタンが無効
            await expect(page.locator('.prompt-column .v-btn:has(.mdi-pencil)')).toBeDisabled()
        })
    })

    // 3.6 削除ボタン無効（未選択時）
    test('3.6 削除ボタン無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.6',
            name: '削除ボタン無効',
            description: 'プロンプト未選択時は削除ボタンが無効',
            screenshotStep: 'prompt_delete_disabled',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 削除ボタンが無効
            await expect(page.locator('.prompt-column .v-btn:has(.mdi-delete)')).toBeDisabled()
        })
    })

    // 3.7 モード切替ボタン
    test('3.7 モード切替表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '3.7',
            name: 'モード切替表示',
            description: '生成用/修正用モード切替が表示される',
            screenshotStep: 'prompt_mode',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // モード切替エリアが表示される（btn-toggleまたはセグメントボタン）
            const modeToggle = page.locator('.prompt-column .v-btn-toggle')
            const modeButtons = page.locator('.prompt-column:has-text("生成用")')
            await expect(modeToggle.or(modeButtons).first()).toBeVisible({ timeout: 10000 })
        })
    })
})
