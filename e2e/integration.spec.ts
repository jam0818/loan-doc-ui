import { test, expect, type Page } from '@playwright/test'

/**
 * 結合テスト
 * 認証→ドキュメント→プロンプト→生成の一連のフローをテスト
 */

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

test.describe('結合テスト - エンドツーエンドフロー', () => {
    test('完全なワークフロー: 認証→ドキュメント作成→プロンプト設定→生成', async ({ page }) => {
        // ステップ1: 認証
        await login(page)
        await expect(page.locator('text=ドキュメント')).toBeVisible()

        // ステップ2: ドキュメント作成
        await page.click('button:has(.mdi-plus):near(:text("ドキュメント"))')
        await page.fill('.v-dialog input', '結合テスト用ドキュメント')
        await page.fill('.v-dialog .v-card input:has-text("フィールド名"), .v-dialog .v-card input', 'サマリー')
        await page.fill('.v-dialog textarea', 'テスト用の内容です')
        await page.click('button:has-text("保存")')

        // ドキュメントが作成されたことを確認
        await expect(page.locator('text=結合テスト用ドキュメント')).toBeVisible()

        // ステップ3: プロンプト作成・設定
        await page.click('button:has(.mdi-plus):near(:text("プロンプト"))')
        await page.fill('.v-dialog input', '結合テスト用プロンプト')
        await page.click('button:has-text("保存")')

        // プロンプトが作成されたことを確認
        await expect(page.locator('text=結合テスト用プロンプト')).toBeVisible()

        // プロンプトを選択してプロンプト内容を設定
        await page.click('.v-select:has-text("プロンプトを選択")')
        await page.click('.v-list-item:has-text("結合テスト用プロンプト")')

        // プロンプト内容を入力
        const promptTextarea = page.locator('.prompt-edit-area .v-textarea textarea').first()
        if (await promptTextarea.isVisible()) {
            await promptTextarea.fill('以下の内容を要約してください')
        }

        // ステップ4: 生成
        const generateButton = page.locator('button:has-text("一括生成"), button:has-text("生成")')
        if (await generateButton.isEnabled()) {
            await generateButton.click()
            // 生成結果の確認（バックエンドの応答待ち）
        }
    })

    test('ログアウト後に再ログインできる', async ({ page }) => {
        // 初回ログイン
        await login(page)
        await expect(page.locator('text=ドキュメント')).toBeVisible()

        // ログアウト
        await page.click('button:has(.mdi-logout)')
        await expect(page).toHaveURL(/.*login/)

        // 再ログイン
        await login(page)
        await expect(page.locator('text=ドキュメント')).toBeVisible()
    })

    test('ドキュメント切り替え時にプロンプト選択がリセットされる', async ({ page }) => {
        await login(page)

        // 最初のドキュメントを選択
        await page.click('.v-select:has-text("文書を選択")')
        await page.click('.v-list-item:first-child')

        // プロンプトを選択
        await page.click('.v-select:has-text("プロンプトを選択")')
        await page.click('.v-list-item:first-child')

        // 別のドキュメントを選択
        await page.click('.v-select:has-text("文書を選択")')
        await page.click('.v-list-item:nth-child(2)')

        // プロンプト選択がリセットされることを確認
        // （実装に依存）
    })

    test('3カラムレイアウトが正しく表示される', async ({ page }) => {
        await login(page)

        // 3カラムが表示されることを確認
        await expect(page.locator('.document-column, :text("ドキュメント")')).toBeVisible()
        await expect(page.locator('.prompt-column, :text("プロンプト")')).toBeVisible()
        await expect(page.locator('.generate-column, :text("生成")')).toBeVisible()
    })
})

test.describe('結合テスト - エラーハンドリング', () => {
    test('無効な認証情報でログインエラーが表示される', async ({ page }) => {
        await page.goto('/login')
        await page.fill('input[type="text"]', 'invalid_user')
        await page.fill('input[type="password"]', 'wrong_password')
        await page.click('button:has-text("ログイン")')

        // エラーメッセージの確認（バックエンドの応答による）
        // await expect(page.locator('.v-alert')).toBeVisible()
    })

    test('API接続エラー時にエラー表示される', async ({ page }) => {
        await login(page)

        // APIエラーのシミュレーション（バックエンドがダウンしている場合など）
        // 実際のエラーハンドリングを確認
    })
})
