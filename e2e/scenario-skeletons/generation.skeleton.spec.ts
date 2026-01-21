/**
 * 生成シナリオ スケルトン (11テスト)
 * 
 * チェックリスト準拠: docs/test-scenarios-checklist.md
 */
import { test, expect } from '@playwright/test'
import { testMeta, createDocumentViaUI, createPromptViaUI, captureStep, loginAndSetup } from '../lib'

// ファイルレベルのメタデータ
testMeta({
    screen: '生成',
    model: 'Generate',
    tester: 'Automation',
})

test.describe('生成シナリオ', () => {
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    // ===== ボタン状態 =====

    test('GEN-01: 生成ボタン無効（ドキュメント未選択）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'GEN-01' },
            { type: 'perspective', description: 'ボタン状態' },
            { type: 'expected', description: 'ドキュメント未選択時は生成ボタンが無効であること' },
        )

        // ログイン直後
        await captureStep(page, '生成ボタン確認', async () => {
            // 検証: disabled
        })
    })

    test('GEN-02: 生成ボタン無効（プロンプト未選択）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'GEN-02' },
            { type: 'perspective', description: 'ボタン状態' },
            { type: 'expected', description: 'プロンプト未選択時は生成ボタンが無効であること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        await captureStep(page, '生成ボタン確認', async () => {
            // ドキュメントのみ選択
        })
    })

    test('GEN-03: 生成ボタン有効', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'GEN-03' },
            { type: 'perspective', description: 'ボタン状態' },
            { type: 'expected', description: '両方選択時は生成ボタンが有効であること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '生成ボタン確認', async () => {
            // 両方選択
        })
    })

    test('GEN-04: 生成ボタン無効（生成中）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'GEN-04' },
            { type: 'perspective', description: '状態遷移' },
            { type: 'expected', description: '生成実行中はボタンが無効でローディング表示されること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '生成実行中確認', async () => {
            // === CODEGEN: 生成実行中 ===
        })
    })

    // ===== 表示モード =====

    test('GEN-05: 生成前タブ表示', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'GEN-05' },
            { type: 'perspective', description: '初期表示' },
            { type: 'expected', description: '初期状態で生成前タブが選択されていること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        // 初期状態
        await captureStep(page, 'タブ状態確認', async () => {
            // === CODEGEN ===
        })
    })

    test('GEN-06: 生成後タブ切替', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'GEN-06' },
            { type: 'perspective', description: 'タブ操作' },
            { type: 'expected', description: '生成後タブに切り替えると編集可能になること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '生成後タブ切替', async () => {
            // === CODEGEN: 「生成後」タブクリック ===
        })
    })

    test('GEN-07: タブ切替往復', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'GEN-07' },
            { type: 'perspective', description: 'タブ操作' },
            { type: 'expected', description: 'タブを往復して切り替えられること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, 'タブ往復操作', async () => {
            // === CODEGEN: 生成前 ↔ 生成後 ===
        })
    })

    // ===== 生成実行 =====

    test('GEN-08: 生成実行成功', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'GEN-08' },
            { type: 'perspective', description: '正常系: 生成' },
            { type: 'expected', description: '一括生成を実行して結果が表示されること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '一括生成実行', async () => {
            // === CODEGEN: 一括生成ボタンクリック ===
        })
    })

    test('GEN-09: 生成中インジケーター', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'GEN-09' },
            { type: 'perspective', description: 'UIフィードバック' },
            { type: 'expected', description: '生成中にインジケーターが表示されること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, 'インジケーター確認', async () => {
            // === CODEGEN: 生成実行中の状態をキャプチャ ===
        })
    })

    test('GEN-10: 自動モード切替', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'GEN-10' },
            { type: 'perspective', description: '自動遷移' },
            { type: 'expected', description: '生成完了後に修正用モードに自動切替されること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '自動切替確認', async () => {
            // === CODEGEN: 生成完了まで待機 ===
        })
    })

    // ===== 生成結果編集 =====

    test('GEN-11: 生成結果編集', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'GEN-11' },
            { type: 'perspective', description: '正常系: 結果編集' },
            { type: 'expected', description: '生成結果を編集できること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '結果編集操作', async () => {
            // === CODEGEN: 生成後タブでテキスト編集 ===
        })
    })
})
