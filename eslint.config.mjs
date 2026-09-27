// Konfigurasi ESLint flat untuk Nuxt.
// File ini dibuat otomatis oleh modul `@nuxt/eslint` → `.nuxt/eslint.config.mjs`
// Jangan edit `.nuxt/` (di-ignore git, dibuat ulang tiap `nuxt prepare`).
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // TODO: naikkan ke 'error' setelah codebase bersih
    '@typescript-eslint/no-explicit-any': 'warn',
  },
})
