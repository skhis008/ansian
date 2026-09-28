<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { formatRelative } from '#shared/utils/format'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Chat', robots: 'noindex, nofollow' })

const chat = useChatStore()
const auth = useAuthStore()
const toast = useToast()

const selected = ref<number | null>(null)
const conversation = computed(() => chat.conversations.find(c => c.id === chat.activeId) ?? null)
const messages = computed(() => (chat.activeId ? chat.messagesOf(chat.activeId) : []))

onMounted(async () => {
  await chat.fetchConversations()
  const first = chat.conversations[0]
  if (first) {
    selected.value = first.id
    await chat.fetchMessages(first.id)
  }
})

async function pick(id: number) {
  selected.value = id
  await chat.fetchMessages(id)
}

async function send(body: string) {
  if (!chat.activeId) return
  try {
    await chat.send(chat.activeId, body)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal mengirim pesan.')
  }
}

function openRide(code: string) {
  toast.info(`Membuka perjalanan ${code}…`)
  void navigateTo('/driver/rides')
}
</script>

<template>
  <div class="space-y-4">
    <AppPageHeader title="Chat" description="Percakapan dengan pelanggan.">
      <template #actions>
        <UiBadge tone="gray">{{ chat.conversations.length }} percakapan</UiBadge>
      </template>
    </AppPageHeader>

    <div class="grid gap-4 lg:grid-cols-4">
      <UiCard :padded="false" class="overflow-hidden lg:col-span-1">
        <div class="border-b border-ink-100 px-4 py-3">
          <p class="text-xs font-bold tracking-wide text-ink-400 uppercase">Percakapan</p>
        </div>

        <div v-if="chat.loadingList" class="space-y-2 p-3">
          <UiSkeletonBlock v-for="i in 4" :key="i" :lines="2" />
        </div>

        <div v-else-if="!chat.conversations.length" class="p-6 text-center">
          <UiIcon name="message-circle" class="mx-auto size-7 text-ink-300" />
          <p class="mt-2 text-[13px] font-semibold text-ink-700">Belum ada chat</p>
          <p class="mt-1 text-[11px] text-ink-500">Chat muncul setelah kamu menerima perjalanan.</p>
        </div>

        <ul v-else class="max-h-[calc(100dvh-16rem)] divide-y divide-ink-100 overflow-y-auto">
          <li v-for="c in chat.conversations" :key="c.id">
            <button
              type="button"
              class="flex w-full items-center gap-3 p-3 text-left transition"
              :class="selected === c.id ? 'bg-brand-50' : 'hover:bg-ink-50'"
              @click="pick(c.id)"
            >
              <UiAvatar :name="c.counterpart.name" :src="c.counterpart.avatar_url" :size="40" />
              <span class="min-w-0 flex-1">
                <span class="flex items-baseline justify-between gap-2">
                  <span class="truncate text-[13px] font-bold text-ink-900">{{ c.counterpart.name }}</span>
                  <span class="shrink-0 text-[9px] text-ink-400">{{ formatRelative(c.updated_at) }}</span>
                </span>
                <span class="block truncate text-[11px] text-ink-500">{{ c.last_message?.body ?? 'Mulai chat' }}</span>
              </span>
              <span
                v-if="c.unread_count > 0"
                class="grid min-w-4 shrink-0 place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white"
              >
                {{ c.unread_count }}
              </span>
            </button>
          </li>
        </ul>
      </UiCard>

      <UiCard :padded="false" class="overflow-hidden lg:col-span-3">
        <ChatWindow
          v-if="conversation"
          :conversation="conversation"
          :messages="messages"
          :loading="chat.loadingMessages"
          :sending="chat.sending"
          :typing="chat.activeId ? chat.typing[chat.activeId] : false"
          :my-avatar="auth.user?.avatar_url"
          :ride-code="conversation.ride_code"
          @send="send"
          @open-ride="openRide"
        />
        <div v-else class="grid h-[calc(100dvh-16rem)] place-items-center p-8 text-center">
          <div>
            <UiIcon name="message-square" class="mx-auto size-9 text-ink-300" />
            <p class="mt-3 text-sm font-semibold text-ink-700">Pilih percakapan</p>
            <p class="mt-1 text-xs text-ink-500">Pilih salah satu chat di samping untuk membaca dan membalas.</p>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
