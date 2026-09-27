<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { formatNumber, formatRupiah } from '#shared/utils/format'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Pendapatan', robots: 'noindex, nofollow' })

const driver = useDriverStore()
const toast = useToast()

const { pending, refresh } = await useAsyncData('driver-earnings', async () => {
  await driver.fetchEarnings()
  return driver.earnings
})

onMounted(async () => {
  await driver.fetchEarnings().catch(() => toast.error('Gagal memuat pendapatan.'))
})

const cards = computed(() => [
  { label: 'Hari Ini', value: driver.earnings?.today ?? 0, trips: driver.earnings?.trips_today ?? 0, icon: 'wallet', tone: 'bg-emerald-50 text-emerald-600' },
  { label: '7 Hari Terakhir', value: driver.earnings?.week ?? 0, trips: driver.earnings?.trips_week ?? 0, icon: 'history', tone: 'bg-brand-50 text-brand-600' },
  { label: 'Bulan Ini', value: driver.earnings?.month ?? 0, trips: driver.earnings?.trips_month ?? 0, icon: 'trending-up', tone: 'bg-violet-50 text-violet-600' },
  { label: 'Semua Waktu', value: driver.earnings?.total ?? 0, trips: 0, icon: 'chart', tone: 'bg-amber-50 text-amber-600' },
])

const series = computed(() => (driver.earnings?.series ?? []).map(p => ({ label: p.label, value: p.gmv })))
</script>

<template>
  <div class="space-y-5">
    <AppPageHeader title="Pendapatan" description="Ringkasan hasil mengantar kamu.">
      <template #actions>
        <UiButton variant="outline" size="sm" :loading="pending" @click="refresh()">
          <template #icon><UiIcon name="refresh-cw" class="size-4" /></template>
          Segarkan
        </UiButton>
      </template>
    </AppPageHeader>

    <div v-if="pending && !driver.earnings" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <UiCard v-for="i in 4" :key="i"><UiSkeletonBlock :lines="2" /></UiCard>
    </div>

    <div v-else class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <UiCard v-for="c in cards" :key="c.label">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[11px] text-ink-500">{{ c.label }}</p>
            <p class="mt-1 truncate text-lg font-bold text-ink-900">{{ formatRupiah(c.value) }}</p>
            <p v-if="c.trips" class="text-[11px] text-ink-400">{{ c.trips }} perjalanan</p>
          </div>
          <span class="grid size-9 shrink-0 place-items-center rounded-xl" :class="c.tone">
            <UiIcon :name="c.icon" class="size-4" />
          </span>
        </div>
      </UiCard>
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <UiCard class="lg:col-span-2">
        <h2 class="mb-4 text-sm font-bold text-ink-900">Tren 7 hari terakhir</h2>
        <ChartsLineChart :series="series" value-prefix="Rp " color="#16a34a" height="h-64" />
      </UiCard>

      <div class="space-y-5">
        <UiCard>
          <h2 class="text-sm font-bold text-ink-900">Ringkasan</h2>
          <dl class="mt-3 space-y-3">
            <div class="flex items-center justify-between">
              <dt class="text-[13px] text-ink-500">Rata-rata per perjalanan</dt>
              <dd class="text-[13px] font-bold text-ink-900">{{ formatRupiah(driver.earnings?.average_fare ?? 0) }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-[13px] text-ink-500">Total perjalanan</dt>
              <dd class="text-[13px] font-bold text-ink-900">{{ formatNumber(driver.profile?.total_rides ?? 0) }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-[13px] text-ink-500">Rating kamu</dt>
              <dd class="flex items-center gap-1 text-[13px] font-bold text-ink-900">
                <UiIcon name="star" class="size-3.5 fill-amber-400 text-amber-400" />
                {{ (driver.profile?.rating ?? 5).toFixed(2) }}
              </dd>
            </div>
          </dl>
        </UiCard>

        <UiCard>
          <h2 class="text-sm font-bold text-ink-900">Info pencairan</h2>
          <p class="mt-2 text-[12.5px] leading-relaxed text-ink-500">
            Pendapatan dari perjalanan yang selesai masuk ke saldo driver. Pencairan ke rekening diproses setiap hari kerja
            melalui backend Laravel.
          </p>
          <UiButton variant="outline" size="sm" block class="mt-3">
            <template #icon><UiIcon name="download" class="size-4" /></template>
            Unduh Rincian
          </UiButton>
        </UiCard>
      </div>
    </div>
  </div>
</template>
