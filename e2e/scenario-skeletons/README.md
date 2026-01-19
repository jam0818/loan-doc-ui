# シナリオスケルトン

このディレクトリには、チェックリスト（`docs/test-scenarios-checklist.md`）に基づいた全63シナリオのスケルトンファイルが含まれています。

## ファイル一覧

| ファイル | テスト数 | カテゴリ |
|---------|----------|---------|
| `auth.skeleton.spec.ts` | 7 | 認証 |
| `documents.skeleton.spec.ts` | 19 | ドキュメント管理 |
| `prompts.skeleton.spec.ts` | 22 | プロンプト管理 |
| `generation.skeleton.spec.ts` | 11 | 生成 |
| `integration.skeleton.spec.ts` | 4 | 統合 |
| **合計** | **63** | |

## 使い方

### 1. スケルトンをコピー

```bash
cp e2e/scenario-skeletons/auth.skeleton.spec.ts e2e/scenarios/auth.spec.ts
```

### 2. Codegenでコード生成

```bash
npx playwright codegen http://localhost:3000
```

### 3. `=== CODEGEN: ... ===` の間にコードを貼り付け

```typescript
// === CODEGEN: user1/password入力 → ログイン ===
await page.getByLabel('ユーザー名').fill('user1')
await page.getByLabel('パスワード').fill('password')
await page.getByRole('button', { name: 'ログイン' }).click()
// === CODEGEN END ===
```

### 4. テスト実行

```bash
npx playwright test e2e/scenarios/auth.spec.ts
```

## 出力

- **スクリーンショット**: `test-results/evidence/`
- **Excelレポート**: `test-results/scenario-test-report.xlsx`

## カスタマイズのヒント

### 検証コードの追加

```typescript
// 検証: メイン画面に遷移
await expect(page.getByText('ドキュメント')).toBeVisible()
```

### ステータス変更

テストが失敗する場合:
```typescript
status: 'FAIL',
error: 'エラーメッセージ',
```

### スキップ

一時的にスキップする場合:
```typescript
test.skip('TEST-XX: ...', async ({ page }) => {
```
