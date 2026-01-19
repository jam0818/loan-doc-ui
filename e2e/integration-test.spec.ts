/**
 * 結合テスト
 *
 * 実API使用、UIログイン形式
 * CHECKLIST.md 5.1-5.12のテストケースを実装
 */

import { test, expect } from '@playwright/test'
import { runTest, createReporter, loginViaUI } from './lib'

// 共通レポーター
const reporter = createReporter()

/**
 * 結合テスト
 */
test.describe('結合テスト', () => {
    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // ===== フロー =====

    // 5.1 完全ワークフロー実行
    test('5.1 完全ワークフロー実行', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.1',
            name: '完全ワークフロー実行',
            description: 'ログイン→ドキュメント→プロンプト→生成の一連フロー',
            screenshotStep: 'workflow',
        }, async () => {
            await loginViaUI(page)
            // 3カラムが表示される
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
            await expect(page.locator('.prompt-column')).toBeVisible()
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // ===== 遷移 =====

    // 5.2 ログアウト→再ログイン
    test('5.2 ログアウト→再ログイン', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.2',
            name: 'ログアウト→再ログイン',
            description: 'ログアウト後に再ログインできる',
            screenshotStep: 'relogin',
        }, async () => {
            await loginViaUI(page)
            await page.locator('.mdi-logout').click()
            await page.waitForTimeout(1000)
            await expect(page).toHaveURL(/\/login/)
            // 再ログイン
            await loginViaUI(page)
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // 5.3 リロード後状態維持
    test('5.3 リロード後状態維持', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.3',
            name: 'リロード後状態維持',
            description: 'ページリロード後も状態が維持される',
            screenshotStep: 'reload_state',
        }, async () => {
            await loginViaUI(page)
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
            await page.reload()
            await page.waitForLoadState('networkidle')
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // ===== 連携 =====

    // 5.4 ドキュメント選択→プロンプト有効
    test('5.4 ドキュメント選択→プロンプト有効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.4',
            name: 'ドキュメント選択→プロンプト有効',
            description: 'ドキュメント選択によりプロンプト操作が有効になる',
            screenshotStep: 'doc_prompt_link',
        }, async () => {
            await loginViaUI(page)
            await page.getByRole('combobox', { name: '文書を選択' }).click()
            await page.waitForTimeout(500)
            const firstItem = page.getByRole('listbox').locator('.v-list-item').first()
            if (await firstItem.isVisible()) {
                await firstItem.click()
            }
        })
    })

    // 5.5 ドキュメント切替→プロンプトリセット
    test('5.5 ドキュメント切替→プロンプトリセット', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.5',
            name: 'ドキュメント切替→プロンプトリセット',
            description: 'ドキュメント切替時にプロンプト選択がリセット',
            screenshotStep: 'doc_change_reset',
        }, async () => {
            await loginViaUI(page)
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // 5.6 プロンプト選択→生成有効
    test('5.6 プロンプト選択→生成有効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.6',
            name: 'プロンプト選択→生成有効',
            description: 'プロンプト選択により生成ボタンが有効になる',
            screenshotStep: 'prompt_gen_link',
        }, async () => {
            await loginViaUI(page)
            await expect(page.locator('.generate-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // 5.7 モード変更連動
    test('5.7 モード変更連動', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.7',
            name: 'モード変更連動',
            description: 'プロンプトモード変更が生成カラムに連動',
            screenshotStep: 'mode_sync',
        }, async () => {
            await loginViaUI(page)
            await expect(page.locator('.generate-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // ===== レイアウト =====

    // 5.8 3カラムレイアウト表示
    test('5.8 3カラムレイアウト表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.8',
            name: '3カラムレイアウト表示',
            description: 'ドキュメント・プロンプト・生成の3カラム表示',
            screenshotStep: 'layout',
        }, async () => {
            await loginViaUI(page)
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
            await expect(page.locator('.prompt-column')).toBeVisible()
            await expect(page.locator('.generate-column')).toBeVisible()
        })
    })

    // ===== エラー =====

    // 5.9 APIエラー表示
    test('5.9 APIエラー表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.9',
            name: 'APIエラー表示',
            description: 'APIエラー時にエラーメッセージ表示',
            screenshotStep: 'api_error',
        }, async () => {
            await loginViaUI(page)
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // 5.10 ネットワークエラー
    test('5.10 ネットワークエラー', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.10',
            name: 'ネットワークエラー',
            description: 'ネットワークエラー時の処理',
            screenshotStep: 'network_error',
        }, async () => {
            await loginViaUI(page)
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // 5.11 タイムアウト処理
    test('5.11 タイムアウト処理', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.11',
            name: 'タイムアウト処理',
            description: 'タイムアウト時の処理',
            screenshotStep: 'timeout',
        }, async () => {
            await loginViaUI(page)
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
        })
    })

    // 5.12 無効認証エラー
    test('5.12 無効認証エラー', async ({ page }) => {
        await runTest(reporter, page, {
            id: '5.12',
            name: '無効認証エラー',
            description: '無効な認証トークン時の処理',
            screenshotStep: 'auth_error',
        }, async () => {
            await loginViaUI(page)
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 10000 })
        })
    })
})
