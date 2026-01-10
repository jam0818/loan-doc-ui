<template>
  <div class="document-column">
    <!-- ヘッダー -->
    <div class="column-header">
      <span class="column-title">ドキュメント</span>
      <v-spacer />
      <v-btn icon="mdi-plus" size="small" variant="text" @click="showCreateDialog = true" />
      <v-btn
        :disabled="!appStore.selectedDocumentId"
        icon="mdi-pencil"
        size="small"
        variant="text"
        @click="openEditDialog"
      />
      <v-btn
        color="error"
        :disabled="!appStore.selectedDocumentId"
        icon="mdi-delete"
        size="small"
        variant="text"
        @click="handleDelete"
      />
    </div>

    <!-- 文書選択ドロップダウン -->
    <div class="dropdown-area">
      <v-select
        v-model="selectedId"
        clearable
        density="compact"
        hide-details
        item-title="title"
        item-value="document_id"
        :items="docStore.documents"
        label="文書を選択"
        variant="outlined"
      />
    </div>

    <!-- 文書情報 -->
    <div v-if="selectedDocument" class="document-info">
      <h3 class="document-title">{{ selectedDocument.title }}</h3>
      <v-list class="field-list" density="compact">
        <v-list-item
          v-for="field in selectedDocument.field_items"
          :key="field.field_id"
          prepend-icon="mdi-form-textbox"
        >
          <v-list-item-title>{{ field.name }}</v-list-item-title>
          <v-list-item-subtitle class="text-truncate">
            {{ field.content || '(内容未設定)' }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="!selectedDocument.field_items?.length">
          <v-list-item-title class="text-medium-emphasis">
            フィールドがありません
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </div>

    <!-- 文書未選択時 -->
    <v-empty-state
      v-else
      class="mt-8"
      icon="mdi-file-document-outline"
      text="ドロップダウンから文書を選択"
      title="文書を選択してください"
    />

    <!-- 作成ダイアログ -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>新規文書作成</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newDocTitle"
            autofocus
            class="mb-4"
            label="文書タイトル"
            variant="outlined"
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
            class="mb-3 pa-3"
            variant="outlined"
          >
            <div class="d-flex align-center mb-2">
              <v-text-field
                v-model="field.name"
                density="compact"
                hide-details
                label="フィールド名"
                style="max-width: 200px"
                variant="outlined"
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
              density="compact"
              label="元となる文書内容（必須）"
              placeholder="このフィールドの元となる文書内容を入力..."
              rows="3"
              :rules="[v => !!v?.trim() || '内容を入力してください']"
              variant="outlined"
            />
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">キャンセル</v-btn>
          <v-btn color="primary" :loading="docStore.loading" variant="flat" @click="handleCreate">作成</v-btn>
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
            class="mb-4"
            label="文書タイトル"
            variant="outlined"
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
            :key="field.field_id ?? `new-${index}`"
            class="mb-3 pa-3"
            variant="outlined"
          >
            <div class="d-flex align-center mb-2">
              <v-text-field
                v-model="field.name"
                density="compact"
                hide-details
                label="フィールド名"
                style="max-width: 200px"
                variant="outlined"
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
              density="compact"
              label="元となる文書内容（必須）"
              placeholder="このフィールドの元となる文書内容を入力..."
              rows="3"
              :rules="[v => !!v?.trim() || '内容を入力してください']"
              variant="outlined"
            />
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showEditDialog = false">キャンセル</v-btn>
          <v-btn color="primary" :loading="docStore.loading" variant="flat" @click="handleUpdate">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import type { FieldItemUpdate } from '@/types'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useAppStore } from '@/stores/app'
  import { useDocumentStore } from '@/stores/documents'

  const docStore = useDocumentStore()
  const appStore = useAppStore()

  // ローカル選択ID
  const selectedId = ref<string | null>(null)

  // ダイアログ状態
  const showCreateDialog = ref(false)
  const showEditDialog = ref(false)

  // 新規作成用
  const newDocTitle = ref('')
  const newFields = ref<{ name: string, content: string }[]>([{ name: '', content: '' }])

  // 編集用
  const editDocTitle = ref('')
  const editFields = ref<FieldItemUpdate[]>([])

  // 選択中の文書
  const selectedDocument = computed(() => {
    if (!selectedId.value) return null
    return docStore.getById(selectedId.value)
  })

  // 初期化時に文書一覧を取得
  onMounted(async () => {
    try {
      await docStore.fetchList()
    } catch (error) {
      console.error('文書一覧の取得に失敗:', error)
    }
  })

  // 選択変更時にストアに反映
  watch(selectedId, id => {
    appStore.selectDocument(id)
    // 生成前コンテンツを更新
    if (id) {
      const doc = docStore.getById(id)
      if (doc && doc.field_items) {
        const content = doc.field_items.map(f => `## ${f.name}\n\n${f.content || ''}\n`).join('\n')
        appStore.setBeforeContent(content)
      }
    }
  })

  // フィールド追加（新規）
  function addNewField () {
    newFields.value.push({ name: '', content: '' })
  }

  // フィールド追加（編集）
  function addEditField () {
    editFields.value.push({
      field_id: null, // 新規フィールド
      name: '',
      content: '',
    })
  }

  // 編集ダイアログを開く
  function openEditDialog () {
    if (!selectedDocument.value) return
    editDocTitle.value = selectedDocument.value.title
    editFields.value = (selectedDocument.value.field_items || []).map(f => ({
      field_id: f.field_id,
      name: f.name,
      content: f.content,
    }))
    showEditDialog.value = true
  }

  // 作成処理
  async function handleCreate () {
    if (!newDocTitle.value.trim()) return
    const fields = newFields.value.filter(f => f.name.trim() && f.content.trim())
    try {
      const doc = await docStore.create(newDocTitle.value.trim(), fields)
      selectedId.value = doc.document_id
      showCreateDialog.value = false
      newDocTitle.value = ''
      newFields.value = [{ name: '', content: '' }]
    } catch (error) {
      console.error('文書の作成に失敗:', error)
    }
  }

  // 更新処理
  async function handleUpdate () {
    if (!selectedId.value || !editDocTitle.value.trim()) return
    const fields = editFields.value.filter(f => f.name.trim() && f.content.trim())
    try {
      await docStore.update(selectedId.value, {
        title: editDocTitle.value.trim(),
        fieldItems: fields,
      })
      showEditDialog.value = false
    } catch (error) {
      console.error('文書の更新に失敗:', error)
    }
  }

  // 削除処理
  async function handleDelete () {
    if (!selectedId.value) return
    try {
      await docStore.remove(selectedId.value)
      selectedId.value = null
    } catch (error) {
      console.error('文書の削除に失敗:', error)
    }
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
