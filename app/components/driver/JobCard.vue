<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { DriverJob } from '#shared/types'
import { formatDistance, formatRupiah, formatCountdown } from '#shared/utils/format'

const props = withDefaults(defineProps<{ job: DriverJob; compact?: boolean }>(), { compact: false })

const emit = defineEmits<{ accept: []; reject: [] }>()

const remaining = ref(props.job.expires_in_seconds)
const accepting = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (remaining.value > 0) remaining.value--
  }, 1000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const progress = computed(() => Math.max(0, Math.min(100, (remaining.value / props.job.expires_in_seconds) * 100)))
const urgent = computed(() => remaining.value <= 15)

async function accept() {
  accepting.value = true
  try {
    emit('accept')
  } finally {
    setTimeout(() => (accepting.value = false), 600)
  }
}
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border bg-white transition"
    :class="urgent ? 'border-amber-300 ring-1 ring-amber-200' : 'border-ink-200/80'"
  >
    <div class="h-1 bg-ink-100">
      <div
        class="h-full transition-[width] duration-1000 ease-linear"
        :class="urgent ? 'bg-amber-500' : 'bg-brand-500'"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <div class="p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-mono text-xs font-bold text-ink-700">{{ job.ride_code }}</p>
          </div>
          <p class="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
            <span class="size-2 shrink-0 rounded-full border-2 border-ink-900" />
            <span class="truncate">{{ job.pickup.place_name || job.pickup.address }}</span>
          </p>
          <p class="mt-1 flex items-center gap-1.5 text-sm text-ink-600">
            <span class="size-2 shrink-0 rounded-full bg-rose-600" />
            <span class="truncate">{{ job.destination.place_name || job.destination.address }}</span>
          </p>
        </div>

        <div class="shrink-0 text-right">
          <p class="text-lg font-bold text-emerald-600">{{ formatRupiah(job.fare) }}</p>
          <p class="text-[10px] text-ink-400">Perkiraan diterima 80%</p>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
        <span class="inline-flex items-center gap-1">
          <UiIcon name="navigation" class="size-3" />
          {{ formatDistance(job.distance_km) }}
        </span>
        <span class="inline-flex items-center gap-1">
          <UiIcon name="clock" class="size-3" />
          {{ job.duration_min }} mnt
        </span>
        <span class="inline-flex items-center gap-1">
          <UiIcon name="user" class="size-3" />
          {{ job.customer_name }} · {{ job.customer_rating }}
        </span>
        <span
          class="ml-auto inline-flex items-center gap-1 font-semibold"
          :class="urgent ? 'text-amber-600' : 'text-ink-500'"
        >
          <UiIcon name="clock" class="size-3" />
          {{ formatCountdown(remaining) }}
        </span>
      </div>

      <div v-if="!compact" class="mt-3 rounded-lg bg-ink-50 px-2.5 py-2 text-[11px] text-ink-600">
        Jarak ke titik jemput: <span class="font-semibold">{{ formatDistance(job.distance_to_pickup_km) }}</span>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <UiButton variant="outline" size="sm" block @click="emit('reject')">
          Lewati
        </UiButton>
        <UiButton size="sm" block :loading="accepting" @click="accept">
          <template #icon><UiIcon name="check" class="size-4" /></template>
          Terima
        </UiButton>
      </div>
    </div>
  </div>
</template>
