import { test, expect, type Page } from '@playwright/test'
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
    status: 'PASS' | 'FAIL' | 'SKIP'
    screenshotPath?: string
    error?: string
    timestamp: string
}

/**
 * テスト結果を保存するためのグローバル配列
 */
const testResults: TestResult[] = []

/**
 * スクリーンショットを保存するディレクトリ
 */
const screenshotDir = 'test-results/screenshots'

/**
 * スクリーンショットを撮影して保存
 */
async function captureEvidence(page: Page, testId: string, stepName: string): Promise<string> {
    const fileName = `${testId}_${stepName}_${Date.now()}.png`
    const filePath = path.join(screenshotDir, fileName)

    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true })
    }

    await page.screenshot({ path: filePath, fullPage: true })
    return filePath
}

/**
 * テスト結果を記録
 */
function recordResult(result: TestResult): void {
    testResults.push(result)
}

/**
 * 共通ヘルパー: モック付きログイン処理
 */
async function loginWithMock(page: Page, username = 'admin', password = 'password') {
    await setupApiMocks(page)
    await page.goto('/login')
    await page.fill('input[type="text"]', username)
    await page.fill('input[type="password"]', password)
    await page.click('button:has-text("ログイン")')
    await page.waitForURL('/')
}

/**
 * 認証機能テスト（エビデンス付き）
 */
test.describe('認証機能テスト', () => {
    test.beforeAll(async () => {
        // スクリーンショットディレクトリを作成
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true })
        }
    })

    test.beforeEach(async () => {
        resetMockData()
    })

    test.afterAll(async () => {
        // テスト結果をExcelに出力
        await generateExcelReport()
    })

    // 1.1 ログインページ表示
    test('1.1 ログインページが正しく表示される', async ({ page }) => {
        const testId = '1.1'
        const category = '未認証状態 - ログインページ'
        const description = 'ログインページにアクセスし、タイトル・入力欄・ボタンが表示されることを確認'

        try {
            await page.goto('/login')

            // エビデンス撮影
            const screenshot = await captureEvidence(page, testId, 'login_page')

            await expect(page.locator('text=文書生成アプリケーション')).toBeVisible()
            await expect(page.locator('input').first()).toBeVisible()
            await expect(page.locator('input[type="password"]')).toBeVisible()
            await expect(page.locator('button:has-text("ログイン")')).toBeVisible()

            recordResult({
                id: testId,
                category,
                name: 'ログインページ表示',
                description,
                status: 'PASS',
                screenshotPath: screenshot,
                timestamp: new Date().toISOString(),
            })
        } catch (error) {
            recordResult({
                id: testId,
                category,
                name: 'ログインページ表示',
                description,
                status: 'FAIL',
                error: String(error),
                timestamp: new Date().toISOString(),
            })
            throw error
        }
    })

    // 1.2 未認証リダイレクト
    test('1.2 未認証時にメインページにアクセスするとログインページにリダイレクト', async ({ page }) => {
        const testId = '1.2'
        const category = '未認証状態 - ログインページ'
        const description = 'メインページにアクセスし、ログインページにリダイレクトされることを確認'

        try {
            await page.goto('/')

            // エビデンス撮影
            const screenshot = await captureEvidence(page, testId, 'redirect')

            await expect(page).toHaveURL(/.*login/)

            recordResult({
                id: testId,
                category,
                name: '未認証リダイレクト',
                description,
                status: 'PASS',
                screenshotPath: screenshot,
                timestamp: new Date().toISOString(),
            })
        } catch (error) {
            recordResult({
                id: testId,
                category,
                name: '未認証リダイレクト',
                description,
                status: 'FAIL',
                error: String(error),
                timestamp: new Date().toISOString(),
            })
            throw error
        }
    })

    // 1.3 ログイン成功
    test('1.3 有効な認証情報でログイン成功', async ({ page }) => {
        const testId = '1.3'
        const category = '未認証状態 - フォーム入力'
        const description = '有効なユーザー名・パスワードでログインし、メイン画面が表示されることを確認'

        try {
            await setupApiMocks(page)
            await page.goto('/login')

            // ログイン前のエビデンス
            await captureEvidence(page, testId, 'before_login')

            await page.fill('input[type="text"]', 'admin')
            await page.fill('input[type="password"]', 'password')
            await page.click('button:has-text("ログイン")')
            await page.waitForURL('/')

            // ログイン後のエビデンス
            const screenshot = await captureEvidence(page, testId, 'after_login')

            await expect(page.locator('text=ドキュメント')).toBeVisible()
            await expect(page.locator('text=プロンプト')).toBeVisible()

            recordResult({
                id: testId,
                category,
                name: 'ログイン成功',
                description,
                status: 'PASS',
                screenshotPath: screenshot,
                timestamp: new Date().toISOString(),
            })
        } catch (error) {
            recordResult({
                id: testId,
                category,
                name: 'ログイン成功',
                description,
                status: 'FAIL',
                error: String(error),
                timestamp: new Date().toISOString(),
            })
            throw error
        }
    })

    // 1.4 ログイン失敗
    test('1.4 無効な認証情報でエラーメッセージが表示される', async ({ page }) => {
        const testId = '1.4'
        const category = '未認証状態 - フォーム入力'
        const description = '無効なユーザー名・パスワードでログインを試み、エラーメッセージが表示されることを確認'

        try {
            await setupApiMocks(page)
            await page.goto('/login')
            await page.fill('input[type="text"]', 'invalid_user')
            await page.fill('input[type="password"]', 'wrong_password')
            await page.click('button:has-text("ログイン")')

            // エビデンス撮影（エラー表示後）
            await page.waitForTimeout(1000)
            const screenshot = await captureEvidence(page, testId, 'error_message')

            await expect(page.locator('.v-alert')).toBeVisible({ timeout: 5000 })

            recordResult({
                id: testId,
                category,
                name: 'ログイン失敗エラー',
                description,
                status: 'PASS',
                screenshotPath: screenshot,
                timestamp: new Date().toISOString(),
            })
        } catch (error) {
            // エラーメッセージが表示されない場合もエビデンスを残す
            recordResult({
                id: testId,
                category,
                name: 'ログイン失敗エラー',
                description,
                status: 'FAIL',
                error: String(error),
                timestamp: new Date().toISOString(),
            })
            throw error
        }
    })

    // 1.5 空フィールド無効
    test('1.5 空のフィールドではログインボタンが無効', async ({ page }) => {
        const testId = '1.5'
        const category = '未認証状態 - フォーム入力'
        const description = '入力フィールドが空の場合、ログインボタンが無効になることを確認'

        try {
            await page.goto('/login')

            // 空の状態のエビデンス
            const screenshot = await captureEvidence(page, testId, 'empty_fields')

            const loginButton = page.locator('button:has-text("ログイン")')
            await expect(loginButton).toBeDisabled()

            recordResult({
                id: testId,
                category,
                name: '空フィールド無効',
                description,
                status: 'PASS',
                screenshotPath: screenshot,
                timestamp: new Date().toISOString(),
            })
        } catch (error) {
            recordResult({
                id: testId,
                category,
                name: '空フィールド無効',
                description,
                status: 'FAIL',
                error: String(error),
                timestamp: new Date().toISOString(),
            })
            throw error
        }
    })
})

/**
 * Excel レポートを生成
 */
async function generateExcelReport(): Promise<void> {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Playwright E2E Test'
    workbook.created = new Date()

    // カテゴリごとにグループ化
    const categories = [...new Set(testResults.map(r => r.category))]

    for (const category of categories) {
        const categoryResults = testResults.filter(r => r.category === category)
        const sheetName = category.substring(0, 31) // Excelのシート名は31文字まで

        const worksheet = workbook.addWorksheet(sheetName)

        // ヘッダー設定
        worksheet.columns = [
            { header: 'テストID', key: 'id', width: 10 },
            { header: 'テスト名', key: 'name', width: 25 },
            { header: '説明', key: 'description', width: 50 },
            { header: '結果', key: 'status', width: 10 },
            { header: '実行日時', key: 'timestamp', width: 25 },
            { header: 'エビデンス', key: 'evidence', width: 50 },
            { header: 'エラー', key: 'error', width: 50 },
        ]

        // ヘッダースタイル
        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        }
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

        // データ追加
        for (const result of categoryResults) {
            const row = worksheet.addRow({
                id: result.id,
                name: result.name,
                description: result.description,
                status: result.status,
                timestamp: result.timestamp,
                evidence: result.screenshotPath || '',
                error: result.error || '',
            })

            // 結果に応じて色を設定
            const statusCell = row.getCell('status')
            if (result.status === 'PASS') {
                statusCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF90EE90' },
                }
            } else if (result.status === 'FAIL') {
                statusCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF6B6B' },
                }
            }

            // スクリーンショットを埋め込み
            if (result.screenshotPath && fs.existsSync(result.screenshotPath)) {
                try {
                    const imageId = workbook.addImage({
                        filename: result.screenshotPath,
                        extension: 'png',
                    })
                    // 画像は別シートに配置することも可能
                    // ここではパスを記載
                } catch {
                    // 画像埋め込み失敗時はパスのみ表示
                }
            }
        }

        // 罫線設定
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                }
            })
        })
    }

    // サマリーシートを追加
    const summarySheet = workbook.addWorksheet('サマリー')
    summarySheet.columns = [
        { header: 'カテゴリ', key: 'category', width: 30 },
        { header: '合計', key: 'total', width: 10 },
        { header: 'PASS', key: 'pass', width: 10 },
        { header: 'FAIL', key: 'fail', width: 10 },
        { header: '成功率', key: 'rate', width: 15 },
    ]

    summarySheet.getRow(1).font = { bold: true }
    summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
    }
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    for (const category of categories) {
        const categoryResults = testResults.filter(r => r.category === category)
        const total = categoryResults.length
        const pass = categoryResults.filter(r => r.status === 'PASS').length
        const fail = categoryResults.filter(r => r.status === 'FAIL').length
        const rate = total > 0 ? Math.round((pass / total) * 100) : 0

        summarySheet.addRow({
            category,
            total,
            pass,
            fail,
            rate: `${rate}%`,
        })
    }

    // 全体合計
    const totalAll = testResults.length
    const passAll = testResults.filter(r => r.status === 'PASS').length
    const failAll = testResults.filter(r => r.status === 'FAIL').length
    const rateAll = totalAll > 0 ? Math.round((passAll / totalAll) * 100) : 0

    const totalRow = summarySheet.addRow({
        category: '合計',
        total: totalAll,
        pass: passAll,
        fail: failAll,
        rate: `${rateAll}%`,
    })
    totalRow.font = { bold: true }

    // 罫線設定
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
    const reportDir = 'test-results'
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true })
    }

    const reportPath = path.join(reportDir, `test-report_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`)
    await workbook.xlsx.writeFile(reportPath)

    console.log(`\n📊 テストレポートを生成しました: ${reportPath}`)
    console.log(`📸 スクリーンショット: ${screenshotDir}/`)
}
