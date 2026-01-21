/**
 * Playwright Excel Reporter
 * 
 * Playwright Reporter API 準拠のExcelレポートライブラリ。
 * テスト結果を自動収集し、カスタマイズ可能なカラム構成でExcelファイルを生成する。
 * 
 * @example 基本的な使用方法
 * ```typescript
 * // playwright.config.ts
 * export default defineConfig({
 *     reporter: [
 *         ['html'],
 *         ['./e2e/lib/playwright-excel-reporter', {
 *             outputPath: 'test-results/evidence.xlsx',
 *             embedImages: true,
 *         }]
 *     ]
 * })
 * ```
 * 
 * @example テストファイルでの使用
 * ```typescript
 * import { test, expect } from '@playwright/test'
 * import { testMeta, captureStep } from '../lib/playwright-excel-reporter'
 * 
 * // ファイル冒頭でメタデータ定義
 * testMeta({
 *     screen: 'ドキュメント管理',
 *     model: 'Document',
 *     tester: 'CI/CD',
 * })
 * 
 * test.describe('ドキュメント管理', () => {
 *     test('新規作成できる', async ({ page }) => {
 *         await captureStep(page, 'ドキュメント作成', async () => {
 *             // 操作
 *         })
 *         await expect(page.getByText('作成完了')).toBeVisible()
 *     })
 * })
 * ```
 */

// デフォルトエクスポート: Reporter クラス
export { default } from './reporter'

// 名前付きエクスポート
export { default as ExcelReporter } from './reporter'
export { ExcelBuilder } from './excel-builder'
export { captureStep, captureScreenshot, type CaptureStepOptions } from './capture-step'
export { testMeta, getCurrentMeta, resetMeta, type TestMetaOptions } from './meta'
export { DEFAULT_COLUMN_GROUPS, DEFAULT_STYLES, DEFAULT_OPTIONS, STATUS_LABELS } from './defaults'

// 型エクスポート
export type {
    ColumnSource,
    ColumnDef,
    ColumnGroup,
    StyleConfig,
    ExcelReporterOptions,
    TestData,
    AttachmentData,
} from './types'
