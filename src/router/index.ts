/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 * 認証ガードを追加
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// 認証ガード
router.beforeEach((to, _from, next) => {
  const TOKEN_KEY = 'loan-doc-ui:auth_token'
  const token = localStorage.getItem(TOKEN_KEY)
  const isLoggedIn = !!token

  // ログインページへのアクセス
  if (to.path === '/login') {
    // すでにログイン済みならトップへリダイレクト
    if (isLoggedIn) {
      next('/')
    } else {
      next()
    }
    return
  }

  // その他のページは認証必須
  if (!isLoggedIn) {
    next('/login')
    return
  }

  next()
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
