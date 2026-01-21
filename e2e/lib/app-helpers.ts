/**
 * アプリケーション固有テストヘルパー
 * 
 * このファイルはloan-doc-uiアプリケーション固有のUI操作ヘルパーを含む。
 * 汎用的な機能（captureStep等）はplaywright-excel-reporterに移動済み。
 */

import { expect, type Page } from '@playwright/test'

import { testConfig } from '../config'

/**
 * UIを使ってログインする
 * 既にログイン済みの場合はスキップ
 */
export async function loginAndSetup(page: Page): Promise<void> {
    await page.goto(testConfig.routes.home)
    // リダイレクト完了を待機
    await page.waitForLoadState('networkidle')

    // ログインページにリダイレクトされた場合のみログイン
    if (page.url().includes(testConfig.routes.login)) {
        await page.getByLabel('ユーザー名').fill(testConfig.users.default.username)
        await page.getByLabel('パスワード', { exact: true }).fill(testConfig.users.default.password)
        await page.getByRole('button', { name: 'ログイン' }).click()
    }
    // メインページ表示待機
    await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })
}

/**
 * UI経由でログインする（強制）
 */
export async function loginViaUI(page: Page): Promise<void> {
    await page.goto(testConfig.routes.login)
    await page.getByLabel('ユーザー名').fill(testConfig.users.default.username)
    await page.getByLabel('パスワード', { exact: true }).fill(testConfig.users.default.password)
    await page.getByRole('button', { name: 'ログイン' }).click()
    await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })
}

/**
 * UI経由でログアウトする
 */
export async function logoutViaUI(page: Page): Promise<void> {
    await page.locator('.app-header').getByRole('button').filter({ has: page.locator('.mdi-logout') }).click()
    await expect(page).toHaveURL(/.*login/)
}

/**
 * UI経由でドキュメントを作成
 */
export async function createDocumentViaUI(
    page: Page,
    title: string,
    fields: { name: string; content: string }[] = []
): Promise<void> {
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
        const fieldRows = page.locator('.v-card-text .v-card')
        const targetRow = fieldRows.nth(index)

        await targetRow.getByLabel('フィールド名').fill(field.name)
        await targetRow.getByLabel('元となる文書内容（必須）').fill(field.content)
    }

    await page.getByRole('button', { name: '作成' }).click()
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })
    await expect(page.locator('.document-title, h3')).toContainText(title)
}

/**
 * UI経由でドキュメントを編集
 */
export async function editDocumentViaUI(page: Page, title: string): Promise<void> {
    const editBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })
    await editBtn.click()
    await expect(page.getByText('文書を編集')).toBeVisible()

    await page.getByLabel('文書タイトル').fill(title)
    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
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
 */
export async function deleteDocumentViaUI(page: Page): Promise<void> {
    const deleteBtn = page.locator('.document-column').getByRole('button').filter({ has: page.locator('.mdi-delete') })
    await deleteBtn.click()
    await expect(page.getByText('削除の確認')).toBeVisible()

    await page.getByRole('button', { name: '削除' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
}

/**
 * UI経由でプロンプトを作成
 */
export async function createPromptViaUI(page: Page, title: string, type: 'all' | 'each' = 'all'): Promise<void> {
    // +ボタン
    await page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-plus') }).click()
    await expect(page.getByText('新規プロンプト作成')).toBeVisible()

    await page.getByLabel('プロンプト名').fill(title)

    if (type === 'each') {
        // ラベルテキストを含む入力フィールド内のドロップダウンアイコンをクリック（順序依存を排除）
        await page.locator('.v-input').filter({ hasText: 'プロンプトタイプ' }).locator('.mdi-menu-down').click()
        await page.getByRole('option', { name: '個別フィールド用' }).click()
    }

    await page.getByRole('button', { name: '作成' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()

    // 選択状態の確認と自己修復
    const editBtn = page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })
    try {
        await expect(editBtn).toBeEnabled({ timeout: 2000 })
    } catch {
        // 編集ボタンが無効（未選択）の場合、手動選択
        await selectPromptViaUI(page, title)
    }
}

/**
 * UI経由でプロンプトを選択する
 * 
 * TODO: Vuetifyのv-select操作が不安定なため、テストが失敗する場合がある。
 * ユーザー提供のロケータでドロップダウンは開けるようになったが、選択後のボタン活性化確認で躓くことが多い。
 * 詳細な改修はユーザー側で引き取るため、現状は暫定実装として維持する。
 */
export async function selectPromptViaUI(page: Page, title: string): Promise<void> {
    const editBtn = page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') }).first()

    // ドロップダウンを開く（ユーザー提供の確実なロケータを使用）
    const dropdownArrow = page.locator('.prompt-column .mdi-menu-down').first()
    await dropdownArrow.click()

    // オプションが表示されるのを待ってクリック
    const option = page.getByRole('option', { name: title }).first()
    await expect(option).toBeVisible()

    // キーボード操作を優先（Vuetifyのv-selectと相性が良いため）
    try {
        await option.scrollIntoViewIfNeeded()
    } catch { } // 無視

    await option.focus()
    await page.keyboard.press('Enter')

    // 編集ボタンが有効になったか確認
    try {
        await expect(editBtn).toBeEnabled({ timeout: 2000 })
    } catch {
        // キー操作で反応しなかった場合、強制クリックを試行
        try {
            // 見えなくてもDOMにあればクリックを試みる
            await option.click({ force: true })
        } catch { } // 無視

        // 再度待機
        try {
            await expect(editBtn).toBeEnabled({ timeout: 5000 })
        } catch { } // 無視
    }

    // 最終的な確認（十分なタイムアウト）
    await expect(editBtn).toBeEnabled({ timeout: 10000 })
}

/**
 * UI経由でプロンプトを編集
 */
export async function editPromptViaUI(page: Page, title: string): Promise<void> {
    const editBtn = page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-pencil') })
    await editBtn.click({ force: true })
    await expect(page.getByText('プロンプトを編集')).toBeVisible()

    await page.getByLabel('プロンプト名').fill(title)
    await page.getByRole('button', { name: '保存' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
}

/**
 * UI経由でプロンプトを削除
 */
export async function deletePromptViaUI(page: Page): Promise<void> {
    const deleteBtn = page.locator('.prompt-column').getByRole('button').filter({ has: page.locator('.mdi-delete') })
    await deleteBtn.click()
    await expect(page.getByText('削除の確認')).toBeVisible()

    await page.getByRole('button', { name: '削除' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
}

/**
 * UI経由で生成を実行
 */
export async function runGenerationViaUI(page: Page): Promise<void> {
    const genBtn = page.locator('.generate-column').getByRole('button', { name: '一括生成' })
    await genBtn.click({ force: true })

    // 生成中インジケータまたは結果表示を待機
    await expect(page.locator('.generate-column textarea')).toBeVisible()
}

/**
 * UI経由で生成結果を編集
 */
export async function updateGenerationResultViaUI(page: Page, content: string): Promise<void> {
    // 生成後モードであることを確認
    await page.getByRole('button', { name: '生成後' }).click()
    await page.locator('.generate-column textarea').fill(content)
}
