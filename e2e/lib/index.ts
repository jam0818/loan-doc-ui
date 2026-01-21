/**
 * テストライブラリ インデックス
 * 
 * 汎用パッケージとアプリ固有ヘルパーをまとめてエクスポート
 */

// 汎用パッケージ (playwright-excel-reporter)
export * from './playwright-excel-reporter'

// アプリ固有ヘルパー
export {
    loginAndSetup,
    loginViaUI,
    logoutViaUI,
    createDocumentViaUI,
    editDocumentViaUI,
    selectDocumentViaUI,
    deleteDocumentViaUI,
    createPromptViaUI,
    selectPromptViaUI,
    editPromptViaUI,
    deletePromptViaUI,
    runGenerationViaUI,
    updateGenerationResultViaUI,
} from './app-helpers'

// 設定
export { testConfig } from '../config'
