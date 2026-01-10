import type { UserModel } from '@/types'
/**
 * 認証ストア
 * ログイン状態、ユーザー情報、トークンを管理
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi, setAuthToken } from '@/api'

/** ローカルストレージのキー */
const TOKEN_KEY = 'loan-doc-ui:auth_token'

export const useAuthStore = defineStore('auth', () => {
  /** 認証トークン */
  const token = ref<string | null>(null)

  /** 現在のユーザー名 */
  const username = ref<string | null>(null)

  /** ローディング状態 */
  const loading = ref(false)

  /** エラーメッセージ */
  const error = ref<string | null>(null)

  /** ログイン済みかどうか */
  const isLoggedIn = computed(() => !!token.value)

  /**
     * 初期化：LocalStorageからトークンを復元
     */
  function initialize (): void {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      token.value = storedToken
      setAuthToken(storedToken)
    }
  }

  /**
     * ログイン
     */
  async function login (credentials: UserModel): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.login(credentials)
      token.value = response.token
      username.value = credentials.username

      // LocalStorageに保存
      localStorage.setItem(TOKEN_KEY, response.token)

      return true
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'ログインに失敗しました'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
     * ログアウト
     */
  function logout (): void {
    token.value = null
    username.value = null
    setAuthToken(null)
    localStorage.removeItem(TOKEN_KEY)
  }

  /**
     * トークンが有効かどうかを確認（簡易実装）
     */
  function isTokenValid (): boolean {
    return !!token.value
  }

  return {
    token,
    username,
    loading,
    error,
    isLoggedIn,
    initialize,
    login,
    logout,
    isTokenValid,
  }
})
