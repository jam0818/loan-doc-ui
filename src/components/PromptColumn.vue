<template>
  <div class="prompt-column">
    <!-- ヘッダー -->
    <div class="column-header">
      <span class="column-title">プロンプト</span>
      <v-spacer />
      <v-btn
        icon="mdi-plus"
        size="small"
        variant="text"
        :disabled="!appStore.selectedDocumentId"
        @click="showCreateDialog = true"
      />
      <v-btn
        icon="mdi-pencil"
        size="small"
        variant="text"
        :disabled="!appStore.selectedPromptId"
        @click="openEditDialog"
      />
      <v-btn
        icon="mdi-delete"
        size="small"
        variant="text"
        color="error"
        :disabled="!appStore.selectedPromptId"
        @click="handleDelete"
      />
    </div>

    <!-- プロンプト選択ドロップダウン -->
    <div class="dropdown-area">
      <v-select
        v-model="selectedId"
        :items="availablePrompts"
        item-title="title"
        item-value="prompt_id"
        label="プロンプトを選択"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        :disabled="!appStore.selectedDocumentId"
      />

      <!-- 生成用/修正用トグル -->
      <v-btn-toggle
        v-if="appStore.selectedPromptId"
        v-model="promptMode"
        mandatory
        density="compact"
        color="primary"
        class="mt-3"
      >
        <v-btn value="generate" size="small">
          <v-icon icon="mdi-creation" class="mr-1" />
          生成用
        </v-btn>
        <v-btn value="revise" size="small">
          <v-icon icon="mdi-pencil" class="mr-1" />
          修正用
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- プロンプト編集エリア -->
    <div v-if="selectedPrompt" class="prompt-edit-area">
      <v-alert
        :icon="promptMode === 'generate' ? 'mdi-creation' : 'mdi-pencil'"
        :color="promptMode === 'generate' ? 'primary' : 'secondary'"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        {{ promptMode === 'generate' ? '生成用プロンプト' : '修正用プロンプト' }}
      </v-alert>

      <!-- プロンプトタイプ表示 -->
      <v-chip
        size="small"
        :color="selectedPrompt.prompt_target === 'all' ? 'primary' : 'secondary'"
        class="mb-3"
      >
        {{ selectedPrompt.prompt_target === 'all' ? '全フィールド共通' : '個別フィールド用' }}
      </v-chip>

      <!-- 全フィールド共通プロンプト（prompt_target='all'の場合） -->
      <template v-if="selectedPrompt.prompt_target === 'all'">
        <v-card variant="outlined">
          <v-card-title class="text-subtitle-1">
            <v-icon icon="mdi-earth" size="small" class="mr-2" />
            全フィールド共通プロンプト
          </v-card-title>
          <v-card-text>
            <v-textarea
              :model-value="getGlobalPromptText()"
              :label="promptMode === 'generate' ? '共通生成プロンプト' : '共通修正プロンプト'"
              variant="outlined"
              rows="8"
              hide-details
              placeholder="全フィールドに適用される共通プロンプト..."
              @update:model-value="(val: string) => handleGlobalPromptChange(val)"
            />
          </v-card-text>
        </v-card>
      </template>

      <!-- フィールドごとのプロンプト（prompt_target='each'の場合） -->
      <template v-else>
        <div class="field-prompts-list">
          <v-card
            v-for="field in selectedDocumentFields"
            :key="field.field_id"
            variant="outlined"
            class="mb-3"
          >
            <v-card-title class="text-subtitle-1 d-flex align-center">
              <v-icon icon="mdi-form-textbox" size="small" class="mr-2" />
              {{ field.name }}
              <v-spacer />
              <v-chip size="x-small" color="secondary">ID: {{ field.field_id.slice(-6) }}</v-chip>
            </v-card-title>
            <v-card-subtitle v-if="field.content" class="text-truncate">
              内容: {{ field.content }}
            </v-card-subtitle>
            <v-card-text>
              <v-textarea
                :model-value="getFieldPromptText(field.field_id)"
                :label="`${field.name}の${promptMode === 'generate' ? '生成' : '修正'}プロンプト`"
                variant="outlined"
                rows="2"
                hide-details
                :placeholder="`${field.name}の${promptMode === 'generate' ? '生成' : '修正'}時に使用するプロンプト...`"
                @update:model-value="(val: string) => handleFieldPromptChange(field.field_id, val)"
              />
              <div v-if="promptMode === 'revise'" class="d-flex justify-end mt-2">
                <v-btn
                  size="small"
                  variant="tonal"
                  color="secondary"
                  :loading="appStore.generatingFieldId === field.field_id"
                  :disabled="!getFieldPromptText(field.field_id)"
                  @click="handleFieldRegenerate(field)"
                >
                  <v-icon icon="mdi-refresh" size="small" class="mr-1" />
                  再生成
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </template>
    </div>

    <!-- プロンプト未選択時 -->
    <v-empty-state
      v-else-if="appStore.selectedDocumentId"
      icon="mdi-text-box-outline"
      title="プロンプトを選択"
      text="ドロップダウンからプロンプトを選択するか、新規作成してください"
      class="mt-8"
    />

    <!-- 文書未選択時 -->
    <v-empty-state
      v-else
      icon="mdi-file-document-arrow-right"
      title="文書を選択してください"
      text="まず左カラムで文書を選択"
      class="mt-8"
    />

    <!-- 作成ダイアログ -->
    <v-dialog v-model="showCreateDialog" max-width="400">
      <v-card>
        <v-card-title>新規プロンプト作成</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newPromptName"
            label="プロンプト名"
            variant="outlined"
            autofocus
            class="mb-3"
          />
          <v-select
            v-model="newPromptTarget"
            :items="promptTargetOptions"
            item-title="label"
            item-value="value"
            label="プロンプトタイプ"
            variant="outlined"
          />
          <v-alert
            v-if="newPromptTarget === 'all'"
            type="info"
            variant="tonal"
            density="compact"
          >
            全フィールド共通のプロンプトを1つ設定します
          </v-alert>
          <v-alert
            v-else
            type="info"
            variant="tonal"
            density="compact"
          >
            各フィールドに個別のプロンプトを設定します
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">キャンセル</v-btn>
          <v-btn color="primary" variant="flat" :loading="promptStore.loading" @click="handleCreate">作成</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 編集ダイアログ -->
    <v-dialog v-model="showEditDialog" max-width="400">
      <v-card>
        <v-card-title>プロンプトを編集</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editPromptName"
            label="プロンプト名"
            variant="outlined"
            class="mb-3"
          />
          <v-select
            v-model="editPromptTarget"
            :items="promptTargetOptions"
            item-title="label"
            item-value="value"
            label="プロンプトタイプ"
            variant="outlined"
          />
          <v-alert
            v-if="editPromptTarget !== selectedPrompt?.prompt_target"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            タイプを変更すると、現在の{{ selectedPrompt?.prompt_target === 'all' ? '全フィールド共通' : '個別フィールド' }}プロンプトが破棄されます
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showEditDialog = false">キャンセル</v-btn>
          <v-btn color="primary" variant="flat" :loading="promptStore.loading" @click="handleUpdate">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { usePromptStore } from '@/stores/prompts'
import { useDocumentStore } from '@/stores/documents'
import { useAppStore } from '@/stores/app'
import type { PromptMode, PromptTarget, FieldItemModel } from '@/types'

const promptStore = usePromptStore()
const docStore = useDocumentStore()
const appStore = useAppStore()

// ローカル選択ID
const selectedId = ref<string | null>(null)

// プロンプトモード
const promptMode = ref<PromptMode>('generate')

// ダイアログ状態
const showCreateDialog = ref(false)
const showEditDialog = ref(false)

// 新規作成用
const newPromptName = ref('')
const newPromptTarget = ref<PromptTarget>('all')

// 編集用
const editPromptName = ref('')
const editPromptTarget = ref<PromptTarget>('all')

// プロンプトタイプオプション
const promptTargetOptions = [
  { label: '全フィールド共通', value: 'all' },
  { label: '個別フィールド用', value: 'each' },
]

// 使用可能なプロンプト（選択文書に紐づくもの）
const availablePrompts = computed(() => {
  if (!appStore.selectedDocumentId) return []
  return promptStore.getByDocumentId(appStore.selectedDocumentId)
})

// 選択中のプロンプト
const selectedPrompt = computed(() => {
  if (!selectedId.value) return null
  return promptStore.getById(selectedId.value)
})

// 選択中の文書のフィールド
const selectedDocumentFields = computed(() => {
  if (!appStore.selectedDocumentId) return []
  const doc = docStore.getById(appStore.selectedDocumentId)
  return doc?.field_items || []
})

// 初期化時にプロンプト一覧を取得
onMounted(async () => {
  try {
    await promptStore.fetchList()
  } catch (e) {
    console.error('プロンプト一覧の取得に失敗:', e)
  }
})

// 選択変更時にストアに反映
watch(selectedId, (id) => {
  appStore.selectPrompt(id)
})

// プロンプトモード変更をストアに反映
watch(promptMode, (mode) => {
  appStore.setPromptMode(mode)
})

// 文書変更時にプロンプト選択をリセット
watch(() => appStore.selectedDocumentId, () => {
  selectedId.value = null
})

// appStoreからのプロンプトモード変更を同期
watch(() => appStore.promptMode, (mode) => {
  promptMode.value = mode
})

// 全フィールド共通プロンプトのテキストを取得
function getGlobalPromptText(): string {
  if (!selectedPrompt.value) return ''
  const fp = selectedPrompt.value.field_prompt_items?.find(f => f.field_id === null)
  if (!fp) return ''
  return promptMode.value === 'generate' ? fp.generation_prompt : fp.correction_prompt
}

// フィールドプロンプトのテキストを取得
function getFieldPromptText(fieldId: string): string {
  if (!selectedPrompt.value) return ''
  const fp = selectedPrompt.value.field_prompt_items?.find(f => f.field_id === fieldId)
  if (!fp) return ''
  return promptMode.value === 'generate' ? fp.generation_prompt : fp.correction_prompt
}

// 全フィールド共通プロンプト変更
function handleGlobalPromptChange(value: string) {
  if (!selectedId.value) return
  const updates = promptMode.value === 'generate'
    ? { generation_prompt: value }
    : { correction_prompt: value }
  promptStore.updateFieldPromptLocal(selectedId.value, null, updates)
}

// フィールドプロンプト変更
function handleFieldPromptChange(fieldId: string, value: string) {
  if (!selectedId.value) return
  const updates = promptMode.value === 'generate'
    ? { generation_prompt: value }
    : { correction_prompt: value }
  promptStore.updateFieldPromptLocal(selectedId.value, fieldId, updates)
}

// 個別フィールド再生成処理（ストリーム対応モック実装）
async function handleFieldRegenerate(field: FieldItemModel) {
  if (!selectedPrompt.value) return

  const doc = docStore.getById(appStore.selectedDocumentId!)
  if (!doc) return

  appStore.setGeneratingFieldId(field.field_id)

  // 生成後表示に自動切り替え
  appStore.setViewMode('after')

  // プロンプトテキストを取得
  const promptText = getFieldPromptText(field.field_id)

  // モック生成（実際はAPIからストリーム）
  const mockContent = promptMode.value === 'generate'
    ? `【${field.name}の生成結果】\n\n${promptText}を適用して生成された内容です。\n\n元の内容: ${field.content}\n`
    : `【${field.name}の修正結果】\n\n${promptText}を適用して修正された内容です。\n\n元の内容: ${field.content}\n`

  // 文字を1つずつ追加してストリーム風に表示
  let result = ''
  for (const char of mockContent) {
    await new Promise(resolve => setTimeout(resolve, 15))
    result += char

    // フィールドコンテンツを更新
    appStore.setFieldContent(field.field_id, result)

    // 全フィールドの結果をまとめてリアルタイムで反映
    const fullContent = appStore.buildGeneratedContentFromFields(doc.field_items || [])
    appStore.setGeneratedContent(fullContent)
  }

  appStore.setGeneratingFieldId(null)
}

// 編集ダイアログを開く
function openEditDialog() {
  if (!selectedPrompt.value) return
  editPromptName.value = selectedPrompt.value.title
  editPromptTarget.value = selectedPrompt.value.prompt_target
  showEditDialog.value = true
}

// 作成処理
async function handleCreate() {
  if (!newPromptName.value.trim() || !appStore.selectedDocumentId) return

  // 選択中の文書のフィールドを取得
  const doc = docStore.getById(appStore.selectedDocumentId)
  if (!doc) return

  try {
    const prompt = await promptStore.create(
      appStore.selectedDocumentId,
      newPromptName.value.trim(),
      newPromptTarget.value,
      doc.field_items || []
    )
    selectedId.value = prompt.prompt_id
    showCreateDialog.value = false
    newPromptName.value = ''
    newPromptTarget.value = 'all'
  } catch (e) {
    console.error('プロンプトの作成に失敗:', e)
  }
}

// 更新処理
async function handleUpdate() {
  if (!selectedId.value || !editPromptName.value.trim() || !selectedPrompt.value) return

  const targetChanged = editPromptTarget.value !== selectedPrompt.value.prompt_target

  try {
    if (targetChanged) {
      // タイプが変更された場合、古いデータを破棄して新しいタイプ用のデータを生成
      const doc = docStore.getById(appStore.selectedDocumentId!)
      if (!doc) return

      const fieldPromptItems = editPromptTarget.value === 'each'
        ? (doc.field_items || []).map(field => ({
            field_id: field.field_id,
            generation_prompt: '',
            correction_prompt: '',
          }))
        : [{
            field_id: null,
            generation_prompt: '',
            correction_prompt: '',
          }]

      await promptStore.update(selectedId.value, {
        title: editPromptName.value.trim(),
        promptTarget: editPromptTarget.value,
        fieldPromptItems,
      })
    } else {
      // タイプ変更なし: 名前のみ更新
      await promptStore.update(selectedId.value, { title: editPromptName.value.trim() })
    }

    showEditDialog.value = false
  } catch (e) {
    console.error('プロンプトの更新に失敗:', e)
  }
}

// 削除処理
async function handleDelete() {
  if (!selectedId.value) return
  try {
    await promptStore.remove(selectedId.value)
    selectedId.value = null
  } catch (e) {
    console.error('プロンプトの削除に失敗:', e)
  }
}
</script>

<style scoped>
.prompt-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgb(var(--v-theme-surface));
}

.column-header {
  display: flex;
  align-items: center;
  height: 40px;
  min-height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface-variant));
}

.column-title {
  font-weight: 600;
  font-size: 0.875rem;
}

.dropdown-area {
  padding: 12px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.prompt-edit-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.field-prompts-list {
  margin-top: 8px;
}
</style>
