<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Payment } from '#shared/types'
import { formatDateTime, formatRupiah } from '#shared/utils/format'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Checkout', robots: 'noindex, nofollow' })

const route = useRoute()
const toast = useToast()
const rideId = computed(() => Number(route.params.id))
const method = ref<'qris' | 'midtrans' | 'xendit' | 'wallet'>('qris')
const processing = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const { data: ride } = await useAsyncData(`checkout-${rideId.value}`, () =>
  http.get<{ data: any }>(`/rides/${rideId.value}`).then(r => r.data),
)

const GATEWAYS = [
  { value: 'qris' as const, label: 'QRIS', icon: 'inbox', desc: 'Scan dengan GoPay / OVO / DANA / m-banking', recommended: true },
  { value: 'midtrans' as const, label: 'Midtrans', icon: 'credit-card', desc: 'Virtual account, e-wallet, kartu kredit' },
  { value: 'xendit' as const, label: 'Xendit', icon: 'zap', desc: 'OVO, DANA, ShopeePay, LinkAja' },
  { value: 'wallet' as const, label: 'Saldo Dompet', icon: 'briefcase', desc: 'Saldo tersedia Rp185.000' },
]

const GATEWAY_LABEL: Record<string, string> = {
  qris: 'QRIS',
  midtrans: 'Midtrans',
  xendit: 'Xendit',
  wallet: 'Dompet',
}

onMounted(() => {
  countdown.value = 900
  timer = setInterval(() => {
    if (countdown.value > 0) countdown.value--
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const countdownLabel = computed(() => {
  const m = Math.floor(countdown.value / 60)
  const s = countdown.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

async function pay() {
  processing.value = true
  try {
    const res = await http.post<{ data: Payment }>('/payments', { ride_id: rideId.value, method: method.value })
    toast.success('Pembayaran berhasil!')
    await navigateTo(`/rider/rides/${rideId.value}`)
    void res
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Pembayaran gagal. Coba lagi.')
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-5">
    <AppPageHeader title="Checkout" description="Selesaikan pembayaran perjalanan kamu." />

    <div class="grid gap-5 lg:grid-cols-5">
      <!-- Ringkasan -->
      <div class="space-y-4 lg:col-span-2">
        <UiCard v-if="ride">
          <div class="flex items-center gap-3">
            <span class="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <UiIcon name="navigation" class="size-5" />
            </span>
            <div class="min-w-0">
              <p class="font-mono text-sm font-bold text-ink-900">{{ ride.ride_code }}</p>
              <p class="text-[11px] text-ink-500">{{ formatDateTime(ride.created_at) }}</p>
            </div>
          </div>

          <div class="mt-4 space-y-3 border-t border-ink-100 pt-4">
            <div class="flex items-start gap-2.5">
              <span class="mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-ink-900" />
              <div class="min-w-0">
                <p class="text-[10px] text-ink-400 uppercase">Jemput</p>
                <p class="text-[13px] font-semibold text-ink-800">{{ ride.pickup.address }}</p>
              </div>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="mt-1.5 size-2.5 shrink-0 rounded-full bg-rose-600" />
              <div class="min-w-0">
                <p class="text-[10px] text-ink-400 uppercase">Tujuan</p>
                <p class="text-[13px] font-semibold text-ink-800">{{ ride.destination.address }}</p>
              </div>
            </div>
          </div>

          <div class="mt-4 flex items-end justify-between border-t border-ink-100 pt-4">
            <div>
              <p class="text-[11px] text-ink-500">Total tagihan</p>
              <p class="text-2xl font-bold text-ink-900">{{ formatRupiah(ride.fare) }}</p>
            </div>
            <RideStatusBadge :status="ride.status" />
          </div>
        </UiCard>
      </div>

      <!-- Metode -->
      <div class="space-y-4 lg:col-span-3">
        <UiCard>
          <h2 class="text-sm font-bold text-ink-900">Metode pembayaran</h2>
          <div class="mt-3 space-y-2">
            <button
              v-for="g in GATEWAYS"
              :key="g.value"
              type="button"
              class="flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition"
              :class="method === g.value ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500/20' : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50'"
              @click="method = g.value"
            >
              <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-white shadow-xs">
                <UiIcon :name="g.icon" class="size-4.5 text-ink-700" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="text-sm font-bold text-ink-900">{{ g.label }}</span>
                  <UiBadge v-if="g.recommended" tone="brand" size="xs">Rekomendasi</UiBadge>
                </span>
                <span class="block text-xs text-ink-500">{{ g.desc }}</span>
              </span>
              <span
                class="grid size-5 shrink-0 place-items-center rounded-full border-2 transition"
                :class="method === g.value ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'"
              >
                <UiIcon v-if="method === g.value" name="check" class="size-3" />
              </span>
            </button>
          </div>
        </UiCard>

        <!-- QRIS preview -->
        <UiCard v-if="method === 'qris'">
          <div class="flex flex-col items-center py-4">
            <div class="relative grid size-44 place-items-center rounded-2xl bg-white p-3 shadow-soft ring-1 ring-ink-200">
              <PayQrPlaceholder />
            </div>
            <p class="mt-4 text-sm font-semibold text-ink-900">Scan dengan aplikasi apa pun</p>
            <p class="mt-0.5 text-xs text-ink-500">Kode berlaku {{ countdownLabel }}</p>
            <p class="mt-3 font-mono text-sm font-bold text-ink-800">{{ GATEWAY_LABEL[method] }}-{{ rideId }}-AJ</p>
          </div>
        </UiCard>

        <div class="flex flex-col gap-2 sm:flex-row">
          <UiButton
            to="/rider/rides"
            variant="outline"
            block
            @click="navigateTo(`/rider/rides/${rideId}`)"
          >
            Batalkan
          </UiButton>
          <UiButton size="lg" block :loading="processing" @click="pay">
            Bayar {{ formatRupiah(ride?.fare ?? 0) }}
          </UiButton>
        </div>

        <p class="flex items-start gap-2 rounded-xl bg-ink-100 px-3.5 py-3 text-[11px] leading-relaxed text-ink-600">
          <UiIcon name="shield-check" class="mt-px size-4 shrink-0 text-emerald-600" />
          Transaksi diproses melalui server Laravel ({{ GATEWAY_LABEL[method] }}). Data kartu tidak pernah menyentuh frontend ini.
        </p>
      </div>
    </div>
  </div>
</template>
