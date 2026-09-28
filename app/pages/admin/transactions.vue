<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Paginated, PaymentMethod, PaymentStatus } from '#shared/types'
import { formatRupiah, formatDateTime } from '#shared/utils/format'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '#shared/types'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Transaksi', robots: 'noindex, nofollow' })

const toast = useToast()
const search = ref('')
const status = ref<PaymentStatus | ''>('')
const method = ref<PaymentMethod | ''>('')
const page = ref(1)

const query = reactive({ search: '', status: '', method: '' })
watch([search, status, method], () => {
  query.search = search.value
  query.status = status.value
  query.method = method.value
  page.value = 1
})

type AdminPayment = {
  id: number
  ride_id: number
  ride_code: string
  method: PaymentMethod
  amount: number
  status: PaymentStatus
  reference: string
  paid_at: string | null
  created_at: string
  customer_name: string
  driver_name: string
}

const marking = ref(false)

/** Mock konfirmasi QRIS manual (pada produksi: webhook backend) */
async function markPaid() {
  if (!detail.value) return
  marking.value = true
  try {
    await http.post('/payments/webhook', {
      reference: detail.value.reference,
      transaction_status: 'settlement',
    })
    toast.success('Pembayaran ditandai lunas.')
    detail.value = null
    await refresh()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal menandai pembayaran.')
  } finally {
    marking.value = false
  }
}

const { data, pending, refresh } = await useAsyncData(
  'admin-payments',
  () => http.get<Paginated<AdminPayment>>('/admin/payments', { ...query, page: page.value, per_page: 15 }),
  { watch: [query, page] },
)

const rows = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

const totalAmount = computed(() => rows.value.reduce((a, p) => a + (p.status === 'paid' ? p.amount : 0), 0))
const totalPaid = computed(() => rows.value.filter(p => p.status === 'paid').length)
const totalPending = computed(() => rows.value.filter(p => p.status === 'pending').length)

const STATUS_TONES: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
  refunded: 'gray',
}

const detail = ref<AdminPayment | null>(null)
</script>

<template>
  <div class="space-y-5">
    <AppPageHeader title="Transaksi" description="Rekonsiliasi pembayaran dari seluruh perjalanan." />

    <div class="grid gap-4 sm:grid-cols-3">
      <UiCard>
        <p class="text-[11.5px] text-ink-500">Nilai Berhasil Dibayar</p>
        <p class="mt-1.5 text-xl font-bold tracking-tight text-ink-900">{{ formatRupiah(totalAmount) }}</p>
        <p class="mt-1 text-[11px] text-ink-400">halaman {{ meta?.current_page ?? 1 }}</p>
      </UiCard>
      <UiCard>
        <p class="text-[11.5px] text-ink-500">Transaksi Berhasil</p>
        <p class="mt-1.5 text-xl font-bold tracking-tight text-emerald-600">{{ totalPaid }}</p>
        <p class="mt-1 text-[11px] text-ink-400">pada halaman ini</p>
      </UiCard>
      <UiCard>
        <p class="text-[11.5px] text-ink-500">Menunggu Pembayaran</p>
        <p class="mt-1.5 text-xl font-bold tracking-tight text-amber-600">{{ totalPending }}</p>
        <p class="mt-1 text-[11px] text-ink-400">perlu ditindaklanjuti</p>
      </UiCard>
    </div>

    <UiCard :padded="false">
      <div class="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
        <div class="relative min-w-[15rem] flex-1">
          <UiIcon name="search" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
          <input
            v-model="search"
            type="search"
            placeholder="Cari referensi, kode perjalanan, atau nama…"
            class="h-10 w-full rounded-xl border border-ink-200 bg-white pr-3 pl-9 text-sm outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15"
          >
        </div>
        <select
          v-model="status"
          class="h-10 rounded-xl border border-ink-200 bg-white px-3 text-[12.5px] font-medium text-ink-700 outline-none focus:border-brand-500"
        >
          <option value="">Semua status</option>
          <option v-for="(label, value) in PAYMENT_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
        </select>
        <select
          v-model="method"
          class="h-10 rounded-xl border border-ink-200 bg-white px-3 text-[12.5px] font-medium text-ink-700 outline-none focus:border-brand-500"
        >
          <option value="">Semua metode</option>
          <option v-for="(label, value) in PAYMENT_METHOD_LABELS" :key="value" :value="value">{{ label }}</option>
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
        <AppEmptyState icon="credit-card" title="Tidak ada transaksi" description="Ubah kata kunci atau filter." />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-ink-100 text-[11px] tracking-wide text-ink-400 uppercase">
              <th class="px-4 py-3 font-semibold">Referensi</th>
              <th class="px-3 py-3 font-semibold">Perjalanan</th>
              <th class="px-3 py-3 font-semibold">Pelanggan</th>
              <th class="px-3 py-3 font-semibold">Metode</th>
              <th class="px-3 py-3 font-semibold">Status</th>
              <th class="px-3 py-3 text-right font-semibold">Nominal</th>
              <th class="px-4 py-3 text-right font-semibold">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in rows"
              :key="p.id"
              class="cursor-pointer border-b border-ink-50 last:border-0 hover:bg-ink-50/60"
              @click="detail = p"
            >
              <td class="px-4 py-3 font-mono text-[12px] text-ink-700">{{ p.reference }}</td>
              <td class="px-3 py-3 font-mono text-[12px] text-ink-600">{{ p.ride_code }}</td>
              <td class="px-3 py-3">
                <p class="text-[12.5px] text-ink-700">{{ p.customer_name }}</p>
                <p class="text-[11px] text-ink-400">{{ p.driver_name }}</p>
              </td>
              <td class="px-3 py-3 text-[12.5px] text-ink-700">{{ PAYMENT_METHOD_LABELS[p.method] }}</td>
              <td class="px-3 py-3">
                <UiBadge :tone="STATUS_TONES[p.status]" size="sm" dot>{{ PAYMENT_STATUS_LABELS[p.status] }}</UiBadge>
              </td>
              <td class="px-3 py-3 text-right text-[12.5px] font-semibold text-ink-900">{{ formatRupiah(p.amount) }}</td>
              <td class="px-4 py-3 text-right text-[11.5px] text-ink-400">{{ formatDateTime(p.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between border-t border-ink-100 px-4 py-3">
        <p class="text-[12px] text-ink-500">
          Halaman {{ meta.current_page }} dari {{ meta.last_page }} · {{ meta.total }} transaksi
        </p>
        <div class="flex gap-2">
          <UiButton size="sm" variant="outline" :disabled="page <= 1" @click="page--">Sebelumnya</UiButton>
          <UiButton size="sm" variant="outline" :disabled="page >= meta.last_page" @click="page++">Berikutnya</UiButton>
        </div>
      </div>
    </UiCard>

    <UiModal :open="!!detail" title="Detail Transaksi" :description="detail?.reference" @close="detail = null">
      <dl v-if="detail" class="grid grid-cols-2 gap-3 text-[12.5px]">
        <div class="col-span-2">
          <dt class="text-ink-400">Nominal</dt>
          <dd class="mt-0.5 text-lg font-bold text-ink-900">{{ formatRupiah(detail.amount) }}</dd>
        </div>
        <div>
          <dt class="text-ink-400">Status</dt>
          <dd class="mt-0.5"><UiBadge :tone="STATUS_TONES[detail.status]" size="sm" dot>{{ PAYMENT_STATUS_LABELS[detail.status] }}</UiBadge></dd>
        </div>
        <div>
          <dt class="text-ink-400">Metode</dt>
          <dd class="mt-0.5 font-semibold text-ink-800">{{ PAYMENT_METHOD_LABELS[detail.method] }}</dd>
        </div>
        <div>
          <dt class="text-ink-400">Kode Perjalanan</dt>
          <dd class="mt-0.5 font-mono font-semibold text-ink-800">{{ detail.ride_code }}</dd>
        </div>
        <div>
          <dt class="text-ink-400">Pelanggan</dt>
          <dd class="mt-0.5 font-semibold text-ink-800">{{ detail.customer_name }}</dd>
        </div>
        <div>
          <dt class="text-ink-400">Driver</dt>
          <dd class="mt-0.5 font-semibold text-ink-800">{{ detail.driver_name }}</dd>
        </div>
        <div>
          <dt class="text-ink-400">Dibuat</dt>
          <dd class="mt-0.5 font-semibold text-ink-800">{{ formatDateTime(detail.created_at) }}</dd>
        </div>
        <div>
          <dt class="text-ink-400">Dibayar</dt>
          <dd class="mt-0.5 font-semibold text-ink-800">{{ formatDateTime(detail.paid_at) }}</dd>
        </div>
      </dl>

      <template #footer>
        <UiButton variant="ghost" @click="detail = null">Tutup</UiButton>
        <UiButton
          v-if="detail && (detail.status === 'unpaid' || detail.status === 'pending')"
          variant="outline"
          :loading="marking"
          @click="markPaid"
        >
          Tandai Lunas
        </UiButton>
      </template>
    </UiModal>
  </div>
</template>
