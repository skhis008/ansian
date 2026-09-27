import { defineStore } from 'pinia'
import type { AppNotification } from '#shared/types'
import { http } from '~/composables/useApi'

interface NotificationState {
  items: AppNotification[]
  loading: boolean
  unread: number
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    items: [],
    loading: false,
    unread: 0,
  }),

  actions: {
    async fetch() {
      this.loading = true
      try {
        const res = await http.get<{ data: AppNotification[] }>('/notifications', { per_page: 20 })
        this.items = res.data
        this.unread = res.data.filter(n => !n.read_at).length
      } finally {
        this.loading = false
      }
    },

    push(notification: AppNotification) {
      if (this.items.some(n => n.id === notification.id)) return
      this.items.unshift(notification)
      this.unread += 1
    },

    async markRead(id: number) {
      const item = this.items.find(n => n.id === id)
      if (!item || item.read_at) return
      item.read_at = new Date().toISOString()
      this.unread = Math.max(0, this.unread - 1)
      await http.post(`/notifications/${id}/read`).catch(() => undefined)
    },

    async markAllRead() {
      if (this.unread === 0) return
      for (const n of this.items) n.read_at = n.read_at ?? new Date().toISOString()
      this.unread = 0
      await http.post('/notifications/read-all').catch(() => undefined)
    },
  },
})
