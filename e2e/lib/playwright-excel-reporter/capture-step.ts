/**
 * Playwright Excel Reporter - captureStep ヘルパー
 * 
 * テストステップの前後でスクリーンショットを自動撮影し、
 * Playwright標準のアタッチメントとして保存する
 */

import { test, type Page } from '@playwright/test'

/**
 * captureStep オプション
 */
export interface CaptureStepOptions {
    /** フルページスクリーンショット（デフォルト: true） */
    fullPage?: boolean
    /** 操作前ラベル（デフォルト: '操作前'） */
    beforeLabel?: string
    /** 操作後ラベル（デフォルト: '操作後'） */
    afterLabel?: string
    /** 操作前スクショをスキップ */
    skipBefore?: boolean
    /** 操作後スクショをスキップ */
    skipAfter?: boolean
    /** 操作後の安定化待機時間（ms、デフォルト: 300） */
    waitAfter?: number
}

/**
 * テストステップを実行し、前後のスクリーンショットを自動撮影
 * 
 * Playwright の `test.step()` と統合し、Trace Viewer や HTML Report で
 * 階層表示される。スクリーンショットは `test.info().attach()` で追加され、
 * Playwright標準のレポーターからも参照可能。
 * 
 * @example
 * ```typescript
 * await captureStep(page, 'ログインフォーム入力', async () => {
 *     await page.fill('#username', 'user1')
 *     await page.fill('#password', 'pass1')
 *     await page.click('button[type="submit"]')
 * })
 * ```
 * 
 * @param page Playwright Page オブジェクト
 * @param stepName ステップ名（スクショ名にも使用）
 * @param action 実行するアクション
 * @param options オプション
 * @returns アクションの戻り値
 */
export async function captureStep<T>(
    page: Page,
    stepName: string,
    action: () => Promise<T>,
    options: CaptureStepOptions = {}
): Promise<T> {
    const {
        fullPage = true,
        beforeLabel = '操作前',
        afterLabel = '操作後',
        skipBefore = false,
        skipAfter = false,
        waitAfter = 300,
    } = options

    return test.step(stepName, async () => {
        // 1. 操作前スクリーンショット
        if (!skipBefore) {
            try {
                const beforeBuffer = await page.screenshot({ fullPage })
                await test.info().attach(`${stepName}_${beforeLabel}`, {
                    body: beforeBuffer,
                    contentType: 'image/png',
                })
            } catch (e) {
                console.warn(`captureStep: 操作前スクショ失敗 - ${e}`)
            }
        }

        // 2. アクション実行
        const result = await action()

        // 3. 安定化待機
        if (waitAfter > 0) {
            await page.waitForTimeout(waitAfter)
        }

        // 4. 操作後スクリーンショット
        if (!skipAfter) {
            try {
                const afterBuffer = await page.screenshot({ fullPage })
                await test.info().attach(`${stepName}_${afterLabel}`, {
                    body: afterBuffer,
                    contentType: 'image/png',
                })
            } catch (e) {
                console.warn(`captureStep: 操作後スクショ失敗 - ${e}`)
            }
        }

        return result
    })
}

/**
 * 単発のスクリーンショットを撮影してアタッチ
 * 
 * @example
 * ```typescript
 * await captureScreenshot(page, '初期状態')
 * ```
 * 
 * @param page Playwright Page オブジェクト
 * @param name スクリーンショット名
 * @param options オプション
 */
export async function captureScreenshot(
    page: Page,
    name: string,
    options: { fullPage?: boolean } = {}
): Promise<void> {
    const { fullPage = true } = options

    try {
        const buffer = await page.screenshot({ fullPage })
        await test.info().attach(name, {
            body: buffer,
            contentType: 'image/png',
        })
    } catch (e) {
        console.warn(`captureScreenshot: スクショ失敗 - ${e}`)
    }
}
