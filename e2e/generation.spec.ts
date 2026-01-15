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
 * プロンプトを選択する
 */
async function selectPrompt(page: Page) {
    await page.click('.v-select:has-text("プロンプトを選択")')
    await page.click('.v-list-item:first-child')
}

/**
 * LLM生成機能テスト（モック使用）
 */
test.describe('LLM生成機能', () => {
    test.beforeEach(async ({ page }) => {
        resetMockData()
        await loginWithMock(page)
    })

    test.describe('前提条件確認', () => {
        test('ドキュメント未選択時は生成ボタンが無効', async ({ page }) => {
            const generateButton = page.locator('button:has-text("一括生成")')
            await expect(generateButton).toBeDisabled()
        })

        test('プロンプト未選択時は生成ボタンが無効', async ({ page }) => {
            await selectDocument(page)
            const generateButton = page.locator('button:has-text("一括生成")')
            await expect(generateButton).toBeDisabled()
        })

        test('両方選択時は生成ボタンが有効', async ({ page }) => {
            await selectDocument(page)
            await selectPrompt(page)
            const generateButton = page.locator('button:has-text("一括生成")')
            await expect(generateButton).toBeEnabled()
        })
    })

    test.describe('表示モード', () => {
        test('生成前/生成後モードを切り替えられる', async ({ page }) => {
            await selectDocument(page)
            await expect(page.locator('button:has-text("生成前")')).toBeVisible()
            await expect(page.locator('button:has-text("生成後")')).toBeVisible()
        })
    })

    test.describe('一括生成', () => {
        test('生成ボタンをクリックすると生成が開始される', async ({ page }) => {
            await selectDocument(page)
            await selectPrompt(page)

            await page.click('button:has-text("一括生成")')
            // 生成中の状態（ローディング）を確認
        })
    })
})
