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
          <v-chip class="mr-2" size="small" variant="tonal" color="secondary">
            <v-icon icon="mdi-account" size="small" start />
            {{ authStore.username || 'ユーザー' }}
          </v-chip>
          <v-btn
            icon="mdi-logout"
            size="small"
            variant="text"
            color="secondary"
            @click="handleLogout"
          />
        </div>
      </template>
    </v-app-bar>

    <v-main class="main-content">
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
  background: #C5D8E0 !important; /* くすんだ水色 */
  color: #3A4A54 !important;
}

.app-header :deep(.v-toolbar-title) {
  font-weight: 500;
}

.main-content {
  background: #F5F7F8;
}

.main-layout {
  display: flex;
  height: calc(100vh - 48px);
  overflow: hidden;
}

.column {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #D8E2E7;
  overflow: hidden;
  background: #FFFFFF;
}

.column:last-child {
  border-right: none;
}

.document-column {
  width: 280px;
  min-width: 280px;
  flex-shrink: 0;
  background: #EDF1F3;
}

.prompt-column {
  flex: 1;
  min-width: 300px;
}

.generate-column {
  flex: 1;
  min-width: 300px;
  background: #F8FAFB;
}
</style>
