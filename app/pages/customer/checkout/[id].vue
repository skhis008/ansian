<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Payment } from '#shared/types'
import { formatDateTime, formatRupiah } from '#shared/utils/format'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Checkout', robots: 'noindex, nofollow' })

const route = useRoute()
const toast = useToast()
const rideId = computed(() => Number(route.params.id))
const method = ref<'qris' | 'cash'>('qris')
const processing = ref(false)
const countdown = ref(0)
const payment = ref<Payment | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

const { data: ride } = await useAsyncData(`checkout-${rideId.value}`, () =>
  http.get<{ data: any }>(`/rides/${rideId.value}`).then(r => r.data),
)

const { data: qris } = await useAsyncData('qris-config', () =>
  http
    .get<{ data: { image_url: string; merchant_name: string; instructions: string[] } }>('/payments/qris')
    .then(r => r.data),
)

const OPTIONS = [
  { value: 'qris' as const, label: 'QRIS', icon: 'inbox', desc: 'Semua e-wallet & mobile banking', recommended: true },
  { value: 'cash' as const, label: 'Tunai', icon: 'wallet', desc: 'Bayar langsung ke driver saat selesai' },
]

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
  if (!ride.value) return
  processing.value = true
  try {
    if (method.value === 'cash') {
      await http.post<{ data: Payment }>('/payments', { ride_id: rideId.value, method: 'cash' })
      toast.success('Siapkan tunai — bayar ke driver saat perjalanan selesai.')
      await navigateTo(`/customer/rides/${rideId.value}`)
      return
    }
    const res = await http.post<{ data: Payment }>('/payments', { ride_id: rideId.value, method: 'qris' })
    payment.value = res.data
    toast.success('QRIS dibuat. Pindai kode lalu konfirmasi pembayaran.')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Pembayaran gagal. Coba lagi.')
  } finally {
    processing.value = false
  }
}

/** Mock konfirmasi QRIS — di produksi dipanggil webhook backend, bukan frontend */
async function confirmPaid() {
  if (!payment.value) return
  processing.value = true
  try {
    await http.post('/payments/webhook', {
      reference: payment.value.reference,
      transaction_status: 'settlement',
    })
    toast.success('Pembayaran terkonfirmasi!')
    await navigateTo(`/customer/rides/${rideId.value}`)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal konfirmasi pembayaran.')
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

        <UiCard v-if="method === 'cash' && !payment">
          <div class="flex items-start gap-3">
            <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <UiIcon name="wallet" class="size-4.5" />
            </span>
            <div>
              <p class="text-sm font-bold text-ink-900">Bayar tunai ke driver</p>
              <p class="mt-1 text-xs leading-relaxed text-ink-500">
                Serahkan uang sesuai total tagihan saat perjalanan selesai. Tidak ada pembayaran online.
              </p>
            </div>
          </div>
        </UiCard>
      </div>

      <!-- Metode -->
      <div class="space-y-4 lg:col-span-3">
        <UiCard>
          <h2 class="text-sm font-bold text-ink-900">Metode pembayaran</h2>
          <div class="mt-3 space-y-2">
            <button
              v-for="o in OPTIONS"
              :key="o.value"
              type="button"
              class="flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition"
              :class="method === o.value ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500/20' : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50'"
              :disabled="Boolean(payment)"
              @click="method = o.value"
            >
              <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-white shadow-xs">
                <UiIcon :name="o.icon" class="size-4.5 text-ink-700" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="text-sm font-bold text-ink-900">{{ o.label }}</span>
                  <UiBadge v-if="o.recommended" tone="brand" size="xs">Rekomendasi</UiBadge>
                </span>
                <span class="block text-xs text-ink-500">{{ o.desc }}</span>
              </span>
              <span
                class="grid size-5 shrink-0 place-items-center rounded-full border-2 transition"
                :class="method === o.value ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'"
              >
                <UiIcon v-if="method === o.value" name="check" class="size-3" />
              </span>
            </button>
          </div>
        </UiCard>

        <!-- QRIS -->
        <UiCard v-if="method === 'qris'">
          <div class="flex flex-col items-center py-4">
            <div class="grid size-44 place-items-center rounded-2xl bg-white p-3 shadow-soft ring-1 ring-ink-200">
              <img v-if="qris?.image_url" :src="qris.image_url" alt="Kode QRIS pembayaran" class="size-full object-contain">
              <PayQrPlaceholder v-else />
            </div>
            <p class="mt-4 text-sm font-semibold text-ink-900">{{ qris?.merchant_name ?? 'Ansian' }}</p>
            <p class="mt-0.5 text-xs text-ink-500">Pindai dengan aplikasi apa pun · berlaku {{ countdownLabel }}</p>
            <p v-if="payment" class="mt-3 font-mono text-xs font-bold text-ink-700">{{ payment.reference }}</p>

            <ol v-if="qris?.instructions?.length" class="mt-4 w-full space-y-1.5 text-left text-xs text-ink-500">
              <li v-for="(step, i) in qris.instructions" :key="i" class="flex gap-2">
                <span class="font-bold text-ink-400">{{ i + 1 }}.</span>
                <span>{{ step }}</span>
              </li>
            </ol>

            <UiButton
              v-if="payment"
              size="lg"
              block
              class="mt-4"
              :loading="processing"
              @click="confirmPaid"
            >
              Saya Sudah Bayar
            </UiButton>
            <p v-else class="mt-4 text-center text-[11px] text-ink-400">
              Tekan tombol bayar untuk membuat kode pembayaran.
            </p>
          </div>
        </UiCard>

        <div class="flex flex-col gap-2 sm:flex-row">
          <UiButton
            v-if="!payment"
            variant="outline"
            block
            @click="navigateTo(`/customer/rides/${rideId}`)"
          >
            Batalkan
          </UiButton>
          <UiButton v-else variant="outline" block @click="payment = null">
            Ganti metode
          </UiButton>
          <UiButton
            v-if="!payment"
            size="lg"
            block
            :loading="processing"
            @click="pay"
          >
            Bayar {{ formatRupiah(ride?.fare ?? 0) }}
          </UiButton>
        </div>

        <p class="flex items-start gap-2 rounded-xl bg-ink-100 px-3.5 py-3 text-[11px] leading-relaxed text-ink-600">
          <UiIcon name="shield-check" class="mt-px size-4 shrink-0 text-emerald-600" />
          {{ method === 'qris'
            ? 'QRIS dibuat & dikonfirmasi oleh backend Laravel — frontend tidak pernah memegang data pembayaran.'
            : 'Tunai dibayar langsung ke driver, tanpa proses online.' }}
        </p>
      </div>
    </div>
  </div>
</template>
