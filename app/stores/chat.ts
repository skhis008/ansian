import { defineStore } from 'pinia'
import type { ChatMessage, Conversation } from '#shared/types'
import { http } from '~/composables/useApi'

interface ChatState {
  conversations: Conversation[]
  activeId: number | null
  messages: Record<number, ChatMessage[]>
  loadingList: boolean
  loadingMessages: boolean
  sending: boolean
  typing: Record<number, boolean>
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    conversations: [],
    activeId: null,
    messages: {},
    loadingList: false,
    loadingMessages: false,
    sending: false,
    typing: {},
  }),

  getters: {
    activeConversation: state => state.conversations.find(c => c.id === state.activeId) ?? null,
    totalUnread: state => state.conversations.reduce((a, c) => a + c.unread_count, 0),
    messagesOf: state => (id: number) => state.messages[id] ?? [],
  },

  actions: {
    async fetchConversations() {
      this.loadingList = true
      try {
        const res = await http.get<{ data: Conversation[] }>('/conversations')
        this.conversations = res.data
      } finally {
        this.loadingList = false
      }
    },

    async fetchMessages(conversationId: number) {
      this.activeId = conversationId
      this.loadingMessages = true
      try {
        const res = await http.get<{ data: ChatMessage[] }>(`/messages/${conversationId}`, { per_page: 50 })
        this.messages[conversationId] = res.data
        await this.markRead(conversationId)
      } finally {
        this.loadingMessages = false
      }
    },

    async openConversation(rideCode?: string) {
      if (rideCode) {
        const res = await http.post<{ data: Conversation }>('/conversations', { ride_code: rideCode })
        const conv = res.data
        if (!this.conversations.some(c => c.id === conv.id)) this.conversations.unshift(conv)
        await this.fetchMessages(conv.id)
        return conv
      }
      this.activeId = this.conversations[0]?.id ?? null
      if (this.activeId) await this.fetchMessages(this.activeId)
      return this.activeConversation
    },

    async send(conversationId: number, body: string, type: ChatMessage['type'] = 'text') {
      this.sending = true
      try {
        const res = await http.post<{ data: ChatMessage }>(`/conversations/${conversationId}/messages`, {
          body,
          type,
        })
        const list = (this.messages[conversationId] ??= [])
        if (!list.some(m => m.id === res.data.id)) list.push(res.data)
        this.bumpPreview(conversationId, res.data)
        return res.data
      } finally {
        this.sending = false
      }
    },

    /** Pesan dari websocket — tidak perlu request ulang */
    pushIncoming(conversationId: number, message: ChatMessage) {
      const list = (this.messages[conversationId] ??= [])
      if (list.some(m => m.id === message.id)) return
      list.push(message)

      const conv = this.conversations.find(c => c.id === conversationId)
      if (conv) {
        conv.last_message = message
        conv.updated_at = message.created_at
        if (!message.is_mine && conv.id !== this.activeId) conv.unread_count += 1
        this.conversations = [conv, ...this.conversations.filter(c => c.id !== conv.id)]
      } else {
        void this.fetchConversations()
      }
    },

    setTyping(conversationId: number, value: boolean) {
      this.typing[conversationId] = value
    },

    async markRead(conversationId: number) {
      const conv = this.conversations.find(c => c.id === conversationId)
      if (!conv || conv.unread_count === 0) return
      conv.unread_count = 0
      await http.post(`/conversations/${conversationId}/read`).catch(() => undefined)
    },

    bumpPreview(conversationId: number, message: ChatMessage) {
      const conv = this.conversations.find(c => c.id === conversationId)
      if (!conv) return
      conv.last_message = message
      conv.updated_at = message.created_at
      this.conversations = [conv, ...this.conversations.filter(c => c.id !== conv.id)]
    },

    clear() {
      this.$reset()
    },
  },
})
