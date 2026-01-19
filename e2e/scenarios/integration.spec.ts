/**
 * 統合シナリオテスト
 * 
 * エンドツーエンドの全体フロー:
 * ドキュメント作成 -> プロンプト作成 -> 生成 -> ログアウト
 */
import { test, expect } from '@playwright/test'
import { runTest, createReporter, loginAndSetup, createDocumentViaUI, createPromptViaUI, deleteDocumentViaUI } from '../lib'

const reporter = createReporter()

test.describe('統合シナリオ', () => {
    test.afterAll(async () => {
        await reporter.generateReport()
    })

    test('E2E全体フロー', async ({ page }) => {
        await runTest(reporter, page, {
            id: 'E2E-01',
            name: '全体フロー検証',
            description: '文書作成から生成、ログアウトまでの一連の流れ',
            screenshotStep: 'e2e_flow',
        }, async () => {
            // 1. ログイン
            await loginAndSetup(page)

            // 2. ドキュメント作成
            const docTitle = `E2E_Docs_${Date.now()}`
            await createDocumentViaUI(page, docTitle)

            // 3. プロンプト作成
            const promptTitle = `E2E_Prompt_${Date.now()}`
            await createPromptViaUI(page, promptTitle)

            // 4. 生成実行
            await page.getByRole('button', { name: '生成' }).click()
            await expect(page.locator('.generate-result, textarea')).toBeVisible({ timeout: 30000 })

            // 5. 後始末（ドキュメント削除）
            await deleteDocumentViaUI(page)

            // 6. ログアウト
            await page.locator('.mdi-logout').click()
            await expect(page).toHaveURL(/.*login/)
        })
    })
})
