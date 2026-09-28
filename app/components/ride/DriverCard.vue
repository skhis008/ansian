<script setup lang="ts">
import type { Driver } from '#shared/types'
import { formatDistance, formatNumber, formatRating } from '#shared/utils/format'

defineProps<{ driver: Driver; distanceKm?: number; eta?: number; compact?: boolean }>()

const VEHICLE: Record<Driver['vehicle_type'], { label: string; icon: string }> = {
  motorcycle: { label: 'Motor', icon: 'bike' },
}
</script>

<template>
  <div class="rounded-2xl border border-ink-200 bg-white p-4">
    <div class="flex items-center gap-3">
      <div class="relative">
        <UiAvatar :name="driver.user.name" :src="driver.user.avatar_url" :size="52" />
        <span
          class="absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-white"
          :class="driver.status === 'offline' ? 'bg-ink-400' : 'bg-emerald-500'"
        />
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-ink-900">{{ driver.user.name }}</p>
        <p class="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
          <span class="inline-flex items-center gap-0.5 font-semibold text-amber-600">
            <UiIcon name="star" class="size-3 fill-current" />
            {{ formatRating(driver.rating, 2) }}
          </span>
          <span aria-hidden="true">·</span>
          <span>{{ formatNumber(driver.total_rides) }} perjalanan</span>
        </p>
      </div>

      <UiBadge :tone="driver.status === 'offline' ? 'gray' : 'success'" dot>
        {{ driver.status === 'offline' ? 'Offline' : driver.status === 'busy' ? 'Mengantar' : 'Tersedia' }}
      </UiBadge>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-ink-50 p-3.5">
      <div>
        <p class="text-[10px] font-medium tracking-wide text-ink-400 uppercase">Kendaraan</p>
        <p class="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-ink-800">
          <UiIcon :name="VEHICLE[driver.vehicle_type].icon" class="size-4 text-ink-500" />
          {{ VEHICLE[driver.vehicle_type].label }}
        </p>
        <p class="mt-0.5 text-xs text-ink-500">{{ driver.vehicle_color }} {{ driver.vehicle_model }}</p>
      </div>
      <div>
        <p class="text-[10px] font-medium tracking-wide text-ink-400 uppercase">Nomor Plat</p>
        <p class="mt-0.5 rounded-md bg-ink-900 px-2 py-0.5 font-mono text-sm font-bold tracking-wider text-white">
          {{ driver.vehicle_plate }}
        </p>
        <p class="mt-1 font-mono text-[10px] text-ink-400">{{ driver.driver_code }}</p>
      </div>
    </div>

    <div v-if="!compact" class="mt-3 flex items-center justify-between text-xs text-ink-500">
      <span v-if="distanceKm !== undefined" class="inline-flex items-center gap-1">
        <UiIcon name="navigation" class="size-3.5" />
        {{ formatDistance(distanceKm) }} dari Anda
      </span>
      <span v-if="eta !== undefined" class="inline-flex items-center gap-1">
        <UiIcon name="clock" class="size-3.5" />
        ± {{ eta }} menit
      </span>
    </div>
  </div>
</template>
