<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SystemSetting } from '#shared/types'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Pengaturan', robots: 'noindex, nofollow' })

const toast = useToast()

const GROUP_META: Record<string, { title: string; description: string; icon: string }> = {
  general: {
    title: 'Aplikasi',
    description: 'Identitas layanan yang ditampilkan ke pengguna.',
    icon: 'settings',
  },
  fare: {
    title: 'Tarif Zona',
    description: 'Aturan tarif per zona jarak (hijau, kuning, jingga, merah) beserta biaya admin.',
    icon: 'wallet',
  },
  ride: {
    title: 'Operasional Perjalanan',
    description: 'Radius pencarian driver dan aturan pembatalan.',
    icon: 'navigation',
  },
  driver: {
    title: 'Driver Mahasiswa',
    description: 'Standar kelayakan driver mahasiswa yang diterima.',
    icon: 'bike',
  },
  payment: {
    title: 'Pembayaran',
    description: 'Metode pembayaran yang aktif (Tunai & QRIS).',
    icon: 'credit-card',
  },
  chat: {
    title: 'Dukungan',
    description: 'Balasan otomatis dan channel komunikasi.',
    icon: 'message-circle',
  },
}

const { data, pending, refresh } = await useAsyncData(
  'admin-settings',
  () => http.get<{ data: SystemSetting[] }>('/admin/settings').then(r => r.data),
)

const drafts = ref<Record<string, string>>({})
const saving = ref(false)

watch(
  data,
  list => {
    const next: Record<string, string> = {}
    for (const s of list ?? []) next[s.key] = s.value
    drafts.value = next
  },
  { immediate: true },
)

const groups = computed(() => {
  const list = data.value ?? []
  const order = Object.keys(GROUP_META)
  return order
    .map(key => {
      const items = list.filter(s => s.group === key)
      return { key, items, ...(GROUP_META[key] ?? { title: key, description: '', icon: 'settings' }) }
    })
    .filter(g => g.items.length)
})

const dirtyKeys = computed(() =>
  (data.value ?? []).filter(s => drafts.value[s.key] !== undefined && drafts.value[s.key] !== s.value).map(s => s.key),
)

async function save() {
  if (!dirtyKeys.value.length) return
  saving.value = true
  try {
    const payload: Record<string, string> = {}
    for (const key of dirtyKeys.value) payload[key] = drafts.value[key] ?? ''
    await http.put('/admin/settings', { settings: payload })
    toast.success(`${dirtyKeys.value.length} pengaturan disimpan.`)
    await refresh()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal menyimpan pengaturan.')
  } finally {
    saving.value = false
  }
}

function reset() {
  const next: Record<string, string> = {}
  for (const s of data.value ?? []) next[s.key] = s.value
  drafts.value = next
}

const isBool = (t: SystemSetting['type']) => t === 'boolean'
const boolValue = (v: string) => v === 'true' || v === '1'
</script>

<template>
  <div class="space-y-5">
    <AppPageHeader title="Pengaturan" description="Konfigurasi parameter layanan dan tarif.">
      <template #actions>
        <UiButton v-if="dirtyKeys.length" size="sm" variant="ghost" @click="reset">Batalkan</UiButton>
        <UiButton size="sm" :loading="saving" :disabled="!dirtyKeys.length" @click="save">
          Simpan {{ dirtyKeys.length ? `(${dirtyKeys.length})` : '' }}
        </UiButton>
      </template>
    </AppPageHeader>

    <div v-if="pending" class="space-y-4">
      <UiCard v-for="i in 3" :key="i"><UiSkeletonBlock :lines="4" /></UiCard>
    </div>

    <UiCard v-else-if="!groups.length">
      <AppEmptyState icon="settings" title="Belum ada pengaturan" description="Konfigurasi akan tampil di sini." />
    </UiCard>

    <template v-else>
      <UiCard v-for="g in groups" :key="g.key">
        <div class="mb-4 flex items-start gap-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <UiIcon :name="g.icon" class="size-4.5" />
          </span>
          <div>
            <h3 class="text-sm font-bold text-ink-900">{{ g.title }}</h3>
            <p class="text-[12px] text-ink-500">{{ g.description }}</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div v-for="s in g.items" :key="s.key" class="space-y-1.5">
            <template v-if="isBool(s.type)">
              <UiSwitch
                :model-value="boolValue(drafts[s.key] ?? 'false')"
                @update:model-value="drafts[s.key] = $event ? 'true' : 'false'"
              >
                <span class="text-[12.5px] font-semibold text-ink-800">{{ s.label }}</span>
              </UiSwitch>
              <p class="text-[11px] text-ink-400">{{ s.key }}</p>
            </template>

            <label v-else class="block">
              <span class="mb-1.5 block text-[12.5px] font-medium text-ink-700">
                {{ s.label }}
                <span v-if="drafts[s.key] !== s.value" class="ml-1 text-brand-600">(diubah)</span>
              </span>
              <textarea
                v-if="s.type === 'text'"
                v-model="drafts[s.key]"
                rows="3"
                class="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-[13px] text-ink-800 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/15"
              />
              <UiInput
                v-else
                v-model="drafts[s.key]"
                :type="s.type === 'number' ? 'number' : 'text'"
              />
              <span class="mt-1 block text-[11px] text-ink-400">{{ s.key }}</span>
            </label>
          </div>
        </div>
      </UiCard>

      <p class="text-center text-[11px] text-ink-300">
        Perubahan berlaku untuk perjalanan baru setelah disimpan.
      </p>
    </template>
  </div>
</template>
