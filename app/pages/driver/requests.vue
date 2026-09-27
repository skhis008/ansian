<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { currentPosition } from '#shared/utils/geo'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Permintaan Masuk', robots: 'noindex, nofollow' })

const driver = useDriverStore()
const toast = useToast()
const rideStore = useRideStore()
const showMap = ref(false)
const mapCenter = ref<{ lat: number; lng: number } | null>(null)

onMounted(async () => {
  await driver.fetchJobs()
  mapCenter.value = await currentPosition()
})

onBeforeUnmount(() => rideStore.stopPolling())

async function accept(rideId: number) {
  try {
    await driver.acceptJob(rideId)
    toast.success('Perjalanan diterima! Menuju titik jemput.')
    await navigateTo('/driver/active')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal menerima permintaan.')
  }
}

async function reject(rideId: number) {
  try {
    await driver.rejectJob(rideId)
    toast.info('Permintaan dilewati.')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal melewati permintaan.')
  }
}
</script>

<template>
  <div class="space-y-5">
    <AppPageHeader
      title="Permintaan Masuk"
      :description="driver.online ? 'Terima perjalanan yang ingin kamu layani.' : 'Aktifkan status online untuk menerima permintaan.'"
    >
      <template #actions>
        <UiBadge :tone="driver.online ? 'success' : 'gray'" dot>{{ driver.statusLabel }}</UiBadge>
        <UiButton variant="outline" size="sm" @click="driver.fetchJobs()">
          <template #icon><UiIcon name="refresh-cw" class="size-4" /></template>
          Segarkan
        </UiButton>
      </template>
    </AppPageHeader>

    <div class="grid gap-5 lg:grid-cols-5">
      <div class="space-y-3 lg:col-span-3">
        <div v-if="!driver.online" class="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
          <span class="mx-auto grid size-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
            <UiIcon name="navigation-off" class="size-6" />
          </span>
          <p class="mt-4 text-sm font-bold text-ink-800">Status kamu offline</p>
          <p class="mx-auto mt-1 max-w-xs text-xs text-ink-500">
            Permintaan hanya bisa diterima ketika status online aktif.
          </p>
          <UiButton class="mt-5" to="/driver">Aktifkan Online</UiButton>
        </div>

        <div v-else-if="driver.loadingJobs" class="space-y-3">
          <UiCard v-for="i in 3" :key="i"><UiSkeletonBlock :lines="3" /></UiCard>
        </div>

        <div v-else-if="!driver.jobs.length" class="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
          <span class="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <UiIcon name="inbox" class="size-6" />
          </span>
          <p class="mt-4 text-sm font-bold text-ink-800">Tidak ada permintaan menunggu</p>
          <p class="mx-auto mt-1 max-w-xs text-xs text-ink-500">
            Kamu online dan siap menerima order. Notifikasi order baru akan muncul otomatis via realtime.
          </p>
        </div>

        <template v-else>
          <DriverJobCard
            v-for="job in driver.jobs"
            :key="job.id"
            :job="job"
            @accept="accept(job.ride_id)"
            @reject="reject(job.ride_id)"
          />
        </template>
      </div>

      <div class="space-y-4 lg:col-span-2">
        <UiCard :padded="false" class="overflow-hidden">
          <div class="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <h2 class="text-sm font-bold text-ink-900">Peta area</h2>
            <button
              type="button"
              class="text-[11px] font-semibold text-brand-600 hover:underline"
              @click="showMap = !showMap"
            >
              {{ showMap ? 'Sembunyikan' : 'Perbesar' }}
            </button>
          </div>
          <ClientOnly>
            <MapCanvas
              :center="mapCenter ?? undefined"
              :my-location="!!mapCenter"
              :zoom="showMap ? 14 : 12"
              height="h-80"
            />
            <template #fallback>
              <div class="grid h-80 place-items-center bg-ink-100"><UiSkeletonBlock :lines="1" /></div>
            </template>
          </ClientOnly>
        </UiCard>

        <UiCard>
          <h2 class="text-sm font-bold text-ink-900">Tips menerima order</h2>
          <ul class="mt-3 space-y-2.5">
            <li v-for="(t, i) in [
              'Terima order dengan tarif peak yang masuk akal.',
              'Tiba di lokasi jemput maksimal 5 menit.',
              'Jaga komunikasi lewat chat agar penumpang tenang.',
              'Selesaikan perjalanan dengan aman dan ramah.',
            ]" :key="i" class="flex items-start gap-2.5 text-[12.5px] text-ink-600">
              <span class="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-100 text-[9px] font-bold text-brand-700">
                {{ i + 1 }}
              </span>
              {{ t }}
            </li>
          </ul>
        </UiCard>
      </div>
    </div>
  </div>
</template>
