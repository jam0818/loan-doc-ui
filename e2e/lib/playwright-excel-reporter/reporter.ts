/**
 * Playwright Excel Reporter - Reporter 本体
 * 
 * Playwright Reporter API を実装し、テスト結果を自動収集してExcel出力する
 */

import type {
    Reporter,
    FullConfig,
    Suite,
    TestCase,
    TestResult,
    FullResult,
} from '@playwright/test/reporter'
import { ExcelBuilder } from './excel-builder'
import { DEFAULT_OPTIONS } from './defaults'
import type { ExcelReporterOptions, TestData, AttachmentData } from './types'

/**
 * Excel Reporter
 * 
 * Playwright Reporter API 準拠のExcelレポーター。
 * テスト結果を自動収集し、設定されたカラム構成でExcelファイルを生成する。
 * 
 * @example playwright.config.ts での使用
 * ```typescript
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
 */
class ExcelReporter implements Reporter {
    private options: Required<ExcelReporterOptions>
    private testResults: Map<string, TestData[]> = new Map()
    private rawTestResults: TestData[] = []
    private globalIdCounter: number = 0

    constructor(options: ExcelReporterOptions = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options }
    }

    /**
     * テスト開始時
     */
    onBegin(config: FullConfig, suite: Suite): void {
        console.log(`\n📊 Excel Reporter: テスト開始`)
    }

    /**
     * 各テスト終了時
     */
    onTestEnd(test: TestCase, result: TestResult): void {
        // 結果を一時保存（この時点ではID採番しない）
        const data = this.extractTestData(test, result)
        this.rawTestResults.push(data)
    }

    /**
     * 全テスト終了時
     */
    async onEnd(result: FullResult): Promise<void> {
        if (this.rawTestResults.length === 0) {
            console.log('📊 Excel Reporter: テスト結果がありません')
            return
        }

        console.log(`\n📊 Excel Reporter: レポート生成中...`)

        // 1. テスト結果をファイル名・行番号順にソート
        this.sortResults()

        // 2. リトライを集約処理
        const uniqueResults = this.aggregateRetries()

        // 3. ID採番とシート振分け
        this.processFinalResults(uniqueResults)

        const builder = new ExcelBuilder(this.options)

        // シートごとにデータ追加
        for (const [sheetName, tests] of this.testResults) {
            await builder.addSheet(sheetName, tests)
        }

        // サマリーシート追加
        builder.addSummarySheet()

        // 保存
        await builder.save(this.options.outputPath)

        // 統計出力
        const total = Array.from(this.testResults.values()).flat()
        const passed = total.filter(t => t.status === 'passed').length
        const failed = total.filter(t => ['failed', 'timedOut', 'interrupted'].includes(t.status)).length
        const skipped = total.filter(t => t.status === 'skipped').length
        const rate = total.length > 0 ? Math.round((passed / total.length) * 100) : 0

        console.log(`\n📊 Excel Reporter 完了:`)
        console.log(`   ✅ PASS: ${passed}, ❌ FAIL: ${failed}, ⏭️ SKIP: ${skipped}`)
        console.log(`   📈 成功率: ${rate}%`)
        console.log(`   📁 出力: ${this.options.outputPath}`)
    }

    /**
     * 結果をソート（ファイルパス > 行番号）
     */
    private sortResults(): void {
        this.rawTestResults.sort((a, b) => {
            if (a.file !== b.file) {
                return a.file.localeCompare(b.file)
            }
            return 0
        })
    }

    /**
     * リトライを集約
     */
    private aggregateRetries(): TestData[] {
        const resultMap = new Map<string, TestData[]>()

        // 同じテスト（タイトル・ファイル・describeが同じ）をグループ化
        for (const res of this.rawTestResults) {
            const key = `${res.file}::${res.describe}::${res.title}`
            if (!resultMap.has(key)) {
                resultMap.set(key, [])
            }
            resultMap.get(key)!.push(res)
        }

        const finalResults: TestData[] = []

        for (const [_, results] of resultMap) {
            // 最後の実行結果をベースにする
            const final = { ...results[results.length - 1] }

            // リトライがあった場合
            if (results.length > 1) {
                // 経緯を備考（note）に追加
                const history = results.map((r, i) => `${i + 1}回目:${r.status}`).join(', ')
                const note = final.annotations.get('note') || ''
                const retryNote = `リトライ実施: [${history}]`

                final.annotations.set('note', note ? `${note}\n${retryNote}` : retryNote)

                // エラーメッセージは失敗時のものを結合して残す
                const errors = results
                    .map((r, i) => r.error ? `[${i + 1}回目] ${r.error}` : null)
                    .filter(Boolean)
                    .join('\n')

                if (errors) {
                    final.error = errors
                }
            }

            finalResults.push(final)
        }

        return finalResults
    }

    /**
     * 最終結果のID採番とシート振分け
     */
    private processFinalResults(results: TestData[]): void {
        for (const data of results) {
            // ID採番（@testId優先、なければ単純連番）
            const customId = data.annotations.get('testId')
            if (customId) {
                data.id = customId
            } else {
                this.globalIdCounter++
                data.id = String(this.globalIdCounter)
            }

            // シート振分け
            const sheetName = this.getSheetNameFromData(data)
            if (!this.testResults.has(sheetName)) {
                this.testResults.set(sheetName, [])
            }
            this.testResults.get(sheetName)!.push(data)
        }
    }

    /**
     * テストケースからデータを抽出（IDは仮）
     */
    private extractTestData(test: TestCase, result: TestResult): TestData {
        // アノテーションをMapに変換
        const annotations = new Map<string, string>()
        for (const annotation of test.annotations) {
            if (annotation.description) {
                annotations.set(annotation.type, annotation.description)
            }
        }

        // テスト結果のアノテーションも追加
        for (const annotation of result.annotations || []) {
            if (annotation.description) {
                annotations.set(annotation.type, annotation.description)
            }
        }

        // 添付ファイルを変換
        const attachments: AttachmentData[] = result.attachments.map(att => ({
            name: att.name,
            contentType: att.contentType,
            path: att.path,
            body: att.body,
        }))

        // Describeタイトル取得
        const describe = this.getDescribeTitle(test)

        return {
            id: '', // 後で採番
            title: test.title,
            describe,
            file: test.location.file,
            status: result.status,
            timestamp: new Date().toISOString(),
            duration: result.duration,
            error: result.error?.message,
            annotations,
            attachments,
        }
    }

    /**
     * シート名を決定（TestDataから）
     */
    private getSheetNameFromData(data: TestData): string {
        switch (this.options.sheetGroupBy) {
            case 'describe':
                return data.describe || 'Tests'
            case 'file':
                return this.getFileBasename(data.file)
            case 'none':
                return 'Tests'
            default:
                return data.describe || 'Tests'
        }
    }

    /**
     * describeのタイトルを取得
     */
    private getDescribeTitle(test: TestCase): string {
        // test.parent を遡ってdescribeを探す
        let parent: Suite | undefined = test.parent
        while (parent) {
            if (parent.title && parent.title !== '') {
                return parent.title
            }
            parent = parent.parent
        }
        return ''
    }

    /**
     * ファイル名のベースネームを取得
     */
    private getFileBasename(filePath: string): string {
        const parts = filePath.split('/')
        const filename = parts[parts.length - 1]
        return filename.replace(/\.spec\.ts$/, '').replace(/\.test\.ts$/, '')
    }
}

export default ExcelReporter
