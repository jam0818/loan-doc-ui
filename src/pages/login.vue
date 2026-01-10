<route lang="yaml">
meta:
  layout: blank
</route>

<template>
  <v-container class="login-container" fluid>
    <v-row align="center" class="fill-height" justify="center">
      <v-col cols="12" lg="3" md="4" sm="6">
        <!-- タイトル -->
        <div class="text-center mb-6">
          <v-icon class="mb-2" color="primary" icon="mdi-file-document-edit" size="48" />
          <h1 class="text-h5 font-weight-medium text-secondary">文書生成アプリケーション</h1>
        </div>

        <!-- ログインフォーム -->
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="username"
            bg-color="white"
            class="mb-3"
            density="comfortable"
            label="ユーザー名"
            prepend-inner-icon="mdi-account"
            variant="outlined"
          />

          <v-text-field
            v-model="password"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            bg-color="white"
            class="mb-3"
            density="comfortable"
            label="パスワード"
            prepend-inner-icon="mdi-lock"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-alert
            v-if="authStore.error"
            class="mb-3"
            density="compact"
            type="error"
            variant="tonal"
          >
            {{ authStore.error }}
          </v-alert>

          <v-btn
            block
            color="primary"
            :disabled="!isFormValid"
            :loading="authStore.loading"
            size="large"
            type="submit"
          >
            ログイン
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
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

  async function handleLogin () {
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
  background: #EDF1F3;
}
</style>
