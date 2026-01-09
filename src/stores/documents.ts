/**
 * 文書管理ストア
 * 文書のCRUDとローカルストレージ永続化を提供
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Document, Field } from '@/types'

/** ローカルストレージのキー */
const STORAGE_KEY = 'loan-doc-ui:documents'

/** ユニークIDを生成 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/** ローカルストレージから文書を読み込む */
function loadFromStorage(): Document[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const docs = JSON.parse(stored)
            return docs.map((doc: Document) => ({
                ...doc,
                fields: doc.fields.map((f: Field) => ({
                    ...f,
                    content: f.content || '', // 後方互換性
                })),
                createdAt: new Date(doc.createdAt),
                updatedAt: new Date(doc.updatedAt),
            }))
        }
    } catch (e) {
        console.error('文書の読み込みに失敗:', e)
    }
    return []
}

/** ローカルストレージに文書を保存 */
function saveToStorage(documents: Document[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
    } catch (e) {
        console.error('文書の保存に失敗:', e)
    }
}

export const useDocumentStore = defineStore('documents', () => {
    /** 文書一覧 */
    const documents = ref<Document[]>(loadFromStorage())

    // 変更を自動保存
    watch(
        documents,
        (newDocs) => {
            saveToStorage(newDocs)
        },
        { deep: true }
    )

    /** 文書をIDで取得 */
    function getById(id: string): Document | undefined {
        return documents.value.find((doc) => doc.id === id)
    }

    /** 新規文書を作成 */
    function create(title: string, fields: Field[] = []): Document {
        const now = new Date()
        const newDoc: Document = {
            id: generateId(),
            title,
            fields,
            createdAt: now,
            updatedAt: now,
        }
        documents.value.push(newDoc)
        return newDoc
    }

    /** 文書を更新 */
    function update(id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>): void {
        const index = documents.value.findIndex((doc) => doc.id === id)
        if (index !== -1) {
            documents.value[index] = {
                ...documents.value[index],
                ...updates,
                updatedAt: new Date(),
            }
        }
    }

    /** 文書を削除 */
    function remove(id: string): void {
        const index = documents.value.findIndex((doc) => doc.id === id)
        if (index !== -1) {
            documents.value.splice(index, 1)
        }
    }

    /** フィールドを追加 */
    function addField(documentId: string, name: string, content: string = ''): Field | undefined {
        const doc = documents.value.find((d) => d.id === documentId)
        if (doc) {
            const newField: Field = { id: generateId(), name, content }
            doc.fields.push(newField)
            doc.updatedAt = new Date()
            return newField
        }
        return undefined
    }

    /** フィールドを更新 */
    function updateField(documentId: string, fieldId: string, updates: Partial<Omit<Field, 'id'>>): void {
        const doc = documents.value.find((d) => d.id === documentId)
        if (doc) {
            const field = doc.fields.find((f) => f.id === fieldId)
            if (field) {
                Object.assign(field, updates)
                doc.updatedAt = new Date()
            }
        }
    }

    /** フィールドを削除 */
    function deleteField(documentId: string, fieldId: string): void {
        const doc = documents.value.find((d) => d.id === documentId)
        if (doc) {
            const index = doc.fields.findIndex((f) => f.id === fieldId)
            if (index !== -1) {
                doc.fields.splice(index, 1)
                doc.updatedAt = new Date()
            }
        }
    }

    return {
        documents,
        getById,
        create,
        update,
        remove,
        addField,
        updateField,
        deleteField,
    }
})
