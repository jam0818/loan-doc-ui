/**
 * プロンプト管理シナリオテスト
 * 
 * ユーザーフロー:
 * 1. 前提: ドキュメント作成
 * 2. 作成（バリデーション -> 成功）
 * 3. 編集
 * 4. 削除
 */
import { test, expect } from '@playwright/test'
import { runTest, createReporter, loginAndSetup, createDocumentViaUI, deleteDocumentViaUI, createPromptViaUI } from '../lib'

const reporter = createReporter()

test.describe('プロンプト管理シナリオ', () => {
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
        // ドキュメントが必要なので作成しておく
        await createDocumentViaUI(page, `DocsForPromptTest_${Date.now()}`)
        // ドキュメント選択も createDocumentViaUI 内で行われる想定だが、
        // 念のため選択状態を確認するステップを入れても良い
    })

    test.afterEach(async ({ page }) => {
        // テスト後にドキュメントを掃除（削除）
        await deleteDocumentViaUI(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    test('プロンプトCRUDフロー', async ({ page }) => {
        const promptTitle = 'テストプロンプト'
        const updatedTitle = 'テストプロンプト_編集済'

        // 1. 作成フロー
        await runTest(reporter, page, {
            id: 'PROMPT-01',
            name: 'プロンプト作成フロー',
            description: 'バリデーション確認後に正常に作成できること',
            screenshotStep: 'prompt_create',
        }, async () => {
            // プロンプトカラムの+ボタン
            await page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()

            // バリデーション: タイトルなしで保存不可
            // 実装依存: タイトル入力欄がある前提
            const titleInput = page.getByLabel('プロンプト名')
            if (await titleInput.isVisible()) {
                await expect(page.getByRole('button', { name: '保存' })).toBeDisabled()
                await titleInput.fill(promptTitle)
            } else {
                // もし簡易ダイアログでタイプ選択だけならこのバリデーションはスキップまたは別手段
                // ここではタイプとタイトルを入れる想定
            }

            // タイプ選択（あれば）
            // 保存
            await page.getByRole('button', { name: '保存' }).click()

            // 確認
            await expect(page.locator('.prompt-column')).toContainText(promptTitle)
        })

        // 2. 編集フロー
        await runTest(reporter, page, {
            id: 'PROMPT-02',
            name: 'プロンプト編集フロー',
            description: '作成したプロンプトを編集できること',
            screenshotStep: 'prompt_edit',
        }, async () => {
            // 編集ボタン
            const editBtn = page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })
            await editBtn.click()

            // 内容変更
            const titleInput = page.getByLabel('プロンプト名')
            await titleInput.fill(updatedTitle)
            await page.getByRole('button', { name: '保存' }).click()

            // 確認
            await expect(page.locator('.prompt-column')).toContainText(updatedTitle)
        })

        // 3. 削除フロー
        await runTest(reporter, page, {
            id: 'PROMPT-03',
            name: 'プロンプト削除フロー',
            description: 'プロンプトを削除できること',
            screenshotStep: 'prompt_delete',
        }, async () => {
            const deleteBtn = page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-delete') })
            await deleteBtn.click()

            // 確認ダイアログ
            await expect(page.getByText('削除確認')).toBeVisible()
            await page.getByRole('button', { name: '削除' }).click()

            // 確認
            await expect(page.getByText(updatedTitle)).toBeHidden()
        })
    })
})
