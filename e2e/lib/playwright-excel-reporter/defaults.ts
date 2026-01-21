/**
 * Playwright Excel Reporter - デフォルト設定
 * 
 * 日本語ラベルのデフォルトカラム構成
 */

import type { ColumnGroup, ExcelReporterOptions, StyleConfig } from './types'

/**
 * デフォルトカラムグループ
 * 
 * 日本のSI業界標準的な試験表フォーマット
 */
export const DEFAULT_COLUMN_GROUPS: ColumnGroup[] = [
    {
        title: 'テストケース',
        columns: [
            { key: 'id', title: 'No', source: { type: 'auto', field: 'id' }, width: 12 },
            { key: 'screen', title: '画面名', source: { type: 'meta', field: 'screen', fallback: 'describe' }, width: 20 },
            { key: 'model', title: 'モデル', source: { type: 'meta', field: 'model', default: '-' }, width: 15 },
        ],
    },
    {
        title: '試験仕様',
        columns: [
            { key: 'item', title: '確認項目', source: { type: 'auto', field: 'title' }, width: 30 },
            { key: 'perspective', title: '確認観点', source: { type: 'annotation', name: 'perspective', default: '' }, width: 25 },
            { key: 'expected', title: '想定される結果', source: { type: 'annotation', name: 'expected', default: '' }, width: 30 },
        ],
    },
    {
        title: '実施欄',
        columns: [
            { key: 'count', title: '確認項目数', source: { type: 'fixed', value: '1' }, width: 10 },
            { key: 'date', title: '実施日', source: { type: 'auto', field: 'timestamp' }, width: 12 },
            { key: 'tester', title: '実施者', source: { type: 'meta', field: 'tester', default: 'Auto' }, width: 10 },
            { key: 'result', title: '結果', source: { type: 'auto', field: 'status' }, width: 8 },
            { key: 'evidence', title: '検証物', source: { type: 'attachment', pattern: '*' }, width: 50 },
        ],
    },
    {
        title: '備考',
        columns: [
            { key: 'note', title: '', source: { type: 'empty' }, width: 20 },
        ],
    },
]

/**
 * デフォルトスタイル設定
 */
export const DEFAULT_STYLES: StyleConfig = {
    headerFill: 'FF4472C4',     // 青
    headerFont: 'FFFFFFFF',     // 白
    passFill: 'FF90EE90',       // 緑
    failFill: 'FFFF6B6B',       // 赤
    skipFill: 'FFFFEB3B',       // 黄
}

/**
 * デフォルトオプション
 */
export const DEFAULT_OPTIONS: Required<ExcelReporterOptions> = {
    outputPath: 'test-results/test-report.xlsx',
    columnGroups: DEFAULT_COLUMN_GROUPS,
    embedImages: true,
    imageSize: { width: 400, height: 180 },
    rowHeight: 150,
    styles: DEFAULT_STYLES,
    sheetGroupBy: 'describe',
    idPrefix: 'describe',
    customIdPrefix: '',
}

/**
 * ステータスの日本語マッピング
 */
export const STATUS_LABELS: Record<string, string> = {
    passed: 'PASS',
    failed: 'FAIL',
    skipped: 'SKIP',
    timedOut: 'TIMEOUT',
    interrupted: 'INTERRUPTED',
}
