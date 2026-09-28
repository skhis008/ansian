<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ApiError } from '~/composables/useApi'

definePageMeta({ layout: 'auth' })

useSeoMeta({
  title: 'Masuk',
  description: 'Masuk ke akun {{ $config.public.appName }} untuk memesan antar jemput atau mengantar pelanggan sebagai driver.',
  robots: 'noindex, follow',
})

const auth = useAuthStore()
const route = useRoute()
const toast = useToast()

const form = reactive({ email: '', password: '', remember: true })
const errors = ref<Record<string, string>>({})
const serverError = ref('')
const showPassword = ref(false)

const demoAccounts = [
  { role: 'Pelanggan', email: 'customer@ansian.id', password: 'password', icon: 'user', tone: 'bg-brand-50 text-brand-600' },
  { role: 'Driver', email: 'driver@ansian.id', password: 'password', icon: 'bike', tone: 'bg-emerald-50 text-emerald-600' },
  { role: 'Admin', email: 'admin@ansian.id', password: 'admin123', icon: 'shield', tone: 'bg-violet-50 text-violet-600' },
]

function fill(account: (typeof demoAccounts)[number]) {
  form.email = account.email
  form.password = account.password
  errors.value = {}
  serverError.value = ''
}

async function submit() {
  errors.value = {}
  serverError.value = ''

  if (!form.email) errors.value.email = 'Email wajib diisi.'
  if (!form.password) errors.value.password = 'Password wajib diisi.'
  if (Object.keys(errors.value).length) return

  try {
    const user = await auth.login(form.email, form.password, form.remember)
    if (!user) {
      /* Perlu OTP — lanjut ke halaman verifikasi */
      const redirect = route.query.redirect
      await navigateTo({ path: '/verifikasi', query: typeof redirect === 'string' ? { redirect } : {} })
      return
    }
    toast.success(`Selamat datang, ${user.name.split(' ')[0]}!`)
    const redirect = route.query.redirect
    await navigateTo(typeof redirect === 'string' && redirect.startsWith('/') ? redirect : auth.homePath)
  } catch (e) {
    if (e instanceof ApiError) {
      serverError.value = e.message
      errors.value = e.fieldErrors()
    } else {
      serverError.value = 'Gagal masuk. Coba lagi.'
    }
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-ink-900">Masuk ke akun</h1>
    <p class="mt-1.5 text-sm text-ink-500">Selamat datang kembali! Silakan masuk untuk melanjutkan.</p>

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
        v-model="form.password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="••••••••"
        icon="shield"
        autocomplete="current-password"
        :error="errors.password"
        required
      >
        <template #suffix>
          <button
            type="button"
            class="text-ink-400 transition hover:text-ink-600"
            :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
            @click="showPassword = !showPassword"
          >
            <UiIcon :name="showPassword ? 'eye-off' : 'eye'" class="size-4" />
          </button>
        </template>
      </UiInput>

      <div class="flex items-center justify-between">
        <UiSwitch v-model="form.remember" label="Ingat saya" />
        <NuxtLink to="/faq#lupa-password" class="text-[13px] font-semibold text-brand-600 hover:underline">
          Lupa password?
        </NuxtLink>
      </div>

      <UiButton type="submit" size="lg" block :loading="auth.loading">
        Masuk
      </UiButton>
    </form>

    <div class="my-6 flex items-center gap-3">
      <span class="h-px flex-1 bg-ink-200" />
      <span class="text-xs font-medium text-ink-400">Akun demo — klik untuk isi otomatis</span>
      <span class="h-px flex-1 bg-ink-200" />
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="acc in demoAccounts"
        :key="acc.email"
        type="button"
        class="group flex flex-col items-center gap-1.5 rounded-xl border border-ink-200 p-3 transition hover:border-brand-300 hover:bg-brand-50/50"
        @click="fill(acc)"
      >
        <span class="grid size-8 place-items-center rounded-lg transition" :class="acc.tone">
          <UiIcon :name="acc.icon" class="size-4" />
        </span>
        <span class="text-[11px] font-semibold text-ink-700 group-hover:text-brand-700">{{ acc.role }}</span>
      </button>
    </div>

    <p class="mt-7 text-center text-sm text-ink-500">
      Belum punya akun?
      <NuxtLink to="/register" class="font-semibold text-brand-600 hover:underline">Daftar gratis</NuxtLink>
    </p>
  </div>
</template>
