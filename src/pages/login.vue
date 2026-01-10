<route lang="yaml">
meta:
  layout: blank
</route>

<template>
  <v-container class="login-container" fluid>
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="6" md="4" lg="3">
        <!-- タイトル -->
        <div class="text-center mb-6">
          <v-icon icon="mdi-file-document-edit" size="48" color="primary" class="mb-2" />
          <h1 class="text-h5 font-weight-medium">文書生成アプリケーション</h1>
        </div>

        <!-- ログインフォーム -->
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="username"
            label="ユーザー名"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account"
            class="mb-3"
          />

          <v-text-field
            v-model="password"
            label="パスワード"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-lock"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            class="mb-3"
          />

          <v-alert
            v-if="authStore.error"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            {{ authStore.error }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="authStore.loading"
            :disabled="!isFormValid"
          >
            ログイン
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

const isFormValid = computed(() => {
  return username.value.trim() !== '' && password.value.trim() !== ''
})

async function handleLogin() {
  if (!isFormValid.value) return

  const success = await authStore.login({
    username: username.value,
    password: password.value,
  })

  if (success) {
    router.push('/')
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>
