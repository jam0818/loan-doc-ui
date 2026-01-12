import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright設定
 * システム連携テスト用
 */
export default defineConfig({
    // テストディレクトリ
    testDir: './e2e',

    // 各テストのタイムアウト（30秒）
    timeout: 30 * 1000,

    // アサーションのタイムアウト
    expect: {
        timeout: 5000,
    },

    // テストの並列実行
    fullyParallel: true,

    // CI環境での設定
    forbidOnly: !!process.env.CI,

    // リトライ設定
    retries: process.env.CI ? 2 : 0,

    // ワーカー数
    workers: process.env.CI ? 1 : undefined,

    // レポート設定
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
    ],

    // 共通設定
    use: {
        // ベースURL（開発サーバー）
        baseURL: 'http://localhost:5173',

        // トレース設定（失敗時に取得）
        trace: 'on-first-retry',

        // スクリーンショット（失敗時に取得）
        screenshot: 'only-on-failure',

        // ビデオ（失敗時に取得）
        video: 'on-first-retry',
    },

    // プロジェクト設定
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    // 開発サーバーの起動設定
    webServer: {
        command: 'bun run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
})
