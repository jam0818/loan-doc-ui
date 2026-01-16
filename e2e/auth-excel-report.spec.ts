import { test, expect } from '@playwright/test'
import { setupApiMocks, resetMockData } from './mocks/api-mock'
import ExcelJS from 'exceljs'
import * as fs from 'fs'
import * as path from 'path'

/**
 * テスト結果を格納する型
 */
interface TestResult {
    id: string
    category: string
    name: string
    description: string
    status: 'PASS' | 'FAIL'
    screenshotPath?: string
    timestamp: string
}

/**
 * テスト結果とスクリーンショットディレクトリ
 */
const testResults: TestResult[] = []
const screenshotDir = 'test-results/screenshots'
const reportDir = 'test-results'

/**
 * ディレクトリ初期化
 */
function initDirs() {
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true })
    }
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true })
    }
}

/**
 * テスト結果を記録
 */
function recordResult(result: TestResult) {
    testResults.push(result)
    const emoji = result.status === 'PASS' ? '✅' : '❌'
    console.log(`${emoji} [${result.id}] ${result.name}: ${result.status}`)
}

/**
 * Excel出力（画像埋め込み対応）
 */
async function generateExcelReport() {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Playwright E2E Test'
    workbook.created = new Date()

    // カテゴリごとにグループ化
    const categories = [...new Set(testResults.map(r => r.category))]

    for (const category of categories) {
        const categoryResults = testResults.filter(r => r.category === category)
        const sheetName = category.substring(0, 31)

        const worksheet = workbook.addWorksheet(sheetName)
        worksheet.columns = [
            { header: 'テストID', key: 'id', width: 10 },
            { header: 'テスト名', key: 'name', width: 20 },
            { header: '説明', key: 'description', width: 35 },
            { header: '結果', key: 'status', width: 8 },
            { header: '実行日時', key: 'timestamp', width: 22 },
            { header: 'エビデンス画像', key: 'evidence', width: 60 },
        ]

        // ヘッダースタイル
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        }
        worksheet.getRow(1).height = 25

        // データ追加
        let rowIndex = 2
        for (const result of categoryResults) {
            const row = worksheet.getRow(rowIndex)
            row.getCell('id').value = result.id
            row.getCell('name').value = result.name
            row.getCell('description').value = result.description
            row.getCell('status').value = result.status
            row.getCell('timestamp').value = result.timestamp

            // 結果に応じて色を設定
            const statusCell = row.getCell('status')
            statusCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: result.status === 'PASS' ? 'FF90EE90' : 'FFFF6B6B' },
            }

            // 画像埋め込み
            if (result.screenshotPath && fs.existsSync(result.screenshotPath)) {
                try {
                    const imageId = workbook.addImage({
                        filename: result.screenshotPath,
                        extension: 'png',
                    })
                    row.height = 150
                    worksheet.addImage(imageId, {
                        tl: { col: 5, row: rowIndex - 1 },
                        ext: { width: 400, height: 180 },
                    })
                } catch {
                    row.getCell('evidence').value = result.screenshotPath
                }
            }
            rowIndex++
        }

        // 罫線設定
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                }
                cell.alignment = { vertical: 'middle', wrapText: true }
            })
        })
    }

    // サマリーシート
    const summarySheet = workbook.addWorksheet('サマリー')
    summarySheet.columns = [
        { header: 'カテゴリ', key: 'category', width: 30 },
        { header: '合計', key: 'total', width: 10 },
        { header: 'PASS', key: 'pass', width: 10 },
        { header: 'FAIL', key: 'fail', width: 10 },
        { header: '成功率', key: 'rate', width: 15 },
    ]

    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
    }

    for (const category of categories) {
        const catResults = testResults.filter(r => r.category === category)
        const pass = catResults.filter(r => r.status === 'PASS').length
        summarySheet.addRow({
            category,
            total: catResults.length,
            pass,
            fail: catResults.length - pass,
            rate: `${Math.round((pass / catResults.length) * 100)}%`,
        })
    }

    const passAll = testResults.filter(r => r.status === 'PASS').length
    const totalRow = summarySheet.addRow({
        category: '合計',
        total: testResults.length,
        pass: passAll,
        fail: testResults.length - passAll,
        rate: `${Math.round((passAll / testResults.length) * 100)}%`,
    })
    totalRow.font = { bold: true }

    // 罫線
    summarySheet.eachRow((row) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            }
        })
    })

    // ファイル保存
    const reportPath = path.join(reportDir, `test-report_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`)
    await workbook.xlsx.writeFile(reportPath)
    console.log(`\n📊 Excelレポート: ${reportPath}`)
    return reportPath
}

/**
 * 認証機能テスト（Playwright形式 + Excel出力）
 */
test.describe('認証機能テスト（Excel出力付き）', () => {
    test.beforeAll(() => {
        initDirs()
        resetMockData()
    })

    test.afterAll(async () => {
        await generateExcelReport()
        const pass = testResults.filter(r => r.status === 'PASS').length
        console.log(`\n🎉 テスト完了: ${pass} PASS, ${testResults.length - pass} FAIL`)
    })

    test('1.1 ログインページが正しく表示される', async ({ page }) => {
        const testId = '1.1'
        const category = '認証機能'
        const name = 'ログインページ表示'
        const description = 'ログインページが正しく表示される'
        let status: 'PASS' | 'FAIL' = 'FAIL'
        let screenshotPath: string | undefined

        try {
            await page.goto('/login')
            await expect(page.locator('text=文書生成アプリケーション')).toBeVisible({ timeout: 10000 })
            screenshotPath = path.join(screenshotDir, `${testId}_login_page.png`)
            await page.screenshot({ path: screenshotPath, fullPage: true })
            status = 'PASS'
        } catch {
            // 失敗
        }

        recordResult({ id: testId, category, name, description, status, screenshotPath, timestamp: new Date().toISOString() })
        expect(status).toBe('PASS')
    })

    test('1.2 空フィールドではログインボタンが無効', async ({ page }) => {
        const testId = '1.2'
        const category = '認証機能'
        const name = '空フィールド無効'
        const description = '入力欄が空の場合ログインボタンが無効'
        let status: 'PASS' | 'FAIL' = 'FAIL'
        let screenshotPath: string | undefined

        try {
            await page.goto('/login')
            const button = page.locator('button:has-text("ログイン")')
            await expect(button).toBeDisabled()
            screenshotPath = path.join(screenshotDir, `${testId}_empty_fields.png`)
            await page.screenshot({ path: screenshotPath, fullPage: true })
            status = 'PASS'
        } catch {
            // 失敗
        }

        recordResult({ id: testId, category, name, description, status, screenshotPath, timestamp: new Date().toISOString() })
        expect(status).toBe('PASS')
    })

    test('1.3 ログイン情報入力でボタンが有効になる', async ({ page }) => {
        const testId = '1.3'
        const category = '認証機能'
        const name = 'ログイン情報入力'
        const description = 'ユーザー名とパスワードを入力するとボタンが有効になる'
        let status: 'PASS' | 'FAIL' = 'FAIL'
        let screenshotPath: string | undefined

        try {
            await page.goto('/login')
            await page.fill('input[type="text"]', 'admin')
            await page.fill('input[type="password"]', 'password')
            const button = page.locator('button:has-text("ログイン")')
            await expect(button).toBeEnabled()
            screenshotPath = path.join(screenshotDir, `${testId}_filled_fields.png`)
            await page.screenshot({ path: screenshotPath, fullPage: true })
            status = 'PASS'
        } catch {
            // 失敗
        }

        recordResult({ id: testId, category, name, description, status, screenshotPath, timestamp: new Date().toISOString() })
        expect(status).toBe('PASS')
    })

    test('1.4 ログインボタンをクリックできる', async ({ page }) => {
        const testId = '1.4'
        const category = '認証機能'
        const name = 'ログインボタンクリック'
        const description = 'ログインボタンをクリックできる'
        let status: 'PASS' | 'FAIL' = 'FAIL'
        let screenshotPath: string | undefined

        try {
            await page.goto('/login')
            await page.fill('input[type="text"]', 'admin')
            await page.fill('input[type="password"]', 'password')
            await page.click('button:has-text("ログイン")')
            await page.waitForTimeout(2000)
            screenshotPath = path.join(screenshotDir, `${testId}_after_click.png`)
            await page.screenshot({ path: screenshotPath, fullPage: true })
            status = 'PASS'
        } catch {
            // 失敗
        }

        recordResult({ id: testId, category, name, description, status, screenshotPath, timestamp: new Date().toISOString() })
        expect(status).toBe('PASS')
    })
})
