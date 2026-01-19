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
    loginAndSetup,
    logoutViaUI,
    createDocumentViaUI,
    editDocumentViaUI,
    selectDocumentViaUI,
    deleteDocumentViaUI,
    createPromptViaUI,
    editPromptViaUI,
    deletePromptViaUI,
    runGenerationViaUI,
    updateGenerationResultViaUI,
    captureStep,
    TEST_USER,
} from './test-helpers'
export type { TestConfig, EvidenceOptions } from './test-helpers'
export * from './test-helpers'
