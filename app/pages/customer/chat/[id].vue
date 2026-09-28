<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Percakapan', robots: 'noindex, nofollow' })

const chat = useChatStore()
const auth = useAuthStore()
const route = useRoute()
const toast = useToast()
const realtime = useRealtime()

const conversation = computed(() => chat.activeConversation)
const messages = computed(() => (chat.activeId ? chat.messagesOf(chat.activeId) : []))

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) {
    await navigateTo('/customer/chat', { replace: true })
    return
  }
  await chat.fetchConversations()
  await chat.fetchMessages(id)
})

/* Realtime: dengarkan channel ride untuk pesan baru */
watch(
  () => conversation.value?.ride_code,
  code => {
    if (code) realtime.bindRide(code)
  },
  { immediate: true },
)

async function send(body: string) {
  if (!chat.activeId) return
  try {
    await chat.send(chat.activeId, body)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal mengirim pesan.')
  }
}

function openRide(code: string) {
  navigateTo(`/customer/rides?search=${code}`)
}
</script>

<template>
  <div>
    <AppPageHeader title="Percakapan">
      <template #actions>
        <UiButton to="/customer/chat" variant="ghost" size="sm">
          <template #icon><UiIcon name="arrow-left" class="size-4" /></template>
          Semua chat
        </UiButton>
      </template>
    </AppPageHeader>

    <div class="grid gap-4 lg:grid-cols-4">
      <!-- List (desktop) -->
      <div class="hidden lg:col-span-1 lg:block">
        <UiCard :padded="false" class="overflow-hidden">
          <div class="border-b border-ink-100 p-3">
            <p class="px-1 text-xs font-bold tracking-wide text-ink-400 uppercase">Percakapan</p>
          </div>
          <ul class="max-h-[calc(100dvh-16rem)] divide-y divide-ink-100 overflow-y-auto">
            <li v-for="c in chat.conversations" :key="c.id">
              <button
                type="button"
                class="flex w-full items-center gap-3 p-3 text-left transition"
                :class="chat.activeId === c.id ? 'bg-brand-50' : 'hover:bg-ink-50'"
                @click="chat.fetchMessages(c.id)"
              >
                <UiAvatar :name="c.counterpart.name" :src="c.counterpart.avatar_url" :size="38" />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[13px] font-bold text-ink-900">{{ c.counterpart.name }}</span>
                  <span class="block truncate text-[11px] text-ink-500">{{ c.last_message?.body ?? '—' }}</span>
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
      </div>

      <!-- Window -->
      <div class="lg:col-span-3">
        <UiCard :padded="false" class="h-[calc(100dvh-13rem)] overflow-hidden">
          <ChatWindow
            :conversation="conversation"
            :messages="messages"
            :loading="chat.loadingMessages"
            :sending="chat.sending"
            :typing="chat.activeId ? chat.typing[chat.activeId] : false"
            :my-avatar="auth.user?.avatar_url"
            :ride-code="conversation?.ride_code"
            @send="send"
            @open-ride="openRide"
          />
        </UiCard>
      </div>
    </div>
  </div>
</template>
