/**
 * 認証シナリオテスト
 * 
 * ユーザーフロー:
 * 1. ログイン失敗
 * 2. ログイン成功
 * 3. ログアウト
 * 4. セッション維持
 */
import { test, expect } from '@playwright/test'
import { runTest, createReporter, TEST_USER } from '../lib'

const reporter = createReporter()

test.describe('認証シナリオ', () => {
    test.afterAll(async () => {
        await reporter.generateReport()
    })

    test('認証フロー検証', async ({ page }) => {
        // 1. ログイン失敗
        await runTest(reporter, page, {
            id: 'AUTH-01',
            name: 'ログイン失敗フロー',
            description: '無効な認証情報でログインできないこと',
            screenshotStep: 'auth_fail',
            continueOnFail: true,
        }, async () => {
            await page.goto('/login')
            await page.getByLabel('ユーザー名').fill('wrong_user')
            await page.getByLabel('パスワード').fill('wrong_pass')
            await page.getByRole('button', { name: 'ログイン' }).click()
            // エラー表示またはURLが変わらないこと
            await expect(page).toHaveURL(/.*login/)
        })

        // 2. ログイン成功
        await runTest(reporter, page, {
            id: 'AUTH-02',
            name: 'ログイン成功フロー',
            description: '正しい認証情報でログインし、メイン画面が表示されること',
            screenshotStep: 'auth_success',
        }, async () => {
            await page.getByLabel('ユーザー名').fill(TEST_USER.username)
            await page.getByLabel('パスワード').fill(TEST_USER.password)
            await page.getByRole('button', { name: 'ログイン' }).click()
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })
        })

        // 3. セッション維持
        await runTest(reporter, page, {
            id: 'AUTH-03',
            name: 'セッション維持',
            description: 'リロードしてもログイン状態が維持されること',
            screenshotStep: 'auth_session',
        }, async () => {
            await page.reload()
            await expect(page.locator('.document-column')).toBeVisible({ timeout: 15000 })
        })

        // 4. ログアウト
        await runTest(reporter, page, {
            id: 'AUTH-04',
            name: 'ログアウトフロー',
            description: 'ログアウトしてログイン画面に戻ること',
            screenshotStep: 'auth_logout',
        }, async () => {
            await page.locator('.mdi-logout').click()
            await expect(page).toHaveURL(/.*login/)
        })
    })
})
