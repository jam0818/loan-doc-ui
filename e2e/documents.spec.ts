import { test, expect, type Page } from '@playwright/test'
import { setupApiMocks, resetMockData, mockData } from './mocks/api-mock'

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
 * ドキュメントCRUDテスト（モック使用）
 */
test.describe('ドキュメントCRUD', () => {
    test.beforeEach(async ({ page }) => {
        resetMockData()
        await loginWithMock(page)
    })

    test.describe('一覧・選択', () => {
        test('ドキュメント一覧がドロップダウンに表示される', async ({ page }) => {
            await page.click('.v-select:has-text("文書を選択")')
            await expect(page.locator('.v-list-item:has-text("テストドキュメント1")')).toBeVisible()
            await expect(page.locator('.v-list-item:has-text("テストドキュメント2")')).toBeVisible()
        })

        test('未選択時は選択促進メッセージが表示される', async ({ page }) => {
            await expect(page.locator('text=文書を選択してください')).toBeVisible()
        })

        test('ドキュメント選択時にフィールド一覧が表示される', async ({ page }) => {
            await page.click('.v-select:has-text("文書を選択")')
            await page.click('.v-list-item:has-text("テストドキュメント1")')

            await expect(page.locator('text=サマリー')).toBeVisible()
            await expect(page.locator('text=詳細')).toBeVisible()
        })
    })

    test.describe('Create（作成）', () => {
        test('新規作成ダイアログが開く', async ({ page }) => {
            await page.click('button:has(.mdi-plus)')
            await expect(page.locator('text=新規文書作成')).toBeVisible()
        })

        test('空タイトルでは保存不可', async ({ page }) => {
            await page.click('button:has(.mdi-plus)')
            const saveButton = page.locator('.v-dialog button:has-text("保存")')
            await expect(saveButton).toBeDisabled()
        })

        test('ドキュメントを作成できる', async ({ page }) => {
            await page.click('button:has(.mdi-plus)')
            await page.fill('.v-dialog input:first-of-type', '新しいドキュメント')
            await page.click('.v-dialog button:has-text("保存")')

            // ダイアログが閉じる
            await expect(page.locator('.v-dialog:has-text("新規文書作成")')).not.toBeVisible()
        })
    })

    test.describe('Update（更新）', () => {
        test('編集ダイアログが開く', async ({ page }) => {
            await page.click('.v-select:has-text("文書を選択")')
            await page.click('.v-list-item:first-child')
            await page.click('button:has(.mdi-pencil)')
            await expect(page.locator('text=文書編集')).toBeVisible()
        })
    })

    test.describe('Delete（削除）', () => {
        test('削除確認ダイアログが表示される', async ({ page }) => {
            await page.click('.v-select:has-text("文書を選択")')
            await page.click('.v-list-item:first-child')
            await page.click('button:has(.mdi-delete)')
            await expect(page.locator('text=削除の確認')).toBeVisible()
        })

        test('キャンセルで削除をキャンセルできる', async ({ page }) => {
            await page.click('.v-select:has-text("文書を選択")')
            await page.click('.v-list-item:first-child')
            await page.click('button:has(.mdi-delete)')
            await page.click('.v-dialog button:has-text("キャンセル")')
            await expect(page.locator('text=削除の確認')).not.toBeVisible()
        })

        test('削除を実行できる', async ({ page }) => {
            const initialCount = mockData.documents.length
            await page.click('.v-select:has-text("文書を選択")')
            await page.click('.v-list-item:first-child')
            await page.click('button:has(.mdi-delete)')
            await page.click('.v-dialog button:has-text("削除")')

            // ダイアログが閉じる
            await expect(page.locator('text=削除の確認')).not.toBeVisible()
        })
    })
})
