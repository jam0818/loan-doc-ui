/**
 * 認証機能テスト
 *
 * ライブラリ共通のrunTestヘルパーを使用
 */

import { test, expect } from '@playwright/test'
import { runTest, createReporter } from './lib'

// 共通レポーター
const reporter = createReporter()

/**
 * 認証機能テスト
 */
test.describe('認証機能テスト', () => {
    test.afterAll(async () => {
        await reporter.generateReport()
    })

    test('1.1 ログインページ表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.1',
            name: 'ログインページ表示',
            description: 'ログインページが正しく表示される',
            screenshotStep: 'login_page',
        }, async () => {
            await page.goto('/login')
            await expect(page.locator('text=文書生成アプリケーション')).toBeVisible({ timeout: 10000 })
        })
    })

    test('1.2 空フィールドでボタン無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.2',
            name: '空フィールド無効',
            description: '入力欄が空の場合ログインボタンが無効',
            screenshotStep: 'empty_fields',
        }, async () => {
            await page.goto('/login')
            await expect(page.locator('button:has-text("ログイン")')).toBeDisabled()
        })
    })

    test('1.3 ログイン情報入力', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.3',
            name: 'ログイン情報入力',
            description: 'ユーザー名とパスワードを入力するとボタンが有効',
            screenshotStep: 'filled_fields',
        }, async () => {
            await page.goto('/login')
            await page.fill('input[type="text"]', 'admin')
            await page.fill('input[type="password"]', 'password')
            await expect(page.locator('button:has-text("ログイン")')).toBeEnabled()
        })
    })

    test('1.4 ログインボタンクリック', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.4',
            name: 'ログインボタンクリック',
            description: 'ログインボタンをクリックできる',
            screenshotStep: 'after_click',
        }, async () => {
            await page.goto('/login')
            await page.fill('input[type="text"]', 'admin')
            await page.fill('input[type="password"]', 'password')
            await page.click('button:has-text("ログイン")')
            await page.waitForTimeout(2000)
        })
    })
})
