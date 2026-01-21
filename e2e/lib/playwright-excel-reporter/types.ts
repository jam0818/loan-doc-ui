/**
 * Playwright Excel Reporter - 型定義
 * 
 * Excel出力用のカラム定義・オプション型
 */

/**
 * カラムのデータソース定義
 */
export type ColumnSource =
    // 自動取得フィールド
    | { type: 'auto'; field: 'id' | 'title' | 'status' | 'timestamp' | 'describe' | 'duration' | 'error' }
    // ファイル冒頭のtestMeta()から取得
    | { type: 'meta'; field: string; fallback?: 'describe' | 'title'; default?: string }
    // テスト個別のアノテーションから取得
    | { type: 'annotation'; name: string; default?: string }
    // 添付ファイル（スクリーンショット等）
    | { type: 'attachment'; pattern?: string }
    // 固定値
    | { type: 'fixed'; value: string }
    // 空白
    | { type: 'empty' }

/**
 * 個別カラム定義
 */
export interface ColumnDef {
    /** 内部キー（一意識別子） */
    key: string
    /** ヘッダー表示名 */
    title: string
    /** 列幅（Excel単位） */
    width?: number
    /** 値の取得元 */
    source: ColumnSource
}

/**
 * カラムグループ定義（親カラム）
 */
export interface ColumnGroup {
    /** 親カラムのタイトル */
    title: string
    /** 子カラム */
    columns: ColumnDef[]
}

/**
 * スタイル設定
 */
export interface StyleConfig {
    /** ヘッダー背景色（ARGB） */
    headerFill?: string
    /** ヘッダー文字色（ARGB） */
    headerFont?: string
    /** PASS結果の背景色 */
    passFill?: string
    /** FAIL結果の背景色 */
    failFill?: string
    /** SKIP結果の背景色 */
    skipFill?: string
}

/**
 * レポーター設定オプション
 */
export interface ExcelReporterOptions {
    /** 出力パス（デフォルト: 'test-results/test-report.xlsx'） */
    outputPath?: string
    /** カラムグループ定義 */
    columnGroups?: ColumnGroup[]
    /** 画像埋め込み（デフォルト: true） */
    embedImages?: boolean
    /** 埋め込み画像サイズ */
    imageSize?: { width: number; height: number }
    /** 行の高さ（画像埋め込み時） */
    rowHeight?: number
    /** スタイル設定 */
    styles?: StyleConfig
    /** シートのグループ化方式（デフォルト: 'describe'） */
    sheetGroupBy?: 'describe' | 'file' | 'none'
    /** ID連番のプレフィックス方式 */
    idPrefix?: 'describe' | 'file' | 'custom'
    /** カスタムIDプレフィックス */
    customIdPrefix?: string
}

/**
 * 内部で使用するテストデータ
 */
export interface TestData {
    /** テストID（自動採番 or アノテーション） */
    id: string
    /** テストタイトル */
    title: string
    /** describeのタイトル */
    describe: string
    /** ファイルパス */
    file: string
    /** 行番号 */
    line: number
    /** テスト結果 */
    status: 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted'
    /** 実行日時 */
    timestamp: string
    /** 実行時間（ms） */
    duration: number
    /** エラーメッセージ */
    error?: string
    /** アノテーション */
    annotations: Map<string, string>
    /** 添付ファイル（スクリーンショット等） */
    attachments: AttachmentData[]
}

/**
 * 添付ファイルデータ
 */
export interface AttachmentData {
    /** 添付ファイル名 */
    name: string
    /** コンテンツタイプ */
    contentType: string
    /** ファイルパス（あれば） */
    path?: string
    /** Bodyデータ（あれば） */
    body?: Buffer
}
