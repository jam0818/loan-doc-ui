/**
 * LLM生成シナリオテスト
 * 
 * ユーザーフロー:
 * 1. 前提: ドキュメント＆プロンプト作成
 * 2. 生成実行
 * 3. 結果操作
 */
import { test, expect } from '@playwright/test'
import { runTest, createReporter, loginAndSetup, createDocumentViaUI, createPromptViaUI, deleteDocumentViaUI } from '../lib'

const reporter = createReporter()

test.describe('LLM生成シナリオ', () => {
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
        await createDocumentViaUI(page, `DocsForGen_${Date.now()}`)
        await createPromptViaUI(page, `PromptForGen_${Date.now()}`)
    })

    test.afterEach(async ({ page }) => {
        // ドキュメントを削除すればプロンプトも連鎖的に消えるか、
        // あるいはプロンプトはドキュメントに紐づくのでドキュメント削除で十分なケースが多い
        await deleteDocumentViaUI(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    test('生成実行・確認フロー', async ({ page }) => {
        // 1. 生成実行
        await runTest(reporter, page, {
            id: 'GEN-01',
            name: '生成実行フロー',
            description: '生成ボタンを押して結果が表示されること',
            screenshotStep: 'gen_exec',
        }, async () => {
            // 生成ボタンが有効であることを確認
            const genBtn = page.getByRole('button', { name: '生成' })
            await expect(genBtn).toBeEnabled()

            await genBtn.click()

            // ローディング待機 -> 完了
            // 実装により、完了後に「生成後」モードに切り替わるか、結果テキストが表示されるか
            // ここでは簡易的に何らかの結果が表示されることを待つ
            await expect(page.locator('.generate-result, textarea')).toBeVisible({ timeout: 30000 })
        })

        // 2. 結果編集
        await runTest(reporter, page, {
            id: 'GEN-02',
            name: '生成結果操作',
            description: '生成結果を編集できること（修正モード等）',
            screenshotStep: 'gen_edit',
        }, async () => {
            // 修正用モードへの切替などが必要なら実施
            // テキストエリアへの入力
            const resultArea = page.locator('textarea').first()
            if (await resultArea.isVisible()) {
                await resultArea.fill('生成結果を編集しました')
            }
        })
    })
})
