/**
 * アプリ状態管理ストア
 * 選択状態、モード、生成結果を管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PromptMode, ViewMode } from '@/types'

export const useAppStore = defineStore('app', () => {
  /** 選択中の文書ID */
  const selectedDocumentId = ref<string | null>(null)

  /** 選択中のプロンプトID */
  const selectedPromptId = ref<string | null>(null)

  /** プロンプトモード（生成用/修正用） */
  const promptMode = ref<PromptMode>('generate')

  /** 表示モード（生成前/生成後） */
  const viewMode = ref<ViewMode>('before')

  /** 生成中のフィールドID */
  const generatingFieldId = ref<string | null>(null)

  /** 生成されたコンテンツ（Markdown） */
  const generatedContent = ref<string>('')

  /** 生成前のコンテンツ（Markdown） */
  const beforeContent = ref<string>('')

  /** フィールドごとの生成済みコンテンツ */
  const fieldContents = ref<Record<string, string>>({})

  /** 文書を選択 */
  function selectDocument(id: string | null) {
    selectedDocumentId.value = id
    selectedPromptId.value = null // プロンプト選択をリセット
  }

  /** プロンプトを選択 */
  function selectPrompt(id: string | null) {
    selectedPromptId.value = id
  }

  /** プロンプトモードを切り替え */
  function setPromptMode(mode: PromptMode) {
    promptMode.value = mode
  }

  /** 表示モードを切り替え */
  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  /** 生成中のフィールドを設定 */
  function setGeneratingFieldId(fieldId: string | null) {
    generatingFieldId.value = fieldId
  }

  /** 生成コンテンツを設定 */
  function setGeneratedContent(content: string) {
    generatedContent.value = content
  }

  /** 生成コンテンツに追記 */
  function appendGeneratedContent(content: string) {
    generatedContent.value += content
  }

  /** 生成前コンテンツを設定 */
  function setBeforeContent(content: string) {
    beforeContent.value = content
  }

  /** フィールドごとの生成コンテンツを設定 */
  function setFieldContent(fieldId: string, content: string) {
    fieldContents.value[fieldId] = content
  }

  /** フィールドごとの生成コンテンツを取得 */
  function getFieldContent(fieldId: string): string {
    return fieldContents.value[fieldId] || ''
  }

  /** フィールドコンテンツをクリア */
  function clearFieldContents() {
    fieldContents.value = {}
  }

  /** 全フィールドの生成コンテンツをまとめてMarkdown形式で取得 */
  function buildGeneratedContentFromFields(fields: { id: string; name: string }[]): string {
    return fields.map(f => `## ${f.name}\n\n${fieldContents.value[f.id] || ''}\n`).join('\n')
  }

  /** リセット */
  function reset() {
    selectedDocumentId.value = null
    selectedPromptId.value = null
    promptMode.value = 'generate'
    viewMode.value = 'before'
    generatingFieldId.value = null
    generatedContent.value = ''
    beforeContent.value = ''
    fieldContents.value = {}
  }

  return {
    selectedDocumentId,
    selectedPromptId,
    promptMode,
    viewMode,
    generatingFieldId,
    generatedContent,
    beforeContent,
    fieldContents,
    selectDocument,
    selectPrompt,
    setPromptMode,
    setViewMode,
    setGeneratingFieldId,
    setGeneratedContent,
    appendGeneratedContent,
    setBeforeContent,
    setFieldContent,
    getFieldContent,
    clearFieldContents,
    buildGeneratedContentFromFields,
    reset,
  }
})
