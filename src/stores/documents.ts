/**
 * 文書管理ストア
 * APIクライアントを使用してバックエンドと連携
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { documentsApi } from '@/api'
import type {
    DocumentModel,
    DocumentCreate,
    DocumentUpdate,
    FieldItemModel,
    FieldItemUpdate,
} from '@/types'

export const useDocumentStore = defineStore('documents', () => {
    /** 文書一覧 */
    const documents = ref<DocumentModel[]>([])

    /** ローディング状態 */
    const loading = ref(false)

    /** エラー状態 */
    const error = ref<string | null>(null)

    /** 文書をIDで取得 */
    function getById(id: string): DocumentModel | undefined {
        return documents.value.find((doc) => doc.document_id === id)
    }

    /** 文書一覧をAPIから取得 */
    async function fetchList(): Promise<void> {
        loading.value = true
        error.value = null
        try {
            documents.value = await documentsApi.fetchDocuments()
        } catch (e) {
            error.value = e instanceof Error ? e.message : '文書の取得に失敗しました'
            throw e
        } finally {
            loading.value = false
        }
    }

    /** 新規文書を作成 */
    async function create(
        title: string,
        fieldItems: { name: string; content: string }[] = [],
        sharedScope: 'all' | 'only_me' = 'only_me'
    ): Promise<DocumentModel> {
        loading.value = true
        error.value = null
        try {
            const payload: DocumentCreate = {
                title,
                shared_scope: sharedScope,
                field_items: fieldItems,
            }
            const response = await documentsApi.createDocument(payload)
            documents.value.push(response.new_document)
            return response.new_document
        } catch (e) {
            error.value = e instanceof Error ? e.message : '文書の作成に失敗しました'
            throw e
        } finally {
            loading.value = false
        }
    }

    /** 文書を更新 */
    async function update(
        id: string,
        updates: {
            title?: string
            sharedScope?: 'all' | 'only_me'
            fieldItems?: FieldItemUpdate[]
        }
    ): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const doc = getById(id)
            if (!doc) throw new Error('文書が見つかりません')

            const payload: DocumentUpdate = {
                title: updates.title ?? doc.title,
                shared_scope: updates.sharedScope ?? doc.shared_scope,
                field_items: updates.fieldItems ?? (doc.field_items || []).map((f) => ({
                    field_id: f.field_id,
                    name: f.name,
                    content: f.content,
                })),
            }

            await documentsApi.updateDocument(id, payload)

            // ローカル状態を更新
            const index = documents.value.findIndex((d) => d.document_id === id)
            const docToUpdate = documents.value[index]
            if (docToUpdate) {
                docToUpdate.title = payload.title
                docToUpdate.shared_scope = payload.shared_scope
                docToUpdate.field_items = payload.field_items.map((f, i) => ({
                    field_id: f.field_id || `temp-${i}`,
                    name: f.name,
                    content: f.content,
                }))
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : '文書の更新に失敗しました'
            throw e
        } finally {
            loading.value = false
        }
    }

    /** 文書を削除 */
    async function remove(id: string): Promise<void> {
        loading.value = true
        error.value = null
        try {
            await documentsApi.deleteDocument(id)
            const index = documents.value.findIndex((d) => d.document_id === id)
            if (index !== -1) {
                documents.value.splice(index, 1)
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : '文書の削除に失敗しました'
            throw e
        } finally {
            loading.value = false
        }
    }

    /** フィールドを追加（ローカル操作後にupdateを呼ぶ想定） */
    function addFieldLocal(
        documentId: string,
        name: string,
        content: string = ''
    ): FieldItemModel | undefined {
        const doc = documents.value.find((d) => d.document_id === documentId)
        if (doc) {
            const newField: FieldItemModel = {
                field_id: `temp-${Date.now()}`,
                name,
                content,
            }
            if (!doc.field_items) {
                doc.field_items = []
            }
            doc.field_items.push(newField)
            return newField
        }
        return undefined
    }

    /** フィールドを更新（ローカル操作） */
    function updateFieldLocal(
        documentId: string,
        fieldId: string,
        updates: Partial<Omit<FieldItemModel, 'field_id'>>
    ): void {
        const doc = documents.value.find((d) => d.document_id === documentId)
        if (doc && doc.field_items) {
            const field = doc.field_items.find((f) => f.field_id === fieldId)
            if (field) {
                Object.assign(field, updates)
            }
        }
    }

    /** フィールドを削除（ローカル操作） */
    function deleteFieldLocal(documentId: string, fieldId: string): void {
        const doc = documents.value.find((d) => d.document_id === documentId)
        if (doc && doc.field_items) {
            const index = doc.field_items.findIndex((f) => f.field_id === fieldId)
            if (index !== -1) {
                doc.field_items.splice(index, 1)
            }
        }
    }

    return {
        documents,
        loading,
        error,
        getById,
        fetchList,
        create,
        update,
        remove,
        addFieldLocal,
        updateFieldLocal,
        deleteFieldLocal,
    }
})
