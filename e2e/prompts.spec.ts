import { test, expect, type Page } from '@playwright/test'
import { setupApiMocks, resetMockData } from './mocks/api-mock'

/**
 * 共通ヘルパー: モック付きログイン処理
 */
async function loginWithMock(page: Page) {
    await setupApiMocks(page)
    await page.goto('/login')
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'password')
    await page.click('button:has-text("ログイン")')
    await page.waitForURL('/')
}

/**
 * ドキュメントを選択する
 */
async function selectDocument(page: Page) {
    await page.click('.v-select:has-text("文書を選択")')
    await page.click('.v-list-item:first-child')
}

/**
 * プロンプトCRUDテスト（モック使用）
 */
test.describe('プロンプトCRUD', () => {
    test.beforeEach(async ({ page }) => {
        resetMockData()
        await loginWithMock(page)
        await selectDocument(page)
    })

    test.describe('一覧・選択', () => {
        test('プロンプト一覧がドロップダウンに表示される', async ({ page }) => {
            await page.click('.v-select:has-text("プロンプトを選択")')
            await expect(page.locator('.v-list-item:has-text("テストプロンプト1")')).toBeVisible()
            await expect(page.locator('.v-list-item:has-text("テストプロンプト2")')).toBeVisible()
        })

        test('プロンプト選択時に編集エリアが表示される', async ({ page }) => {
            await page.click('.v-select:has-text("プロンプトを選択")')
            await page.click('.v-list-item:first-child')
            await expect(page.locator('.v-textarea')).toBeVisible()
        })
    })

    test.describe('モード切替', () => {
        test('生成用/修正用モードを切り替えられる', async ({ page }) => {
            await page.click('.v-select:has-text("プロンプトを選択")')
            await page.click('.v-list-item:first-child')

            await expect(page.locator('.v-btn--active:has-text("生成用")')).toBeVisible()
            await page.click('button:has-text("修正用")')
            await expect(page.locator('.v-btn--active:has-text("修正用")')).toBeVisible()
        })
    })

    test.describe('Create（作成）', () => {
        test('新規作成ダイアログが開く', async ({ page }) => {
            // プロンプト列の+ボタンをクリック
            const addButtons = page.locator('button:has(.mdi-plus)')
            await addButtons.nth(1).click()
            await expect(page.locator('text=新規プロンプト作成')).toBeVisible()
        })
    })

    test.describe('Delete（削除）', () => {
        test('削除確認ダイアログが表示される', async ({ page }) => {
            await page.click('.v-select:has-text("プロンプトを選択")')
            await page.click('.v-list-item:first-child')
            // プロンプト列の削除ボタン
            const deleteButtons = page.locator('button:has(.mdi-delete)')
            await deleteButtons.nth(1).click()
            await expect(page.locator('text=削除の確認')).toBeVisible()
        })
    })
})
