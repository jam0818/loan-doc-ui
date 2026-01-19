/**
 * テストスケルトン: ヘルパー関数活用版
 * 
 * 特徴:
 * - 共通操作にはlibのヘルパー関数を使用
 * - Codegenコードは検証ロジックのみに使用
 */
import { test, expect, Page } from '@playwright/test'
import {
    createReporter,
    loginAndSetup,
    createDocumentViaUI,
    createPromptViaUI,
    editDocumentViaUI,
    deleteDocumentViaUI,
} from '../lib'

const reporter = createReporter()

test.describe('【カテゴリ名を入力】', () => {
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    test('TEST-01: ドキュメント作成・編集フロー', async ({ page }) => {
        const testId = 'TEST-01'
        const beforePath = reporter.getScreenshotPath(testId, 'before')
        const afterPath = reporter.getScreenshotPath(testId, 'after')

        // セットアップ: ヘルパー関数を使用
        const docTitle = `テストDoc_${Date.now()}`
        await createDocumentViaUI(page, docTitle)

        // 最終操作前のスクリーンショット
        await page.screenshot({ path: beforePath, fullPage: true })

        // 最終操作: ヘルパー関数を使用
        const newTitle = `${docTitle}_編集済`
        await editDocumentViaUI(page, newTitle)

        // 最終操作後のスクリーンショット
        await page.screenshot({ path: afterPath, fullPage: true })

        // === VERIFICATION (Codegenで生成した検証コード) ===
        await expect(page.getByText(newTitle)).toBeVisible()
        // === VERIFICATION END ===

        reporter.addResult({
            id: testId,
            category: 'ドキュメント',
            name: 'ドキュメント編集成功',
            description: 'ドキュメントを作成して編集できること',
            status: 'PASS',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        })
    })

    test('TEST-02: プロンプト作成フロー', async ({ page }) => {
        const testId = 'TEST-02'
        const beforePath = reporter.getScreenshotPath(testId, 'before')
        const afterPath = reporter.getScreenshotPath(testId, 'after')

        // セットアップ
        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        await page.screenshot({ path: beforePath, fullPage: true })

        // 最終操作
        const promptTitle = `テストPrompt_${Date.now()}`
        await createPromptViaUI(page, promptTitle)

        await page.screenshot({ path: afterPath, fullPage: true })

        // 検証
        // （ここにCodegenの検証コードを配置）

        reporter.addResult({
            id: testId,
            category: 'プロンプト',
            name: 'プロンプト作成成功',
            description: 'プロンプトを作成できること',
            status: 'PASS',
            beforeScreenshotPath: beforePath,
            afterScreenshotPath: afterPath,
        })
    })
})
