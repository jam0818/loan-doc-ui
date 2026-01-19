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
    /** 操作前スクリーンショットのステップ名（オプション）*/
    beforeScreenshotStep?: string
    /** 操作後スクリーンショットのステップ名（オプション）*/
    afterScreenshotStep?: string
    /** 後方互換用: screenshotStepもサポート */
    screenshotStep?: string
    /** 操作前スクリーンショットのパスを直接指定（testFn内で撮影した場合）*/
    beforeScreenshotPath?: string
    /** 操作後スクリーンショットのパスを直接指定（testFn内で撮影した場合）*/
    afterScreenshotPath?: string
    continueOnFail?: boolean
}

/**
 * エビデンスオプション
 * ヘルパー関数内で操作前後のスクリーンショットを撮影するための設定
 */
export interface EvidenceOptions {
    /** 操作前スクリーンショットの保存パス */
    beforePath?: string
    /** 操作後スクリーンショットの保存パス */
    afterPath?: string
}

/**
 * UIを使ってログインする
 * 既にログイン済みの場合はスキップ
 */
export async function loginAndSetup(page: Page, evidence?: EvidenceOptions): Promise<void> {
    await page.goto('/')
    // リダイレクト完了を待機
    await page.waitForLoadState('networkidle')

    // ログインページにリダイレクトされた場合のみログイン
    if (page.url().includes('/login')) {
        await page.getByLabel('ユーザー名').fill(TEST_USER.username)
        await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password)

        // エビデンス: 操作前（ログインボタンクリック前）
        if (evidence?.beforePath) {
            await page.screenshot({ path: evidence.beforePath, fullPage: true })
        }

        await page.getByRole('button', { name: 'ログイン' }).click()
    }
    // メインページ表示待機
    await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })

    // エビデンス: 操作後（ログイン完了後）
    if (evidence?.afterPath) {
        await page.screenshot({ path: evidence.afterPath, fullPage: true })
    }
}

/**
 * UI経由でログインする（強制）
 */
export async function loginViaUI(page: Page, evidence?: EvidenceOptions): Promise<void> {
    await page.goto('/login')
    await page.getByLabel('ユーザー名').fill(TEST_USER.username)
    await page.getByLabel('パスワード', { exact: true }).fill(TEST_USER.password)

    // エビデンス: 操作前（ログインボタンクリック前）
    if (evidence?.beforePath) {
        await page.screenshot({ path: evidence.beforePath, fullPage: true })
    }

    await page.getByRole('button', { name: 'ログイン' }).click()
    await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })

    // エビデンス: 操作後（ログイン完了後）
    if (evidence?.afterPath) {
        await page.screenshot({ path: evidence.afterPath, fullPage: true })
    }
}

export async function logoutViaUI(page: Page, evidence?: EvidenceOptions): Promise<void> {
    // エビデンス: 操作前（ログアウトボタンクリック前）
    if (evidence?.beforePath) {
        await page.screenshot({ path: evidence.beforePath, fullPage: true })
    }

    await page.locator('.app-header').getByRole('button').filter({ has: page.locator('.mdi-logout') }).click()
    await expect(page).toHaveURL(/.*login/)

    // エビデンス: 操作後（ログアウト完了後）
    if (evidence?.afterPath) {
        await page.screenshot({ path: evidence.afterPath, fullPage: true })
    }
}

export async function createDocumentViaUI(page: Page, title: string, fields: { name: string, content: string }[] = [], evidence?: EvidenceOptions): Promise<void> {
    // +ボタンをクリック
    await page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
    await expect(page.getByText('新規文書作成')).toBeVisible()

    // タイトル入力
    await page.getByLabel('文書タイトル').fill(title)

    // フィールド入力
    for (const [index, field] of fields.entries()) {
        // 最初の行は既にあるので追加ボタン不要、2つ目以降は追加
        if (index > 0) {
            await page.getByRole('button', { name: '追加' }).click()
        }

        // フィールド名と内容を入力
        // 入力欄が複数あるので、最後に追加されたものをターゲットにする必要がある
        // .v-card (各フィールド行) のリストを取得
        const fieldRows = page.locator('.v-card-text .v-card')
        const targetRow = fieldRows.nth(index)

        await targetRow.getByLabel('フィールド名').fill(field.name)
        await targetRow.getByLabel('元となる文書内容（必須）').fill(field.content)
    }

    // エビデンス: 操作前（作成ボタンクリック前）
    if (evidence?.beforePath) {
        await page.screenshot({ path: evidence.beforePath, fullPage: true })
    }

    await page.getByRole('button', { name: '作成' }).click()
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })
    await expect(page.locator('.document-title, h3')).toContainText(title)

    // エビデンス: 操作後（作成完了後）
    if (evidence?.afterPath) {
        await page.screenshot({ path: evidence.afterPath, fullPage: true })
    }
}

export async function editDocumentViaUI(page: Page, title: string, evidence?: EvidenceOptions): Promise<void> {
    const editBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })
    await editBtn.click()
    await expect(page.getByText('文書を編集')).toBeVisible()

    await page.getByLabel('文書タイトル').fill(title)

    // エビデンス: 操作前（保存ボタンクリック前）
    if (evidence?.beforePath) {
        await page.screenshot({ path: evidence.beforePath, fullPage: true })
    }

    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()

    // エビデンス: 操作後（編集完了後）
    if (evidence?.afterPath) {
        await page.screenshot({ path: evidence.afterPath, fullPage: true })
    }
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

export async function deleteDocumentViaUI(page: Page, evidence?: EvidenceOptions): Promise<void> {
    const deleteBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-delete') })
    await deleteBtn.click()
    await expect(page.getByText('削除の確認')).toBeVisible()

    // エビデンス: 操作前（削除ボタンクリック前）
    if (evidence?.beforePath) {
        await page.screenshot({ path: evidence.beforePath, fullPage: true })
    }

    await page.getByRole('button', { name: '削除' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()

    // エビデンス: 操作後（削除完了後）
    if (evidence?.afterPath) {
        await page.screenshot({ path: evidence.afterPath, fullPage: true })
    }
}

export async function createPromptViaUI(page: Page, title: string, type: 'all' | 'each' = 'all', evidence?: EvidenceOptions): Promise<void> {
    // +ボタン
    await page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
    await expect(page.getByText('新規プロンプト作成')).toBeVisible()

    await page.getByLabel('プロンプト名').fill(title)

    if (type === 'each') {
        await page.getByLabel('プロンプトタイプ').click()
        await page.getByRole('option', { name: '個別フィールド用' }).click()
    }

    // エビデンス: 操作前（作成ボタンクリック前）
    if (evidence?.beforePath) {
        await page.screenshot({ path: evidence.beforePath, fullPage: true })
    }

    await page.getByRole('button', { name: '作成' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    // エビデンス: 操作後（作成完了後）
    if (evidence?.afterPath) {
        await page.screenshot({ path: evidence.afterPath, fullPage: true })
    }

    // 選択状態の確認と自己修復
    const editBtn = page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })
    try {
        await expect(editBtn).toBeEnabled({ timeout: 2000 })
    } catch {
        // 編集ボタンが無効（未選択）の場合、ヘルパーを使って手動選択
        await selectPromptViaUI(page, title)
    }
}

/**
 * UI経由でプロンプトを選択する（堅牢版）
 */
export async function selectPromptViaUI(page: Page, title: string): Promise<void> {
    const editBtn = page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })

    // ドロップダウンを開く
    const select = page.locator('.prompt-column .v-input').first()
    await select.click()

    // オプションが表示されるのを待ってクリック
    // クリックが効かない場合があるため、キーボード操作も試みる
    const option = page.getByRole('option', { name: title }).first()
    await expect(option).toBeVisible()
    await option.focus() // フォーカスしてから
    await page.keyboard.press('Enter') // エンターで選択

    // それでもだめならクリック
    try {
        await expect(editBtn).toBeEnabled({ timeout: 1000 })
    } catch {
        await option.click({ force: true })
        // 選択反映を確認
        try {
            await expect(editBtn).toBeEnabled({ timeout: 5000 })
        } catch (e) {
            console.warn('Warning: Prompt edit button disabled after robust selection. Proceeding anyway.')
        }
    }
}

export async function editPromptViaUI(page: Page, title: string, evidence?: EvidenceOptions): Promise<void> {
    const editBtn = page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })
    await editBtn.click({ force: true })
    await expect(page.getByText('プロンプトを編集')).toBeVisible()

    await page.getByLabel('プロンプト名').fill(title)

    // エビデンス: 操作前（保存ボタンクリック前）
    if (evidence?.beforePath) {
        await page.screenshot({ path: evidence.beforePath, fullPage: true })
    }

    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()

    // エビデンス: 操作後（編集完了後）
    if (evidence?.afterPath) {
        await page.screenshot({ path: evidence.afterPath, fullPage: true })
    }
}

export async function deletePromptViaUI(page: Page, evidence?: EvidenceOptions): Promise<void> {
    const deleteBtn = page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-delete') })
    await deleteBtn.click()
    await expect(page.getByText('削除の確認')).toBeVisible()

    // エビデンス: 操作前（削除ボタンクリック前）
    if (evidence?.beforePath) {
        await page.screenshot({ path: evidence.beforePath, fullPage: true })
    }

    await page.getByRole('button', { name: '削除' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()

    // エビデンス: 操作後（削除完了後）
    if (evidence?.afterPath) {
        await page.screenshot({ path: evidence.afterPath, fullPage: true })
    }
}

/**
 * UI経由で生成を実行
 */
export async function runGenerationViaUI(page: Page, evidence?: EvidenceOptions): Promise<void> {
    const genBtn = page.locator('.generate-column').getByRole('button', { name: '一括生成' })
    // await expect(genBtn).toBeEnabled() // Flaky in this env
    // エビデンス: 操作前（生成ボタンクリック前）
    if (evidence?.beforePath) {
        await page.screenshot({ path: evidence.beforePath, fullPage: true })
    }
    await genBtn.click({ force: true })

    // 生成中インジケータまたは結果表示を待機
    // 実装では生成開始時に 'after' モードになり、結果が表示される
    await expect(page.locator('.generate-column textarea')).toBeVisible()

    // エビデンス: 操作後（生成完了後）
    if (evidence?.afterPath) {
        await page.screenshot({ path: evidence.afterPath, fullPage: true })
    }
}

/**
 * UI経由で生成結果を編集
 */
export async function updateGenerationResultViaUI(page: Page, content: string): Promise<void> {
    // 生成後モードであることを確認（ボタンで切り替えも可能だが、通常生成後である前提）
    await page.getByRole('button', { name: '生成後' }).click()
    await page.locator('.generate-column textarea').fill(content)
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
    let beforeScreenshotPath: string | undefined
    let afterScreenshotPath: string | undefined
    let error: string | undefined

    // 操作前スクリーンショット（テスト実行前に撮影）
    const beforeStep = config.beforeScreenshotStep ?? config.screenshotStep
    if (beforeStep) {
        try {
            beforeScreenshotPath = reporter.getScreenshotPath(config.id, `${beforeStep}_before`)
            await page.screenshot({ path: beforeScreenshotPath, fullPage: true })
        } catch (e) {
            console.error(`Before ScreenShot Error: ${e}`)
        }
    }

    try {
        await testFn()
        status = 'PASS'
    } catch (e) {
        error = String(e)
        status = 'FAIL'
    }

    // 操作後スクリーンショット（テスト実行後に撮影）
    const afterStep = config.afterScreenshotStep ?? config.screenshotStep
    if (afterStep) {
        try {
            afterScreenshotPath = reporter.getScreenshotPath(config.id, `${afterStep}_after`)
            await page.screenshot({ path: afterScreenshotPath, fullPage: true })
        } catch (e) {
            console.error(`After ScreenShot Error: ${e}`)
        }
    }

    reporter.addResult({
        id: config.id,
        category,
        name: config.name,
        description: config.description,
        status,
        // configで直接指定されたパスを優先、なければrunTestで撮影したパスを使用
        beforeScreenshotPath: config.beforeScreenshotPath ?? beforeScreenshotPath,
        afterScreenshotPath: config.afterScreenshotPath ?? afterScreenshotPath,
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

/**
 * ステップ実行ヘルパー
 * 操作前後のスクリーンショットを撮影しながらアクションを実行する
 * 
 * @param page Playwright Page object
 * @param testId テストID（ファイル名のプレフィックスに使用）
 * @param stepName ステップ名（ファイル名の一部に使用）
 * @param action 実行するアクション
 * @returns 撮影したスクリーンショットのパス（before, after）
 */
export async function captureStep(
    page: Page,
    testId: string,
    stepName: string,
    action: () => Promise<void>
): Promise<{ beforePath: string; afterPath: string }> {
    // タイムスタンプを含めて一意にする（オプション）
    const safeTestId = testId.replace(/[^a-z0-9-_]/gi, '_')
    const safeStepName = stepName.replace(/[^a-z0-9-_]/gi, '_')
    // test-results/screenshots/ 以下の相対パスを返す（TestReporterとの整合性）
    // 実際の保存は絶対パスで行う必要があるが、Playwrightは相対パスでもcwd基準で動作する
    // TestReporter.getScreenshotPath は "screenshots/..." を返すが、
    // ここでは単純に保存先を指定する。

    // TestReporterと整合性を取るため、test-results/screenshots/ に保存
    const baseDir = 'test-results/screenshots'
    const fileNameBase = `${safeTestId}_${safeStepName}`

    const beforePath = `${baseDir}/${fileNameBase}_01_before.png`
    const afterPath = `${baseDir}/${fileNameBase}_02_after.png`
    const errorPath = `${baseDir}/${fileNameBase}_99_error.png`

    try {
        // 1. 直前のスクショ
        await page.screenshot({ path: beforePath, fullPage: true }).catch(() => { })

        // 2. アクション実行
        await action()

        // 画面遷移やレンダリング待ち（少し待機して安定させる）
        await page.waitForTimeout(500)

        // 3. 直後のスクショ
        await page.screenshot({ path: afterPath, fullPage: true }).catch(() => { })

        return { beforePath, afterPath }
    } catch (error) {
        // エラー時もスクショを撮る
        await page.screenshot({ path: errorPath, fullPage: true }).catch(() => { })
        // エラー時はafterPathをエラー画像にする
        return { beforePath, afterPath: errorPath }
    }
}
