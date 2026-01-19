/**
 * ドキュメントCRUDテスト
 *
 * ライブラリ共通のrunTestヘルパーを使用
 */

import { test, expect, type Page } from '@playwright/test'
import { runTest, createReporter } from './lib'
import { setupApiMocks, resetMockData } from './mocks/api-mock'

// 共通レポーター
const reporter = createReporter()

/**
 * テスト前にログイン状態を設定
 */
async function setupAuth(page: Page) {
    await setupApiMocks(page)
    // 認証状態をローカルストレージに設定
    await page.addInitScript(() => {
        localStorage.setItem('auth', JSON.stringify({
            isAuthenticated: true,
            user: { id: 1, username: 'admin', role: 'admin' },
            token: 'mock-token',
        }))
    })
}

/**
 * ドキュメントCRUDテスト
 */
test.describe('ドキュメント管理テスト', () => {
    test.beforeEach(async ({ page }) => {
        resetMockData()
        await setupAuth(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // 一覧表示テスト
    test('2.1 ドロップダウンに一覧表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.1',
            name: 'ドロップダウン一覧表示',
            description: 'ドキュメント一覧がドロップダウンに表示される',
            screenshotStep: 'doc_list',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // ドロップダウンをクリック
            await page.click('.document-selector, [data-testid="document-selector"]')
            await page.waitForTimeout(500)
            // 一覧が表示されることを確認
            await expect(page.locator('.v-list-item, .v-menu')).toBeVisible({ timeout: 5000 })
        })
    })

    test('2.2 未選択時メッセージ', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.2',
            name: '未選択時メッセージ',
            description: 'ドキュメント未選択時に選択促進メッセージが表示される',
            screenshotStep: 'no_selection',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 未選択時のメッセージを確認
            await expect(page.locator('text=ドキュメントを選択')).toBeVisible({ timeout: 5000 })
        })
    })

    // 作成テスト
    test('2.8 作成ダイアログ表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.8',
            name: '作成ダイアログ表示',
            description: '新規作成ボタンクリックでダイアログが表示される',
            screenshotStep: 'create_dialog',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 新規作成ボタンをクリック
            await page.click('[data-testid="create-document"], button:has-text("新規"), .v-btn--icon:has(.mdi-plus)')
            await page.waitForTimeout(500)
            // ダイアログが表示されることを確認
            await expect(page.locator('.v-dialog, [role="dialog"]')).toBeVisible({ timeout: 5000 })
        })
    })

    test('2.9 タイトル空で保存不可', async ({ page }) => {
        await runTest(reporter, page, {
            id: '2.9',
            name: 'タイトル空で保存不可',
            description: 'タイトル未入力時は保存ボタンが無効',
            screenshotStep: 'empty_title',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 新規作成ダイアログを開く
            await page.click('[data-testid="create-document"], button:has-text("新規"), .v-btn--icon:has(.mdi-plus)')
            await page.waitForTimeout(500)
            // タイトルを空にする
            const titleInput = page.locator('input[placeholder*="タイトル"], input[label*="タイトル"]')
            await titleInput.clear()
            // 保存ボタンが無効であることを確認
            await expect(page.locator('button:has-text("保存")')).toBeDisabled()
        })
    })
})
