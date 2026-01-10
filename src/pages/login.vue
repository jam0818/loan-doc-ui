<route lang="yaml">
meta:
  layout: blank
</route>

<template>
  <v-container class="login-container" fluid>
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="4">
        <v-card class="login-card" elevation="8">
          <v-card-title class="text-h5 text-center pa-6">
            <v-icon icon="mdi-file-document-edit" size="large" class="mr-2" />
            文書生成アプリケーション
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                label="ユーザー名"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :error-messages="authStore.error ? '' : undefined"
                autofocus
                class="mb-4"
              />

              <v-text-field
                v-model="password"
                label="パスワード"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                class="mb-4"
              />

              <v-alert
                v-if="authStore.error"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-4"
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
          </v-card-text>
        </v-card>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  border-radius: 16px;
}
</style>
