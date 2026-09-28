<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChartPoint, PaymentMethod, RevenueByVehicleType, VehicleType } from '#shared/types'
import { formatRupiah } from '#shared/utils/format'
import { PAYMENT_METHOD_LABELS, VEHICLE_TYPE_LABELS } from '#shared/types'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Laporan', robots: 'noindex, nofollow' })

const range = ref(30)

type ReportPayload = {
  range: { days: number; from: string | null; to: string | null }
  series: ChartPoint[]
  summary: {
    total_rides: number
    total_gmv: number
    avg_fare: number
    total_distance_km: number
    total_duration_min: number
  }
  by_method: Array<{ method: PaymentMethod; count: number; amount: number }>
  by_vehicle: RevenueByVehicleType[]
}

const { data, pending, refresh } = await useAsyncData(
  'admin-reports',
  () => http.get<{ data: ReportPayload }>('/admin/reports', { days: range.value }).then(r => r.data),
  { watch: [range] },
)

const gmvChart = computed(() => (data.value?.series ?? []).map(p => ({ label: p.label, value: p.gmv })))
const ridesChart = computed(() => (data.value?.series ?? []).map(p => ({ label: p.label, value: p.rides })))
const cancelledChart = computed(() => (data.value?.series ?? []).map(p => ({ label: p.label, value: p.cancelled })))

const maxVehicle = computed(() => Math.max(1, ...(data.value?.by_vehicle ?? []).map(v => v.gmv)))

const VEHICLE_ICONS: Record<VehicleType, string> = {
  motorcycle: 'bike',
}

const fmtHours = (min: number) => `${(min / 60).toFixed(1)} jam`

const exportCsv = () => {
  const rows = data.value?.series ?? []
  if (!rows.length) return
  const header = 'tanggal,perjalanan,selesai,dibatalkan,gmv\n'
  const body = rows
    .map(p => `${p.date},${p.rides},${p.completed},${p.cancelled},${p.gmv}`)
    .join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `laporan-ansian-${range.value}-hari.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-5">
    <AppPageHeader title="Laporan" description="Analisis pendapatan dan performa perjalanan.">
      <template #actions>
        <select
          v-model.number="range"
          class="h-9 rounded-xl border border-ink-200 bg-white px-3 text-[12.5px] font-medium text-ink-700 outline-none focus:border-brand-500"
        >
          <option :value="7">7 hari</option>
          <option :value="30">30 hari</option>
          <option :value="90">90 hari</option>
        </select>
        <UiButton size="sm" variant="outline" @click="exportCsv">
          <template #icon><UiIcon name="download" class="size-4" /></template>
          Ekspor CSV
        </UiButton>
      </template>
    </AppPageHeader>

    <div v-if="pending" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <UiCard v-for="i in 5" :key="i"><UiSkeletonBlock :lines="2" /></UiCard>
    </div>

    <template v-else-if="data">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <UiCard>
          <p class="text-[11.5px] text-ink-500">Perjalanan Selesai</p>
          <p class="mt-1.5 text-xl font-bold tracking-tight text-ink-900">
            {{ data.summary.total_rides.toLocaleString('id-ID') }}
          </p>
        </UiCard>
        <UiCard>
          <p class="text-[11.5px] text-ink-500">Total GMV</p>
          <p class="mt-1.5 text-xl font-bold tracking-tight text-ink-900">{{ formatRupiah(data.summary.total_gmv) }}</p>
        </UiCard>
        <UiCard>
          <p class="text-[11.5px] text-ink-500">Rata-rata Tarif</p>
          <p class="mt-1.5 text-xl font-bold tracking-tight text-ink-900">{{ formatRupiah(data.summary.avg_fare) }}</p>
        </UiCard>
        <UiCard>
          <p class="text-[11.5px] text-ink-500">Total Jarak</p>
          <p class="mt-1.5 text-xl font-bold tracking-tight text-ink-900">
            {{ data.summary.total_distance_km.toLocaleString('id-ID') }} km
          </p>
        </UiCard>
        <UiCard>
          <p class="text-[11.5px] text-ink-500">Total Durasi</p>
          <p class="mt-1.5 text-xl font-bold tracking-tight text-ink-900">
            {{ fmtHours(data.summary.total_duration_min) }}
          </p>
        </UiCard>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <UiCard>
          <h3 class="mb-4 text-sm font-bold text-ink-900">GMV Harian</h3>
          <ChartsLineChart v-if="gmvChart.length" :series="gmvChart" value-prefix="Rp " color="#16a34a" height="h-64" />
        </UiCard>
        <UiCard>
          <h3 class="mb-4 text-sm font-bold text-ink-900">Jumlah Perjalanan</h3>
          <ChartsLineChart v-if="ridesChart.length" :series="ridesChart" color="#4f46e5" height="h-64" />
        </UiCard>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <UiCard>
          <h3 class="mb-4 text-sm font-bold text-ink-900">PEmbatalan</h3>
          <ChartsLineChart v-if="cancelledChart.length" :series="cancelledChart" color="#dc2626" height="h-56" fill />
        </UiCard>

        <UiCard>
          <h3 class="mb-4 text-sm font-bold text-ink-900">Komposisi Kendaraan</h3>
          <ul class="space-y-3.5">
            <li v-for="v in data.by_vehicle" :key="v.vehicle_type">
              <div class="mb-1.5 flex items-center justify-between text-[12.5px]">
                <span class="flex items-center gap-1.5 font-medium text-ink-700">
                  <UiIcon :name="VEHICLE_ICONS[v.vehicle_type]" class="size-3.5" />
                  {{ VEHICLE_TYPE_LABELS[v.vehicle_type] }}
                </span>
                <span class="text-ink-500">{{ v.rides }} perjalanan · {{ v.percentage }}%</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-ink-100">
                <div
                  class="h-full rounded-full bg-brand-500"
                  :style="{ width: `${(v.gmv / maxVehicle) * 100}%` }"
                />
              </div>
              <p class="mt-1 text-right text-[11px] text-ink-400">{{ formatRupiah(v.gmv) }}</p>
            </li>
          </ul>
        </UiCard>

        <UiCard>
          <h3 class="mb-4 text-sm font-bold text-ink-900">Metode Pembayaran</h3>
          <ul class="space-y-2.5">
            <li
              v-for="m in data.by_method"
              :key="m.method"
              class="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2.5"
            >
              <div>
                <p class="text-[12.5px] font-semibold text-ink-800">{{ PAYMENT_METHOD_LABELS[m.method] }}</p>
                <p class="text-[11px] text-ink-400">{{ m.count }} transaksi</p>
              </div>
              <p class="text-[12.5px] font-bold text-ink-900">{{ formatRupiah(m.amount) }}</p>
            </li>
            <li v-if="!data.by_method.length" class="py-6 text-center text-[12.5px] text-ink-400">
              Belum ada transaksi selesai.
            </li>
          </ul>
        </UiCard>
      </div>

      <p class="text-center text-[11px] text-ink-300">
        Periode {{ data.range.from }} sampai {{ data.range.to }} · laporan dapat mengekspor CSV untuk rekapitulasi.
      </p>
    </template>
  </div>
</template>
