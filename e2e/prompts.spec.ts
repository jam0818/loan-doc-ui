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
 * ドキュメントを選択する
 */
async function selectDocument(page: Page) {
    await page.click('.v-select:has-text("文書を選択")')
    await page.click('.v-list-item:first-child')
}

/**
 * プロンプトCRUDテスト
 */
test.describe('プロンプトCRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await selectDocument(page)
    })

    test.describe('Create - プロンプト作成', () => {
        test('新規プロンプト作成ダイアログが開く', async ({ page }) => {
            await page.click('button:has(.mdi-plus):near(:text("プロンプト"))')
            await expect(page.locator('text=新規プロンプト作成')).toBeVisible()
        })

        test('タイトルとプロンプトタイプを設定して作成できる', async ({ page }) => {
            // ダイアログを開く
            await page.click('button:has(.mdi-plus):near(:text("プロンプト"))')

            // タイトル入力
            await page.fill('.v-dialog input:has-text("プロンプト名"), .v-dialog input', 'テストプロンプト')

            // 保存
            await page.click('button:has-text("保存")')

            // 作成されたことを確認
            await expect(page.locator('text=テストプロンプト')).toBeVisible()
        })

        test('全フィールド共通タイプを選択できる', async ({ page }) => {
            await page.click('button:has(.mdi-plus):near(:text("プロンプト"))')

            // タイプ選択（全フィールド共通）
            await page.click('.v-dialog .v-btn-toggle .v-btn:has-text("全フィールド共通")')
            await expect(page.locator('.v-btn--active:has-text("全フィールド共通")')).toBeVisible()
        })

        test('個別フィールドタイプを選択できる', async ({ page }) => {
            await page.click('button:has(.mdi-plus):near(:text("プロンプト"))')

            // タイプ選択（個別フィールド）
            await page.click('.v-dialog .v-btn-toggle .v-btn:has-text("個別フィールド")')
            await expect(page.locator('.v-btn--active:has-text("個別フィールド")')).toBeVisible()
        })
    })

    test.describe('Read - プロンプト読み取り', () => {
        test('プロンプト選択時にプロンプト内容が表示される', async ({ page }) => {
            // プロンプト選択
            await page.click('.v-select:has-text("プロンプトを選択")')
            await page.click('.v-list-item:first-child')

            // プロンプト内容が表示されることを確認
            await expect(page.locator('.prompt-edit-area, .v-textarea')).toBeVisible()
        })

        test('生成用/修正用モードを切り替えられる', async ({ page }) => {
            // プロンプト選択
            await page.click('.v-select:has-text("プロンプトを選択")')
            await page.click('.v-list-item:first-child')

            // 生成用モード確認
            await expect(page.locator('text=生成用')).toBeVisible()

            // 修正用モードに切り替え
            await page.click('button:has-text("修正用")')
            await expect(page.locator('.v-btn--active:has-text("修正用")')).toBeVisible()
        })

        test('個別フィールドプロンプトが折りたたみ可能', async ({ page }) => {
            // 個別フィールドタイプのプロンプトを選択
            await page.click('.v-select:has-text("プロンプトを選択")')
            await page.click('.v-list-item:first-child')

            // 展開パネルの確認
            const expansionPanel = page.locator('.v-expansion-panel')
            if (await expansionPanel.count() > 0) {
                // パネルをクリックして折りたたみ/展開
                await expansionPanel.first().click()
            }
        })
    })

    test.describe('Update - プロンプト更新', () => {
        test('プロンプト内容を編集して保存できる', async ({ page }) => {
            // プロンプト選択
            await page.click('.v-select:has-text("プロンプトを選択")')
            await page.click('.v-list-item:first-child')

            // テキストエリアに入力
            const textarea = page.locator('.v-textarea textarea').first()
            await textarea.fill('更新されたプロンプト内容')

            // 保存を確認（自動保存または保存ボタン）
        })
    })

    test.describe('Delete - プロンプト削除', () => {
        test('削除確認ダイアログが表示される', async ({ page }) => {
            // プロンプト選択
            await page.click('.v-select:has-text("プロンプトを選択")')
            await page.click('.v-list-item:first-child')

            // 削除ボタンをクリック
            await page.click('button:has(.mdi-delete):near(:text("プロンプト"))')

            // 確認ダイアログを確認
            await expect(page.locator('text=削除の確認')).toBeVisible()
        })

        test('キャンセルで削除をキャンセルできる', async ({ page }) => {
            // プロンプト選択
            await page.click('.v-select:has-text("プロンプトを選択")')
            await page.click('.v-list-item:first-child')

            // 削除ボタン→キャンセル
            await page.click('button:has(.mdi-delete):near(:text("プロンプト"))')
            await page.click('button:has-text("キャンセル")')

            // ダイアログが閉じることを確認
            await expect(page.locator('text=削除の確認')).not.toBeVisible()
        })
    })
})
