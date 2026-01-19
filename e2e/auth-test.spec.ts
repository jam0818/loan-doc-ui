/**
 * 認証機能テスト
 *
 * 共通ライブラリのrunTestヘルパーとgetByRoleを使用
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
            await expect(page.getByRole('heading', { name: '文書生成アプリケーション' })).toBeVisible({ timeout: 10000 })
            // ユーザー名フィールド確認
            await expect(page.getByLabel('ユーザー名')).toBeVisible()
            // パスワードフィールド確認
            await expect(page.getByLabel('パスワード')).toBeVisible()
            // ログインボタン確認
            await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
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
            await expect(page.getByRole('button', { name: 'ログイン' })).toBeDisabled()
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
            await page.getByLabel('ユーザー名').fill('admin')
            // ボタンは無効のまま
            await expect(page.getByRole('button', { name: 'ログイン' })).toBeDisabled()
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
            await page.getByLabel('パスワード').fill('password')
            // ボタンは無効のまま
            await expect(page.getByRole('button', { name: 'ログイン' })).toBeDisabled()
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
            await page.getByLabel('ユーザー名').fill('admin')
            await page.getByLabel('パスワード').fill('password')
            // ボタンが有効になる
            await expect(page.getByRole('button', { name: 'ログイン' })).toBeEnabled()
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
            await page.getByLabel('ユーザー名').fill('admin')
            await page.getByLabel('パスワード').fill('password')
            await page.getByRole('button', { name: 'ログイン' }).click()
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
            const passwordField = page.getByLabel('パスワード')
            await passwordField.fill('testpassword')
            // 最初はtypeがpassword
            await expect(passwordField).toHaveAttribute('type', 'password')
            // 目アイコンをクリック（Vuetifyのappend-inner-icon）
            await page.locator('.v-field__append-inner .mdi-eye').click()
            // typeがtextに変わる
            await expect(passwordField).toHaveAttribute('type', 'text')
        })
    })
})
