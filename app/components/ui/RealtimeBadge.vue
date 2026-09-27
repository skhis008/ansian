<script setup lang="ts">
const realtime = useRealtime()

const connected = computed(() => realtime.connected.value)

const config = computed(() => {
  switch (realtime.status.value) {
    case 'echo':
      return { label: 'Realtime', tone: 'text-emerald-600', dot: 'bg-emerald-500' }
    case 'polling':
      return { label: 'Polling', tone: 'text-amber-600', dot: 'bg-amber-500' }
    default:
      return { label: 'Offline', tone: 'text-ink-400', dot: 'bg-ink-300' }
  }
})
</script>

<template>
  <span
    class="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold sm:inline-flex"
    :class="config.tone"
    :title="`Koneksi realtime: ${config.label}`"
  >
    <span class="relative flex size-1.5">
      <span
        v-if="connected"
        class="absolute inline-flex size-full animate-ping rounded-full opacity-60"
        :class="config.dot"
      />
      <span class="relative inline-flex size-1.5 rounded-full" :class="config.dot" />
    </span>
    {{ config.label }}
  </span>
</template>
