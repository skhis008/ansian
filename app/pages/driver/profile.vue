<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { VehicleType } from '#shared/types'
import { formatDate, maskPhone } from '#shared/utils/format'

definePageMeta({ layout: 'app' })
useSeoMeta({ title: 'Profil Kendaraan', robots: 'noindex, nofollow' })

const auth = useAuthStore()
const driver = useDriverStore()
const toast = useToast()

const saving = ref(false)
const editing = ref(false)
const errors = ref<Record<string, string>>({})

const form = reactive({
  vehicle_type: 'motorcycle' as VehicleType,
  vehicle_plate: '',
  vehicle_color: '',
  vehicle_model: '',
})

if (auth.isDriver && auth.driver) driver.sync(auth.driver)

const profile = computed(() => driver.profile)

const VEHICLES: { value: VehicleType; label: string; icon: string }[] = [
  { value: 'motorcycle', label: 'Motor', icon: 'bike' },
]

const VERIFICATION_TONES: Record<string, 'success' | 'warning' | 'danger'> = {
  verified: 'success',
  pending: 'warning',
  rejected: 'danger',
}
const VERIFICATION_TEXT: Record<string, string> = {
  verified: 'Terverifikasi',
  pending: 'Menunggu verifikasi admin',
  rejected: 'Ditolak — hubungi CS',
}

const STATUS_LABEL: Record<string, string> = {
  offline: 'Offline',
  idle: 'Online — siap menerima order',
  busy: 'Sedang mengantar',
}

onMounted(() => {
  if (!profile.value && auth.isDriver && auth.driver) driver.sync(auth.driver)
  fillForm()
})

function fillForm() {
  const p = profile.value
  if (!p) return
  form.vehicle_type = p.vehicle_type
  form.vehicle_plate = p.vehicle_plate
  form.vehicle_color = p.vehicle_color
  form.vehicle_model = p.vehicle_model
}

function startEdit() {
  fillForm()
  errors.value = {}
  editing.value = true
}

async function save() {
  errors.value = {}
  if (!form.vehicle_plate.trim()) {
    errors.value.vehicle_plate = 'Nomor kendaraan wajib diisi.'
    return
  }
  saving.value = true
  try {
    await driver.updateVehicle({ ...form })
    toast.success('Data kendaraan diperbarui.')
    editing.value = false
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Gagal menyimpan data kendaraan.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-5">
    <AppPageHeader title="Profil Kendaraan" description="Data kendaraan dan status ketersediaan kamu.">
      <template #actions>
        <UiBadge :tone="profile?.status === 'offline' ? 'gray' : 'success'" dot>
          {{ STATUS_LABEL[profile?.status ?? 'offline'] }}
        </UiBadge>
      </template>
    </AppPageHeader>

    <!-- Ringkasan driver -->
    <UiCard>
      <div class="flex flex-wrap items-center gap-4">
        <UiAvatar :name="auth.user?.name ?? 'Driver'" :src="profile?.photo_url ?? auth.user?.avatar_url" :size="64" />
        <div class="min-w-0 flex-1">
          <p class="text-base font-bold text-ink-900">{{ auth.user?.name }}</p>
          <p class="font-mono text-[11px] text-ink-500">{{ profile?.driver_code }} · {{ maskPhone(auth.user?.phone ?? '') }}</p>
        </div>
        <div class="flex gap-4 text-center">
          <div>
            <p class="text-lg font-bold text-ink-900">{{ (profile?.rating ?? 5).toFixed(1) }}</p>
            <p class="text-[10px] text-ink-400">Rating</p>
          </div>
          <div>
            <p class="text-lg font-bold text-ink-900">{{ profile?.total_rides ?? 0 }}</p>
            <p class="text-[10px] text-ink-400">Perjalanan</p>
          </div>
          <div>
            <p class="text-lg font-bold text-ink-900">{{ profile?.online_hours ?? 0 }}</p>
            <p class="text-[10px] text-ink-400">Jam online</p>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Data mahasiswa & verifikasi -->
    <UiCard>
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-bold text-ink-900">Data mahasiswa</h2>
        <UiBadge :tone="VERIFICATION_TONES[profile?.verification ?? 'pending']" dot>
          {{ VERIFICATION_TEXT[profile?.verification ?? 'pending'] }}
        </UiBadge>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl bg-ink-50 p-3.5">
          <p class="text-[10px] text-ink-400 uppercase">NIM</p>
          <p class="mt-0.5 font-mono text-sm font-bold text-ink-900">{{ profile?.student_id || '-' }}</p>
        </div>
        <div class="rounded-xl bg-ink-50 p-3.5">
          <p class="text-[10px] text-ink-400 uppercase">Kampus</p>
          <p class="mt-0.5 text-sm font-bold text-ink-900">{{ profile?.campus || '-' }}</p>
        </div>
        <div class="rounded-xl bg-ink-50 p-3.5">
          <p class="text-[10px] text-ink-400 uppercase">Program studi</p>
          <p class="mt-0.5 text-sm font-bold text-ink-900">{{ profile?.study_program || '-' }}</p>
        </div>
      </div>
      <p v-if="profile?.verification !== 'verified'" class="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-800">
        Akunmu sudah aktif untuk login, tetapi order baru bisa diterima setelah admin memverifikasi NIM & kampus.
      </p>
    </UiCard>

    <!-- Kendaraan -->
    <UiCard>
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-ink-900">Data kendaraan</h2>
        <UiButton v-if="!editing" variant="outline" size="sm" @click="startEdit">
          <template #icon><UiIcon name="edit" class="size-4" /></template>
          Ubah
        </UiButton>
      </div>

      <!-- Mode lihat -->
      <div v-if="!editing" class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-xl bg-ink-50 p-3.5">
          <p class="text-[10px] text-ink-400 uppercase">Jenis</p>
          <p class="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-ink-900">
            <UiIcon :name="VEHICLES.find(v => v.value === profile?.vehicle_type)?.icon ?? 'bike'" class="size-4" />
            {{ VEHICLES.find(v => v.value === profile?.vehicle_type)?.label ?? profile?.vehicle_type }}
          </p>
        </div>
        <div class="rounded-xl bg-ink-50 p-3.5">
          <p class="text-[10px] text-ink-400 uppercase">Nomor kendaraan</p>
          <p class="mt-0.5 font-mono text-sm font-bold text-ink-900">{{ profile?.vehicle_plate }}</p>
        </div>
        <div class="rounded-xl bg-ink-50 p-3.5">
          <p class="text-[10px] text-ink-400 uppercase">Warna</p>
          <p class="mt-0.5 text-sm font-bold text-ink-900">{{ profile?.vehicle_color || '-' }}</p>
        </div>
        <div class="rounded-xl bg-ink-50 p-3.5">
          <p class="text-[10px] text-ink-400 uppercase">Merek / model</p>
          <p class="mt-0.5 text-sm font-bold text-ink-900">{{ profile?.vehicle_model || '-' }}</p>
        </div>
      </div>

      <!-- Mode edit -->
      <div v-else class="mt-4 space-y-4">
        <div>
          <p class="mb-2 text-[11px] font-semibold text-ink-500">Jenis kendaraan</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="v in VEHICLES"
              :key="v.value"
              type="button"
              class="flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition"
              :class="form.vehicle_type === v.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:bg-ink-50'"
              @click="form.vehicle_type = v.value"
            >
              <UiIcon :name="v.icon" class="size-5" />
              {{ v.label }}
            </button>
          </div>
        </div>

        <UiInput
          v-model="form.vehicle_plate"
          label="Nomor kendaraan"
          icon="bike"
          placeholder="F 1234 ABC"
          :error="errors.vehicle_plate"
        />
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput v-model="form.vehicle_color" label="Warna" icon="eye" placeholder="Hitam" />
          <UiInput v-model="form.vehicle_model" label="Merek / model" icon="package" placeholder="Honda Beat" />
        </div>

        <div class="flex justify-end gap-2 border-t border-ink-100 pt-4">
          <UiButton variant="ghost" @click="editing = false">Batal</UiButton>
          <UiButton :loading="saving" @click="save">Simpan Perubahan</UiButton>
        </div>
      </div>
    </UiCard>

    <!-- Dokumen -->
    <UiCard>
      <h2 class="text-sm font-bold text-ink-900">Dokumen verifikasi</h2>
      <p class="mt-1 text-[12px] text-ink-500">Berkas diverifikasi oleh tim admin.</p>
      <div class="mt-3 grid gap-2 sm:grid-cols-2">
        <div
          v-for="doc in [
            { name: 'KTP', status: 'Terverifikasi' },
            { name: 'SIM', status: 'Terverifikasi' },
            { name: 'STNK', status: 'Terverifikasi' },
            { name: 'Foto Kendaraan', status: 'Terverifikasi' },
          ]"
          :key="doc.name"
          class="flex items-center gap-3 rounded-xl border border-ink-200 p-3"
        >
          <span class="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
            <UiIcon name="file-text" class="size-4" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-[13px] font-semibold text-ink-900">{{ doc.name }}</span>
            <span class="block text-[10px] text-emerald-600">{{ doc.status }}</span>
          </span>
          <UiIcon name="check-circle" class="size-4 text-emerald-600" />
        </div>
      </div>
    </UiCard>

    <p class="text-center text-[11px] text-ink-400">
        Bergabung {{ formatDate(auth.user?.created_at) }} · {{ auth.user?.email }}
    </p>
  </div>
</template>
