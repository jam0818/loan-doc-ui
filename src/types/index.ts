/**
 * 文書生成アプリケーションの型定義
 */

/** フィールド */
export interface Field {
    /** フィールドの一意識別子 */
    id: string
    /** フィールド名 */
    name: string
    /** フィールドの元となる文書内容 */
    content: string
}

/** 文書 */
export interface Document {
    /** 文書の一意識別子 */
    id: string
    /** 文書タイトル */
    title: string
    /** フィールド一覧 */
    fields: Field[]
    /** 作成日時 */
    createdAt: Date
    /** 更新日時 */
    updatedAt: Date
}

/** フィールドプロンプト（フィールドIDに紐づく個別プロンプト） */
export interface FieldPrompt {
    /** フィールドプロンプトの一意識別子 */
    id: string
    /** 対象のフィールドID */
    fieldId: string
    /** 生成用プロンプト */
    generatePrompt: string
    /** 修正用プロンプト */
    revisePrompt: string
}

/** プロンプトタイプ（排他：どちらか一方のみ） */
export type PromptType = 'global' | 'field'

/** プロンプト（文書に紐づくプロンプトセット） */
export interface Prompt {
    /** プロンプトの一意識別子 */
    id: string
    /** 紐づく文書ID */
    documentId: string
    /** プロンプト名 */
    name: string
    /** プロンプトタイプ（global: 全フィールド共通, field: 個別フィールド用）排他 */
    type: PromptType
    /** 全フィールド共通プロンプト（type='global'の場合のみ使用） */
    globalPrompt: string
    /** 全フィールド共通の修正用プロンプト（type='global'の場合のみ使用） */
    globalRevisePrompt: string
    /** フィールドごとのプロンプト（type='field'の場合のみ使用） */
    fieldPrompts: FieldPrompt[]
    /** 作成日時 */
    createdAt: Date
    /** 更新日時 */
    updatedAt: Date
}

/** プロンプトモード */
export type PromptMode = 'generate' | 'revise'

/** 表示モード */
export type ViewMode = 'before' | 'after'

/** アプリ状態 */
export interface AppState {
    /** 選択中の文書ID */
    selectedDocumentId: string | null
    /** 選択中のプロンプトID */
    selectedPromptId: string | null
    /** プロンプトモード（生成用/修正用） */
    promptMode: PromptMode
    /** 表示モード（生成前/生成後） */
    viewMode: ViewMode
    /** 生成中のフィールドID */
    generatingFieldId: string | null
    /** 生成されたコンテンツ（Markdown） */
    generatedContent: string
}
