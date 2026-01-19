/**
 * テストレポートライブラリ インデックス
 * 
 * 使いやすいようにエクスポート
 */

export { TestReporter, getReporter, resetReporter } from './test-reporter'
export type { TestResult, ReporterOptions } from './test-reporter'
export {
    runTest,
    createReporter,
    loginViaUI,
    goToMainPageLoggedIn,
    TEST_USER,
} from './test-helpers'
export type { TestConfig } from './test-helpers'
