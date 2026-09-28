<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatRelative } from '#shared/utils/format'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Pesan', robots: 'noindex, nofollow' })

const chat = useChatStore()
const route = useRoute()
const search = ref('')

const { pending } = await useAsyncData('chat-list', async () => {
  await chat.fetchConversations()
  return true
})

/* Masuk dari /chat/:id atau dari CTA di halaman lain */
onMounted(async () => {
  const id = Number(route.query.id ?? route.params.id)
  if (id && chat.conversations.some(c => c.id === id)) {
    await chat.fetchMessages(id)
  }
})

watch(search, () => undefined)

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return chat.conversations
  return chat.conversations.filter(
    c => c.counterpart.name.toLowerCase().includes(q) || c.last_message?.body.toLowerCase().includes(q),
  )
})

const groups = computed(() => {
  const now = Date.now()
  return filtered.value.map(c => {
    const ts = new Date(c.updated_at).getTime()
    const hours = (now - ts) / 3_600_000
    let label = formatRelative(c.updated_at)
    if (hours < 24) label = 'Hari ini'
    else if (hours < 48) label = 'Kemarin'
    return { conv: c, label }
  })
})
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <AppPageHeader title="Pesan" description="Percakapan dengan driver dan tim kami.">
      <template #actions>
        <UiButton variant="outline" size="sm" to="/customer/chat?new=support">
          <template #icon><UiIcon name="message-circle" class="size-4" /></template>
          Hubungi CS
        </UiButton>
      </template>
    </AppPageHeader>

    <div class="relative mb-4">
      <UiIcon name="search" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
      <input
        v-model="search"
        type="search"
        placeholder="Cari percakapan…"
        class="h-11 w-full rounded-xl border border-ink-200 bg-white pr-3 pl-9 text-sm outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15"
      >
    </div>

    <div v-if="pending" class="space-y-2">
      <div v-for="i in 5" :key="i" class="rounded-2xl border border-ink-200 bg-white p-4">
        <UiSkeletonBlock :lines="2" />
      </div>
    </div>

    <div v-else-if="!filtered.length" class="rounded-2xl border border-ink-200 bg-white p-6">
      <AppEmptyState
        icon="message-circle"
        title="Belum ada percakapan"
        description="Mulai chat dengan driver atau tim bantuan kami."
      >
        <UiButton to="/customer/book">Pesan perjalanan</UiButton>
      </AppEmptyState>
    </div>

    <ul v-else class="space-y-2">
      <li v-for="g in groups" :key="g.conv.id">
        <NuxtLink
          :to="{ path: '/customer/chat', query: { id: g.conv.id } }"
          class="flex items-center gap-3.5 rounded-2xl border bg-white p-3.5 transition"
          :class="chat.activeId === g.conv.id ? 'border-brand-400 ring-1 ring-brand-200' : 'border-ink-200/80 hover:border-brand-300 hover:shadow-soft'"
        >
          <div class="relative shrink-0">
            <UiAvatar :name="g.conv.counterpart.name" :src="g.conv.counterpart.avatar_url" :size="48" />
            <span v-if="g.conv.counterpart.role === 'admin'" class="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full border-2 border-white bg-violet-500 text-white">
              <UiIcon name="shield" class="size-2" />
            </span>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-baseline justify-between gap-2">
              <p class="truncate text-sm font-bold text-ink-900">
                {{ g.conv.counterpart.name }}
                <span v-if="g.conv.type === 'ride'" class="ml-1 text-[10px] font-medium text-ink-400">
                  · {{ g.conv.ride_code }}
                </span>
              </p>
              <span class="shrink-0 text-[10px] text-ink-400">{{ g.label }}</span>
            </div>
            <p
              class="mt-0.5 truncate text-[13px]"
              :class="g.conv.unread_count > 0 ? 'font-semibold text-ink-800' : 'text-ink-500'"
            >
              <span v-if="g.conv.last_message?.is_mine" class="text-ink-400">Kamu: </span>
              {{ g.conv.last_message?.body ?? 'Mulai percakapan' }}
            </p>
          </div>

          <span
            v-if="g.conv.unread_count > 0"
            class="grid min-w-5 shrink-0 place-items-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white"
          >
            {{ g.conv.unread_count }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
