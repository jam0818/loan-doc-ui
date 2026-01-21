/**
 * テスト環境設定
 * 
 * 環境変数またはデフォルト値を使用して、テスト実行に必要な設定値を提供する。
 */
export const testConfig = {
    /**
     * アプリケーションのベースURL
     */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /**
     * テスト用ユーザーアカウント
     */
    users: {
        default: {
            username: process.env.TEST_USERNAME || 'user1',
            password: process.env.TEST_PASSWORD || 'pass1',
        },
    },

    /**
     * ルーティング設定
     */
    routes: {
        home: '/',
        login: '/login',
    },
}
