# Playwright Excel Reporter

Playwright Reporter API 準拠の Excel レポート出力ライブラリです。
テスト実行結果を自動収集し、画像埋め込みやカスタマイズ可能なカラム構成で Excel ファイル（.xlsx）を生成します。

## 特徴

- **Playwright 完全統合**: `playwright.config.ts` に追加するだけで動作
- **リッチな Excel 出力**: スクリーンショットのセル埋め込み、スタイル適用済み
- **階層構造サポート**: `describe` ブロックやファイル単位でのシート分割
- **メタデータ管理**: `testMeta()` で画面名やモデルなどの共通情報を一括定義
- **証跡保存**: `captureStep()` で操作前後のスクリーンショットを自動記録
- **日本的帳票対応**: 親カラム（マージヘッダー）や連番管理に対応

## セットアップ

### 1. レポーター登録

`playwright.config.ts` に設定を追加します。

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['html'], // HTMLレポートと併用可能
    ['./e2e/lib/playwright-excel-reporter', {
      outputPath: 'test-results/test-report.xlsx', // 出力パス
      embedImages: true,                           // 画像を埋め込むか
      sheetGroupBy: 'describe',                    // シート分割単位 ('describe' | 'file' | 'none')
    }]
  ],
});
```

## 基本的な使い方

### 1. メタデータの定義 (`testMeta`)

テストファイルの冒頭で、そのファイル内のテスト共通の情報を定義できます。これらは Excel のカラムにマッピングされます。

```typescript
import { test } from '@playwright/test';
import { testMeta } from './lib/playwright-excel-reporter';

// ファイルレベルのメタデータ
testMeta({
  screen: 'ログイン画面',
  model: 'Auth',
  tester: '自動テスト',
});

test.describe('認証機能', () => {
  // ...
});
```

### 2. ステップとスクショの記録 (`captureStep`)

`test.step()` の代わりに `captureStep()` を使うと、操作前後のスクリーンショットが自動的に撮影され、レポートに添付されます。

```typescript
import { captureStep } from './lib/playwright-excel-reporter';

test('ログインできる', async ({ page }) => {
  await captureStep(page, 'ログイン情報入力', async () => {
    await page.getByLabel('ユーザー名').fill('user1');
    await page.getByLabel('パスワード').fill('pass1');
  });

  await captureStep(page, 'ログインボタン押下', async () => {
    await page.getByRole('button', { name: 'ログイン' }).click();
  }, { waitAfter: 1000 }); // 操作後の待機時間なども指定可能
});
```

### 3. テストIDの固定 (`@testId`)

デフォルトでは全テスト終了後にファイル順で連番（1, 2, 3...）が振られますが、アノテーションでIDを固定することも可能です。

```typescript
test('ユーザー作成', async ({ page }) => {
  test.info().annotations.push({ type: 'testId', description: 'USER-001' });
  // ...
});
```

## カラム構成のカスタマイズ (Advanced)

デフォルトのカラム構成（`defaults.ts`）をオーバーライドして、独自のExcelフォーマットを作成できます。

```typescript
['./e2e/lib/playwright-excel-reporter', {
  outputPath: 'report.xlsx',
  columnGroups: [
    {
      title: '基本情報',
      columns: [
        { key: 'id', title: 'No', source: { type: 'auto', field: 'id' } },
        { key: 'feature', title: '機能', source: { type: 'meta', field: 'screen' } },
      ]
    },
    // ...
  ]
}]
```

## リトライ時の挙動

Playwright のリトライ機能（`retries: 2` 等）を使用した場合の実装：

- **集約**: 同一テストケースの複数回の実行結果は、Excel 上では **1行** に集約されます。
- **ステータス**: 最終回の実行結果がそのテストのステータスになります（例: FAIL -> PASS なら PASS）。
- **履歴**: 「備考」欄にリトライの履歴が自動追記されます（例: `リトライ実施: [1回目:failed, 2回目:passed]`）。

これにより、再実行でパスしたテストも「OK」として扱い、リトライがあった事実だけを備考に残すことができます。
