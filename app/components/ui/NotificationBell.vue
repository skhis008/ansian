<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { AppNotification } from '#shared/types'
import { formatRelative } from '#shared/utils/format'

const store = useNotificationStore()
const open = ref(false)
const boxRef = ref<HTMLElement | null>(null)

const items = computed(() => store.items.slice(0, 8))

const iconFor: Record<AppNotification['type'], string> = {
  ride: 'navigation',
  chat: 'message-circle',
  payment: 'credit-card',
  promo: 'gift',
  system: 'info',
}

const toneFor: Record<AppNotification['type'], string> = {
  ride: 'bg-brand-50 text-brand-600',
  chat: 'bg-violet-50 text-violet-600',
  payment: 'bg-emerald-50 text-emerald-600',
  promo: 'bg-amber-50 text-amber-600',
  system: 'bg-ink-100 text-ink-600',
}

function onClickOutside(e: MouseEvent) {
  if (boxRef.value && !boxRef.value.contains(e.target as Node)) open.value = false
}

async function select(n: AppNotification) {
  await store.markRead(n.id)
  const rideId = n.data.ride_id
  open.value = false
  if (rideId) {
    const auth = useAuthStore()
    if (auth.isDriver) navigateTo('/driver/active')
    else navigateTo(`/customer/rides/${rideId}`)
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="boxRef" class="relative">
    <button
      type="button"
      class="relative rounded-lg p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
      :aria-label="`Notifikasi${store.unread ? `, ${store.unread} belum dibaca` : ''}`"
      :aria-expanded="open"
      @click="open = !open"
    >
      <UiIcon name="bell" class="size-5" />
      <span
        v-if="store.unread > 0"
        class="absolute top-0.5 right-0.5 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
      >
        {{ store.unread > 9 ? '9+' : store.unread }}
      </span>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift"
      >
        <div class="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <h3 class="text-sm font-semibold text-ink-900">Notifikasi</h3>
          <button
            v-if="store.unread > 0"
            type="button"
            class="text-xs font-semibold text-brand-600 hover:underline"
            @click="store.markAllRead()"
          >
            Tandai semua
          </button>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <div v-if="store.loading" class="space-y-3 p-4">
            <UiSkeletonBlock v-for="i in 3" :key="i" :lines="2" height="h-3" />
          </div>

          <ul v-else-if="items.length" class="divide-y divide-ink-100">
            <li v-for="n in items" :key="n.id">
              <button
                type="button"
                class="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-ink-50"
                :class="!n.read_at ? 'bg-brand-50/40' : ''"
                @click="select(n)"
              >
                <span class="grid size-8 shrink-0 place-items-center rounded-lg" :class="toneFor[n.type]">
                  <UiIcon :name="iconFor[n.type]" class="size-4" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[13px] font-semibold text-ink-900">{{ n.title }}</span>
                  <span class="mt-0.5 block line-clamp-2 text-xs text-ink-500">{{ n.body }}</span>
                  <span class="mt-1 block text-[10px] text-ink-400">{{ formatRelative(n.created_at) }}</span>
                </span>
                <span v-if="!n.read_at" class="mt-1.5 size-2 shrink-0 rounded-full bg-brand-600" />
              </button>
            </li>
          </ul>

          <p v-else class="px-4 py-8 text-center text-sm text-ink-400">
            Belum ada notifikasi.
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
