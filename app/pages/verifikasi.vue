<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ApiError } from '~/composables/useApi'

definePageMeta({ layout: 'auth' })

useSeoMeta({
  title: 'Verifikasi Email',
  description: 'Masukkan kode verifikasi 6 digit yang dikirim ke email kamu.',
  robots: 'noindex, follow',
})

const auth = useAuthStore()
const route = useRoute()
const toast = useToast()

const code = ref('')
const serverError = ref('')
const cooldown = ref(0)
const resending = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const challenge = computed(() => auth.challenge)
const title = computed(() => (auth.challengePurpose === 'register' ? 'Verifikasi email kamu' : 'Verifikasi keamanan'))
const subtitle = computed(
  () =>
    `Kode 6 digit sudah dikirim ke ${challenge.value?.email_masked ?? 'email kamu'}. Berlaku 5 menit.`,
)

function startCooldown(seconds: number) {
  cooldown.value = seconds
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (cooldown.value > 0) cooldown.value--
    else if (timer) clearInterval(timer)
  }, 1000)
}

onMounted(() => startCooldown(60))
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

async function submit() {
  serverError.value = ''
  const value = code.value.replace(/\D/g, '')
  if (value.length !== 6) {
    serverError.value = 'Kode verifikasi 6 digit.'
    return
  }
  try {
    const user = await auth.verifyOtp(value)
    toast.success(`Selamat datang, ${user.name.split(' ')[0]}!`)
    const redirect = route.query.redirect
    await navigateTo(typeof redirect === 'string' && redirect.startsWith('/') ? redirect : auth.homePath)
  } catch (e) {
    serverError.value = e instanceof ApiError ? e.message : 'Gagal memverifikasi kode. Coba lagi.'
  }
}

async function resend() {
  if (cooldown.value > 0 || resending.value) return
  resending.value = true
  serverError.value = ''
  try {
    await auth.resendOtp()
    toast.success('Kode baru sudah dikirim.')
    startCooldown(60)
  } catch (e) {
    serverError.value = e instanceof ApiError ? e.message : 'Gagal mengirim ulang kode.'
  } finally {
    resending.value = false
  }
}

function back() {
  const purpose = auth.challengePurpose
  auth.clearChallenge()
  navigateTo(purpose === 'register' ? '/register' : '/login')
}
</script>

<template>
  <div>
    <template v-if="challenge">
      <span class="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <UiIcon name="mail" class="size-6" />
      </span>

      <h1 class="mt-5 text-2xl font-bold tracking-tight text-ink-900">{{ title }}</h1>
      <p class="mt-1.5 text-sm text-ink-500">{{ subtitle }}</p>

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
          v-model="code"
          label="Kode verifikasi"
          placeholder="123456"
          inputmode="numeric"
          autocomplete="one-time-code"
          :maxlength="6"
          class="text-center font-mono text-xl tracking-[0.5em]"
          @update:model-value="code = String($event).replace(/\D/g, '').slice(0, 6)"
        />

        <div
          v-if="challenge.dev_code"
          class="rounded-xl border border-dashed border-brand-300 bg-brand-50/60 px-3.5 py-3 text-center"
        >
          <p class="text-[11px] font-semibold uppercase tracking-wide text-brand-700">Mode demo (tanpa email)</p>
          <p class="mt-1 font-mono text-lg font-bold tracking-[0.3em] text-brand-800">{{ challenge.dev_code }}</p>
        </div>

        <UiButton type="submit" size="lg" block :loading="auth.loading">
          Verifikasi
        </UiButton>
      </form>

      <div class="mt-5 flex items-center justify-between text-[13px]">
        <button
          type="button"
          class="font-semibold transition"
          :class="cooldown > 0 ? 'cursor-not-allowed text-ink-400' : 'text-brand-600 hover:underline'"
          :disabled="cooldown > 0"
          @click="resend"
        >
          {{ cooldown > 0 ? `Kirim ulang (${cooldown}s)` : 'Kirim ulang kode' }}
        </button>
        <button type="button" class="font-semibold text-ink-500 transition hover:text-ink-800" @click="back">
          Ganti email
        </button>
      </div>

      <p class="mt-7 rounded-xl bg-ink-50 px-3.5 py-3 text-center text-[12px] leading-relaxed text-ink-500">
        Perangkat ini akan dipercaya 30 hari — login berikutnya cukup password.
      </p>
    </template>

    <template v-else>
      <span class="grid size-12 place-items-center rounded-2xl bg-ink-100 text-ink-500">
        <UiIcon name="alert-circle" class="size-6" />
      </span>
      <h1 class="mt-5 text-2xl font-bold tracking-tight text-ink-900">Sesi verifikasi berakhir</h1>
      <p class="mt-1.5 text-sm text-ink-500">Silakan masuk atau daftar ulang untuk mendapatkan kode baru.</p>
      <div class="mt-6 flex flex-col gap-2">
        <UiButton to="/login" size="lg" block>Ke Halaman Masuk</UiButton>
        <UiButton to="/register" size="lg" block variant="outline">Daftar Baru</UiButton>
      </div>
    </template>
  </div>
</template>
