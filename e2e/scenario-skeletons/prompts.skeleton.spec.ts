/**
 * プロンプト管理シナリオ スケルトン (22テスト)
 * 
 * チェックリスト準拠: docs/test-scenarios-checklist.md
 */
import { test, expect } from '@playwright/test'
import { testMeta, createDocumentViaUI, createPromptViaUI, captureStep, loginAndSetup } from '../lib'

// ファイルレベルのメタデータ
testMeta({
    screen: 'プロンプト管理',
    model: 'Prompt',
    tester: 'Automation',
})

test.describe('プロンプト管理シナリオ', () => {
    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    // ===== 作成シナリオ =====

    test('PROMPT-01: 作成成功（全体タイプ）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-01' },
            { type: 'perspective', description: '正常系: 全体作成' },
            { type: 'expected', description: '全フィールド共通タイプでプロンプトを作成できること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        await captureStep(page, '全体プロンプト作成', async () => {
            // === CODEGEN: 名前 + 全フィールド共通 → 作成 ===
        })
    })

    test('PROMPT-02: 作成成功（個別タイプ）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-02' },
            { type: 'perspective', description: '正常系: 個別作成' },
            { type: 'expected', description: '個別フィールド用タイプでプロンプトを作成できること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        await captureStep(page, '個別プロンプト作成', async () => {
            // === CODEGEN: 名前 + 個別フィールド用 → 作成 ===
        })
    })

    test('PROMPT-03: 作成キャンセル', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-03' },
            { type: 'perspective', description: 'キャンセル操作' },
            { type: 'expected', description: 'キャンセルでプロンプトが作成されないこと' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        await captureStep(page, '作成キャンセル', async () => {
            // === CODEGEN: ダイアログ開く → キャンセル ===
        })
    })

    test('PROMPT-04: 作成バリデーション（名前空）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-04' },
            { type: 'perspective', description: '入力バリデーション' },
            { type: 'expected', description: '名前空の場合作成できないこと' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        await captureStep(page, '名前空で作成試行', async () => {
            // === CODEGEN: 名前空で作成 ===
        })
    })

    test('PROMPT-05: 作成ボタン無効', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-05' },
            { type: 'perspective', description: 'ボタン状態' },
            { type: 'expected', description: 'ドキュメント未選択時は作成ボタンが無効であること' },
        )

        // ドキュメント未選択時
        await captureStep(page, '作成ボタン確認', async () => {
            // === CODEGEN ===
        })
    })

    // ===== 編集シナリオ =====

    test('PROMPT-06: 編集成功（名前変更）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-06' },
            { type: 'perspective', description: '正常系: 名前編集' },
            { type: 'expected', description: 'プロンプト名を変更できること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '名前変更操作', async () => {
            // === CODEGEN: 名前変更 → 保存 ===
        })
    })

    test('PROMPT-07: 編集成功（タイプ変更警告）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-07' },
            { type: 'perspective', description: '警告表示' },
            { type: 'expected', description: 'タイプ変更時に警告が表示されること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, 'タイプ変更操作', async () => {
            // === CODEGEN: タイプを変更 ===
        })
    })

    test('PROMPT-08: 編集キャンセル', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-08' },
            { type: 'perspective', description: 'キャンセル操作' },
            { type: 'expected', description: 'キャンセルで変更が反映されないこと' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '編集キャンセル', async () => {
            // === CODEGEN: 変更 → キャンセル ===
        })
    })

    test('PROMPT-09: 編集バリデーション（名前空）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-09' },
            { type: 'perspective', description: '入力バリデーション' },
            { type: 'expected', description: '名前空で保存できないこと' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '名前空で保存試行', async () => {
            // === CODEGEN: 名前空で保存 ===
        })
    })

    test('PROMPT-10: 編集ボタン無効', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-10' },
            { type: 'perspective', description: 'ボタン状態' },
            { type: 'expected', description: 'プロンプト未選択時は編集ボタンが無効であること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        // プロンプト未選択時
        await captureStep(page, '編集ボタン確認', async () => {
            // === CODEGEN ===
        })
    })

    // ===== 削除シナリオ =====

    test('PROMPT-11: 削除成功', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-11' },
            { type: 'perspective', description: '正常系: 削除' },
            { type: 'expected', description: 'プロンプトを削除できること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '削除実行', async () => {
            // === CODEGEN: 削除 → 確認ダイアログで実行 ===
        })
    })

    test('PROMPT-12: 削除キャンセル', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-12' },
            { type: 'perspective', description: 'キャンセル操作' },
            { type: 'expected', description: 'キャンセルでプロンプトが残ること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '削除キャンセル', async () => {
            // === CODEGEN: 削除 → キャンセル ===
        })
    })

    test('PROMPT-13: 削除ボタン無効', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-13' },
            { type: 'perspective', description: 'ボタン状態' },
            { type: 'expected', description: 'プロンプト未選択時は削除ボタンが無効であること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)

        // プロンプト未選択時
        await captureStep(page, '削除ボタン確認', async () => {
            // === CODEGEN ===
        })
    })

    // ===== プロンプトテキスト編集 =====

    test('PROMPT-14: 全体プロンプト入力', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-14' },
            { type: 'perspective', description: 'テキスト入力' },
            { type: 'expected', description: 'テキストエリアにプロンプトを入力できること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '全体テキスト入力', async () => {
            // === CODEGEN: テキストエリアに入力 ===
        })
    })

    test('PROMPT-15: 個別プロンプト入力', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-15' },
            { type: 'perspective', description: 'テキスト入力' },
            { type: 'expected', description: '各フィールドに個別プロンプトを入力できること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')

        await captureStep(page, '個別テキスト入力', async () => {
            // === CODEGEN: フィールドごとにテキスト入力 ===
        })
    })

    test('PROMPT-16: プロンプト切替（選択）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-16' },
            { type: 'perspective', description: '切替操作' },
            { type: 'expected', description: 'ドロップダウンでプロンプトを切り替えられること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `PromptA_${Date.now()}`)
        await createPromptViaUI(page, `PromptB_${Date.now()}`)

        await captureStep(page, 'プロンプト切替', async () => {
            // === CODEGEN: ドロップダウンで別プロンプト選択 ===
        })
    })

    // ===== モード切替 =====

    test('PROMPT-17: 生成用モード表示', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-17' },
            { type: 'perspective', description: '初期表示' },
            { type: 'expected', description: '初期状態で生成用モードが表示されること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        // 初期状態で確認
        await captureStep(page, 'モード確認', async () => {
            // === CODEGEN ===
        })
    })

    test('PROMPT-18: 修正用モード切替', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-18' },
            { type: 'perspective', description: 'モード切替' },
            { type: 'expected', description: '修正用モードに切り替えられること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, '修正モード切替', async () => {
            // === CODEGEN: 「修正用」ボタンクリック ===
        })
    })

    test('PROMPT-19: モード切替往復', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-19' },
            { type: 'perspective', description: 'モード切替' },
            { type: 'expected', description: 'モードを往復して切り替えられること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`)
        await createPromptViaUI(page, `Prompt_${Date.now()}`)

        await captureStep(page, 'モード往復操作', async () => {
            // === CODEGEN: 生成用 ↔ 修正用 ===
        })
    })

    // ===== 個別フィールドプロンプト =====

    test('PROMPT-20: エキスパンションパネル展開', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-20' },
            { type: 'perspective', description: 'UI操作' },
            { type: 'expected', description: 'フィールドのパネルを展開できること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')

        await captureStep(page, 'パネル展開', async () => {
            // === CODEGEN: フィールド名クリック ===
        })
    })

    test('PROMPT-21: 設定済チップ', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-21' },
            { type: 'perspective', description: 'UI表示' },
            { type: 'expected', description: 'プロンプト入力後に設定済チップが表示されること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')

        await captureStep(page, 'チップ確認', async () => {
            // === CODEGEN: フィールドにプロンプト入力 ===
        })
    })

    test('PROMPT-22: 再生成ボタン（修正用モード）', async ({ page }) => {
        test.info().annotations.push(
            { type: 'testId', description: 'PROMPT-22' },
            { type: 'perspective', description: 'UI表示' },
            { type: 'expected', description: '修正用モードで再生成ボタンが表示されること' },
        )

        await createDocumentViaUI(page, `Doc_${Date.now()}`, [{ name: 'フィールド1', content: 'テスト' }])
        await createPromptViaUI(page, `Prompt_${Date.now()}`, 'each')

        await captureStep(page, '再生成ボタン確認', async () => {
            // === CODEGEN: 修正用モードでフィールド展開 ===
        })
    })
})
