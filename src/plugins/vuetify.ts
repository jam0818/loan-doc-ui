/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// くすんだ水色と薄めの灰色を基調としたライトテーマ
const lightTheme = {
  dark: false,
  colors: {
    // 背景系
    'background': '#F5F7F8',
    'surface': '#FFFFFF',
    'surface-variant': '#EDF1F3',

    // プライマリ（くすんだ水色）
    'primary': '#7BA3B5',
    'primary-darken-1': '#5D8A9E',

    // セカンダリ（薄めの灰色）
    'secondary': '#8A9BA8',
    'secondary-darken-1': '#6B8090',

    // アクセント
    'accent': '#A8C5D3',

    // ステータス色（控えめに）
    'error': '#C57B7B',
    'info': '#7BA3B5',
    'success': '#7BB58A',
    'warning': '#B5A87B',

    // テキスト
    'on-background': '#3A4A54',
    'on-surface': '#3A4A54',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
  },
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
    },
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      color: 'primary',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VTextarea: {
      variant: 'outlined',
      color: 'primary',
    },
    VCard: {
      variant: 'flat',
    },
    VAppBar: {
      flat: true,
    },
  },
})
