/**
 * テストヘルパー関数拡張
 *
 * シナリオテスト用の操作ヘルパーを含む
 */

import { test, expect, type Page } from '@playwright/test'
import { TestReporter } from './test-reporter'

/**
 * テスト用認証情報
 */
export const TEST_USER = {
    username: 'user1',
    password: 'pass1',
}

/**
 * テスト実行設定
 */
export interface TestConfig {
    id: string
    category?: string
    name: string
    description: string
    screenshotStep?: string
    continueOnFail?: boolean
}

/**
 * UIを使ってログインする
 * 既にログイン済みの場合はスキップ
 */
export async function loginAndSetup(page: Page): Promise<void> {
    await page.goto('/')
    // ログインページにリダイレクトされた場合のみログイン
    if (page.url().includes('/login')) {
        await page.getByLabel('ユーザー名').fill(TEST_USER.username)
        await page.getByLabel('パスワード').fill(TEST_USER.password)
        await page.getByRole('button', { name: 'ログイン' }).click()
    }
    // メインページ表示待機
    await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })
}

/**
 * UI経由でログインする（強制）
 */
export async function loginViaUI(page: Page): Promise<void> {
    await page.goto('/login')
    await page.getByLabel('ユーザー名').fill(TEST_USER.username)
    await page.getByLabel('パスワード').fill(TEST_USER.password)
    await page.getByRole('button', { name: 'ログイン' }).click()
    await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })
}

/**
 * UI経由でドキュメントを作成
 */
export async function createDocumentViaUI(page: Page, title: string, fields: string[] = []): Promise<void> {
    // +ボタンをクリック
    await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
    await expect(page.getByText('新規文書作成')).toBeVisible()

    // タイトル入力
    await page.getByLabel('文書タイトル').fill(title)

    // フィールド入力
    // 注: 実装依存。フィールド追加ボタンがあるか、デフォルトで1つあるかなど
    // ここでは単純に保存のみを実装（フィールド追加ロジックは必要に応じて拡張）

    await page.getByRole('button', { name: '保存' }).click()
    // 保存後の自動選択またはダイアログ閉じるのを待機
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })
    // タイトルが表示されているか確認
    await expect(page.locator('.document-title, h3')).toContainText(title)
}

/**
 * UI経由でドキュメントを選択
 */
export async function selectDocumentViaUI(page: Page, titlePart: string): Promise<void> {
    await page.getByRole('combobox', { name: '文書を選択' }).click()
    await page.getByRole('option', { name: titlePart }).first().click()
    // タイトル表示待機
    await expect(page.locator('.document-title, h3')).toBeVisible()
}

/**
 * UI経由でドキュメントを削除
 * (現在選択中のドキュメントを削除)
 */
export async function deleteDocumentViaUI(page: Page): Promise<void> {
    const deleteBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-delete') })
    await deleteBtn.click()
    await expect(page.getByText('削除確認')).toBeVisible() // ダイアログタイトルなど
    await page.getByRole('button', { name: '削除' }).click() // create delete button confirm
    await expect(page.getByRole('dialog')).toBeHidden()
}

/**
 * UI経由でプロンプトを作成
 */
export async function createPromptViaUI(page: Page, title: string, type: 'all' | 'each' = 'all'): Promise<void> {
    // +ボタン
    await page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
    await expect(page.getByText('新規プロンプト作成')).toBeVisible() // 仮のみだし

    // タイトルなど入力... (実装に合わせて調整)
    // 今回は簡易的に保存ボタンを押すフローのみ記述
    // TODO: プロンプト作成ダイアログの要素ID/Labelに合わせて実装
    // await page.getByLabel('プロンプト名').fill(title)

    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
}


/**
 * テスト実行ヘルパー（変更なし）
 */
export async function runTest(
    reporter: TestReporter,
    page: Page,
    config: TestConfig,
    testFn: () => Promise<void>
): Promise<void> {
    const testInfo = test.info()
    const category = config.category
        ?? testInfo.titlePath[1]
        ?? testInfo.titlePath[0]?.replace(/\.spec\.ts$/, '')
        ?? 'テスト'

    let status: 'PASS' | 'FAIL' = 'FAIL'
    let screenshotPath: string | undefined
    let error: string | undefined

    try {
        await testFn()
        status = 'PASS'
    } catch (e) {
        error = String(e)
        status = 'FAIL'
    }

    if (config.screenshotStep) {
        try {
            screenshotPath = reporter.getScreenshotPath(config.id, config.screenshotStep)
            await page.screenshot({ path: screenshotPath, fullPage: true })
        } catch (e) {
            console.error(`ScreenShot Error: ${e}`)
        }
    }

    reporter.addResult({
        id: config.id,
        category,
        name: config.name,
        description: config.description,
        status,
        screenshotPath,
        error,
    })

    if (!config.continueOnFail) {
        expect(status, `Test Failed: ${error}`).toBe('PASS')
    }
}

/**
 * 共通レポーター設定
 */
export function createReporter(): TestReporter {
    return new TestReporter({
        outputDir: 'test-results',
        screenshotDir: 'test-results/screenshots',
        reportPrefix: 'scenario-test-report', // Prefix変更
        embedImages: true,
        useFixedFileName: true,
        persistResults: true,
    })
}
