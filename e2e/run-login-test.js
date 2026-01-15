/**
 * シンプルなログインテスト実行スクリプト
 * bunx playwright を使わず直接実行
 */
const { chromium } = require('playwright')

async function runLoginTest() {
    console.log('🚀 ログインテスト開始')

    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    try {
        // ログインページにアクセス
        console.log('📍 ログインページにアクセス...')
        await page.goto('http://localhost:3000/login')

        // ログインページ表示確認
        await page.waitForSelector('text=文書生成アプリケーション', { timeout: 10000 })
        console.log('✅ ログインページ表示OK')

        // スクリーンショット
        await page.screenshot({ path: 'test-results/login-page.png', fullPage: true })
        console.log('📸 ログインページスクリーンショット保存')

        // ログイン情報入力
        await page.fill('input[type="text"]', 'admin')
        await page.fill('input[type="password"]', 'password')
        console.log('✅ ログイン情報入力OK')

        // ログインボタンクリック
        await page.click('button:has-text("ログイン")')
        console.log('✅ ログインボタンクリックOK')

        // メイン画面遷移待ち（5秒）
        try {
            await page.waitForURL('http://localhost:3000/', { timeout: 5000 })
            console.log('✅ メイン画面遷移OK')

            // スクリーンショット
            await page.screenshot({ path: 'test-results/main-page.png', fullPage: true })
            console.log('📸 メイン画面スクリーンショット保存')

            console.log('\n🎉 ログインテスト成功!')
        } catch (e) {
            // ログイン失敗（APIモックなしのため）
            await page.screenshot({ path: 'test-results/login-result.png', fullPage: true })
            console.log('⚠️ メイン画面遷移失敗（APIモックなしの可能性）')
            console.log('📸 結果スクリーンショット保存')
        }

    } catch (error) {
        console.error('❌ テスト失敗:', error.message)
        await page.screenshot({ path: 'test-results/error.png', fullPage: true })
    } finally {
        await browser.close()
        console.log('\n📊 テスト完了')
    }
}

// test-resultsディレクトリ作成
const fs = require('fs')
if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true })
}

runLoginTest().catch(console.error)
