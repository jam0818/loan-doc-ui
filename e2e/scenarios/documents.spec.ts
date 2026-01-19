/**
 * ドキュメント管理シナリオテスト
 * 
 * ユーザーフロー:
 * 1. 作成（バリデーション確認 -> 成功）
 * 2. 編集
 * 3. 削除
 */
import { test, expect } from '@playwright/test'
import { runTest, createReporter, loginAndSetup, createDocumentViaUI, selectDocumentViaUI, deleteDocumentViaUI } from '../lib'

const reporter = createReporter()

test.describe('ドキュメント管理シナリオ', () => {
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    test('ドキュメントCRUDフロー', async ({ page }) => {
        const docTitle = `テスト文書_${Date.now()}`
        const updatedTitle = `${docTitle}_編集済`

        // 1. 作成フロー
        await runTest(reporter, page, {
            id: 'DOC-01',
            name: 'ドキュメント作成フロー',
            description: 'バリデーション確認後に正常に作成できること',
            screenshotStep: 'doc_create',
        }, async () => {
            // バリデーション: タイトルなし
            await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
            await expect(page.getByRole('button', { name: '保存' })).toBeDisabled()

            // 入力して保存
            await page.getByLabel('文書タイトル').fill(docTitle)
            await page.getByRole('button', { name: '保存' }).click()

            // 確認
            await expect(page.locator('.document-title, h3')).toContainText(docTitle)
        })

        // 2. 編集フロー
        await runTest(reporter, page, {
            id: 'DOC-02',
            name: 'ドキュメント編集フロー',
            description: '作成したドキュメントを編集できること',
            screenshotStep: 'doc_edit',
        }, async () => {
            // 編集ボタンクリック
            const editBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })
            await editBtn.click()

            // タイトル編集
            await page.getByLabel('文書タイトル').fill(updatedTitle)
            await page.getByRole('button', { name: '保存' }).click() // 保存ボタン名は要確認（更新かも）

            // 確認
            await expect(page.locator('.document-title, h3')).toContainText(updatedTitle)
        })

        // 3. 削除フロー
        await runTest(reporter, page, {
            id: 'DOC-03',
            name: 'ドキュメント削除フロー',
            description: 'ドキュメントを削除できること',
            screenshotStep: 'doc_delete',
        }, async () => {
            await deleteDocumentViaUI(page)

            // 削除後は選択状態が解除されるか、リストから消えているか
            // NOTE: リストを開いて確認するのはUI上少し手間なので、タイトル表示が消えているか等で確認
            // もしくはリストを開いて検索
            await expect(page.getByText(updatedTitle)).toBeHidden()
        })
    })
})
