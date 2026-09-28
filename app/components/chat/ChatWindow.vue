<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { ChatMessage, Conversation } from '#shared/types'

const props = defineProps<{
  conversation: Conversation | null
  messages: ChatMessage[]
  loading?: boolean
  sending?: boolean
  myAvatar?: string | null
  typing?: boolean
  rideCode?: string | null
}>()

const emit = defineEmits<{ send: [body: string]; openRide: [rideCode: string] }>()

const draft = ref('')
const scrollEl = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isTypingReply = ref(false)

const canSend = computed(() => draft.value.trim().length > 0 && !props.sending)

function scrollToBottom(smooth = true) {
  nextTick(() => {
    const el = scrollEl.value
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  })
}

watch(() => props.messages.length, () => scrollToBottom())
watch(() => props.conversation?.id, () => scrollToBottom(false))

function autoGrow() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

async function send() {
  if (!canSend.value) return
  const body = draft.value.trim()
  draft.value = ''
  nextTick(autoGrow)
  emit('send', body)

  // Simulasi "sedang mengetik" untuk lawas di mode mock
  if (props.conversation && props.conversation.counterpart.id !== 0) {
    isTypingReply.value = true
    setTimeout(() => (isTypingReply.value = false), 1800)
  }
  scrollToBottom()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <div class="flex h-full flex-col bg-ink-50">
    <!-- Header -->
    <div v-if="conversation" class="flex items-center gap-3 border-b border-ink-200 bg-white px-4 py-3">
      <div class="relative">
        <UiAvatar :name="conversation.counterpart.name" :src="conversation.counterpart.avatar_url" :size="40" />
        <span class="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-emerald-500" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-ink-900">{{ conversation.counterpart.name }}</p>
        <p class="text-[11px] text-emerald-600">Online · biasanya membalas dalam 1 menit</p>
      </div>
      <button
        v-if="rideCode"
        type="button"
        class="hidden items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 sm:inline-flex"
        @click="emit('openRide', rideCode)"
      >
        <UiIcon name="navigation" class="size-3.5" />
        {{ rideCode }}
      </button>
    </div>

    <!-- Messages -->
    <div ref="scrollEl" class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 4" :key="i" class="flex gap-2.5">
          <div class="skeleton size-8 rounded-full" />
          <div class="skeleton h-10 w-2/5 rounded-2xl" />
        </div>
      </div>

      <template v-else>
        <p v-if="!messages.length" class="py-10 text-center text-sm text-ink-400">
          Belum ada pesan. Sapa {{ conversation?.counterpart.name.split(' ')[0] }} sekarang!
        </p>

        <ChatBubble
          v-for="m in messages"
          :key="m.id"
          :message="m"
          :show-avatar="!m.is_mine"
          :avatar="!m.is_mine ? conversation?.counterpart.avatar_url : myAvatar"
          :name="m.sender_name"
        />

        <div v-if="typing || isTypingReply" class="flex items-center gap-2.5">
          <div class="w-8 shrink-0">
            <UiAvatar :name="conversation?.counterpart.name ?? '?'" :src="conversation?.counterpart.avatar_url" :size="32" />
          </div>
          <div class="flex items-center gap-1 rounded-2xl rounded-bl-md bg-ink-100 px-3.5 py-2.5">
            <span class="size-1.5 animate-bounce-dot rounded-full bg-ink-400" />
            <span class="size-1.5 animate-bounce-dot rounded-full bg-ink-400 [animation-delay:150ms]" />
            <span class="size-1.5 animate-bounce-dot rounded-full bg-ink-400 [animation-delay:300ms]" />
          </div>
        </div>
      </template>
    </div>

    <!-- Input -->
    <form class="flex items-end gap-2 border-t border-ink-200 bg-white p-3" @submit.prevent="send">
      <div class="relative flex-1">
        <textarea
          ref="textareaRef"
          v-model="draft"
          rows="1"
          placeholder="Tulis pesan…"
          class="max-h-30 w-full resize-none rounded-2xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-3 focus:ring-brand-500/15"
          @input="autoGrow"
          @keydown="onKeydown"
        />
      </div>
      <button
        type="submit"
        :disabled="!canSend"
        class="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600"
        aria-label="Kirim pesan"
      >
        <UiIcon name="send" class="size-[18px]" />
      </button>
    </form>
  </div>
</template>
