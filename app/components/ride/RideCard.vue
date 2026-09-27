<script setup lang="ts">
import type { Ride } from '#shared/types'
import { formatDateTime, formatDistance, formatDuration, formatRupiah } from '#shared/utils/format'

const props = withDefaults(
  defineProps<{ ride: Ride; clickable?: boolean; showDriver?: boolean; showRider?: boolean }>(),
  { clickable: true, showDriver: false, showRider: false },
)

const counterpartName = computed(() =>
  props.showDriver ? (props.ride.driver?.user.name ?? 'Mencari driver…') : props.showRider ? (props.ride.rider?.name ?? '-') : null,
)
</script>

<template>
  <component
    :is="clickable ? resolveComponent('NuxtLink') : 'div'"
    :to="clickable ? `/rider/rides/${ride.id}` : undefined"
    class="group flex gap-3.5 rounded-2xl border border-ink-200/80 bg-white p-4 transition"
    :class="clickable ? 'hover:border-brand-300 hover:shadow-soft' : ''"
  >
    <div class="relative flex shrink-0 flex-col items-center pt-0.5">
      <span class="size-2.5 rounded-full border-2 border-ink-900 bg-white" />
      <span class="my-0.5 w-px flex-1 bg-ink-200" />
      <span class="size-2.5 rounded-full bg-rose-600" />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-ink-900">
            {{ ride.pickup.place_name || ride.pickup.address }}
          </p>
          <p class="mt-1 truncate text-sm text-ink-500">
            {{ ride.destination.place_name || ride.destination.address }}
          </p>
        </div>
        <RideStatusBadge :status="ride.status" class="shrink-0" />
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
        <span class="inline-flex items-center gap-1">
          <UiIcon name="navigation" class="size-3.5" />
          {{ formatDistance(ride.distance_km) }}
        </span>
        <span class="inline-flex items-center gap-1">
          <UiIcon name="clock" class="size-3.5" />
          {{ formatDuration(ride.duration_min) }}
        </span>
        <span v-if="ride.surge_multiplier > 1" class="inline-flex items-center gap-1 font-semibold text-amber-600">
          <UiIcon name="zap" class="size-3.5" />
          {{ ride.surge_multiplier }}×
        </span>
        <span class="inline-flex items-center gap-1">
          <UiIcon name="history" class="size-3.5" />
          {{ formatDateTime(ride.created_at) }}
        </span>
      </div>

      <div v-if="counterpartName" class="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-ink-600">
        <UiIcon :name="showDriver ? 'car' : 'user'" class="size-3.5" />
        {{ counterpartName }}
      </div>

      <div class="mt-3 flex items-end justify-between gap-3 border-t border-ink-100 pt-3">
        <div class="min-w-0">
          <p class="text-[10px] font-medium tracking-wide text-ink-400 uppercase">Kode pesanan</p>
          <p class="font-mono text-xs font-semibold text-ink-600">{{ ride.ride_code }}</p>
        </div>
        <div class="text-right">
          <p class="text-[10px] font-medium tracking-wide text-ink-400 uppercase">Ongkos</p>
          <p class="text-base font-bold text-ink-900">{{ formatRupiah(ride.fare) }}</p>
        </div>
      </div>
    </div>
  </component>
</template>
