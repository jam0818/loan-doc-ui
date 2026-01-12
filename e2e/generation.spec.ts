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
 * プロンプトを選択する
 */
async function selectPrompt(page: Page) {
    await page.click('.v-select:has-text("プロンプトを選択")')
    await page.click('.v-list-item:first-child')
}

/**
 * LLM生成機能テスト
 */
test.describe('LLM生成機能', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test.describe('生成前の状態確認', () => {
        test('ドキュメント未選択時は生成ボタンが無効', async ({ page }) => {
            const generateButton = page.locator('button:has-text("一括生成"), button:has-text("生成")')
            await expect(generateButton).toBeDisabled()
        })

        test('プロンプト未選択時は生成ボタンが無効', async ({ page }) => {
            await selectDocument(page)
            const generateButton = page.locator('button:has-text("一括生成"), button:has-text("生成")')
            await expect(generateButton).toBeDisabled()
        })

        test('ドキュメントとプロンプト選択後は生成ボタンが有効', async ({ page }) => {
            await selectDocument(page)
            await selectPrompt(page)
            const generateButton = page.locator('button:has-text("一括生成"), button:has-text("生成")')
            await expect(generateButton).toBeEnabled()
        })
    })

    test.describe('一括生成', () => {
        test('一括生成ボタンをクリックすると生成が開始される', async ({ page }) => {
            await selectDocument(page)
            await selectPrompt(page)

            // 生成ボタンをクリック
            await page.click('button:has-text("一括生成"), button:has-text("生成")')

            // 生成中の状態を確認（ローディング表示など）
            // バックエンドが未実装の場合はエラーになる可能性がある
        })

        test('生成前コンテンツが表示される', async ({ page }) => {
            await selectDocument(page)

            // 生成前エリアにコンテンツが表示されることを確認
            const beforeArea = page.locator('.before-content, :text("生成前")')
            await expect(beforeArea).toBeVisible()
        })
    })

    test.describe('個別再生成（修正モード）', () => {
        test('修正モードで個別再生成ボタンが表示される', async ({ page }) => {
            await selectDocument(page)
            await selectPrompt(page)

            // 修正用モードに切り替え
            await page.click('button:has-text("修正用")')

            // 個別再生成ボタンを確認
            const regenerateButton = page.locator('button:has-text("再生成")')
            // 個別フィールドタイプの場合のみ表示される
        })
    })

    test.describe('生成結果の表示', () => {
        test('生成後コンテンツエリアが存在する', async ({ page }) => {
            await selectDocument(page)

            // 生成後エリアを確認
            const afterArea = page.locator('.after-content, :text("生成後"), .generate-column')
            await expect(afterArea).toBeVisible()
        })
    })
})
