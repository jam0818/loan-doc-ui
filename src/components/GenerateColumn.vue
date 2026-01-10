<template>
  <div class="generate-column">
    <!-- ヘッダー -->
    <div class="column-header">
      <span class="column-title">生成</span>
      <v-spacer />
      <v-btn
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="mdi-creation"
        :loading="isGenerating"
        :disabled="!canGenerate"
        @click="handleGenerate"
      >
        一括生成
      </v-btn>
    </div>

    <!-- 表示モードトグル -->
    <div class="toggle-area">
      <v-btn-toggle
        v-model="viewMode"
        mandatory
        density="compact"
        color="primary"
      >
        <v-btn value="before" size="small">
          <v-icon icon="mdi-file-document-outline" class="mr-1" />
          生成前
        </v-btn>
        <v-btn value="after" size="small">
          <v-icon icon="mdi-file-document-check" class="mr-1" />
          生成後
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- Markdownエディタ -->
    <div class="editor-area">
      <v-textarea
        v-model="editorContent"
        variant="outlined"
        hide-details
        :placeholder="viewMode === 'before' ? '生成前の文書内容' : '生成結果がここに表示されます'"
        :readonly="viewMode === 'before'"
        class="markdown-editor"
        rows="20"
      />

      <!-- 生成中インジケーター -->
      <div v-if="isGenerating" class="generating-indicator">
        <v-progress-circular indeterminate size="20" width="2" color="primary" />
        <span class="ml-2">
          {{ appStore.generatingFieldId ? `${appStore.generatingFieldId.slice(-6)} を生成中...` : '生成中...' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useDocumentStore } from '@/stores/documents'
import { usePromptStore } from '@/stores/prompts'
import type { ViewMode } from '@/types'

const appStore = useAppStore()
const docStore = useDocumentStore()
const promptStore = usePromptStore()

// 表示モード
const viewMode = ref<ViewMode>('before')

// 生成中フラグ
const isGenerating = computed(() => appStore.generatingFieldId !== null)

// 生成可能かどうか
const canGenerate = computed(() => {
  return appStore.selectedDocumentId && appStore.selectedPromptId && !isGenerating.value
})

// エディタの内容
const editorContent = computed({
  get() {
    return viewMode.value === 'before'
      ? appStore.beforeContent
      : appStore.generatedContent
  },
  set(value: string) {
    if (viewMode.value === 'after') {
      appStore.setGeneratedContent(value)
    }
  }
})

// 表示モード変更をストアに反映
watch(viewMode, (mode) => {
  appStore.setViewMode(mode)
})

/**
 * 一括生成処理（モック実装）
 * 実際の実装ではイベントストリームで生成
 */
async function handleGenerate() {
  if (!appStore.selectedDocumentId || !appStore.selectedPromptId) return

  const doc = docStore.getById(appStore.selectedDocumentId)
  const prompt = promptStore.getById(appStore.selectedPromptId)
  if (!doc || !prompt) return

  // 生成コンテンツをリセット
  appStore.setGeneratedContent('')

  // 生成開始時に「生成後」タブに切り替え
  viewMode.value = 'after'

  // 各フィールドを順次生成（モック）
  for (const field of doc.field_items || []) {
    appStore.setGeneratingFieldId(field.field_id)

    // ストリーム風にテキストを追加
    const header = `## ${field.name}\n\n`
    appStore.appendGeneratedContent(header)

    // モック生成（実際はAPIからストリーム）
    let promptText = ''
    if (prompt.prompt_target === 'all') {
      const fp = prompt.field_prompt_items?.find(f => f.field_id === null)
      promptText = fp ? (appStore.promptMode === 'generate' ? fp.generation_prompt : fp.correction_prompt) : ''
    } else {
      const fp = prompt.field_prompt_items?.find(f => f.field_id === field.field_id)
      promptText = fp ? (appStore.promptMode === 'generate' ? fp.generation_prompt : fp.correction_prompt) : ''
    }

    const mockContent = `【${field.name}の生成結果】\nプロンプト: ${promptText || '(未設定)'}\n元の内容: ${field.content || '(なし)'}\n\n`

    // 文字を1つずつ追加してストリーム風に表示
    for (const char of mockContent) {
      await new Promise(resolve => setTimeout(resolve, 20))
      appStore.appendGeneratedContent(char)
    }

    appStore.appendGeneratedContent('\n')
  }

  appStore.setGeneratingFieldId(null)

  // 生成後表示に切り替え
  viewMode.value = 'after'

  // 修正用プロンプトモードに自動切り替え
  appStore.setPromptMode('revise')
}
</script>

<style scoped>
.generate-column {
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

.toggle-area {
  padding: 12px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.editor-area {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.markdown-editor {
  flex: 1;
}

.markdown-editor :deep(textarea) {
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}

.generating-indicator {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
  border-radius: 8px;
  margin-top: 8px;
  color: rgb(var(--v-theme-primary));
  font-size: 0.875rem;
}
</style>
