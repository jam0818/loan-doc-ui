/**
 * Playwright Excel Reporter - メタデータヘルパー
 * 
 * テストファイル冒頭でメタデータを一括定義するためのヘルパー
 */

import { test } from '@playwright/test'

/**
 * テストメタデータオプション
 */
export interface TestMetaOptions {
    /** 画面名（Excelの「画面名」カラムに表示） */
    screen?: string
    /** モデル名（Excelの「モデル」カラムに表示） */
    model?: string
    /** 実施者（Excelの「実施者」カラムに表示） */
    tester?: string
    /** その他のカスタムメタデータ */
    [key: string]: string | undefined
}

// ファイルレベルのメタデータを格納
let currentFileMeta: TestMetaOptions = {}

/**
 * テストファイル冒頭でメタデータを一括定義
 * 
 * このメタデータは同一ファイル内の全テストに適用される。
 * 個別テストで上書きする場合は `test.info().annotations.push()` を使用。
 * 
 * @example
 * ```typescript
 * import { test, expect } from '@playwright/test'
 * import { testMeta, captureStep } from '../lib'
 * 
 * // ファイル冒頭でメタデータ定義
 * testMeta({
 *     screen: 'ドキュメント管理',
 *     model: 'Document',
 *     tester: 'CI/CD',
 * })
 * 
 * test.describe('ドキュメント管理', () => {
 *     test('新規作成できる', async ({ page }) => {
 *         // テスト実装
 *     })
 * })
 * ```
 */
export function testMeta(options: TestMetaOptions): void {
    currentFileMeta = { ...options }

    // test.beforeEach でアノテーションに追加
    test.beforeEach(async ({ }, testInfo) => {
        for (const [key, value] of Object.entries(currentFileMeta)) {
            if (value !== undefined) {
                testInfo.annotations.push({ type: key, description: value })
            }
        }
    })
}

/**
 * 現在のファイルメタデータを取得（内部用）
 */
export function getCurrentMeta(): TestMetaOptions {
    return { ...currentFileMeta }
}

/**
 * メタデータをリセット（テスト用）
 */
export function resetMeta(): void {
    currentFileMeta = {}
}
