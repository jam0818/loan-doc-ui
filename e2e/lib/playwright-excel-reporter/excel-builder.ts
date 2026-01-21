/**
 * Playwright Excel Reporter - Excel Builder
 * 
 * ExcelJS を使用してテスト結果をExcelファイルに出力する
 * 親カラム（マージセル）対応
 */

import ExcelJS from 'exceljs'
import * as fs from 'fs'
import * as path from 'path'
import type {
    ColumnGroup,
    ColumnDef,
    TestData,
    ExcelReporterOptions,
    AttachmentData,
} from './types'
import { DEFAULT_OPTIONS, DEFAULT_STYLES, STATUS_LABELS } from './defaults'

/**
 * Excel Builder クラス
 * 
 * テスト結果からExcelファイルを生成する
 */
export class ExcelBuilder {
    private workbook: ExcelJS.Workbook
    private options: Required<ExcelReporterOptions>
    private allTestData: TestData[] = []

    constructor(options: ExcelReporterOptions = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options }
        this.workbook = new ExcelJS.Workbook()
        this.workbook.creator = 'Playwright Excel Reporter'
        this.workbook.created = new Date()
    }

    /**
     * シートを追加
     * 
     * @param sheetName シート名
     * @param tests テストデータ配列
     */
    async addSheet(sheetName: string, tests: TestData[]): Promise<void> {
        // シート名のサニタイズ（Excelの制限: 31文字以内、特定文字禁止）
        const safeName = this.sanitizeSheetName(sheetName)
        const worksheet = this.workbook.addWorksheet(safeName)

        // 全テストデータを保持（サマリー用）
        this.allTestData.push(...tests)

        // ヘッダー構築
        await this.buildHeader(worksheet)

        // データ行追加
        await this.addDataRows(worksheet, tests)

        // スタイル適用
        this.applyStyles(worksheet)
    }

    /**
     * ヘッダーを構築（2行構成: 親カラム + 子カラム）
     */
    private async buildHeader(worksheet: ExcelJS.Worksheet): Promise<void> {
        const columnGroups = this.options.columnGroups
        const styles = this.options.styles

        // 列幅設定用の配列を作成
        const columns: Partial<ExcelJS.Column>[] = []
        let colIndex = 1

        // 1行目: 親カラム（マージセル）
        const row1 = worksheet.getRow(1)
        // 2行目: 子カラム
        const row2 = worksheet.getRow(2)

        for (const group of columnGroups) {
            const startCol = colIndex

            for (const col of group.columns) {
                // 列幅設定
                columns.push({ key: col.key, width: col.width ?? 15 })

                // 2行目に子カラムのタイトル
                const cell2 = row2.getCell(colIndex)
                cell2.value = col.title
                cell2.font = { bold: true, color: { argb: styles.headerFont ?? 'FFFFFFFF' } }
                cell2.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: styles.headerFill ?? 'FF4472C4' },
                }
                cell2.alignment = { vertical: 'middle', horizontal: 'center' }
                cell2.border = this.getBorder()

                colIndex++
            }

            const endCol = colIndex - 1

            // 1行目に親カラムのタイトル（マージ）
            const cell1 = row1.getCell(startCol)
            cell1.value = group.title
            cell1.font = { bold: true, color: { argb: styles.headerFont ?? 'FFFFFFFF' } }
            cell1.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: styles.headerFill ?? 'FF4472C4' },
            }
            cell1.alignment = { vertical: 'middle', horizontal: 'center' }
            cell1.border = this.getBorder()

            // 親カラムをマージ
            if (startCol < endCol) {
                worksheet.mergeCells(1, startCol, 1, endCol)
            }
        }

        // 列幅を設定
        worksheet.columns = columns

        // ヘッダー行の高さ
        row1.height = 25
        row2.height = 25
    }

    /**
     * データ行を追加
     */
    private async addDataRows(worksheet: ExcelJS.Worksheet, tests: TestData[]): Promise<void> {
        const columnGroups = this.options.columnGroups
        let rowIndex = 3  // ヘッダー2行の次から

        for (const testData of tests) {
            const row = worksheet.getRow(rowIndex)
            let colIndex = 1

            for (const group of columnGroups) {
                for (const colDef of group.columns) {
                    const cell = row.getCell(colIndex)
                    const value = await this.getCellValue(colDef, testData, worksheet, rowIndex, colIndex)

                    if (typeof value === 'string' || typeof value === 'number') {
                        cell.value = value
                    }

                    // 結果カラムに色付け
                    if (colDef.source.type === 'auto' && colDef.source.field === 'status') {
                        this.applyStatusStyle(cell, testData.status)
                    }

                    cell.border = this.getBorder()
                    cell.alignment = { vertical: 'middle', wrapText: true }

                    colIndex++
                }
            }

            // 画像がある場合は行の高さを調整
            const hasImage = this.hasImageAttachment(testData)
            if (hasImage) {
                row.height = this.options.rowHeight
            }

            rowIndex++
        }
    }

    /**
     * セルの値を取得
     */
    private async getCellValue(
        colDef: ColumnDef,
        testData: TestData,
        worksheet: ExcelJS.Worksheet,
        rowIndex: number,
        colIndex: number
    ): Promise<string | number | undefined> {
        const source = colDef.source

        switch (source.type) {
            case 'auto':
                return this.getAutoValue(source.field, testData)

            case 'meta':
                // メタデータから取得（アノテーション経由）
                const metaValue = testData.annotations.get(source.field)
                if (metaValue) return metaValue
                // フォールバック
                if (source.fallback === 'describe') return testData.describe
                if (source.fallback === 'title') return testData.title
                return source.default ?? ''

            case 'annotation':
                return testData.annotations.get(source.name) ?? source.default ?? ''

            case 'attachment':
                // 画像埋め込み or パス表示
                return await this.handleAttachment(testData, worksheet, rowIndex, colIndex)

            case 'fixed':
                return source.value

            case 'empty':
                return ''

            default:
                return ''
        }
    }

    /**
     * 自動フィールドの値を取得
     */
    private getAutoValue(field: string, testData: TestData): string | number {
        switch (field) {
            case 'id':
                return testData.id
            case 'title':
                return testData.title
            case 'describe':
                return testData.describe
            case 'status':
                return STATUS_LABELS[testData.status] ?? testData.status
            case 'timestamp':
                // 日付のみ表示
                return testData.timestamp.split('T')[0]
            case 'duration':
                return `${Math.round(testData.duration / 1000)}s`
            case 'error':
                return testData.error ?? ''
            default:
                return ''
        }
    }

    /**
     * 添付ファイル（スクショ）の処理
     */
    private async handleAttachment(
        testData: TestData,
        worksheet: ExcelJS.Worksheet,
        rowIndex: number,
        colIndex: number
    ): Promise<string> {
        const imageAttachments = testData.attachments.filter(
            a => a.contentType.startsWith('image/')
        )

        if (imageAttachments.length === 0) {
            return ''
        }

        if (!this.options.embedImages) {
            // パスのみ表示
            return imageAttachments.map(a => a.name).join(', ')
        }

        // 画像埋め込み
        for (const attachment of imageAttachments) {
            await this.embedImage(worksheet, attachment, rowIndex, colIndex)
        }

        return ''  // 画像埋め込み時はセル値は空
    }

    /**
     * 画像を埋め込む
     */
    private async embedImage(
        worksheet: ExcelJS.Worksheet,
        attachment: AttachmentData,
        rowIndex: number,
        colIndex: number
    ): Promise<void> {
        try {
            let imageBuffer: Buffer | undefined

            if (attachment.body) {
                imageBuffer = attachment.body
            } else if (attachment.path && fs.existsSync(attachment.path)) {
                imageBuffer = fs.readFileSync(attachment.path)
            }

            if (!imageBuffer) return

            // Node.js バージョンと ExcelJS 型定義の互換性問題のため型アサーションを使用
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const imageId = this.workbook.addImage({
                buffer: imageBuffer as any,
                extension: 'png',
            })

            worksheet.addImage(imageId, {
                tl: { col: colIndex - 1, row: rowIndex - 1 },
                ext: this.options.imageSize,
            })
        } catch (e) {
            console.warn(`画像埋め込み失敗: ${attachment.name} - ${e}`)
        }
    }

    /**
     * ステータスに応じたスタイルを適用
     */
    private applyStatusStyle(cell: ExcelJS.Cell, status: string): void {
        const styles = this.options.styles

        const fillColors: Record<string, string | undefined> = {
            passed: styles.passFill,
            failed: styles.failFill,
            skipped: styles.skipFill,
            timedOut: styles.failFill,
            interrupted: styles.skipFill,
        }

        const color = fillColors[status]
        if (color) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: color },
            }
        }
    }

    /**
     * スタイルを適用
     */
    private applyStyles(worksheet: ExcelJS.Worksheet): void {
        // 罫線を全セルに適用
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                if (!cell.border) {
                    cell.border = this.getBorder()
                }
            })
        })
    }

    /**
     * 罫線スタイルを取得
     */
    private getBorder(): Partial<ExcelJS.Borders> {
        return {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        }
    }

    /**
     * 画像添付があるか確認
     */
    private hasImageAttachment(testData: TestData): boolean {
        return testData.attachments.some(a => a.contentType.startsWith('image/'))
    }

    /**
     * サマリーシートを追加
     */
    addSummarySheet(): void {
        const worksheet = this.workbook.addWorksheet('サマリー')

        // カラム設定
        worksheet.columns = [
            { header: 'カテゴリ', key: 'category', width: 30 },
            { header: '合計', key: 'total', width: 10 },
            { header: 'PASS', key: 'pass', width: 10 },
            { header: 'FAIL', key: 'fail', width: 10 },
            { header: 'SKIP', key: 'skip', width: 10 },
            { header: '成功率', key: 'rate', width: 15 },
        ]

        // ヘッダースタイル
        const headerRow = worksheet.getRow(1)
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: this.options.styles.headerFill ?? 'FF4472C4' },
        }

        // カテゴリ別集計
        const categories = new Map<string, TestData[]>()
        for (const test of this.allTestData) {
            const category = test.describe || 'その他'
            if (!categories.has(category)) {
                categories.set(category, [])
            }
            categories.get(category)!.push(test)
        }

        // データ行追加
        for (const [category, tests] of categories) {
            const pass = tests.filter(t => t.status === 'passed').length
            const fail = tests.filter(t => t.status === 'failed').length
            const skip = tests.filter(t => t.status === 'skipped').length
            const total = tests.length
            const rate = total > 0 ? Math.round((pass / total) * 100) : 0

            worksheet.addRow({
                category,
                total,
                pass,
                fail,
                skip,
                rate: `${rate}%`,
            })
        }

        // 合計行
        const totalPass = this.allTestData.filter(t => t.status === 'passed').length
        const totalFail = this.allTestData.filter(t => t.status === 'failed').length
        const totalSkip = this.allTestData.filter(t => t.status === 'skipped').length
        const totalCount = this.allTestData.length
        const totalRate = totalCount > 0 ? Math.round((totalPass / totalCount) * 100) : 0

        const totalRow = worksheet.addRow({
            category: '合計',
            total: totalCount,
            pass: totalPass,
            fail: totalFail,
            skip: totalSkip,
            rate: `${totalRate}%`,
        })
        totalRow.font = { bold: true }

        // 罫線
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = this.getBorder()
            })
        })
    }

    /**
     * Excelファイルを保存
     */
    async save(outputPath: string): Promise<string> {
        // ディレクトリがなければ作成
        const dir = path.dirname(outputPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

        await this.workbook.xlsx.writeFile(outputPath)
        console.log(`📁 Excelレポート保存: ${outputPath}`)

        return outputPath
    }

    /**
     * シート名をサニタイズ
     */
    private sanitizeSheetName(name: string): string {
        // Excelのシート名制限: 31文字以内、特定文字禁止
        return name
            .replace(/[\\/*?:\[\]]/g, '_')
            .substring(0, 31)
    }
}
