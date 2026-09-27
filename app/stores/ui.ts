import { defineStore } from 'pinia'
import type { Toast, ToastType } from '~/composables/useToast'

interface UiState {
  toasts: Toast[]
  sidebarOpen: boolean
  chatOpen: boolean
}

let counter = 0

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    toasts: [],
    sidebarOpen: false,
    chatOpen: false,
  }),

  actions: {
    toast(message: string, type: ToastType = 'info', duration = 4000) {
      const id = ++counter
      this.toasts.push({ id, message, type })
      if (duration > 0) {
        setTimeout(() => this.dismiss(id), duration)
      }
      return id
    },
    success(message: string) {
      return this.toast(message, 'success')
    },
    error(message: string) {
      return this.toast(message, 'error', 5500)
    },
    info(message: string) {
      return this.toast(message, 'info')
    },
    dismiss(id: number) {
      const i = this.toasts.findIndex(t => t.id === id)
      if (i !== -1) this.toasts.splice(i, 1)
    },
    toggleSidebar(force?: boolean) {
      this.sidebarOpen = force ?? !this.sidebarOpen
    },
  },
})
