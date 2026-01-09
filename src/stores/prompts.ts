/**
 * プロンプト管理ストア
 * プロンプトのCRUDとローカルストレージ永続化を提供
 * プロンプトタイプはglobal(全フィールド用)かfield(個別用)の排他
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Prompt, FieldPrompt, Field, PromptType } from '@/types'

/** ローカルストレージのキー */
const STORAGE_KEY = 'loan-doc-ui:prompts'

/** ユニークIDを生成 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/** ローカルストレージからプロンプトを読み込む */
function loadFromStorage(): Prompt[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const prompts = JSON.parse(stored)
            return prompts.map((p: Prompt) => ({
                ...p,
                type: p.type || 'global', // 後方互換性
                fieldPrompts: p.fieldPrompts || [],
                globalPrompt: p.globalPrompt || '',
                globalRevisePrompt: p.globalRevisePrompt || '',
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.updatedAt),
            }))
        }
    } catch (e) {
        console.error('プロンプトの読み込みに失敗:', e)
    }
    return []
}

/** ローカルストレージにプロンプトを保存 */
function saveToStorage(prompts: Prompt[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts))
    } catch (e) {
        console.error('プロンプトの保存に失敗:', e)
    }
}

export const usePromptStore = defineStore('prompts', () => {
    /** プロンプト一覧 */
    const prompts = ref<Prompt[]>(loadFromStorage())

    // 変更を自動保存
    watch(
        prompts,
        (newPrompts) => {
            saveToStorage(newPrompts)
        },
        { deep: true }
    )

    /** プロンプトをIDで取得 */
    function getById(id: string): Prompt | undefined {
        return prompts.value.find((p) => p.id === id)
    }

    /** 文書IDでプロンプト一覧を取得 */
    function getByDocumentId(documentId: string): Prompt[] {
        return prompts.value.filter((p) => p.documentId === documentId)
    }

    /**
     * 新規プロンプトを作成
     * type='field'の場合、各フィールドに対応するFieldPromptを自動生成
     */
    function create(documentId: string, name: string, type: PromptType, fields: Field[] = []): Prompt {
        const now = new Date()

        // 個別フィールド用の場合、各フィールドに対応するFieldPromptを生成
        const fieldPrompts: FieldPrompt[] = type === 'field'
            ? fields.map(field => ({
                id: generateId(),
                fieldId: field.id,
                generatePrompt: '',
                revisePrompt: '',
            }))
            : []

        const newPrompt: Prompt = {
            id: generateId(),
            documentId,
            name,
            type,
            globalPrompt: '',
            globalRevisePrompt: '',
            fieldPrompts,
            createdAt: now,
            updatedAt: now,
        }
        prompts.value.push(newPrompt)
        return newPrompt
    }

    /** プロンプトを更新 */
    function update(id: string, updates: Partial<Omit<Prompt, 'id' | 'createdAt'>>): void {
        const index = prompts.value.findIndex((p) => p.id === id)
        if (index !== -1) {
            prompts.value[index] = {
                ...prompts.value[index],
                ...updates,
                updatedAt: new Date(),
            }
        }
    }

    /** プロンプトを削除 */
    function remove(id: string): void {
        const index = prompts.value.findIndex((p) => p.id === id)
        if (index !== -1) {
            prompts.value.splice(index, 1)
        }
    }

    /** 文書IDに紐づくプロンプトをすべて削除 */
    function removeByDocumentId(documentId: string): void {
        prompts.value = prompts.value.filter((p) => p.documentId !== documentId)
    }

    /** フィールドプロンプトを更新 */
    function updateFieldPrompt(
        promptId: string,
        fieldId: string,
        updates: Partial<Omit<FieldPrompt, 'id' | 'fieldId'>>
    ): void {
        const prompt = prompts.value.find((p) => p.id === promptId)
        if (prompt) {
            const fp = prompt.fieldPrompts.find((f) => f.fieldId === fieldId)
            if (fp) {
                Object.assign(fp, updates)
                prompt.updatedAt = new Date()
            }
        }
    }

    /** フィールドプロンプトを取得 */
    function getFieldPrompt(promptId: string, fieldId: string): FieldPrompt | undefined {
        const prompt = prompts.value.find((p) => p.id === promptId)
        return prompt?.fieldPrompts.find((f) => f.fieldId === fieldId)
    }

    return {
        prompts,
        getById,
        getByDocumentId,
        create,
        update,
        remove,
        removeByDocumentId,
        updateFieldPrompt,
        getFieldPrompt,
    }
})
