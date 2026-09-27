<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ApiError } from '~/composables/useApi'

definePageMeta({ layout: 'auth' })

useSeoMeta({
  title: 'Daftar Gratis',
  description: 'Daftar sebagai penumpang untuk memesan antar jemput, atau sebagai driver untuk mulai menghasilkan penghasilan.',
  robots: 'noindex, follow',
})

const auth = useAuthStore()
const toast = useToast()

const form = reactive({
  role: 'rider' as 'rider' | 'driver',
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  terms: false,
})
const errors = ref<Record<string, string>>({})
const serverError = ref('')
const showPassword = ref(false)

const passwordScore = computed(() => {
  const p = form.password
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthLabel = ['Sangat lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat']
const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500']

function validate() {
  const e: Record<string, string> = {}
  if (!form.name.trim()) e.name = 'Nama lengkap wajib diisi.'
  else if (form.name.trim().length < 3) e.name = 'Nama minimal 3 karakter.'

  if (!form.email) e.email = 'Email wajib diisi.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid.'

  const digits = form.phone.replace(/\D/g, '')
  if (!digits) e.phone = 'Nomor WhatsApp wajib diisi.'
  else if (digits.length < 9) e.phone = 'Nomor HP tidak valid.'

  if (!form.password) e.password = 'Password wajib diisi.'
  else if (form.password.length < 8) e.password = 'Password minimal 8 karakter.'

  if (form.password !== form.password_confirmation) e.password_confirmation = 'Konfirmasi password tidak cocok.'

  if (!form.terms) e.terms = 'Kamu harus menyetujui syarat & ketentuan.'

  errors.value = e
  return Object.keys(e).length === 0
}

async function submit() {
  serverError.value = ''
  if (!validate()) return

  try {
    const user = await auth.register({ ...form })
    toast.success(`Akun ${form.role === 'driver' ? 'driver' : 'penumpang'} berhasil dibuat!`)
    await navigateTo(auth.homePath)
    return user
  } catch (e) {
    if (e instanceof ApiError) {
      serverError.value = e.message
      errors.value = { ...errors.value, ...e.fieldErrors() }
    } else {
      serverError.value = 'Pendaftaran gagal. Coba lagi.'
    }
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-ink-900">Buat akun</h1>
    <p class="mt-1.5 text-sm text-ink-500">Gratis, hanya butuh 1 menit.</p>

    <!-- Pilih role -->
    <div class="mt-6 grid grid-cols-2 gap-3">
      <button
        type="button"
        class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition"
        :class="form.role === 'rider' ? 'border-brand-500 bg-brand-50/60' : 'border-ink-200 hover:border-ink-300'"
        @click="form.role = 'rider'"
      >
        <span class="grid size-10 place-items-center rounded-xl" :class="form.role === 'rider' ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'">
          <UiIcon name="user" class="size-5" />
        </span>
        <span class="text-center">
          <span class="block text-sm font-semibold text-ink-900">Saya Penumpang</span>
          <span class="mt-0.5 block text-[11px] text-ink-500">Butuh diantar</span>
        </span>
      </button>

      <button
        type="button"
        class="flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition"
        :class="form.role === 'driver' ? 'border-emerald-500 bg-emerald-50/60' : 'border-ink-200 hover:border-ink-300'"
        @click="form.role = 'driver'"
      >
        <span class="grid size-10 place-items-center rounded-xl" :class="form.role === 'driver' ? 'bg-emerald-600 text-white' : 'bg-ink-100 text-ink-500'">
          <UiIcon name="car" class="size-5" />
        </span>
        <span class="text-center">
          <span class="block text-sm font-semibold text-ink-900">Saya Driver</span>
          <span class="mt-0.5 block text-[11px] text-ink-500">Ingin penghasilan</span>
        </span>
      </button>
    </div>

    <div
      v-if="serverError"
      class="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
      role="alert"
    >
      <UiIcon name="alert-circle" class="mt-0.5 size-4 shrink-0" />
      <span>{{ serverError }}</span>
    </div>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <UiInput
        v-model="form.name"
        label="Nama lengkap"
        placeholder="Sesuai KTP"
        icon="user"
        autocomplete="name"
        :error="errors.name"
        required
      />

      <UiInput
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="nama@email.com"
        icon="mail"
        autocomplete="email"
        :error="errors.email"
        required
      />

      <UiInput
        v-model="form.phone"
        label="Nomor WhatsApp"
        type="tel"
        placeholder="0812xxxxxxx"
        icon="phone"
        inputmode="numeric"
        autocomplete="tel"
        :error="errors.phone"
        required
      />

      <div>
        <UiInput
          v-model="form.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Minimal 8 karakter"
          icon="shield"
          autocomplete="new-password"
          :error="errors.password"
          required
        >
          <template #suffix>
            <button
              type="button"
              class="text-ink-400 transition hover:text-ink-600"
              :aria-label="showPassword ? 'Sembunyikan' : 'Tampilkan'"
              @click="showPassword = !showPassword"
            >
              <UiIcon :name="showPassword ? 'eye-off' : 'eye'" class="size-4" />
            </button>
          </template>
        </UiInput>

        <div v-if="form.password" class="mt-2 flex items-center gap-2">
          <div class="flex flex-1 gap-1">
            <span
              v-for="i in 4"
              :key="i"
              class="h-1 flex-1 rounded-full transition-colors"
              :class="i <= passwordScore ? strengthColor[passwordScore - 1] : 'bg-ink-200'"
            />
          </div>
          <span class="text-[10px] font-semibold text-ink-500">{{ strengthLabel[passwordScore - 1] }}</span>
        </div>
      </div>

      <UiInput
        v-model="form.password_confirmation"
        label="Ulangi password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Ketik ulang"
        icon="shield"
        autocomplete="new-password"
        :error="errors.password_confirmation"
        required
      />

      <div>
        <label class="flex cursor-pointer items-start gap-2.5">
          <input
            v-model="form.terms"
            type="checkbox"
            class="mt-0.5 size-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          >
          <span class="text-[13px] leading-relaxed text-ink-600">
            Saya setuju dengan
            <NuxtLink to="/terms" class="font-semibold text-brand-600 hover:underline">Ketentuan Layanan</NuxtLink>
            dan
            <NuxtLink to="/kebijakan-privasi" class="font-semibold text-brand-600 hover:underline">Kebijakan Privasi</NuxtLink>.
          </span>
        </label>
        <p v-if="errors.terms" class="mt-1.5 text-xs font-medium text-red-600">{{ errors.terms }}</p>
      </div>

      <UiButton type="submit" size="lg" block :loading="auth.loading">
        {{ form.role === 'driver' ? 'Daftar sebagai Driver' : 'Daftar Sekarang' }}
      </UiButton>
    </form>

    <p class="mt-6 text-center text-sm text-ink-500">
      Sudah punya akun?
      <NuxtLink to="/login" class="font-semibold text-brand-600 hover:underline">Masuk</NuxtLink>
    </p>
  </div>
</template>
