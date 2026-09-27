<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Ride } from '#shared/types'
import { formatDateTime, formatDistance, formatRupiah } from '#shared/utils/format'

definePageMeta({ layout: 'app' })

const route = useRoute()
const toast = useToast()
const chat = useChatStore()
const rateOpen = ref(false)

const id = computed(() => Number(route.params.id))

const { data: ride, pending, error } = await useAsyncData(
  () => `ride-${id.value}`,
  () => http.get<{ data: Ride }>(`/rides/${id.value}`).then(r => r.data),
)

useSeoMeta({
  title: computed(() => `Perjalanan ${ride.value?.ride_code ?? ''}`),
  robots: 'noindex, nofollow',
})

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
  midtrans: 'Midtrans',
  xendit: 'Xendit',
  wallet: 'Dompet',
}

async function openChat() {
  if (!ride.value) return
  await chat.openConversation(ride.value.ride_code)
  await navigateTo('/rider/chat')
}

async function submitRating(payload: { score: number; comment: string | null; tags: string[] }) {
  if (!ride.value) return
  try {
    await http.post(`/rides/${ride.value.id}/rate`, payload)
    toast.success('Terima kasih atas rating kamu!')
    rateOpen.value = false
    await refreshNuxtData(`ride-${id.value}`)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal mengirim rating.')
  }
}
</script>

<template>
  <div class="space-y-5">
    <NuxtLink to="/rider/rides" class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
      <UiIcon name="arrow-left" class="size-4" />
      Kembali ke riwayat
    </NuxtLink>

    <div v-if="pending" class="space-y-4">
      <div class="rounded-2xl border border-ink-200 bg-white p-5"><UiSkeletonBlock :lines="4" /></div>
      <div class="rounded-2xl border border-ink-200 bg-white p-5"><UiSkeletonBlock :lines="3" /></div>
    </div>

    <div v-else-if="error || !ride" class="rounded-2xl border border-ink-200 bg-white p-6">
      <AppEmptyState
        icon="alert-circle"
        title="Perjalanan tidak ditemukan"
        description="Data perjalanan mungkin sudah tidak tersedia."
      >
        <UiButton to="/rider/rides">Kembali</UiButton>
      </AppEmptyState>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-bold tracking-tight text-ink-900">{{ ride.ride_code }}</h1>
            <RideStatusBadge :status="ride.status" />
          </div>
          <p class="mt-1 text-sm text-ink-500">
            Dibuat {{ formatDateTime(ride.created_at) }}
            <span v-if="ride.service_type === 'scheduled'"> · Jadwal terjadwal</span>
          </p>
        </div>

        <div class="flex gap-2">
          <UiButton variant="outline" size="sm" @click="openChat">
            <template #icon><UiIcon name="message-circle" class="size-4" /></template>
            Chat
          </UiButton>
          <UiButton
            v-if="ride.status === 'completed' && !ride.rating"
            size="sm"
            @click="rateOpen = true"
          >
            <template #icon><UiIcon name="star" class="size-4" /></template>
            Beri Rating
          </UiButton>
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-3">
        <div class="space-y-5 lg:col-span-2">
          <!-- Peta -->
          <UiCard :padded="false" class="overflow-hidden">
            <ClientOnly>
              <MapCanvas
                :pickup="ride.pickup"
                :destination="ride.destination"
                height="h-72"
              />
            </ClientOnly>
          </UiCard>

          <!-- Rute -->
          <UiCard>
            <h2 class="mb-4 text-sm font-bold text-ink-900">Detail Rute</h2>
            <div class="flex items-start gap-3">
              <div class="flex flex-col items-center pt-1">
                <span class="size-3 rounded-full border-2 border-ink-900" />
                <span class="my-1 w-0.5 flex-1 rounded-full bg-ink-200" />
                <span class="size-3 rounded-full bg-rose-600" />
              </div>
              <div class="min-w-0 flex-1 space-y-4">
                <div>
                  <p class="text-[10px] font-medium tracking-wide text-ink-400 uppercase">Titik jemput</p>
                  <p class="mt-0.5 text-sm font-semibold text-ink-900">{{ ride.pickup.address }}</p>
                  <p v-if="ride.pickup_note" class="mt-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
                    Catatan: {{ ride.pickup_note }}
                  </p>
                </div>
                <div>
                  <p class="text-[10px] font-medium tracking-wide text-ink-400 uppercase">Tujuan</p>
                  <p class="mt-0.5 text-sm font-semibold text-ink-900">{{ ride.destination.address }}</p>
                </div>
              </div>
            </div>

            <dl class="mt-5 grid grid-cols-3 gap-3 border-t border-ink-100 pt-4">
              <div>
                <dt class="text-[10px] text-ink-400 uppercase">Jarak</dt>
                <dd class="mt-0.5 text-sm font-bold text-ink-900">{{ formatDistance(ride.distance_km) }}</dd>
              </div>
              <div>
                <dt class="text-[10px] text-ink-400 uppercase">Durasi</dt>
                <dd class="mt-0.5 text-sm font-bold text-ink-900">{{ ride.duration_min }} mnt</dd>
              </div>
              <div>
                <dt class="text-[10px] text-ink-400 uppercase">Lonjakan</dt>
                <dd class="mt-0.5 text-sm font-bold" :class="ride.surge_multiplier > 1 ? 'text-amber-600' : 'text-ink-900'">
                  {{ ride.surge_multiplier }}×
                </dd>
              </div>
            </dl>
          </UiCard>

          <!-- Rating -->
          <UiCard v-if="ride.rating">
            <h2 class="mb-3 text-sm font-bold text-ink-900">Rating kamu</h2>
            <div class="flex items-center gap-1.5">
              <UiIcon
                v-for="i in 5"
                :key="i"
                name="star"
                class="size-5"
                :class="i <= ride.rating.score ? 'fill-amber-400 text-amber-400' : 'text-ink-200'"
              />
              <span class="ml-1.5 text-sm font-bold text-ink-900">{{ ride.rating.score }}.0</span>
            </div>
            <p v-if="ride.rating.comment" class="mt-2.5 text-sm text-ink-600">“{{ ride.rating.comment }}”</p>
            <div v-if="ride.rating.tags?.length" class="mt-2.5 flex flex-wrap gap-1.5">
              <UiBadge v-for="t in ride.rating.tags" :key="t" tone="gray" size="xs">{{ t }}</UiBadge>
            </div>
          </UiCard>
        </div>

        <div class="space-y-5">
          <!-- Ringkasan pembayaran -->
          <UiCard>
            <h2 class="mb-3 text-sm font-bold text-ink-900">Ringkasan Pembayaran</h2>
            <dl class="space-y-2.5 text-sm">
              <div class="flex justify-between">
                <dt class="text-ink-500">Ongkos perjalanan</dt>
                <dd class="font-semibold text-ink-800">{{ formatRupiah(ride.fare) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-ink-500">Metode</dt>
                <dd class="font-semibold text-ink-800">{{ PAYMENT_LABEL[ride.payment_method] ?? ride.payment_method }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-ink-500">Status</dt>
                <dd>
                  <UiBadge :tone="ride.payment_status === 'paid' ? 'success' : ride.payment_status === 'failed' ? 'danger' : 'warning'">
                    {{ ride.payment_status === 'paid' ? 'Lunas' : ride.payment_status === 'unpaid' ? 'Belum bayar' : ride.payment_status }}
                  </UiBadge>
                </dd>
              </div>
              <div class="flex items-end justify-between border-t border-ink-100 pt-2.5">
                <dt class="font-semibold text-ink-900">Total</dt>
                <dd class="text-lg font-bold text-ink-900">{{ formatRupiah(ride.fare) }}</dd>
              </div>
            </dl>

            <UiButton
              v-if="ride.payment_status === 'unpaid' && ride.payment_method !== 'cash'"
              :to="`/rider/checkout/${ride.id}`"
              size="sm"
              block
              class="mt-4"
            >
              Bayar Sekarang
            </UiButton>
          </UiCard>

          <!-- Driver -->
          <UiCard v-if="ride.driver">
            <h2 class="mb-3 text-sm font-bold text-ink-900">Driver</h2>
            <div class="flex items-center gap-3">
              <UiAvatar :name="ride.driver.user.name" :src="ride.driver.user.avatar_url" :size="44" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-ink-900">{{ ride.driver.user.name }}</p>
                <p class="flex items-center gap-1 text-xs text-ink-500">
                  <UiIcon name="star" class="size-3 fill-amber-400 text-amber-400" />
                  {{ ride.driver.rating }}
                  <span aria-hidden="true">·</span>
                  {{ ride.driver.vehicle_color }} {{ ride.driver.vehicle_model }}
                </p>
              </div>
            </div>
            <div class="mt-3 flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2.5">
              <span class="text-[10px] font-medium tracking-wide text-ink-400 uppercase">Plat</span>
              <span class="rounded-md bg-ink-900 px-2 py-0.5 font-mono text-sm font-bold tracking-wider text-white">
                {{ ride.driver.vehicle_plate }}
              </span>
            </div>
            <UiButton :href="`tel:${ride.driver.user.phone}`" variant="outline" size="sm" block class="mt-3">
              <template #icon><UiIcon name="phone" class="size-4" /></template>
              {{ ride.driver.user.phone }}
            </UiButton>
          </UiCard>

          <!-- Timeline -->
          <UiCard>
            <h2 class="mb-4 text-sm font-bold text-ink-900">Riwayat Status</h2>
            <RideTimeline :ride="ride" />
          </UiCard>
        </div>
      </div>

      <RideRateModal :open="rateOpen" :ride="ride" @close="rateOpen = false" @submitted="submitRating" />
    </template>
  </div>
</template>
