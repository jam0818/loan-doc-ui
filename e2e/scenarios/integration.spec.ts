/**
 * 統合シナリオテスト
 * 
 * エンドツーエンドの全体フロー検証
 * 
 * ベストプラクティス:
 * - 各テストが独立
 * - 実際の業務フローを網羅
 * - 各テストにbefore/afterエビデンス
 */
import { test, expect } from '@playwright/test'
import { runTest, createReporter, loginAndSetup, createDocumentViaUI, createPromptViaUI, deleteDocumentViaUI, runGenerationViaUI, logoutViaUI, selectPromptViaUI } from '../lib'

const reporter = createReporter()

test.describe('統合シナリオ', () => {
    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ============================================
    // E2Eフローシナリオ
    // ============================================

    test.skip('E2E-01: 完全なユーザーフロー', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('E2E-01', 'before')
        const afterPath = reporter.getScreenshotPath('E2E-01', 'after')

        await runTest(reporter, page, {
            id: 'E2E-01',
            name: '完全なユーザーフロー',
            description: 'ログイン→文書作成→プロンプト作成→生成→ログアウトの一連の流れ',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            // 1. ログイン
            await loginAndSetup(page)

            // エビデンス: ログイン後
            await page.screenshot({ path: beforePath, fullPage: true })

            // 2. ドキュメント作成
            const docTitle = `E2E_Doc_${Date.now()}`
            await createDocumentViaUI(page, docTitle, [
                { name: '要約', content: 'テスト文書の要約です。' }
            ])
            await expect(page.locator('.document-title, h3')).toContainText(docTitle)

            // 3. プロンプト作成
            const promptTitle = `E2E_Prompt_${Date.now()}`
            await createPromptViaUI(page, promptTitle)
            await expect(page.getByText(promptTitle).first()).toBeVisible()

            // ストアの同期/反応性の問題を回避するためにリロードして再選択する（堅牢化）
            await page.reload()
            await expect(page.locator('.document-column')).toBeVisible()

            // ドキュメント再選択
            await page.locator('.document-column .v-input').click()
            await page.getByRole('option', { name: docTitle }).first().click()
            await expect(page.locator('.document-title, h3')).toContainText(docTitle)

            // プロンプト再選択（堅牢ヘ​​ルパー使用）
            await selectPromptViaUI(page, promptTitle)

            // 4. 生成実行
            await runGenerationViaUI(page, {
                beforePath: reporter.getScreenshotPath('E2E-01', 'generation-before'),
                afterPath: reporter.getScreenshotPath('E2E-01', 'generation-after')
            })
            await expect(page.locator('.generate-column textarea')).toBeVisible()

            // 5. 後始末（ドキュメント削除）
            await deleteDocumentViaUI(page)

            // 6. ログアウト
            await logoutViaUI(page)
            await expect(page).toHaveURL(/.*login/)

            // エビデンス: ログアウト後
            await page.screenshot({ path: afterPath, fullPage: true })
        })
    })

    test.skip('E2E-02: 複数ドキュメント・プロンプト操作', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('E2E-02', 'before')
        const afterPath = reporter.getScreenshotPath('E2E-02', 'after')

        await runTest(reporter, page, {
            id: 'E2E-02',
            name: '複数リソース操作',
            description: '複数のドキュメント・プロンプトを作成して切り替えられること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            // 1. ログイン
            await loginAndSetup(page)

            // 2. 複数ドキュメント作成
            const docTitle1 = `E2E_Doc1_${Date.now()}`
            const docTitle2 = `E2E_Doc2_${Date.now()}`
            await createDocumentViaUI(page, docTitle1, [
                { name: 'F1', content: 'C1' }
            ])
            await createDocumentViaUI(page, docTitle2, [
                { name: 'F2', content: 'C2' }
            ])

            // エビデンス: 2つ目のドキュメント作成後
            await page.screenshot({ path: beforePath, fullPage: true })

            // 3. ドキュメント切り替え
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.getByRole('option', { name: docTitle1 }).first().click()
            await expect(page.locator('.document-title, h3')).toContainText(docTitle1)

            // 4. 各ドキュメントにプロンプトを作成
            const promptTitle = `E2E_Prompt_${Date.now()}`
            await createPromptViaUI(page, promptTitle)

            // 5. 後始末
            await deleteDocumentViaUI(page)

            // 2つ目のドキュメントを選択して削除
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.getByRole('option', { name: docTitle2 }).first().click()
            await deleteDocumentViaUI(page)

            // エビデンス: クリーンアップ後
            await page.screenshot({ path: afterPath, fullPage: true })

            // 6. ログアウト
            await logoutViaUI(page)
        })
    })

    test.skip('E2E-03: セッション復帰フロー', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('E2E-03', 'before')
        const afterPath = reporter.getScreenshotPath('E2E-03', 'after')

        await runTest(reporter, page, {
            id: 'E2E-03',
            name: 'セッション復帰フロー',
            description: 'リロード後もデータが維持されていること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            // 1. ログイン
            await loginAndSetup(page)

            // 2. ドキュメント作成
            const docTitle = `E2E_Session_${Date.now()}`
            await createDocumentViaUI(page, docTitle, [
                { name: 'SessionField', content: 'Content' }
            ])

            // エビデンス: リロード前
            await page.screenshot({ path: beforePath, fullPage: true })

            // 3. リロード
            await page.reload()
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })

            // 4. データが維持されていることを確認
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await expect(page.getByRole('option', { name: docTitle })).toBeVisible()
            await page.getByRole('option', { name: docTitle }).first().click()

            // エビデンス: リロード後
            await page.screenshot({ path: afterPath, fullPage: true })

            // 5. 後始末
            await deleteDocumentViaUI(page)
            await logoutViaUI(page)
        })
    })
})
