<script setup lang="ts">
import type { FareQuote } from '#shared/types'
import { formatDistance, formatDuration, formatRupiah } from '#shared/utils/format'

defineProps<{ quote: FareQuote | null; loading?: boolean; note?: string }>()
</script>

<template>
  <div class="rounded-2xl border border-ink-200 bg-white p-4">
    <h3 class="text-sm font-semibold text-ink-900">Rincian ongkos</h3>

    <div v-if="loading" class="mt-3 space-y-2">
      <UiSkeletonBlock v-for="i in 4" :key="i" :lines="1" height="h-3" />
    </div>

    <template v-else-if="quote">
      <dl class="mt-3 space-y-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-ink-500">Tarif dasar</dt>
          <dd class="font-medium text-ink-700">{{ formatRupiah(quote.base_fare) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-ink-500">Ongkos jarak ({{ formatDistance(quote.distance_km) }})</dt>
          <dd class="font-medium text-ink-700">{{ formatRupiah(quote.distance_fare) }}</dd>
        </div>
        <div v-if="quote.surge_fare > 0" class="flex justify-between text-amber-600">
          <dt class="flex items-center gap-1">
            <UiIcon name="zap" class="size-3.5" />
            Lonjakan ({{ quote.surge_multiplier }}×)
          </dt>
          <dd class="font-semibold">+{{ formatRupiah(quote.surge_fare) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-ink-500">Biaya layanan</dt>
          <dd class="font-medium text-ink-700">{{ formatRupiah(quote.service_fee) }}</dd>
        </div>
      </dl>

      <div class="mt-3 space-y-1 border-t border-ink-100 pt-3 text-xs text-ink-500">
        <div class="flex justify-between">
          <span>Estimasi waktu</span>
          <span class="font-semibold text-ink-700">{{ formatDuration(quote.duration_min) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Driver terdekat</span>
          <span class="font-semibold text-emerald-600">{{ quote.nearest_drivers }} tersedia</span>
        </div>
      </div>

      <div class="mt-3 flex items-end justify-between rounded-xl bg-brand-50 px-3.5 py-3">
        <span class="text-sm font-semibold text-brand-800">Total dibayar</span>
        <span class="text-xl font-bold text-brand-700">{{ formatRupiah(quote.total) }}</span>
      </div>

      <p v-if="note" class="mt-2 text-[11px] text-ink-400">{{ note }}</p>
    </template>

    <p v-else class="mt-3 text-sm text-ink-400">
      Isi titik penjemputan dan tujuan untuk melihat estimasi ongkos.
    </p>
  </div>
</template>
