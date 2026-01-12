import { test, expect, type Page } from '@playwright/test'

/**
 * 共通ヘルパー: ログイン処理
 */
async function login(page: Page) {
    await page.goto('/login')
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'password')
    await page.click('button:has-text("ログイン")')
    await page.waitForURL('/')
}

/**
 * ドキュメントCRUDテスト
 */
test.describe('ドキュメントCRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test.describe('Create - ドキュメント作成', () => {
        test('新規ドキュメント作成ダイアログが開く', async ({ page }) => {
            await page.click('button:has(.mdi-plus):near(:text("ドキュメント"))')
            await expect(page.locator('text=新規文書作成')).toBeVisible()
        })

        test('タイトルとフィールドを入力して作成できる', async ({ page }) => {
            // ダイアログを開く
            await page.click('button:has(.mdi-plus):near(:text("ドキュメント"))')

            // タイトル入力
            await page.fill('input:has-text("文書タイトル"), .v-dialog input', 'テストドキュメント')

            // フィールド追加
            await page.fill('.v-dialog input:has-text("フィールド名"), .v-dialog .v-card input', 'テストフィールド')
            await page.fill('.v-dialog textarea', 'テストコンテンツ')

            // 保存
            await page.click('button:has-text("保存")')

            // 作成されたことを確認
            await expect(page.locator('text=テストドキュメント')).toBeVisible()
        })

        test('空のタイトルでは作成できない', async ({ page }) => {
            await page.click('button:has(.mdi-plus):near(:text("ドキュメント"))')

            // タイトルを空のまま保存ボタンを確認
            const saveButton = page.locator('button:has-text("保存")')
            await expect(saveButton).toBeDisabled()
        })
    })

    test.describe('Read - ドキュメント読み取り', () => {
        test('ドキュメント選択時にフィールド一覧が表示される', async ({ page }) => {
            // ドキュメント選択
            await page.click('.v-select:has-text("文書を選択")')
            await page.click('.v-list-item:first-child')

            // フィールドが表示されることを確認
            await expect(page.locator('.field-list, .v-list')).toBeVisible()
        })

        test('ドキュメント未選択時は選択促進メッセージが表示される', async ({ page }) => {
            await expect(page.locator('text=文書を選択してください')).toBeVisible()
        })
    })

    test.describe('Update - ドキュメント更新', () => {
        test('編集ダイアログからタイトルを変更できる', async ({ page }) => {
            // ドキュメント選択
            await page.click('.v-select:has-text("文書を選択")')
            await page.click('.v-list-item:first-child')

            // 編集ボタンをクリック
            await page.click('button:has(.mdi-pencil):near(:text("ドキュメント"))')

            // タイトル変更
            await page.fill('.v-dialog input:first-child', '更新されたタイトル')
            await page.click('button:has-text("保存")')

            // 更新を確認
            await expect(page.locator('text=更新されたタイトル')).toBeVisible()
        })
    })

    test.describe('Delete - ドキュメント削除', () => {
        test('削除確認ダイアログが表示される', async ({ page }) => {
            // ドキュメント選択
            await page.click('.v-select:has-text("文書を選択")')
            await page.click('.v-list-item:first-child')

            // 削除ボタンをクリック
            await page.click('button:has(.mdi-delete):near(:text("ドキュメント"))')

            // 確認ダイアログを確認
            await expect(page.locator('text=削除の確認')).toBeVisible()
            await expect(page.locator('text=この操作は取り消せません')).toBeVisible()
        })

        test('キャンセルで削除をキャンセルできる', async ({ page }) => {
            // ドキュメント選択
            await page.click('.v-select:has-text("文書を選択")')
            await page.click('.v-list-item:first-child')

            // 削除ボタン→キャンセル
            await page.click('button:has(.mdi-delete):near(:text("ドキュメント"))')
            await page.click('button:has-text("キャンセル")')

            // ダイアログが閉じることを確認
            await expect(page.locator('text=削除の確認')).not.toBeVisible()
        })

        test('削除を実行するとドキュメントが消える', async ({ page }) => {
            // ドキュメント選択
            await page.click('.v-select:has-text("文書を選択")')
            const firstItem = page.locator('.v-list-item:first-child')
            const title = await firstItem.textContent()
            await firstItem.click()

            // 削除実行
            await page.click('button:has(.mdi-delete):near(:text("ドキュメント"))')
            await page.click('.v-dialog button:has-text("削除")')

            // 削除を確認
            await expect(page.locator(`text=${title}`)).not.toBeVisible()
        })
    })
})
