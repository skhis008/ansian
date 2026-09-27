<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { VehicleType } from '#shared/types'

definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Gabung Jadi Driver — AntarJemput',
  description: 'Daftar jadi driver AntarJemput. Tidak ada biaya pendaftaran, pembayaran harian, dan kamu atur sendiri waktu online.',
})

const form = reactive({
  name: '',
  phone: '',
  vehicle_type: 'motorcycle' as VehicleType,
  vehicle_plate: '',
  vehicle_color: '',
  vehicle_model: '',
})

const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const done = ref(false)

const benefits = [
  { icon: 'wallet', title: 'Bayaran harian', text: 'Pendapatan masuk ke saldo setiap hari kerja.' },
  { icon: 'clock', title: 'Atur waktu sendiri', text: 'Nyalakan status online kapan saja kamu mau.' },
  { icon: 'shield-check', title: 'Dokumen Lengkap', text: 'Kami bantu proses verifikasi lengkap.' },
]

const requirements = [
  'Berusia minimal 21 tahun dan memiliki SIM aktif',
  'Memiliki KTP, SIM, STNK, dan foto kendaraan',
  'Kendaraan dalam kondisi baik dan lengkap',
  'Memegang izin usaha sesuai ketentuan yang berlaku',
]

const VEHICLES: { value: VehicleType; label: string; icon: string }[] = [
  { value: 'motorcycle', label: 'Motor', icon: 'bike' },
  { value: 'car', label: 'Mobil', icon: 'car' },
  { value: 'van', label: 'Van', icon: 'package' },
]

const valid = computed(() => form.name && form.phone && form.vehicle_plate)

function validate() {
  errors.value = {}
  if (!form.name.trim()) errors.value.name = 'Nama wajib diisi.'
  if (!/^08[0-9]{8,11}$/.test(form.phone.replace(/[\s-]/g, ''))) {
    errors.value.phone = 'Masukkan nomor WhatsApp yang valid, contoh 08123456789.'
  }
  if (!form.vehicle_plate.trim()) errors.value.vehicle_plate = 'Nomor kendaraan wajib diisi.'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  await new Promise(r => setTimeout(r, 600))
  try {
    await http.post('/auth/register', { ...form, role: 'driver' })
  } catch {
    /* Mode demo: pendaftaran tetap diarahkan ke login walau API menolak, agar alur bisa dicoba. */
  } finally {
    submitting.value = false
    done.value = true
  }
}
</script>

<template>
  <div class="bg-ink-50">
    <section class="border-b border-ink-200 bg-ink-900">
      <div class="container-app grid gap-10 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <UiBadge tone="brand" size="sm">Pendaftaran Driver</UiBadge>
          <h1 class="mt-4 text-3xl leading-tight font-bold tracking-tight text-white sm:text-4xl">
           Mulai earning,<br>
            Kamu yang atur waktunya.
          </h1>
          <p class="mt-4 max-w-md text-[14px] leading-relaxed text-ink-300">
            Gabung dengan ribuan driver AntarJemput. Tanpa biaya pendaftaran, tanpa target harian, dan pembayaran
            ditransfer setiap hari kerja.
          </p>
          <ul class="mt-8 space-y-4">
            <li v-for="b in benefits" :key="b.title" class="flex items-start gap-3">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <UiIcon :name="b.icon" class="size-4.5" />
              </span>
              <div>
                <p class="text-[14px] font-semibold text-white">{{ b.title }}</p>
                <p class="text-[12.5px] text-ink-400">{{ b.text }}</p>
              </div>
            </li>
          </ul>
        </div>

        <UiCard class="border-0 p-6 shadow-xl sm:p-7">
          <template v-if="!done">
            <h2 class="text-lg font-bold text-ink-900">Isi Data Driver</h2>
            <p class="mt-1.5 text-[12.5px] text-ink-500">
             *Lengkapi data berikut. Verifikasi dokumen dilakukan setelah akun dibuat.
            </p>

            <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
              <label class="block">
                <span class="mb-1.5 block text-[12.5px] font-medium text-ink-700">Nama lengkap</span>
                <UiInput v-model="form.name" placeholder="mis. Budi Santoso" :error="errors.name" autocomplete="name" />
              </label>

              <label class="block">
                <span class="mb-1.5 block text-[12.5px] font-medium text-ink-700">Nomor WhatsApp</span>
                <UiInput
                  v-model="form.phone"
                  type="tel"
                  inputmode="numeric"
                  placeholder="08123456789"
                  :error="errors.phone"
                  autocomplete="tel"
                />
              </label>

              <div>
                <span class="mb-1.5 block text-[12.5px] font-medium text-ink-700">Jenis kendaraan</span>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="v in VEHICLES"
                    :key="v.value"
                    type="button"
                    class="flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[12px] font-medium transition"
                    :class="
                      form.vehicle_type === v.value
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                    "
                    @click="form.vehicle_type = v.value"
                  >
                    <UiIcon :name="v.icon" class="size-5" />
                    {{ v.label }}
                  </button>
                </div>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="mb-1.5 block text-[12.5px] font-medium text-ink-700">Nomor kendaraan</span>
                  <UiInput v-model="form.vehicle_plate" placeholder="B 1234 XYZ" :error="errors.vehicle_plate" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[12.5px] font-medium text-ink-700">Warna</span>
                  <UiInput v-model="form.vehicle_color" placeholder="Hitam" />
                </label>
              </div>

              <label class="block">
                <span class="mb-1.5 block text-[12.5px] font-medium text-ink-700">Merek dan tipe</span>
                <UiInput v-model="form.vehicle_model" placeholder="mis. Honda Beat 2023" />
              </label>

              <UiButton type="submit" block :loading="submitting" :disabled="!valid">Daftar Jadi Driver</UiButton>

              <p class="text-center text-[11.5px] text-ink-400">
                Dengan mendaftar, kamu menyetujui
                <NuxtLink to="/terms" class="font-medium text-brand-700 hover:underline">Syarat & Ketentuan</NuxtLink>
                dan
                <NuxtLink to="/kebijakan-privasi" class="font-medium text-brand-700 hover:underline">
                  Kebijakan Privasi
                </NuxtLink>.
              </p>
            </form>
          </template>

          <template v-else>
            <div class="py-6 text-center">
              <span class="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <UiIcon name="check-circle" class="size-7" />
              </span>
              <h2 class="mt-4 text-lg font-bold text-ink-900">Pendaftaran Terkirim</h2>
              <p class="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-500">
                Tim kami akan memverifikasi dokumen kamu dalam 1x24 jam. Sementara itu, masuk dengan akun demo driver untuk
                menjelajahi dasbor.
              </p>
              <div class="mt-6 flex flex-col gap-2">
                <UiButton to="/login" block>Masuk ke Akun</UiButton>
                <UiButton to="/driver" block variant="soft">Lihat Dasbor Driver</UiButton>
              </div>
            </div>
          </template>
        </UiCard>
      </div>
    </section>

    <section class="container-app py-14">
      <div class="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 class="text-xl font-bold text-ink-900">Syarat Pendaftaran</h2>
          <ul class="mt-4 space-y-3">
            <li v-for="r in requirements" :key="r" class="flex items-start gap-2.5">
              <UiIcon name="check-circle" class="mt-0.5 size-4 shrink-0 text-brand-600" />
              <span class="text-[13.5px] leading-relaxed text-ink-600">{{ r }}</span>
            </li>
          </ul>
        </div>

        <UiCard class="h-fit bg-ink-50">
          <h3 class="text-[14px] font-bold text-ink-900">Pertanyaan Umum</h3>
          <div class="mt-3 space-y-3 text-[13px] text-ink-600">
            <p><span class="font-semibold text-ink-800">Biaya pendaftaran?</span> Gratis, tanpa biaya tersembunyi.</p>
            <p><span class="font-semibold text-ink-800">Kapan pembayaran masuk?</span> Setiap hari kerja ke saldo aplikasi.</p>
            <p><span class="font-semibold text-ink-800">Bisa offline kapan saja?</span> Bisa. Kamu yang menentukan.</p>
          </div>
          <UiButton to="/faq" block variant="soft" class="mt-4">Baca FAQ Lengkap</UiButton>
        </UiCard>
      </div>
    </section>
  </div>
</template>
