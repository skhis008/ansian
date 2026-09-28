<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { formatRupiah, formatNumber } from '#shared/utils/format'
import { distanceKm, currentPosition } from '#shared/utils/geo'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Dashboard Driver', robots: 'noindex, nofollow' })

const auth = useAuthStore()
const driver = useDriverStore()
const rideStore = useRideStore()
const toast = useToast()
const realtime = useRealtime()

if (auth.isDriver && auth.driver) driver.sync(auth.driver)

const { data: summary } = await useAsyncData(`driver-summary-${auth.user?.id}`, () =>
  http.get<{ data: any }>('/me/summary').then(r => r.data),
)

const { data: activity } = await useAsyncData(`driver-activity-${auth.user?.id}`, () =>
  http.get<{ data: any[] }>('/me/activity').then(r => r.data),
)

const { data: activeRide } = await useAsyncData(`driver-active-${auth.user?.id}`, async () => {
  const r = await http.get<{ data: any }>('/rides/active')
  rideStore.setActive(r.data)
  return r.data
})

const myPosition = ref<{ lat: number; lng: number } | null>(null)

onMounted(async () => {
  if (auth.isDriver && auth.driver) driver.sync(auth.driver)
  const res = await http.get<{ data: any }>('/me/summary')
  void res
  await Promise.all([driver.fetchJobs(), driver.fetchEarnings().catch(() => undefined)])
  if (driver.isAvailable) rideStore.startPolling(8000)

  const pos = await currentPosition()
  myPosition.value = pos
  if (driver.online) {
    realtime.sendLocation(auth.user?.id ?? 0, pos.lat, pos.lng)
  }
})

async function toggleStatus() {
  try {
    const res = await driver.toggleStatus()
    if (res?.status === 'idle') {
      toast.success('Kamu online! Menunggu permintaan masuk.')
      await driver.fetchJobs()
      rideStore.startPolling(8000)
    } else {
      toast.info('Kamu offline. Tidak ada permintaan baru.')
      rideStore.stopPolling()
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal mengubah status.')
  }
}

const stats = computed(() => [
  {
    label: 'Pendapatan Hari Ini',
    value: formatRupiah(summary.value?.earnings_today ?? driver.earnings?.today ?? 0),
    sub: `${driver.earnings?.trips_today ?? 0} perjalanan`,
    icon: 'wallet',
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Pendapatan Bulan Ini',
    value: formatRupiah(summary.value?.earnings_month ?? driver.earnings?.month ?? 0),
    sub: `${driver.earnings?.trips_month ?? 0} perjalanan`,
    icon: 'trending-up',
    tone: 'bg-brand-50 text-brand-600',
  },
  {
    label: 'Rating',
    value: (summary.value?.rating ?? driver.profile?.rating ?? 5).toFixed(2),
    sub: `${formatNumber(driver.profile?.total_rides ?? 0)} total perjalanan`,
    icon: 'star',
    tone: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Online Hours',
    value: formatNumber(summary.value?.online_hours ?? driver.profile?.online_hours ?? 0),
    sub: 'jam',
    icon: 'clock',
    tone: 'bg-violet-50 text-violet-600',
  },
])
</script>

<template>
  <div class="space-y-5">
    <!-- Banner verifikasi mahasiswa -->
    <div
      v-if="auth.driver && auth.driver.verification !== 'verified'"
      class="flex items-start gap-3 rounded-2xl border px-4 py-3.5"
      :class="auth.driver.verification === 'rejected'
        ? 'border-red-200 bg-red-50'
        : 'border-amber-200 bg-amber-50'"
    >
      <UiIcon
        name="graduation-cap"
        class="mt-0.5 size-5 shrink-0"
        :class="auth.driver.verification === 'rejected' ? 'text-red-600' : 'text-amber-600'"
      />
      <div class="flex-1">
        <p class="text-sm font-bold" :class="auth.driver.verification === 'rejected' ? 'text-red-900' : 'text-amber-900'">
          {{ auth.driver.verification === 'rejected' ? 'Verifikasi ditolak' : 'Menunggu verifikasi admin' }}
        </p>
        <p class="mt-0.5 text-xs" :class="auth.driver.verification === 'rejected' ? 'text-red-700' : 'text-amber-700'">
          {{ auth.driver.verification === 'rejected'
            ? 'Data NIM/kampus perlu diperbaiki. Hubungi customer service.'
            : `NIM ${auth.driver.student_id || '-'} · ${auth.driver.campus || '-'} sedang ditinjau. Kamu tetap bisa cek aktivitas.` }}
        </p>
      </div>
      <UiButton to="/driver/profile" size="sm" variant="outline">Lihat Data</UiButton>
    </div>

    <!-- Status toggle -->
    <div
      class="rounded-2xl p-5 text-white shadow-lift transition"
      :class="driver.online ? 'bg-gradient-to-r from-emerald-600 to-emerald-700' : 'bg-gradient-to-r from-ink-800 to-ink-900'"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <span
            class="relative grid size-12 shrink-0 place-items-center rounded-2xl"
            :class="driver.online ? 'bg-white/15' : 'bg-white/10'"
          >
            <UiIcon :name="driver.online ? 'zap' : 'navigation-off'" class="size-6" />
            <span v-if="driver.online" class="absolute inset-0 animate-ping rounded-2xl bg-white/20" />
          </span>
          <div>
            <h1 class="text-lg font-bold">{{ driver.statusLabel }}</h1>
            <p class="text-sm text-white/70">
              {{ driver.online ? 'Siap menerima permintaan di sekitarmu' : 'Aktifkan untuk mulai menerima order' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-[11px] text-white/60">Permintaan menunggu</p>
            <p class="text-2xl font-bold">{{ driver.jobs.length }}</p>
          </div>
          <button
            type="button"
            class="relative h-8 w-14 shrink-0 rounded-full transition"
            :class="driver.online ? 'bg-white' : 'bg-white/20'"
            :aria-checked="driver.online"
            role="switch"
            :aria-label="driver.online ? 'Matikan status online' : 'Aktifkan status online'"
            :disabled="driver.busy"
            @click="toggleStatus"
          >
            <span
              class="absolute top-1 left-1 size-6 rounded-full transition-transform duration-200"
              :class="driver.online ? 'translate-x-6 bg-emerald-600' : 'bg-white/70'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Active ride -->
    <NuxtLink
      v-if="activeRide"
      to="/driver/active"
      class="flex items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 transition hover:shadow-soft"
    >
      <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
        <UiIcon name="navigation" class="size-5" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-brand-900">Perjalanan sedang berjalan</p>
        <p class="truncate text-xs text-brand-700">{{ activeRide.pickup.place_name }} → {{ activeRide.destination.place_name }}</p>
      </div>
      <UiIcon name="chevron-right" class="size-5 shrink-0 text-brand-600" />
    </NuxtLink>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <UiCard v-for="s in stats" :key="s.label">
        <div class="flex items-start justify-between">
          <div class="min-w-0">
            <p class="text-[11px] font-medium text-ink-500">{{ s.label }}</p>
            <p class="mt-1 truncate text-lg font-bold text-ink-900">{{ s.value }}</p>
            <p class="text-[11px] text-ink-400">{{ s.sub }}</p>
          </div>
          <span class="grid size-9 shrink-0 place-items-center rounded-xl" :class="s.tone">
            <UiIcon :name="s.icon" class="size-4" />
          </span>
        </div>
      </UiCard>
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <!-- Peta -->
      <UiCard :padded="false" class="overflow-hidden lg:col-span-2">
        <div class="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <h2 class="text-sm font-bold text-ink-900">Area bordering</h2>
          <UiBadge :tone="driver.online ? 'success' : 'gray'" dot>
            {{ driver.online ? 'Menerima order' : 'Offline' }}
          </UiBadge>
        </div>
        <ClientOnly>
          <MapCanvas
            :center="myPosition ?? undefined"
            :my-location="!!myPosition"
            :driver="null"
            height="h-72 lg:h-80"
          />
          <template #fallback>
            <div class="grid h-72 place-items-center bg-ink-100 lg:h-80"><UiSkeletonBlock :lines="1" /></div>
          </template>
        </ClientOnly>
      </UiCard>

      <!-- Permintaan masuk -->
      <div>
        <AppPageHeader title="Permintaan Masuk">
          <template #actions>
            <UiButton to="/driver/requests" variant="ghost" size="sm">
              Semua
              <template #icon><UiIcon name="chevron-right" class="size-4" /></template>
            </UiButton>
          </template>
        </AppPageHeader>

        <div v-if="!driver.online" class="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-6 text-center">
          <UiIcon name="navigation-off" class="mx-auto size-8 text-ink-300" />
          <p class="mt-3 text-sm font-semibold text-ink-700">Kamu sedang offline</p>
          <p class="mt-1 text-xs text-ink-500">Aktifkan status online untuk menerima permintaan.</p>
          <UiButton size="sm" class="mt-4" @click="toggleStatus">Aktifkan Online</UiButton>
        </div>

        <div v-else-if="!driver.jobs.length" class="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-6 text-center">
          <span class="mx-auto grid size-10 place-items-center rounded-xl bg-ink-100 text-ink-400">
            <UiIcon name="inbox" class="size-5" />
          </span>
          <p class="mt-3 text-sm font-semibold text-ink-700">Belum ada permintaan</p>
          <p class="mt-1 text-xs text-ink-500">Siap-siap ya, permintaan akan muncul di sini.</p>
        </div>

        <div v-else class="space-y-2.5">
          <DriverJobCard v-for="job in driver.jobs.slice(0, 3)" :key="job.id" :job="job" compact />
        </div>
      </div>
    </div>

    <!-- Aktivitas -->
    <div>
      <AppPageHeader title="Perjalanan Terakhir" />
      <div v-if="!activity?.length" class="rounded-2xl border border-ink-200 bg-white p-6">
        <AppEmptyState icon="history" title="Belum ada perjalanan" description="Riwayat akan muncul setelah kamu menyelesaikan order pertama." />
      </div>
      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <UiCard v-for="a in activity.slice(0, 6)" :key="a.id" class="!p-4">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate text-[13px] font-semibold text-ink-900">{{ a.destination_name }}</p>
              <p class="truncate text-[11px] text-ink-500">Dari {{ a.pickup_name }}</p>
            </div>
            <RideStatusBadge :status="a.status" />
          </div>
          <div class="mt-3 flex items-end justify-between border-t border-ink-100 pt-2.5">
            <span class="text-[10px] text-ink-400">{{ a.ride_code }}</span>
            <span class="text-sm font-bold text-emerald-600">{{ formatRupiah(a.fare) }}</span>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>
