<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Driver, Paginated } from '#shared/types'
import { formatRupiah, formatDateTime } from '#shared/utils/format'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Driver', robots: 'noindex, nofollow' })

const toast = useToast()
const search = ref('')
const status = ref('')
const page = ref(1)

const query = reactive({ search: '', status: '' })
watch([search, status], () => {
  query.search = search.value
  query.status = status.value
  page.value = 1
})

const { data, pending, refresh } = await useAsyncData(
  'admin-drivers',
  () => http.get<Paginated<Driver>>('/drivers', { ...query, page: page.value, per_page: 15 }),
  { watch: [query, page] },
)

const rows = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

const STATUS_TONES: Record<string, 'success' | 'gray' | 'warning'> = {
  idle: 'success',
  busy: 'warning',
  offline: 'gray',
}
const VEHICLE_LABELS: Record<string, string> = {
  motorcycle: 'Motor',
  car: 'Mobil',
  van: 'Van',
}

const selected = ref<Driver | null>(null)
const settingStatus = ref<'' | 'idle' | 'offline'>('')
const saving = ref(false)

function openDetail(driver: Driver) {
  selected.value = driver
  settingStatus.value = driver.status === 'offline' ? 'idle' : 'offline'
}

async function applyStatus() {
  if (!selected.value || !settingStatus.value) return
  saving.value = true
  try {
    await http.patch(`/admin/drivers/${selected.value.id}`, {
      status: settingStatus.value,
      user_status: 'active',
    })
    toast.success(`Status ${selected.value.user.name} diubah.`)
    selected.value = null
    await refresh()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal mengubah status driver.')
  } finally {
    saving.value = false
  }
}

const summary = computed(() => {
  const list = rows.value
  return [
    { label: 'Total Driver', value: list.length, icon: 'car', tone: 'bg-brand-50 text-brand-600' },
    {
      label: 'Online',
      value: list.filter(d => d.status !== 'offline').length,
      icon: 'navigation',
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Sedang Menjalankan Perjalanan',
      value: list.filter(d => d.status === 'busy').length,
      icon: 'activity',
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Rata-rata Rating',
      value: list.length ? (list.reduce((a, d) => a + d.rating, 0) / list.length).toFixed(2) : '0.00',
      icon: 'star',
      tone: 'bg-indigo-50 text-indigo-600',
    },
  ]
})
</script>

<template>
  <div class="space-y-5">
    <AppPageHeader title="Driver" description="Status ketersediaan, performa, dan pendapatan driver." />

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <UiCard v-for="s in summary" :key="s.label">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[11.5px] font-medium text-ink-500">{{ s.label }}</p>
            <p class="mt-1.5 text-xl font-bold tracking-tight text-ink-900">{{ s.value }}</p>
          </div>
          <span class="grid size-9 shrink-0 place-items-center rounded-xl" :class="s.tone">
            <UiIcon :name="s.icon" class="size-4.5" />
          </span>
        </div>
      </UiCard>
    </div>

    <UiCard :padded="false">
      <div class="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
        <div class="relative min-w-[15rem] flex-1">
          <UiIcon name="search" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
          <input
            v-model="search"
            type="search"
            placeholder="Cari nama, kode driver, atau plat…"
            class="h-10 w-full rounded-xl border border-ink-200 bg-white pr-3 pl-9 text-sm outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15"
          >
        </div>
        <select
          v-model="status"
          class="h-10 rounded-xl border border-ink-200 bg-white px-3 text-[12.5px] font-medium text-ink-700 outline-none focus:border-brand-500"
        >
          <option value="">Semua status</option>
          <option value="idle">Online</option>
          <option value="busy">Menjalankan perjalanan</option>
          <option value="offline">Offline</option>
        </select>
        <UiButton variant="outline" size="sm" @click="refresh()">
          <template #icon><UiIcon name="refresh-cw" class="size-4" /></template>
          Segarkan
        </UiButton>
      </div>

      <div v-if="pending" class="space-y-2 p-4">
        <UiCard v-for="i in 5" :key="i" :padded="false"><UiSkeletonBlock :lines="1" /></UiCard>
      </div>

      <div v-else-if="!rows.length" class="p-4">
        <AppEmptyState icon="car" title="Tidak ada driver" description="Ubah kata kunci atau filter status." />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-ink-100 text-[11px] tracking-wide text-ink-400 uppercase">
              <th class="px-4 py-3 font-semibold">Driver</th>
              <th class="px-3 py-3 font-semibold">Kode</th>
              <th class="px-3 py-3 font-semibold">Kendaraan</th>
              <th class="px-3 py-3 font-semibold">Status</th>
              <th class="px-3 py-3 text-right font-semibold">Perjalanan</th>
              <th class="px-3 py-3 text-right font-semibold">Rating</th>
              <th class="px-3 py-3 text-right font-semibold">Pendapatan</th>
              <th class="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in rows" :key="d.id" class="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <UiAvatar :name="d.user.name" :src="d.user.avatar_url" :size="32" />
                  <div class="min-w-0">
                    <p class="truncate text-[13px] font-semibold text-ink-900">{{ d.user.name }}</p>
                    <p class="truncate text-[11px] text-ink-400">{{ d.user.phone }}</p>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 font-mono text-[12px] text-ink-600">{{ d.driver_code }}</td>
              <td class="px-3 py-3">
                <p class="text-[12.5px] text-ink-700">{{ d.vehicle_plate }}</p>
                <p class="text-[11px] text-ink-400">{{ VEHICLE_LABELS[d.vehicle_type] }} · {{ d.vehicle_color }}</p>
              </td>
              <td class="px-3 py-3">
                <UiBadge :tone="STATUS_TONES[d.status]" size="sm" dot>{{ d.status }}</UiBadge>
              </td>
              <td class="px-3 py-3 text-right text-[12.5px] font-semibold text-ink-900">{{ d.total_rides }}</td>
              <td class="px-3 py-3 text-right">
                <span class="inline-flex items-center gap-0.5 text-[12.5px] font-semibold text-ink-900">
                  <UiIcon name="star" class="size-3.5 text-amber-500" />{{ d.rating.toFixed(1) }}
                </span>
              </td>
              <td class="px-3 py-3 text-right text-[12.5px] font-semibold text-ink-900">
                {{ formatRupiah(d.earnings_month) }}
              </td>
              <td class="px-4 py-3 text-right">
                <UiButton size="xs" variant="outline" @click="openDetail(d)">Detail</UiButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between border-t border-ink-100 px-4 py-3">
        <p class="text-[12px] text-ink-500">
          Halaman {{ meta.current_page }} dari {{ meta.last_page }} · {{ meta.total }} driver
        </p>
        <div class="flex gap-2">
          <UiButton size="sm" variant="outline" :disabled="page <= 1" @click="page--">Sebelumnya</UiButton>
          <UiButton size="sm" variant="outline" :disabled="page >= meta.last_page" @click="page++">Berikutnya</UiButton>
        </div>
      </div>
    </UiCard>

    <UiModal
      :open="!!selected"
      :title="selected?.user.name ?? 'Detail Driver'"
      :description="selected?.driver_code"
      @close="selected = null"
    >
      <div v-if="selected" class="space-y-4">
        <div class="flex items-center gap-3">
          <UiAvatar :name="selected.user.name" :src="selected.user.avatar_url" :size="48" />
          <div class="min-w-0">
            <p class="truncate text-[14px] font-bold text-ink-900">{{ selected.user.name }}</p>
            <p class="truncate text-[12px] text-ink-500">{{ selected.user.email }}</p>
          </div>
        </div>

        <dl class="grid grid-cols-2 gap-3 rounded-xl bg-ink-50 p-3.5 text-[12.5px]">
          <div>
            <dt class="text-ink-400">Kendaraan</dt>
            <dd class="mt-0.5 font-semibold text-ink-800">
              {{ VEHICLE_LABELS[selected.vehicle_type] }} · {{ selected.vehicle_plate }}
            </dd>
          </div>
          <div>
            <dt class="text-ink-400">Warna / Tipe</dt>
            <dd class="mt-0.5 font-semibold text-ink-800">{{ selected.vehicle_color }} · {{ selected.vehicle_model }}</dd>
          </div>
          <div>
            <dt class="text-ink-400">Pendapatan Hari Ini</dt>
            <dd class="mt-0.5 font-semibold text-ink-800">{{ formatRupiah(selected.earnings_today) }}</dd>
          </div>
          <div>
            <dt class="text-ink-400">Pendapatan Bulan Ini</dt>
            <dd class="mt-0.5 font-semibold text-ink-800">{{ formatRupiah(selected.earnings_month) }}</dd>
          </div>
          <div>
            <dt class="text-ink-400">Jam Online</dt>
            <dd class="mt-0.5 font-semibold text-ink-800">{{ selected.online_hours }} jam</dd>
          </div>
          <div>
            <dt class="text-ink-400">Terakhir Aktif</dt>
            <dd class="mt-0.5 font-semibold text-ink-800">{{ formatDateTime(selected.last_seen_at) }}</dd>
          </div>
        </dl>

        <label class="block">
          <span class="mb-1.5 block text-[12.5px] font-medium text-ink-700">Ubah status ketersediaan</span>
          <select
            v-model="settingStatus"
            class="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-[13px] text-ink-800 outline-none focus:border-brand-500"
          >
            <option value="idle">Online (siap menerima order)</option>
            <option value="offline">Offline</option>
          </select>
        </label>
      </div>

      <template #footer>
        <UiButton variant="ghost" @click="selected = null">Tutup</UiButton>
        <UiButton :loading="saving" :disabled="!settingStatus" @click="applyStatus">Terapkan</UiButton>
      </template>
    </UiModal>
  </div>
</template>
