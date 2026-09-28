<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Payment } from '#shared/types'
import { formatDateTime, formatRupiah } from '#shared/utils/format'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Pembayaran', robots: 'noindex, nofollow' })

const auth = useAuthStore()
const toast = useToast()
const payOpen = ref(false)
const selectedRide = ref<number | null>(null)
const paying = ref(false)
const method = ref<'qris' | 'cash'>('qris')

const { data, pending, refresh } = await useAsyncData(`payments-${auth.user?.id}`, () =>
  http.get<PaginatedT<Payment>>('/payments', { per_page: 20 }).then(r => r),
)

type PaginatedT<T> = { data: T[]; meta?: { total: number } }

const payments = computed(() => data.value?.data ?? [])

const summary = computed(() => {
  const list = payments.value
  return {
    total: data.value?.meta?.total ?? 0,
    paid: list.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0),
    pending: list.filter(p => p.status === 'pending').reduce((a, p) => a + p.amount, 0),
    unpaid: list.filter(p => p.status === 'unpaid').reduce((a, p) => a + p.amount, 0),
  }
})

const METHODS = [
  { value: 'qris' as const, label: 'QRIS', icon: 'inbox', desc: 'Semua e-wallet & m-banking' },
  { value: 'cash' as const, label: 'Tunai', icon: 'wallet', desc: 'Bayar langsung ke driver' },
]

const statusTone: Record<string, any> = {
  paid: 'success',
  pending: 'warning',
  unpaid: 'gray',
  failed: 'danger',
  refunded: 'info',
}

const statusLabel: Record<string, string> = {
  paid: 'Lunas',
  pending: 'Diproses',
  unpaid: 'Belum bayar',
  failed: 'Gagal',
  refunded: 'Dikembalikan',
}

function openPay(p: Payment) {
  selectedRide.value = p.ride_id
  payOpen.value = true
}

async function confirmPay() {
  if (!selectedRide.value) return
  paying.value = true
  try {
    await http.post<{ data: Payment; meta?: { message?: string } }>('/payments', {
      ride_id: selectedRide.value,
      method: method.value,
    })
    toast.success(method.value === 'cash' ? 'Pembayaran tunai dicatat. Bayar ke driver saat selesai.' : 'QRIS dibuat. Selesaikan scan untuk konfirmasi.')
    payOpen.value = false
    await refresh()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal memproses pembayaran.')
  } finally {
    paying.value = false
  }
}

onMounted(() => refresh())
</script>

<template>
  <div class="space-y-5">
    <AppPageHeader title="Pembayaran" description="Riwayat transaksi dan metode pembayaran kamu." />

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <UiCard class="!p-4">
        <p class="text-[11px] text-ink-500">Total transaksi</p>
        <p class="mt-0.5 text-lg font-bold text-ink-900">{{ summary.total }}</p>
      </UiCard>
      <UiCard class="!p-4">
        <p class="text-[11px] text-ink-500">Sudah dibayar</p>
        <p class="mt-0.5 text-lg font-bold text-emerald-600">{{ formatRupiah(summary.paid) }}</p>
      </UiCard>
      <UiCard class="!p-4">
        <p class="text-[11px] text-ink-500">Sedang diproses</p>
        <p class="mt-0.5 text-lg font-bold text-amber-600">{{ formatRupiah(summary.pending) }}</p>
      </UiCard>
      <UiCard class="!p-4">
        <p class="text-[11px] text-ink-500">Belum dibayar</p>
        <p class="mt-0.5 text-lg font-bold text-ink-900">{{ formatRupiah(summary.unpaid) }}</p>
      </UiCard>
    </div>

    <UiCard :padded="false" class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[42rem] text-sm">
          <thead>
            <tr class="border-b border-ink-100 bg-ink-50/60 text-left">
              <th class="px-4 py-3 text-[11px] font-bold tracking-wide text-ink-500 uppercase">Referensi</th>
              <th class="px-4 py-3 text-[11px] font-bold tracking-wide text-ink-500 uppercase">Tanggal</th>
              <th class="px-4 py-3 text-[11px] font-bold tracking-wide text-ink-500 uppercase">Metode</th>
              <th class="px-4 py-3 text-[11px] font-bold tracking-wide text-ink-500 uppercase">Status</th>
              <th class="px-4 py-3 text-right text-[11px] font-bold tracking-wide text-ink-500 uppercase">Jumlah</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-100">
            <tr v-if="pending">
              <td colspan="6" class="px-4 py-8"><UiSkeletonBlock :lines="2" /></td>
            </tr>
            <tr v-for="p in payments" :key="p.id" class="transition hover:bg-ink-50/50">
              <td class="px-4 py-3">
                <p class="font-mono text-xs font-semibold text-ink-800">{{ p.reference }}</p>
                <p class="text-[10px] text-ink-400">Perjalanan #{{ p.ride_id }}</p>
              </td>
              <td class="px-4 py-3 text-xs text-ink-600">{{ formatDateTime(p.created_at) }}</td>
              <td class="px-4 py-3">
                <UiBadge tone="gray" size="xs">{{ p.method === 'qris' ? 'QRIS' : 'Tunai' }}</UiBadge>
              </td>
              <td class="px-4 py-3">
                <UiBadge :tone="statusTone[p.status]" size="xs" dot>{{ statusLabel[p.status] }}</UiBadge>
              </td>
              <td class="px-4 py-3 text-right text-sm font-bold text-ink-900">{{ formatRupiah(p.amount) }}</td>
              <td class="px-4 py-3 text-right">
                <UiButton
                  v-if="p.status === 'unpaid' || p.status === 'pending'"
                  size="xs"
                  variant="outline"
                  @click="openPay(p)"
                >
                  Bayar
                </UiButton>
              </td>
            </tr>
            <tr v-if="!pending && !payments.length">
              <td colspan="6" class="px-4 py-12">
                <AppEmptyState icon="credit-card" title="Belum ada transaksi" description="Riwayat pembayaran akan muncul di sini." />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>

    <UiModal
      :open="payOpen"
      title="Pilih metode pembayaran"
      description="Tunai langsung ke driver, atau QRIS lewat aplikasi apa pun."
      size="sm"
      @close="payOpen = false"
    >
      <div class="space-y-2">
        <button
          v-for="g in METHODS"
          :key="g.value"
          type="button"
          class="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition"
          :class="method === g.value ? 'border-brand-500 bg-brand-50/60' : 'border-ink-200 hover:bg-ink-50'"
          @click="method = g.value"
        >
          <UiIcon :name="g.icon" class="size-5 text-ink-600" />
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-bold text-ink-900">{{ g.label }}</span>
            <span class="block text-xs text-ink-500">{{ g.desc }}</span>
          </span>
          <UiIcon v-if="method === g.value" name="check-circle" class="size-5 text-brand-600" />
        </button>
      </div>

      <div class="mt-4 rounded-xl bg-ink-50 p-3.5">
        <p class="text-[11px] text-ink-500">
          Mode demo: pembayaran QRIS disimulasikan. Di produksi, QRIS dibayar lewat aplikasi bank/e-wallet lalu
          dikonfirmasi backend Laravel melalui webhook.
        </p>
      </div>

      <template #footer>
        <UiButton variant="ghost" @click="payOpen = false">Batal</UiButton>
        <UiButton :loading="paying" @click="confirmPay">Lanjutkan</UiButton>
      </template>
    </UiModal>
  </div>
</template>
