/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Styles
import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')

// E2Eテスト用のストア公開
import { useAppStore } from '@/stores/app'
import { useDocumentStore } from '@/stores/documents'
import { usePromptStore } from '@/stores/prompts'

const appStore = useAppStore()
const docStore = useDocumentStore()
const promptStore = usePromptStore()

// @ts-ignore
window.appStore = appStore
// @ts-ignore
window.docStore = docStore
// @ts-ignore
window.promptStore = promptStore
