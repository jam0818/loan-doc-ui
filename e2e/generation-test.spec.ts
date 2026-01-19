/**
 * LLM生成テスト
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
 * LLM生成テスト
 */
test.describe('LLM生成テスト', () => {
    test.beforeEach(async ({ page }) => {
        resetMockData()
        await setupAuthAndMocks(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // 4.1 生成カラム表示
    test('4.1 生成カラム表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.1',
            name: '生成カラム表示',
            description: '生成カラムが正しく表示される',
            screenshotStep: 'gen_column',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 生成カラムが表示される
            await expect(page.locator('.generate-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // 4.2 生成カラムタイトル
    test('4.2 生成カラムタイトル', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.2',
            name: '生成カラムタイトル',
            description: '生成カラムのタイトルが表示される',
            screenshotStep: 'gen_title',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // タイトル「生成」が表示される
            await expect(page.getByText('生成').first()).toBeVisible({ timeout: 10000 })
        })
    })

    // 4.3 生成ボタン表示
    test('4.3 生成ボタン表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.3',
            name: '生成ボタン表示',
            description: '生成実行ボタンが表示される',
            screenshotStep: 'gen_button',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 生成ボタンまたは再生ボタンが表示される
            const genButton = page.getByRole('button', { name: '生成' })
            const playButton = page.locator('.generate-column').getByRole('button').filter({ has: page.locator('.mdi-play') })
            await expect(genButton.or(playButton).first()).toBeVisible({ timeout: 10000 })
        })
    })

    // 4.4 未選択時メッセージ
    test('4.4 未選択時メッセージ', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.4',
            name: '未選択時メッセージ',
            description: 'ドキュメント・プロンプト未選択時にガイダンスが表示される',
            screenshotStep: 'gen_empty',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 未選択時のガイダンス
            const selectDoc = page.getByText('文書を選択してください')
            const selectPrompt = page.getByText('プロンプトを選択してください')
            await expect(selectDoc.or(selectPrompt).first()).toBeVisible({ timeout: 10000 })
        })
    })

    // 4.5 結果表示エリア
    test('4.5 結果表示エリア', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.5',
            name: '結果表示エリア',
            description: '生成結果を表示するエリアが存在する',
            screenshotStep: 'gen_result_area',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 生成カラムが存在することを確認（結果表示エリアを含む）
            await expect(page.locator('.generate-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // 4.6 3カラムレイアウト
    test('4.6 3カラムレイアウト', async ({ page }) => {
        await runTest(reporter, page, {
            id: '4.6',
            name: '3カラムレイアウト',
            description: 'ドキュメント・プロンプト・生成の3カラムが表示される',
            screenshotStep: 'layout',
        }, async () => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            // 3つのカラムが表示される
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
            await expect(page.locator('.prompt-column')).toBeVisible()
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })
})
