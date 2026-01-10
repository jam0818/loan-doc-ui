<template>
  <v-app>
    <!-- アプリヘッダー -->
    <v-app-bar class="app-header" density="compact" flat>
      <v-app-bar-title>
        <v-icon class="mr-2" icon="mdi-file-document-edit" />
        文書生成アプリケーション
      </v-app-bar-title>

      <template #append>
        <div class="d-flex align-center">
          <v-chip class="mr-2" size="small" variant="tonal">
            <v-icon icon="mdi-account" size="small" start />
            {{ authStore.username || 'ユーザー' }}
          </v-chip>
          <v-btn
            icon="mdi-logout"
            size="small"
            variant="text"
            @click="handleLogout"
          />
        </div>
      </template>
    </v-app-bar>

    <v-main>
      <div class="main-layout">
        <DocumentColumn class="column document-column" />
        <PromptColumn class="column prompt-column" />
        <GenerateColumn class="column generate-column" />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import DocumentColumn from '@/components/DocumentColumn.vue'
  import GenerateColumn from '@/components/GenerateColumn.vue'
  import PromptColumn from '@/components/PromptColumn.vue'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()

  onMounted(() => {
    authStore.initialize()
  })

  function handleLogout () {
    authStore.logout()
    router.push('/login')
  }
</script>

<style scoped>
.app-header {
  background: #b8d4e3 !important; /* 薄いくすんだ水色 */
  color: #2c3e50 !important;
}

.app-header :deep(.v-toolbar-title) {
  font-weight: 600;
}

.main-layout {
  display: flex;
  height: calc(100vh - 48px); /* ヘッダー分を引く */
  overflow: hidden;
}

.column {
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.column:last-child {
  border-right: none;
}

.document-column {
  width: 280px;
  min-width: 280px;
  flex-shrink: 0;
}

.prompt-column {
  flex: 1;
  min-width: 300px;
}

.generate-column {
  flex: 1;
  min-width: 300px;
}
</style>
