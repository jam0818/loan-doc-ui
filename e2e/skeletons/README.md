# E2Eテストスケルトン

このディレクトリには、Playwright Codegenで生成したコードをそのまま貼り付けられるテストテンプレートが含まれています。

## 使い方

### 1. テンプレートをコピー

```bash
cp e2e/skeletons/basic-template.spec.ts e2e/scenarios/my-test.spec.ts
```

### 2. Codegenを起動

```bash
npx playwright codegen http://localhost:3000
```

### 3. 生成されたコードを貼り付け

テンプレート内の `// === CODEGEN START ===` と `// === CODEGEN END ===` の間に、
生成されたコードを貼り付けます。

```typescript
// === CODEGEN START (前処理) ===
await page.getByRole('button', { name: '追加' }).click()
await page.getByLabel('タイトル').fill('テスト')
// === CODEGEN END ===
```

### 4. テストを実行

```bash
npx playwright test e2e/scenarios/my-test.spec.ts
```

---

## テンプレート一覧

| ファイル | 説明 | 用途 |
|---------|------|------|
| `basic-template.spec.ts` | シンプルな基本テンプレート | 最初のテスト作成に |
| `with-step-capture.spec.ts` | **推奨** ステップ実行ラッパー版 | `captureStep`で操作をラップ。コードが綺麗でスクショ自動化 |
| `with-error-handling.spec.ts` | try-catch付きテンプレート | エラー時もレポートに記録したい場合 |
| `with-helpers.spec.ts` | ヘルパー関数活用版 | 共通操作はヘルパー使用、検証のみCodegen |

---

## 出力

- **スクリーンショット**: `test-results/evidence/` に保存
- **Excelレポート**: `test-results/scenario-test-report.xlsx`

---

## テンプレートのカスタマイズ

### カテゴリ名・テスト名の変更

```typescript
test.describe('認証シナリオ', () => {  // ← カテゴリ名
    test('AUTH-01: ログイン成功', async ({ page }) => {  // ← テストID・名前
```

### 結果レポートの情報

```typescript
reporter.addResult({
    id: 'AUTH-01',           // テストID
    category: '認証',         // Excel上のカテゴリ
    name: 'ログイン成功',      // テスト名
    description: '有効な認証情報でログインできること',
    status: 'PASS',          // PASS / FAIL / SKIP
})
```
