<template>
  <div class="document-column">
    <!-- ヘッダー -->
    <div class="column-header">
      <span class="column-title">ドキュメント</span>
      <v-spacer />
      <v-btn icon="mdi-plus" size="small" variant="text" @click="showCreateDialog = true" />
      <v-btn
        icon="mdi-pencil"
        size="small"
        variant="text"
        :disabled="!appStore.selectedDocumentId"
        @click="openEditDialog"
      />
      <v-btn
        icon="mdi-delete"
        size="small"
        variant="text"
        color="error"
        :disabled="!appStore.selectedDocumentId"
        @click="handleDelete"
      />
    </div>

    <!-- 文書選択ドロップダウン -->
    <div class="dropdown-area">
      <v-select
        v-model="selectedId"
        :items="docStore.documents"
        item-title="title"
        item-value="id"
        label="文書を選択"
        variant="outlined"
        density="compact"
        hide-details
        clearable
      />
    </div>

    <!-- 文書情報 -->
    <div v-if="selectedDocument" class="document-info">
      <h3 class="document-title">{{ selectedDocument.title }}</h3>
      <v-list density="compact" class="field-list">
        <v-list-item
          v-for="field in selectedDocument.fields"
          :key="field.id"
          prepend-icon="mdi-form-textbox"
        >
          <v-list-item-title>{{ field.name }}</v-list-item-title>
          <v-list-item-subtitle class="text-truncate">
            {{ field.content || '(内容未設定)' }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="!selectedDocument.fields.length">
          <v-list-item-title class="text-medium-emphasis">
            フィールドがありません
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </div>

    <!-- 文書未選択時 -->
    <v-empty-state
      v-else
      icon="mdi-file-document-outline"
      title="文書を選択してください"
      text="ドロップダウンから文書を選択"
      class="mt-8"
    />

    <!-- 作成ダイアログ -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>新規文書作成</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newDocTitle"
            label="文書タイトル"
            variant="outlined"
            autofocus
            class="mb-4"
          />
          <div class="d-flex align-center mb-2">
            <span class="text-subtitle-2">フィールド</span>
            <v-spacer />
            <v-btn size="small" variant="text" @click="addNewField">
              <v-icon icon="mdi-plus" />
              追加
            </v-btn>
          </div>
          <v-card
            v-for="(field, index) in newFields"
            :key="index"
            variant="outlined"
            class="mb-3 pa-3"
          >
            <div class="d-flex align-center mb-2">
              <v-text-field
                v-model="field.name"
                label="フィールド名"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px"
              />
              <v-spacer />
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                @click="newFields.splice(index, 1)"
              />
            </div>
            <v-textarea
              v-model="field.content"
              label="元となる文書内容（必須）"
              variant="outlined"
              density="compact"
              rows="3"
              :rules="[v => !!v?.trim() || '内容を入力してください']"
              placeholder="このフィールドの元となる文書内容を入力..."
            />
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">キャンセル</v-btn>
          <v-btn color="primary" variant="flat" @click="handleCreate">作成</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 編集ダイアログ -->
    <v-dialog v-model="showEditDialog" max-width="600">
      <v-card>
        <v-card-title>文書を編集</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editDocTitle"
            label="文書タイトル"
            variant="outlined"
            class="mb-4"
          />
          <div class="d-flex align-center mb-2">
            <span class="text-subtitle-2">フィールド</span>
            <v-spacer />
            <v-btn size="small" variant="text" @click="addEditField">
              <v-icon icon="mdi-plus" />
              追加
            </v-btn>
          </div>
          <v-card
            v-for="(field, index) in editFields"
            :key="field.id"
            variant="outlined"
            class="mb-3 pa-3"
          >
            <div class="d-flex align-center mb-2">
              <v-text-field
                v-model="field.name"
                label="フィールド名"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px"
              />
              <v-spacer />
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                @click="editFields.splice(index, 1)"
              />
            </div>
            <v-textarea
              v-model="field.content"
              label="元となる文書内容（必須）"
              variant="outlined"
              density="compact"
              rows="3"
              :rules="[v => !!v?.trim() || '内容を入力してください']"
              placeholder="このフィールドの元となる文書内容を入力..."
            />
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showEditDialog = false">キャンセル</v-btn>
          <v-btn color="primary" variant="flat" @click="handleUpdate">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDocumentStore } from '@/stores/documents'
import { useAppStore } from '@/stores/app'
import type { Field } from '@/types'

const docStore = useDocumentStore()
const appStore = useAppStore()

// ローカル選択ID
const selectedId = ref<string | null>(null)

// ダイアログ状態
const showCreateDialog = ref(false)
const showEditDialog = ref(false)

// 新規作成用
const newDocTitle = ref('')
const newFields = ref<{ name: string; content: string }[]>([{ name: '', content: '' }])

// 編集用
const editDocTitle = ref('')
const editFields = ref<Field[]>([])

// 選択中の文書
const selectedDocument = computed(() => {
  if (!selectedId.value) return null
  return docStore.getById(selectedId.value)
})

// 選択変更時にストアに反映
watch(selectedId, (id) => {
  appStore.selectDocument(id)
  // 生成前コンテンツを更新
  if (id) {
    const doc = docStore.getById(id)
    if (doc) {
      const content = doc.fields.map(f => `## ${f.name}\n\n${f.content || ''}\n`).join('\n')
      appStore.setBeforeContent(content)
    }
  }
})

// フィールド追加（新規）
function addNewField() {
  newFields.value.push({ name: '', content: '' })
}

// フィールド追加（編集）
function addEditField() {
  editFields.value.push({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    content: '',
  })
}

// 編集ダイアログを開く
function openEditDialog() {
  if (!selectedDocument.value) return
  editDocTitle.value = selectedDocument.value.title
  editFields.value = selectedDocument.value.fields.map(f => ({ ...f }))
  showEditDialog.value = true
}

// 作成処理
function handleCreate() {
  if (!newDocTitle.value.trim()) return
  const fields = newFields.value
    .filter(f => f.name.trim() && f.content.trim())
    .map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: f.name.trim(),
      content: f.content.trim(),
    }))
  const doc = docStore.create(newDocTitle.value.trim(), fields)
  selectedId.value = doc.id
  showCreateDialog.value = false
  newDocTitle.value = ''
  newFields.value = [{ name: '', content: '' }]
}

// 更新処理
function handleUpdate() {
  if (!selectedId.value || !editDocTitle.value.trim()) return
  const fields = editFields.value.filter(f => f.name.trim() && f.content.trim())
  docStore.update(selectedId.value, { title: editDocTitle.value.trim(), fields })
  showEditDialog.value = false
}

// 削除処理
function handleDelete() {
  if (!selectedId.value) return
  docStore.remove(selectedId.value)
  selectedId.value = null
}
</script>

<style scoped>
.document-column {
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

.document-info {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.document-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: rgb(var(--v-theme-primary));
}

.field-list {
  background: transparent;
}
</style>
