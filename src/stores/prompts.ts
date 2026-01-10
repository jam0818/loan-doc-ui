/**
 * プロンプト管理ストア
 * APIクライアントを使用してバックエンドと連携
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { promptsApi } from '@/api'
import type {
    PromptModel,
    PromptCreate,
    PromptUpdate,
    PromptTarget,
    SharedScope,
    FieldPromptModel,
    FieldPromptCreate,
    FieldPromptUpdate,
    FieldItemModel,
} from '@/types'

export const usePromptStore = defineStore('prompts', () => {
    /** プロンプト一覧 */
    const prompts = ref<PromptModel[]>([])

    /** ローディング状態 */
    const loading = ref(false)

    /** エラー状態 */
    const error = ref<string | null>(null)

    /** プロンプトをIDで取得 */
    function getById(id: string): PromptModel | undefined {
        return prompts.value.find((p) => p.prompt_id === id)
    }

    /** 文書IDでプロンプト一覧を取得 */
    function getByDocumentId(documentId: string): PromptModel[] {
        return prompts.value.filter((p) => p.document_id === documentId)
    }

    /** プロンプト一覧をAPIから取得 */
    async function fetchList(): Promise<void> {
        loading.value = true
        error.value = null
        try {
            prompts.value = await promptsApi.fetchPrompts()
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'プロンプトの取得に失敗しました'
            throw e
        } finally {
            loading.value = false
        }
    }

    /**
     * 新規プロンプトを作成
     * prompt_target='each'の場合、各フィールドに対応するFieldPromptを自動生成
     */
    async function create(
        documentId: string,
        title: string,
        promptTarget: PromptTarget,
        fields: FieldItemModel[] = [],
        sharedScope: SharedScope = 'only_me'
    ): Promise<PromptModel> {
        loading.value = true
        error.value = null
        try {
            // 個別フィールド用の場合、各フィールドに対応するFieldPromptを生成
            const fieldPromptItems: FieldPromptCreate[] =
                promptTarget === 'each'
                    ? fields.map((field) => ({
                        field_id: field.field_id,
                        generation_prompt: '',
                        correction_prompt: '',
                    }))
                    : [
                        {
                            field_id: null, // 全フィールド共通
                            generation_prompt: '',
                            correction_prompt: '',
                        },
                    ]

            const payload: PromptCreate = {
                title,
                shared_scope: sharedScope,
                prompt_target: promptTarget,
                document_id: documentId,
                field_prompt_items: fieldPromptItems,
            }

            const response = await promptsApi.createPrompt(payload)
            prompts.value.push(response.new_prompt)
            return response.new_prompt
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'プロンプトの作成に失敗しました'
            throw e
        } finally {
            loading.value = false
        }
    }

    /** プロンプトを更新 */
    async function update(
        id: string,
        updates: Partial<{
            title: string
            sharedScope: SharedScope
            promptTarget: PromptTarget
            fieldPromptItems: FieldPromptUpdate[]
        }>
    ): Promise<void> {
        loading.value = true
        error.value = null
        try {
            const prompt = getById(id)
            if (!prompt) throw new Error('プロンプトが見つかりません')

            const payload: PromptUpdate = {
                title: updates.title ?? prompt.title,
                shared_scope: updates.sharedScope ?? prompt.shared_scope,
                prompt_target: updates.promptTarget ?? prompt.prompt_target,
                field_prompt_items: updates.fieldPromptItems ?? (prompt.field_prompt_items || []).map((fp) => ({
                    field_prompt_id: fp.field_prompt_id,
                    field_id: fp.field_id,
                    generation_prompt: fp.generation_prompt,
                    correction_prompt: fp.correction_prompt,
                })),
            }

            await promptsApi.updatePrompt(id, payload)

            // ローカル状態を更新
            const index = prompts.value.findIndex((p) => p.prompt_id === id)
            const promptToUpdate = prompts.value[index]
            if (promptToUpdate) {
                promptToUpdate.title = payload.title
                promptToUpdate.shared_scope = payload.shared_scope
                promptToUpdate.prompt_target = payload.prompt_target
                promptToUpdate.field_prompt_items = payload.field_prompt_items.map((fp, i) => ({
                    field_prompt_id: fp.field_prompt_id || `temp-${i}`,
                    field_id: fp.field_id ?? null,
                    generation_prompt: fp.generation_prompt,
                    correction_prompt: fp.correction_prompt,
                }))
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'プロンプトの更新に失敗しました'
            throw e
        } finally {
            loading.value = false
        }
    }

    /** プロンプトを削除 */
    async function remove(id: string): Promise<void> {
        loading.value = true
        error.value = null
        try {
            await promptsApi.deletePrompt(id)
            const index = prompts.value.findIndex((p) => p.prompt_id === id)
            if (index !== -1) {
                prompts.value.splice(index, 1)
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'プロンプトの削除に失敗しました'
            throw e
        } finally {
            loading.value = false
        }
    }

    /** フィールドプロンプトを更新（ローカル操作） */
    function updateFieldPromptLocal(
        promptId: string,
        fieldId: string | null,
        updates: Partial<Omit<FieldPromptModel, 'field_prompt_id' | 'field_id'>>
    ): void {
        const prompt = prompts.value.find((p) => p.prompt_id === promptId)
        if (prompt && prompt.field_prompt_items) {
            const fp = prompt.field_prompt_items.find((f) => f.field_id === fieldId)
            if (fp) {
                Object.assign(fp, updates)
            }
        }
    }

    /** フィールドプロンプトを取得 */
    function getFieldPrompt(
        promptId: string,
        fieldId: string | null
    ): FieldPromptModel | undefined {
        const prompt = prompts.value.find((p) => p.prompt_id === promptId)
        return prompt?.field_prompt_items?.find((f) => f.field_id === fieldId)
    }

    return {
        prompts,
        loading,
        error,
        getById,
        getByDocumentId,
        fetchList,
        create,
        update,
        remove,
        updateFieldPromptLocal,
        getFieldPrompt,
    }
})
