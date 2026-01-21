/**
 * Excel Reporter 動作確認テスト
 * 
 * 新しいPlaywright Excel Reporterの動作を確認するためのテスト
 * - PASS/FAILの記録
 * - 複数describeでのシート分割
 */
import { test, expect } from '@playwright/test'
import { testMeta, captureStep, loginAndSetup } from './lib'

// ============================================================
// describe 1: ドキュメント管理（シート1になる）
// ============================================================
testMeta({
    screen: 'ドキュメント管理',
    model: 'Document',
    tester: 'CI/CD',
})

test.describe('ドキュメント管理', () => {
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    test('PASSケース: メイン画面表示', async ({ page }) => {
        test.info().annotations.push(
            { type: 'perspective', description: '画面表示確認' },
            { type: 'expected', description: 'ドキュメント列が表示される' },
        )

        await captureStep(page, 'ドキュメント列確認', async () => {
            await expect(page.locator('.document-column')).toBeVisible()
        })
    })

    test('FAILケース: 存在しない要素（意図的失敗）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'perspective', description: '意図的失敗テスト' },
            { type: 'expected', description: 'このテストは失敗する' },
        )

        // タイムアウトを短くして速やかに失敗させる
        await expect(page.locator('.this-element-does-not-exist')).toBeVisible({ timeout: 1000 })
    })
})

// ============================================================
// describe 2: プロンプト管理（シート2になる）
// ============================================================
test.describe('プロンプト管理', () => {
    test.beforeEach(async ({ page }) => {
        // このdescribe用のメタデータを個別設定
        test.info().annotations.push(
            { type: 'screen', description: 'プロンプト管理' },
            { type: 'model', description: 'Prompt' },
            { type: 'tester', description: 'Manual' },
        )
        await loginAndSetup(page)
    })

    test('PASSケース: プロンプト列表示', async ({ page }) => {
        test.info().annotations.push(
            { type: 'perspective', description: 'プロンプト列確認' },
            { type: 'expected', description: 'プロンプト列が表示される' },
        )

        await captureStep(page, 'プロンプト列確認', async () => {
            await expect(page.locator('.prompt-column')).toBeVisible()
        })
    })

    test('PASSケース: 生成列表示', async ({ page }) => {
        test.info().annotations.push(
            { type: 'perspective', description: '生成列確認' },
            { type: 'expected', description: '生成列が表示される' },
        )

        await expect(page.locator('.generate-column')).toBeVisible()
    })
})

// ============================================================
// describe 3: 認証機能（シート3になる）
// ============================================================
test.describe('認証機能', () => {
    test('PASSケース: ログイン成功', async ({ page }) => {
        test.info().annotations.push(
            { type: 'screen', description: '認証機能' },
            { type: 'model', description: 'Auth' },
            { type: 'perspective', description: 'ログイン処理' },
            { type: 'expected', description: 'メイン画面に遷移' },
        )

        await loginAndSetup(page)
        await expect(page.locator('.document-column')).toBeVisible()
    })
})
