/**
 * テストレポートライブラリ
 *
 * E2Eテスト結果とエビデンス画像をExcelレポートにまとめるユーティリティ
 *
 * 使用例:
 * ```typescript
 * import { TestReporter, TestResult } from './lib/test-reporter'
 *
 * const reporter = new TestReporter({ outputDir: 'test-results' })
 *
 * // テスト実行中に結果を記録
 * reporter.addResult({
 *   id: '1.1',
 *   category: '認証機能',
 *   name: 'ログインページ表示',
 *   description: 'ログインページが正しく表示される',
 *   status: 'PASS',
 *   screenshotPath: 'path/to/screenshot.png',
 * })
 *
 * // テスト終了後にExcelレポート生成
 * await reporter.generateReport()
 * ```
 */

import ExcelJS from 'exceljs'
import * as fs from 'fs'
import * as path from 'path'

/**
 * テスト結果の型定義
 */
export interface TestResult {
    /** テストID（例: '1.1', '2.3'）*/
    id: string
    /** カテゴリ名（シート名として使用）*/
    category: string
    /** テスト名 */
    name: string
    /** テストの説明 */
    description: string
    /** テスト結果 */
    status: 'PASS' | 'FAIL' | 'SKIP'
    /** スクリーンショットのパス（オプション）*/
    screenshotPath?: string
    /** エラーメッセージ（オプション）*/
    error?: string
    /** 実行日時（自動設定される）*/
    timestamp?: string
}

/**
 * レポーター設定オプション
 */
export interface ReporterOptions {
    /** 出力ディレクトリ（デフォルト: 'test-results'）*/
    outputDir?: string
    /** スクリーンショット保存ディレクトリ（デフォルト: 'test-results/screenshots'）*/
    screenshotDir?: string
    /** レポートファイル名のプレフィックス（デフォルト: 'test-report'）*/
    reportPrefix?: string
    /** 画像をExcelに埋め込むか（デフォルト: true）*/
    embedImages?: boolean
    /** 埋め込み画像のサイズ */
    imageSize?: { width: number; height: number }
    /** 行の高さ（画像埋め込み時）*/
    rowHeight?: number
    /**
     * 固定ファイル名を使用するか（デフォルト: false）
     * trueの場合、タイムスタンプなしの固定名で保存（上書き）
     */
    useFixedFileName?: boolean
    /**
     * 結果をJSONファイルに保存するか（デフォルト: false）
     * trueの場合、結果をJSONに保存し、次回実行時に読み込んで統合
     */
    persistResults?: boolean
    /**
     * 結果保存用JSONファイルのパス
     */
    resultsFilePath?: string
}

/**
 * Excel スタイル設定
 */
interface StyleConfig {
    headerFill: ExcelJS.FillPattern
    headerFont: Partial<ExcelJS.Font>
    passFill: ExcelJS.FillPattern
    failFill: ExcelJS.FillPattern
    skipFill: ExcelJS.FillPattern
    border: Partial<ExcelJS.Borders>
}

/**
 * デフォルトのスタイル設定
 */
const DEFAULT_STYLES: StyleConfig = {
    headerFill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
    },
    headerFont: { bold: true, color: { argb: 'FFFFFFFF' } },
    passFill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF90EE90' },
    },
    failFill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF6B6B' },
    },
    skipFill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFEB3B' },
    },
    border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    },
}

/**
 * テストレポーター
 *
 * テスト結果を収集し、Excelレポートを生成するクラス
 */
export class TestReporter {
    private results: TestResult[] = []
    private options: Required<ReporterOptions>
    private styles: StyleConfig = DEFAULT_STYLES

    constructor(options: ReporterOptions = {}) {
        const outputDir = options.outputDir ?? 'test-results'
        this.options = {
            outputDir,
            screenshotDir: options.screenshotDir ?? 'test-results/screenshots',
            reportPrefix: options.reportPrefix ?? 'test-report',
            embedImages: options.embedImages ?? true,
            imageSize: options.imageSize ?? { width: 400, height: 180 },
            rowHeight: options.rowHeight ?? 150,
            useFixedFileName: options.useFixedFileName ?? false,
            persistResults: options.persistResults ?? false,
            resultsFilePath: options.resultsFilePath ?? path.join(outputDir, 'test-results.json'),
        }
        this.initDirs()

        // 永続化が有効な場合、既存の結果を読み込む
        if (this.options.persistResults) {
            this.loadResults()
        }
    }

    /**
     * ディレクトリを初期化
     */
    private initDirs(): void {
        if (!fs.existsSync(this.options.outputDir)) {
            fs.mkdirSync(this.options.outputDir, { recursive: true })
        }
        if (!fs.existsSync(this.options.screenshotDir)) {
            fs.mkdirSync(this.options.screenshotDir, { recursive: true })
        }
    }

    /**
     * 保存済み結果を読み込む
     */
    private loadResults(): void {
        if (fs.existsSync(this.options.resultsFilePath)) {
            try {
                const data = fs.readFileSync(this.options.resultsFilePath, 'utf-8')
                const parsed = JSON.parse(data)
                if (Array.isArray(parsed)) {
                    this.results = parsed
                    console.log(`📂 既存の結果を読み込み: ${parsed.length}件`)
                }
            } catch (e) {
                console.log('⚠️ 結果ファイルの読み込みに失敗、新規作成します')
            }
        }
    }

    /**
     * 結果をJSONファイルに保存
     */
    saveResults(): void {
        fs.writeFileSync(
            this.options.resultsFilePath,
            JSON.stringify(this.results, null, 2),
            'utf-8'
        )
        console.log(`💾 結果を保存: ${this.options.resultsFilePath} (${this.results.length}件)`)
    }

    /**
     * 保存済み結果をクリア
     */
    clearSavedResults(): void {
        if (fs.existsSync(this.options.resultsFilePath)) {
            fs.unlinkSync(this.options.resultsFilePath)
            console.log('🗑️ 保存済み結果をクリアしました')
        }
        this.results = []
    }

    /**
     * テスト結果を追加（永続化時は即座に保存）
     */
    addResult(result: Omit<TestResult, 'timestamp'>): void {
        // 永続化が有効な場合、最新の結果を読み込む
        if (this.options.persistResults) {
            this.loadResults()
        }

        const fullResult: TestResult = {
            ...result,
            timestamp: new Date().toISOString(),
        }

        // 同じIDの結果があれば更新、なければ追加
        const existingIndex = this.results.findIndex(r => r.id === result.id)
        if (existingIndex >= 0) {
            this.results[existingIndex] = fullResult
        } else {
            this.results.push(fullResult)
        }

        this.logResult(fullResult)

        // 永続化が有効な場合、即座に保存
        if (this.options.persistResults) {
            this.saveResultsQuiet()
        }
    }

    /**
     * 結果を静かに保存（ログなし）
     */
    private saveResultsQuiet(): void {
        fs.writeFileSync(
            this.options.resultsFilePath,
            JSON.stringify(this.results, null, 2),
            'utf-8'
        )
    }

    /**
     * 結果をコンソールに出力
     */
    private logResult(result: TestResult): void {
        const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️'
        console.log(`${emoji} [${result.id}] ${result.name}: ${result.status}`)
    }

    /**
     * すべての結果を取得
     */
    getResults(): TestResult[] {
        return [...this.results]
    }

    /**
     * カテゴリ一覧を取得
     */
    getCategories(): string[] {
        return [...new Set(this.results.map(r => r.category))]
    }

    /**
     * サマリーを取得
     */
    getSummary(): { total: number; pass: number; fail: number; skip: number; rate: number } {
        const total = this.results.length
        const pass = this.results.filter(r => r.status === 'PASS').length
        const fail = this.results.filter(r => r.status === 'FAIL').length
        const skip = this.results.filter(r => r.status === 'SKIP').length
        const rate = total > 0 ? Math.round((pass / total) * 100) : 0
        return { total, pass, fail, skip, rate }
    }

    /**
     * スクリーンショットのパスを生成
     */
    getScreenshotPath(testId: string, stepName: string): string {
        return path.join(this.options.screenshotDir, `${testId}_${stepName}.png`)
    }

    /**
     * 結果をリセット
     */
    reset(): void {
        this.results = []
    }

    /**
     * Excelレポートを生成
     */
    async generateReport(): Promise<string> {
        console.log('\n📊 Excelレポート生成中...')

        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'Playwright Test Reporter'
        workbook.created = new Date()

        // カテゴリ別シート作成
        const categories = this.getCategories()
        for (const category of categories) {
            await this.createCategorySheet(workbook, category)
        }

        // サマリーシート作成
        this.createSummarySheet(workbook, categories)

        // ファイル名決定（固定 or タイムスタンプ付き）
        let reportPath: string
        if (this.options.useFixedFileName) {
            reportPath = path.join(this.options.outputDir, `${this.options.reportPrefix}.xlsx`)
        } else {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            reportPath = path.join(this.options.outputDir, `${this.options.reportPrefix}_${timestamp}.xlsx`)
        }

        await workbook.xlsx.writeFile(reportPath)

        // 永続化が有効な場合、結果も保存
        if (this.options.persistResults) {
            this.saveResults()
        }

        const summary = this.getSummary()
        console.log(`📁 レポート保存: ${reportPath}`)
        console.log(`\n🎉 テスト完了: ${summary.pass} PASS, ${summary.fail} FAIL, ${summary.skip} SKIP (成功率: ${summary.rate}%)`)

        return reportPath
    }

    /**
     * カテゴリ別シートを作成
     */
    private async createCategorySheet(workbook: ExcelJS.Workbook, category: string): Promise<void> {
        const categoryResults = this.results.filter(r => r.category === category)
        const sheetName = category.substring(0, 31) // Excelのシート名制限

        const worksheet = workbook.addWorksheet(sheetName)

        // 列設定
        worksheet.columns = [
            { header: 'テストID', key: 'id', width: 10 },
            { header: 'テスト名', key: 'name', width: 20 },
            { header: '説明', key: 'description', width: 35 },
            { header: '結果', key: 'status', width: 8 },
            { header: '実行日時', key: 'timestamp', width: 22 },
            { header: 'エビデンス', key: 'evidence', width: this.options.embedImages ? 60 : 40 },
            { header: 'エラー', key: 'error', width: 30 },
        ]

        // ヘッダースタイル
        const headerRow = worksheet.getRow(1)
        headerRow.font = this.styles.headerFont
        headerRow.fill = this.styles.headerFill
        headerRow.height = 25

        // データ追加
        let rowIndex = 2
        for (const result of categoryResults) {
            const row = worksheet.getRow(rowIndex)
            row.getCell('id').value = result.id
            row.getCell('name').value = result.name
            row.getCell('description').value = result.description
            row.getCell('status').value = result.status
            row.getCell('timestamp').value = result.timestamp ?? ''
            row.getCell('error').value = result.error ?? ''

            // ステータスに応じた色設定
            const statusCell = row.getCell('status')
            if (result.status === 'PASS') {
                statusCell.fill = this.styles.passFill
            } else if (result.status === 'FAIL') {
                statusCell.fill = this.styles.failFill
            } else {
                statusCell.fill = this.styles.skipFill
            }

            // 画像埋め込み
            if (this.options.embedImages && result.screenshotPath && fs.existsSync(result.screenshotPath)) {
                try {
                    const imageId = workbook.addImage({
                        filename: result.screenshotPath,
                        extension: 'png',
                    })
                    row.height = this.options.rowHeight
                    worksheet.addImage(imageId, {
                        tl: { col: 5, row: rowIndex - 1 },
                        ext: this.options.imageSize,
                    })
                } catch {
                    row.getCell('evidence').value = result.screenshotPath
                }
            } else if (result.screenshotPath) {
                row.getCell('evidence').value = result.screenshotPath
            }

            rowIndex++
        }

        // 罫線と配置設定
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = this.styles.border
                cell.alignment = { vertical: 'middle', wrapText: true }
            })
        })
    }

    /**
     * サマリーシートを作成
     */
    private createSummarySheet(workbook: ExcelJS.Workbook, categories: string[]): void {
        const summarySheet = workbook.addWorksheet('サマリー')

        summarySheet.columns = [
            { header: 'カテゴリ', key: 'category', width: 30 },
            { header: '合計', key: 'total', width: 10 },
            { header: 'PASS', key: 'pass', width: 10 },
            { header: 'FAIL', key: 'fail', width: 10 },
            { header: 'SKIP', key: 'skip', width: 10 },
            { header: '成功率', key: 'rate', width: 15 },
        ]

        // ヘッダースタイル
        const headerRow = summarySheet.getRow(1)
        headerRow.font = this.styles.headerFont
        headerRow.fill = this.styles.headerFill

        // カテゴリ別サマリー
        for (const category of categories) {
            const catResults = this.results.filter(r => r.category === category)
            const pass = catResults.filter(r => r.status === 'PASS').length
            const fail = catResults.filter(r => r.status === 'FAIL').length
            const skip = catResults.filter(r => r.status === 'SKIP').length
            const rate = catResults.length > 0 ? Math.round((pass / catResults.length) * 100) : 0

            summarySheet.addRow({
                category,
                total: catResults.length,
                pass,
                fail,
                skip,
                rate: `${rate}%`,
            })
        }

        // 全体サマリー
        const summary = this.getSummary()
        const totalRow = summarySheet.addRow({
            category: '合計',
            total: summary.total,
            pass: summary.pass,
            fail: summary.fail,
            skip: summary.skip,
            rate: `${summary.rate}%`,
        })
        totalRow.font = { bold: true }

        // 罫線設定
        summarySheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = this.styles.border
            })
        })
    }
}

/**
 * シングルトンインスタンス（簡易利用向け）
 */
let defaultReporter: TestReporter | null = null

/**
 * デフォルトレポーターを取得
 */
export function getReporter(options?: ReporterOptions): TestReporter {
    if (!defaultReporter) {
        defaultReporter = new TestReporter(options)
    }
    return defaultReporter
}

/**
 * デフォルトレポーターをリセット
 */
export function resetReporter(): void {
    defaultReporter = null
}

export default TestReporter
