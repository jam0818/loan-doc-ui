/**
 * OpenAPIスキーマに基づく型定義
 * @see openapi.json
 */

// ============================================================
// 列挙型
// ============================================================

/** 共有範囲 */
export type SharedScope = 'all' | 'only_me'

/** プロンプト対象範囲 */
export type PromptTarget = 'all' | 'each'

/** プロンプトモード（UI用、API定義にはない） */
export type PromptMode = 'generate' | 'revise'

/** 表示モード（UI用、API定義にはない） */
export type ViewMode = 'before' | 'after'

// ============================================================
// フィールド関連
// ============================================================

/** フィールドアイテム（DB/レスポンス用） */
export interface FieldItemModel {
    field_id: string // UUID
    name: string
    content: string
}

/** フィールドアイテム作成リクエスト */
export interface FieldItemCreate {
    name: string
    content: string
}

/** フィールドアイテム更新リクエスト */
export interface FieldItemUpdate {
    field_id?: string | null // 既存項目の場合はIDを指定
    name: string
    content: string
}

// ============================================================
// ドキュメント関連
// ============================================================

/** ドキュメント（DB/レスポンス用） */
export interface DocumentModel {
    document_id: string // UUID
    user_id: string // UUID
    title: string
    shared_scope: SharedScope
    created_at?: string // ISO 8601
    updated_at?: string // ISO 8601
    field_items?: FieldItemModel[]
}

/** ドキュメント作成リクエスト */
export interface DocumentCreate {
    title: string
    shared_scope: SharedScope
    field_items?: FieldItemCreate[]
}

/** ドキュメント作成レスポンス */
export interface DocumentCreateResponse {
    message: string
    inserted_document_id: string
    new_document: DocumentModel
}

/** ドキュメント更新リクエスト */
export interface DocumentUpdate {
    title: string
    shared_scope: SharedScope
    field_items: FieldItemUpdate[]
}

/** ドキュメント更新レスポンス */
export interface DocumentUpdateResponse {
    message: string
    updated_document_id: string
}

/** ドキュメント一覧取得レスポンス */
export interface GetDocumentListApiResponse {
    documents: DocumentModel[]
}

// ============================================================
// フィールドプロンプト関連
// ============================================================

/** フィールドプロンプト（DB/レスポンス用） */
export interface FieldPromptModel {
    field_prompt_id: string // UUID
    field_id: string | null // 'all'の場合はnull
    generation_prompt: string
    correction_prompt: string
}

/** フィールドプロンプト作成リクエスト */
export interface FieldPromptCreate {
    field_id?: string | null
    generation_prompt: string
    correction_prompt: string
}

/** フィールドプロンプト更新リクエスト */
export interface FieldPromptUpdate {
    field_prompt_id?: string | null // 既存項目の場合はIDを指定
    field_id?: string | null
    generation_prompt: string
    correction_prompt: string
}

// ============================================================
// プロンプト関連
// ============================================================

/** プロンプト（DB/レスポンス用） */
export interface PromptModel {
    prompt_id: string // UUID
    user_id: string // UUID
    document_id: string // UUID
    title: string
    shared_scope: SharedScope
    prompt_target: PromptTarget
    created_at?: string // ISO 8601
    updated_at?: string // ISO 8601
    field_prompt_items?: FieldPromptModel[]
}

/** プロンプト作成リクエスト */
export interface PromptCreate {
    title: string
    shared_scope: SharedScope
    prompt_target: PromptTarget
    document_id: string
    field_prompt_items?: FieldPromptCreate[]
}

/** プロンプト作成レスポンス */
export interface PromptCreateResponse {
    message: string
    inserted_prompt_id: string
    new_prompt: PromptModel
}

/** プロンプト更新リクエスト */
export interface PromptUpdate {
    title: string
    shared_scope: SharedScope
    prompt_target: PromptTarget
    field_prompt_items: FieldPromptUpdate[]
}

/** プロンプト更新レスポンス */
export interface PromptUpdateResponse {
    message: string
    updated_prompt_id: string
}

/** プロンプト削除レスポンス */
export interface PromptDeleteResponse {
    message: string
    deleted_prompt_id: string
}

/** プロンプト一覧取得レスポンス */
export interface GetPromptListApiResponse {
    prompts: PromptModel[]
}

// ============================================================
// 認証関連
// ============================================================

/** ログインリクエスト */
export interface UserModel {
    username: string
    password: string
}

/** ログインレスポンス */
export interface AuthorizationApiResponse {
    token: string
}

// ============================================================
// LLM生成関連
// ============================================================

/** LLM生成リクエスト */
export interface UserInputPromptRequest {
    session_id: string // UUID
    prompt_id: string // UUID
    field_name: string
    input_text: string
    input_title: string
}

// ============================================================
// エラーレスポンス
// ============================================================

/** エラーレスポンス */
export interface ErrorResponse {
    error: string
    message: string
    details?: Record<string, unknown> | null
}

/** バリデーションエラー */
export interface ValidationError {
    loc: (string | number)[]
    msg: string
    type: string
}

/** HTTPバリデーションエラー */
export interface HTTPValidationError {
    detail?: ValidationError[]
}

// ============================================================
// アプリケーション状態（UI用）
// ============================================================

/** アプリ状態 */
export interface AppState {
    selectedDocumentId: string | null
    selectedPromptId: string | null
    promptMode: PromptMode
    viewMode: ViewMode
    generatingFieldId: string | null
    generatedContent: string
}
