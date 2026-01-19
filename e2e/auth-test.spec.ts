/**
 * 認証機能テスト
 *
 * 共通ライブラリのrunTestヘルパーとVuetifyヘルパーを使用
 */

import { test, expect } from '@playwright/test'
import { runTest, createReporter, fillVuetifyField } from './lib'

// 共通レポーター
const reporter = createReporter()

/**
 * 認証機能テスト
 */
test.describe('認証機能テスト', () => {
    test.afterAll(async () => {
        await reporter.generateReport()
    })

    // 1.1 ログインページ表示
    test('1.1 ログインページ表示', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.1',
            name: 'ログインページ表示',
            description: 'ログインページが正しく表示される',
            screenshotStep: 'login_page',
        }, async () => {
            await page.goto('/login')
            // タイトル確認
            await expect(page.locator('h1:has-text("文書生成アプリケーション")')).toBeVisible({ timeout: 10000 })
            // ユーザー名フィールド確認
            await expect(page.locator('.v-text-field:has(.v-label:text-is("ユーザー名"))')).toBeVisible()
            // パスワードフィールド確認
            await expect(page.locator('.v-text-field:has(.v-label:text-is("パスワード"))')).toBeVisible()
            // ログインボタン確認
            await expect(page.locator('.v-btn:has-text("ログイン")')).toBeVisible()
        })
    })

    // 1.2 未認証リダイレクト
    test('1.2 未認証リダイレクト', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.2',
            name: '未認証リダイレクト',
            description: '未認証状態でメインページにアクセスするとログインページにリダイレクト',
            screenshotStep: 'redirect',
        }, async () => {
            await page.goto('/')
            // ログインページにリダイレクトされることを確認
            await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
        })
    })

    // 1.3 空フィールドでボタン無効
    test('1.3 空フィールドでボタン無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.3',
            name: '空フィールドでボタン無効',
            description: '入力欄が空の場合ログインボタンが無効',
            screenshotStep: 'empty_fields',
        }, async () => {
            await page.goto('/login')
            await page.waitForLoadState('networkidle')
            // ログインボタンが無効であることを確認
            const loginButton = page.locator('.v-btn:has-text("ログイン")')
            await expect(loginButton).toBeDisabled()
        })
    })

    // 1.4 ユーザー名のみ入力でボタン無効
    test('1.4 ユーザー名のみ入力でボタン無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.4',
            name: 'ユーザー名のみでボタン無効',
            description: 'ユーザー名のみ入力した場合、ログインボタンは無効のまま',
            screenshotStep: 'username_only',
        }, async () => {
            await page.goto('/login')
            await page.waitForLoadState('networkidle')
            // ユーザー名のみ入力
            await fillVuetifyField(page, 'ユーザー名', 'admin')
            // ボタンは無効のまま
            const loginButton = page.locator('.v-btn:has-text("ログイン")')
            await expect(loginButton).toBeDisabled()
        })
    })

    // 1.5 パスワードのみ入力でボタン無効
    test('1.5 パスワードのみ入力でボタン無効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.5',
            name: 'パスワードのみでボタン無効',
            description: 'パスワードのみ入力した場合、ログインボタンは無効のまま',
            screenshotStep: 'password_only',
        }, async () => {
            await page.goto('/login')
            await page.waitForLoadState('networkidle')
            // パスワードのみ入力
            await fillVuetifyField(page, 'パスワード', 'password')
            // ボタンは無効のまま
            const loginButton = page.locator('.v-btn:has-text("ログイン")')
            await expect(loginButton).toBeDisabled()
        })
    })

    // 1.6 両フィールド入力でボタン有効
    test('1.6 両フィールド入力でボタン有効', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.6',
            name: '両フィールド入力でボタン有効',
            description: 'ユーザー名とパスワード両方入力するとログインボタンが有効',
            screenshotStep: 'both_fields',
        }, async () => {
            await page.goto('/login')
            await page.waitForLoadState('networkidle')
            // 両方入力
            await fillVuetifyField(page, 'ユーザー名', 'admin')
            await fillVuetifyField(page, 'パスワード', 'password')
            // ボタンが有効になる
            const loginButton = page.locator('.v-btn:has-text("ログイン")')
            await expect(loginButton).toBeEnabled()
        })
    })

    // 1.7 ログインボタンクリック
    test('1.7 ログインボタンクリック', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.7',
            name: 'ログインボタンクリック',
            description: 'ログインボタンをクリックできる',
            screenshotStep: 'after_click',
        }, async () => {
            await page.goto('/login')
            await page.waitForLoadState('networkidle')
            await fillVuetifyField(page, 'ユーザー名', 'admin')
            await fillVuetifyField(page, 'パスワード', 'password')
            await page.click('.v-btn:has-text("ログイン")')
            await page.waitForTimeout(2000)
            // クリック後の状態を確認（APIモックなしのためエラーまたはURLの変化）
        })
    })

    // 1.8 パスワード表示切替
    test('1.8 パスワード表示切替', async ({ page }) => {
        await runTest(reporter, page, {
            id: '1.8',
            name: 'パスワード表示切替',
            description: 'パスワードフィールドの表示/非表示を切り替えられる',
            screenshotStep: 'password_toggle',
        }, async () => {
            await page.goto('/login')
            await page.waitForLoadState('networkidle')
            // パスワードを入力
            await fillVuetifyField(page, 'パスワード', 'testpassword')
            // 最初はtypeがpassword
            const passwordField = page.locator('.v-text-field:has(.v-label:text-is("パスワード")) input')
            await expect(passwordField).toHaveAttribute('type', 'password')
            // 目アイコンをクリック
            await page.click('.v-text-field:has(.v-label:text-is("パスワード")) .v-input__append i')
            // typeがtextに変わる
            await expect(passwordField).toHaveAttribute('type', 'text')
        })
    })
})
