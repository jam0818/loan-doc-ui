/**
 * ドキュメント管理シナリオテスト
 * 
 * ベストプラクティス:
 * - 各テストが独立（beforeEachでセットアップ）
 * - ハッピーパス + エラーケースの網羅
 * - 各テストがPlaywright上でも個別のテストとして認識される
 */
import { test, expect, Page } from '@playwright/test'
import { runTest, createReporter, loginAndSetup, createDocumentViaUI, editDocumentViaUI, deleteDocumentViaUI } from '../lib'

const reporter = createReporter()

/**
 * テスト用ドキュメントを作成するヘルパー
 */
async function setupDocument(page: Page, title: string): Promise<void> {
    await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
    await expect(page.getByText('新規文書作成')).toBeVisible()
    await page.getByLabel('文書タイトル').fill(title)
    await page.getByRole('button', { name: '作成' }).click()
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })
    await expect(page.locator('.document-title, h3')).toContainText(title)
}

test.describe('ドキュメント管理シナリオ', () => {
    // 各テスト前にログイン
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ============================================
    // 作成シナリオ
    // ============================================

    test('DOC-01: ドキュメント作成 - 成功', async ({ page }) => {
        const docTitle = `テスト文書_${Date.now()}`
        const beforePath = reporter.getScreenshotPath('DOC-01', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-01', 'after')

        await runTest(reporter, page, {
            id: 'DOC-01',
            name: 'ドキュメント作成成功',
            description: '有効なタイトルで新規ドキュメントを作成できること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            await createDocumentViaUI(page, docTitle, [], {
                beforePath,
                afterPath,
            })
            await expect(page.locator('.document-title, h3')).toContainText(docTitle)
        })
    })

    test('DOC-02: ドキュメント作成 - バリデーションエラー（タイトル空）', async ({ page }) => {
        const beforePath = reporter.getScreenshotPath('DOC-02', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-02', 'after')

        await runTest(reporter, page, {
            id: 'DOC-02',
            name: 'ドキュメント作成バリデーション',
            description: 'タイトルが空の場合、作成ボタンが無効または作成できないこと',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            // ダイアログを開く
            await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
            await expect(page.getByText('新規文書作成')).toBeVisible()

            // エビデンス: 空の状態
            await page.screenshot({ path: beforePath, fullPage: true })

            // タイトル空のまま作成ボタンをクリック
            await page.getByRole('button', { name: '作成' }).click()

            // ダイアログが閉じないことを確認（バリデーションエラー）
            await expect(page.getByText('新規文書作成')).toBeVisible()

            // エビデンス: エラー状態
            await page.screenshot({ path: afterPath, fullPage: true })

            // キャンセルして閉じる
            await page.getByRole('button', { name: 'キャンセル' }).click()
        })
    })

    // ============================================
    // 編集シナリオ
    // ============================================

    test('DOC-03: ドキュメント編集 - 成功', async ({ page }) => {
        // セットアップ: ドキュメントを作成
        const originalTitle = `編集テスト元_${Date.now()}`
        const updatedTitle = `${originalTitle}_編集済`
        await setupDocument(page, originalTitle)

        const beforePath = reporter.getScreenshotPath('DOC-03', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-03', 'after')

        await runTest(reporter, page, {
            id: 'DOC-03',
            name: 'ドキュメント編集成功',
            description: '既存ドキュメントのタイトルを編集できること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            await editDocumentViaUI(page, updatedTitle, {
                beforePath,
                afterPath,
            })
            await expect(page.locator('.document-title, h3')).toContainText(updatedTitle)
        })
    })

    test('DOC-04: ドキュメント編集 - バリデーションエラー（タイトル空）', async ({ page }) => {
        // セットアップ: ドキュメントを作成
        const originalTitle = `編集バリデーションテスト_${Date.now()}`
        await setupDocument(page, originalTitle)

        const beforePath = reporter.getScreenshotPath('DOC-04', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-04', 'after')

        await runTest(reporter, page, {
            id: 'DOC-04',
            name: 'ドキュメント編集バリデーション',
            description: 'タイトルを空にして保存しようとするとエラーになること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            // 編集ダイアログを開く
            await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') }).click()
            await expect(page.getByText('文書を編集')).toBeVisible()

            // タイトルを空にする
            await page.getByLabel('文書タイトル').clear()

            // エビデンス: 空の状態
            await page.screenshot({ path: beforePath, fullPage: true })

            // 保存ボタンをクリック
            await page.getByRole('button', { name: '保存' }).click()

            // ダイアログが閉じないことを確認（バリデーションエラー）
            await expect(page.getByText('文書を編集')).toBeVisible()

            // エビデンス: エラー状態
            await page.screenshot({ path: afterPath, fullPage: true })

            // キャンセルして閉じる
            await page.getByRole('button', { name: 'キャンセル' }).click()
        })
    })

    // ============================================
    // 削除シナリオ
    // ============================================

    test('DOC-05: ドキュメント削除 - 成功', async ({ page }) => {
        // セットアップ: ドキュメントを作成
        const docTitle = `削除テスト_${Date.now()}`
        await setupDocument(page, docTitle)

        const beforePath = reporter.getScreenshotPath('DOC-05', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-05', 'after')

        await runTest(reporter, page, {
            id: 'DOC-05',
            name: 'ドキュメント削除成功',
            description: 'ドキュメントを削除できること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            await deleteDocumentViaUI(page, {
                beforePath,
                afterPath,
            })
            // 削除後はタイトルが表示されていないこと
            await expect(page.getByText(docTitle)).toBeHidden()
        })
    })

    test('DOC-06: ドキュメント削除 - キャンセル', async ({ page }) => {
        // セットアップ: ドキュメントを作成
        const docTitle = `削除キャンセルテスト_${Date.now()}`
        await setupDocument(page, docTitle)

        const beforePath = reporter.getScreenshotPath('DOC-06', 'before')
        const afterPath = reporter.getScreenshotPath('DOC-06', 'after')

        await runTest(reporter, page, {
            id: 'DOC-06',
            name: 'ドキュメント削除キャンセル',
            description: '削除確認ダイアログでキャンセルするとドキュメントが残ること',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        }, async () => {
            // 削除ボタンをクリック
            await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-delete') }).click()
            await expect(page.getByText('削除の確認')).toBeVisible()

            // エビデンス: 確認ダイアログ
            await page.screenshot({ path: beforePath, fullPage: true })

            // キャンセルをクリック
            await page.getByRole('button', { name: 'キャンセル' }).click()
            await expect(page.getByRole('dialog')).toBeHidden()

            // ドキュメントがまだ存在することを確認
            await expect(page.locator('.document-title, h3')).toContainText(docTitle)

            // エビデンス: キャンセル後
            await page.screenshot({ path: afterPath, fullPage: true })
        })
    })
})
