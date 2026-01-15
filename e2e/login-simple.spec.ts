import { test, expect } from '@playwright/test'
import { setupApiMocks } from './mocks/api-mock'

/**
 * シンプルなログインテスト
 * ログインが可能かどうかを確認するだけのテスト
 */
test('ログイン確認テスト', async ({ page }) => {
    // APIモックをセットアップ
    await setupApiMocks(page)

    // ログインページにアクセス
    await page.goto('/login')

    // ログインページが表示されることを確認
    await expect(page.locator('text=文書生成アプリケーション')).toBeVisible({ timeout: 10000 })
    console.log('✅ ログインページ表示OK')

    // ログイン情報を入力
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'password')
    console.log('✅ ログイン情報入力OK')

    // ログインボタンをクリック
    await page.click('button:has-text("ログイン")')
    console.log('✅ ログインボタンクリックOK')

    // メイン画面に遷移することを確認
    await page.waitForURL('/', { timeout: 10000 })
    console.log('✅ メイン画面遷移OK')

    // 3カラムが表示されることを確認
    await expect(page.locator('text=ドキュメント')).toBeVisible()
    await expect(page.locator('text=プロンプト')).toBeVisible()
    await expect(page.locator('text=生成')).toBeVisible()
    console.log('✅ 3カラム表示OK')

    console.log('\n🎉 ログインテスト成功!')
})
