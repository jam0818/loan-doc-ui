# E2Eテストライブラリ ガイド

## 概要

`e2e/lib/` ディレクトリには、E2Eテストの効率化と保守性向上のためのユーティリティが含まれています。

```
e2e/lib/
├── index.ts          # 統一エクスポート
├── test-helpers.ts   # UI操作ヘルパー関数
└── test-reporter.ts  # Excelレポート生成
```

---

## クイックスタート

```typescript
import { 
    loginAndSetup,
    createDocumentViaUI,
    createPromptViaUI,
    createReporter 
} from '../lib'

test.describe('マイテスト', () => {
    const reporter = createReporter()

    test.beforeEach(async ({ page }) => {
        await loginAndSetup(page)
    })

    test.afterAll(async () => {
        await reporter.generateReport()
    })

    test('ドキュメント作成', async ({ page }) => {
        await createDocumentViaUI(page, 'テストDoc')
        // 検証...
    })
})
```

---

## API リファレンス

### 認証ヘルパー

| 関数 | 説明 | 引数 |
|------|------|------|
| `loginAndSetup(page, evidence?)` | ログイン（既にログイン済みならスキップ） | `evidence`: スクショパス |
| `loginViaUI(page, evidence?)` | 強制ログイン | 同上 |
| `logoutViaUI(page, evidence?)` | ログアウト | 同上 |

**使用例:**
```typescript
// 標準的なセットアップ
await loginAndSetup(page)

// エビデンス付き
await loginAndSetup(page, {
    beforePath: 'evidence/login-before.png',
    afterPath: 'evidence/login-after.png'
})
```

---

### ドキュメントヘルパー

| 関数 | 説明 |
|------|------|
| `createDocumentViaUI(page, title, fields?, evidence?)` | ドキュメント作成 |
| `editDocumentViaUI(page, title, evidence?)` | タイトル編集 |
| `selectDocumentViaUI(page, titlePart)` | ドキュメント選択 |
| `deleteDocumentViaUI(page, evidence?)` | 削除 |

**使用例:**
```typescript
// シンプルな作成
await createDocumentViaUI(page, 'マイドキュメント')

// フィールド付き作成
await createDocumentViaUI(page, '契約書', [
    { name: '契約者名', content: '山田太郎' },
    { name: '契約日', content: '2024-01-01' },
])

// 編集
await editDocumentViaUI(page, '新しいタイトル')
```

---

### プロンプトヘルパー

| 関数 | 説明 |
|------|------|
| `createPromptViaUI(page, title, type?, evidence?)` | プロンプト作成 |
| `selectPromptViaUI(page, title)` | プロンプト選択（堅牢版） |
| `editPromptViaUI(page, title, evidence?)` | 名前編集 |
| `deletePromptViaUI(page, evidence?)` | 削除 |

**使用例:**
```typescript
// 全フィールド共通タイプ（デフォルト）
await createPromptViaUI(page, '標準プロンプト')

// 個別フィールドタイプ
await createPromptViaUI(page, '詳細プロンプト', 'each')

// プロンプト選択（環境差異を吸収）
await selectPromptViaUI(page, '既存プロンプト')
```

---

### 生成ヘルパー

| 関数 | 説明 |
|------|------|
| `runGenerationViaUI(page, evidence?)` | 一括生成実行 |
| `updateGenerationResultViaUI(page, content)` | 生成結果編集 |

**使用例:**
```typescript
await runGenerationViaUI(page, {
    beforePath: 'evidence/gen-before.png',
    afterPath: 'evidence/gen-after.png'
})
```

---

### テストレポーター

```typescript
import { createReporter, TestReporter } from '../lib'

// レポーターインスタンス作成
const reporter = createReporter()

// スクリーンショットパス生成
const beforePath = reporter.getScreenshotPath('TEST-01', 'before')
const afterPath = reporter.getScreenshotPath('TEST-01', 'after')

// 結果追加（手動）
reporter.addResult({
    id: 'TEST-01',
    category: 'MyCategory',
    name: 'テスト名',
    description: '説明',
    status: 'PASS',
    beforeScreenshotPath: beforePath,
    afterScreenshotPath: afterPath,
})

// Excelレポート生成
await reporter.generateReport()
```

---

## ベストプラクティス

### 1. ヘルパー関数を優先

❌ **悪い例（直接操作）:**
```typescript
await page.locator('.document-column .mdi-plus').click()
await page.locator('input[label="文書タイトル"]').fill('タイトル')
await page.locator('button:has-text("作成")').click()
```

✅ **良い例（ヘルパー使用）:**
```typescript
await createDocumentViaUI(page, 'タイトル')
```

### 2. エビデンスオプションの活用

```typescript
const beforePath = reporter.getScreenshotPath('DOC-01', 'before')
const afterPath = reporter.getScreenshotPath('DOC-01', 'after')

await createDocumentViaUI(page, 'テスト', [], {
    beforePath,
    afterPath
})
```

### 3. 一意の識別子を使用

```typescript
const uniqueTitle = `テストDoc_${Date.now()}`
await createDocumentViaUI(page, uniqueTitle)
```

### 4. テストの独立性

```typescript
test.beforeEach(async ({ page }) => {
    // 各テストはログインから開始
    await loginAndSetup(page)
})

test.afterEach(async ({ page }) => {
    // 必要に応じてクリーンアップ
    await logoutViaUI(page)
})
```

### 5. 待機処理の適切な使用

ヘルパー関数には適切な待機処理が組み込まれています。
追加の待機が必要な場合のみ `expect` を使用:

```typescript
await createDocumentViaUI(page, 'マイDoc')
// 追加の検証が必要な場合
await expect(page.getByText('マイDoc')).toBeVisible()
```

---

## ディレクトリ構造の推奨

```
e2e/
├── lib/                    # 共通ライブラリ
│   ├── index.ts           # エクスポート
│   ├── test-helpers.ts    # UI操作ヘルパー
│   └── test-reporter.ts   # レポート生成
├── scenarios/              # テストファイル
│   ├── auth.spec.ts
│   ├── documents.spec.ts
│   ├── prompts.spec.ts
│   └── generation.spec.ts
├── mocks/                  # モックサーバー
│   └── api-mock.ts
└── evidence/               # スクリーンショット保存先
```

---

## トラブルシューティング

### ボタンがdisabledのまま

`selectPromptViaUI` 関数は内部で複数の戦略（クリック、キーボード入力、force click）を試みます。
それでもdisabledの場合は、前提となる選択操作を確認してください。

### タイムアウトエラー

1. サーバーが起動しているか確認
2. `CI=1` 環境変数を設定してヘッドレスモードで実行
3. タイムアウト値を調整: `test.setTimeout(60000)`

### レポートが生成されない

`test.afterAll` で `await reporter.generateReport()` を呼び出しているか確認。
