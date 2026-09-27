<script setup lang="ts">
import { computed, ref } from 'vue'
import { FARE_CONFIG, syntheticRoute } from '#shared/utils/geo'
import { formatRupiah } from '#shared/utils/format'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'AntarJemput — Ojek Online Murah & Cepat di Sekitarmu',
  description:
    'Pesan ojek online kapan saja dengan tarif transparan, driver terverifikasi, dan-tracking perjalanan real-time di seluruh Indonesia.',
  ogTitle: 'AntarJemput — Ojek Online Murah & Cepat',
  ogDescription: 'Tarif transparan, driver terverifikasi, tracking real-time.',
  ogType: 'website',
})

const ORIGIN = { lat: -6.208763, lng: 106.8456 }
const routePath = syntheticRoute(ORIGIN, { lat: -6.175392, lng: 106.827153 }, 18)

const steps = [
  {
    step: '01',
    title: 'Tentukan lokasi',
    text: 'Pilih titik jemput dan tujuan. Sistem menghitung tarif transparan sebelum kamu memesan.',
    icon: 'map-pin',
    tone: 'bg-brand-50 text-brand-600',
  },
  {
    step: '02',
    title: 'Pilih layanan',
    text: 'Motor, mobil, atau van. Bisa dijadwalkan hingga 7 hari ke depan.',
    icon: 'car',
    tone: 'bg-violet-50 text-violet-600',
  },
  {
    step: '03',
    title: 'Driver menuju lokasi',
    text: 'Driver terdekat menerima order dan posisinya terlihat langsung di peta.',
    icon: 'navigation',
    tone: 'bg-amber-50 text-amber-600',
  },
  {
    step: '04',
    title: 'Perjalanan selesai',
    text: 'Bayar sesuai metode pilihan, lalu beri rating untuk membantu komunitas.',
    icon: 'check-circle',
    tone: 'bg-emerald-50 text-emerald-600',
  },
]

const features = [
  { icon: 'zap', title: 'Driver terdekat', text: 'Rata-rata driver sudah berada dalam radius 3 km dari lokasi kamu.' },
  { icon: 'credit-card', title: 'Bayar fleksibel', text: 'QRIS, virtual account, e-wallet, atau tunai saat perjalanan selesai.' },
  { icon: 'activity', title: 'Tracking real-time', text: 'Pantau posisi driver dan perkiraan tiba secara langsung.' },
  { icon: 'message-circle', title: 'Chat aman', text: 'Hubungi driver atau tim bantuan kapan saja tanpa intercambio nomor pribadi.' },
  { icon: 'shield-check', title: 'Driver terverifikasi', text: 'KTP, SIM, STNK, dan foto kendaraan diverifikasi sebelum driver bergabung.' },
  { icon: 'percent', title: 'Tarif transparan', text: 'Rincian tarif tampil sebelum konfirmasi — tidak ada biaya tersembunyi.' },
]

const stats = [
  { value: '2,4jt+', label: 'perjalanan selesai' },
  { value: '18rb+', label: 'driver terverifikasi' },
  { value: '4,9/5', label: 'rata-rata rating' },
  { value: '< 8 mnt', label: 'rata-rata tiba' },
]

const faqs = [
  {
    q: 'Bagaimana cara menghitung tarifnya?',
    a: `Tarif dihitung dari tarif dasar Rp${FARE_CONFIG.baseFare.toLocaleString('id-ID')}, biaya jarak Rp${FARE_CONFIG.perKm.toLocaleString('id-ID')}/km, biaya waktu Rp${FARE_CONFIG.perMinute.toLocaleString('id-ID')}/menit, dan biaya layanan ${FARE_CONFIG.serviceFeePercent * 100}%. Semua rincian tampil sebelum kamu menekan tombol pesan.`,
  },
  {
    q: 'Apakah saya bisa menjadwalkan perjalanan?',
    a: 'Bisa. Kamu dapat memesan perjalanan hingga 7 hari ke depan, dan driver akan ditugaskan sekitar 5 menit sebelum waktu keberangkatan.',
  },
  {
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'QRIS (semua e-wallet dan m-banking), virtual account, kartu kredit, OVO/DANA, saldo aplikasi, serta tunai kepada driver.',
  },
  {
    q: 'Bagaimana jika driver tidak datang?',
    a: 'Kamu bisa membatalkan perjalanan gratis dalam 2 menit pertama, atau menghubungi customer service 24 jam untuk membantu finding driver pengganti.',
  },
]

const activeFaq = ref(0)
const heroPickup = ref({ lat: -6.208763, lng: 106.8456, address: 'Lokasi kamu', place_name: 'Jakarta Pusat' })
const heroDestination = ref({ lat: -6.175392, lng: 106.827153, address: 'Monas', place_name: 'Bundaran HI' })

const estimate = computed(() => {
  const km = 4.8
  const minutes = 14
  const before = Math.max(FARE_CONFIG.minFare, FARE_CONFIG.baseFare + km * FARE_CONFIG.perKm + minutes * FARE_CONFIG.perMinute)
  return Math.round(before * (1 + FARE_CONFIG.serviceFeePercent))
})
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <div class="container-app grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5 text-[11px] font-bold text-brand-700">
            <UiIcon name="zap" class="size-3" />
            {{ stats[3].value }} rata-rata tiba
          </span>

          <h1 class="mt-4 text-3xl leading-tight font-bold tracking-tight text-ink-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Ojek online yang<br class="hidden sm:block">
            <span class="text-brand-600">tepat waktu</span> & transparan
          </h1>

          <p class="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-600">
            Pesan driver terdekat hanya dalam hitungan detik. Tarif jelas sebelum konfirmasi, posisi driver terpantau
            real-time, dan pembayaran aman lewat QRIS maupun e-wallet favoritmu.
          </p>

          <div class="mt-7 flex flex-wrap items-center gap-3">
            <UiButton to="/register" size="lg">Pesan Sekarang</UiButton>
            <UiButton to="/driver/daftar" variant="outline" size="lg">
              <template #icon><UiIcon name="bike" class="size-4.5" /></template>
              Gabung Jadi Driver
            </UiButton>
          </div>

          <dl class="mt-9 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <div v-for="s in stats" :key="s.label">
              <dt class="text-lg font-bold text-ink-900">{{ s.value }}</dt>
              <dd class="text-[11px] leading-snug text-ink-500">{{ s.label }}</dd>
            </div>
          </dl>
        </div>

        <!-- Booking preview -->
        <div class="relative">
          <div class="overflow-hidden rounded-3xl border border-ink-200/80 bg-white shadow-lift">
            <div class="flex items-center gap-2 border-b border-ink-100 px-4 py-3">
              <span class="size-2.5 rounded-full bg-emerald-500" />
              <span class="size-2.5 rounded-full bg-amber-400" />
              <span class="size-2.5 rounded-full bg-rose-400" />
              <span class="ml-2 text-[11px] font-semibold text-ink-500">Pratinjau pemesanan</span>
            </div>

            <ClientOnly>
              <MapCanvas
                :center="heroPickup"
                :pickup="heroPickup"
                :destination="heroDestination"
                :route="routePath"
                :zoom="13"
                height="h-64"
                :show-traffic-note="false"
              />
              <template #fallback>
                <div class="grid h-64 place-items-center bg-ink-100"><UiSkeletonBlock :lines="1" /></div>
              </template>
            </ClientOnly>

            <div class="space-y-3 p-4">
              <div class="flex items-center gap-2.5 rounded-xl border border-ink-200 px-3 py-2.5">
                <span class="size-2.5 shrink-0 rounded-full border-2 border-ink-900" />
                <div class="min-w-0">
                  <p class="text-[10px] text-ink-400 uppercase">Jemput</p>
                  <p class="truncate text-[13px] font-semibold text-ink-800">{{ heroPickup.place_name }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2.5 rounded-xl border border-ink-200 px-3 py-2.5">
                <span class="size-2.5 shrink-0 rounded-full bg-rose-600" />
                <div class="min-w-0">
                  <p class="text-[10px] text-ink-400 uppercase">Tujuan</p>
                  <p class="truncate text-[13px] font-semibold text-ink-800">{{ heroDestination.place_name }}</p>
                </div>
              </div>

              <div class="flex items-end justify-between rounded-xl bg-ink-50 px-3.5 py-3">
                <div>
                  <p class="text-[10px] text-ink-500">Estimasi tarif</p>
                  <p class="text-lg font-bold text-ink-900">{{ formatRupiah(estimate) }}</p>
                </div>
                <UiBadge tone="brand" size="xs">4,8 km · 14 mnt</UiBadge>
              </div>

              <UiButton to="/rider/book" block>Mulai Pesan</UiButton>
            </div>
          </div>

          <div class="absolute -bottom-4 -left-4 hidden items-center gap-2.5 rounded-2xl border border-ink-200 bg-white px-3.5 py-2.5 shadow-lift sm:flex">
            <UiAvatar name="Dimas saputra" :size="34" />
            <div>
              <p class="text-[12px] font-bold text-ink-900">Dimas (B 1234 ABC)</p>
              <p class="text-[10px] text-ink-500">4,9 ★ · 1,2 km dari kamu</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CARA KERJA -->
    <section id="cara-kerja" class="container-app scroll-mt-20 py-16">
      <div class="max-w-2xl">
        <h2 class="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Cara kerja</h2>
        <p class="mt-3 text-[15px] text-ink-600">
          Empat langkah sederhana dari pemesanan sampai perjalanan selesai.
        </p>
      </div>

      <ol class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="s in steps" :key="s.step" class="relative">
          <div class="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft">
            <div class="flex items-center justify-between">
              <span class="grid size-10 place-items-center rounded-xl" :class="s.tone">
                <UiIcon :name="s.icon" class="size-5" />
              </span>
              <span class="font-mono text-2xl font-bold text-ink-100">{{ s.step }}</span>
            </div>
            <h3 class="mt-4 text-[15px] font-bold text-ink-900">{{ s.title }}</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-ink-600">{{ s.text }}</p>
          </div>
        </li>
      </ol>
    </section>

    <!-- FITUR -->
    <section id="fitur" class="scroll-mt-20 border-y border-ink-200/70 bg-ink-50/40 py-16">
      <div class="container-app">
        <div class="max-w-2xl">
          <h2 class="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Fitur yang membuat perjalanan lebih aman</h2>
          <p class="mt-3 text-[15px] text-ink-600">
            Semua fitur inti sudah tersedia, siap dihubungkan ke backend Laravel.
          </p>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="f in features" :key="f.title" class="rounded-2xl border border-ink-200/80 bg-white p-5">
            <span class="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <UiIcon :name="f.icon" class="size-5" />
            </span>
            <h3 class="mt-4 text-[15px] font-bold text-ink-900">{{ f.title }}</h3>
            <p class="mt-1.5 text-[13px] leading-relaxed text-ink-600">{{ f.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA DRIVER -->
    <section class="container-app py-16">
      <div class="grid items-center gap-8 overflow-hidden rounded-3xl bg-ink-900 p-8 text-white lg:grid-cols-2 lg:p-12">
        <div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold">
            <UiIcon name="bike" class="size-3" />
            Untuk driver
          </span>
          <h2 class="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Penghasilan sampai Rp4 juta / minggu</h2>
          <p class="mt-3 max-w-md text-[14px] leading-relaxed text-white/70">
            Atur sendiri waktu online kamu, terima permintaan terdekat, dan pantau pendapatan lewat dashboard khusus driver.
          </p>
          <div class="mt-6 flex flex-wrap gap-2">
            <span v-for="b in ['Tanpa biaya pendaftaran', 'Pembayaran harian', 'Driver terverifikasi']" :key="b" class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-semibold">
              <UiIcon name="check" class="size-3" />
              {{ b }}
            </span>
          </div>
        </div>
        <div class="flex justify-end">
          <UiButton to="/driver/daftar" size="lg" variant="primary">Daftar Jadi Driver</UiButton>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="border-t border-ink-200/70 bg-ink-50/40 py-16">
      <div class="container-app">
        <div class="max-w-2xl">
          <h2 class="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Pertanyaan umum</h2>
          <p class="mt-3 text-[15px] text-ink-600">Masih ada pertanyaan lain? <NuxtLink to="/faq" class="font-semibold text-brand-600 hover:underline">Lihat semua FAQ</NuxtLink></p>
        </div>

        <div class="mt-8 max-w-3xl space-y-2.5">
          <div
            v-for="(f, i) in faqs"
            :key="f.q"
            class="overflow-hidden rounded-2xl border bg-white transition"
            :class="activeFaq === i ? 'border-brand-300' : 'border-ink-200/80'"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              @click="activeFaq = activeFaq === i ? -1 : i"
            >
              <span class="text-[14px] font-bold text-ink-900">{{ f.q }}</span>
              <UiIcon name="chevron-down" class="size-4 shrink-0 text-ink-400 transition-transform" :class="activeFaq === i ? 'rotate-180' : ''" />
            </button>
            <div v-if="activeFaq === i" class="px-4 pb-4 text-[13.5px] leading-relaxed text-ink-600">
              {{ f.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="container-app py-16 text-center">
      <h2 class="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Siap mulai perjalanan pertama?</h2>
      <p class="mx-auto mt-3 max-w-xl text-[15px] text-ink-600">
        Buat akun gratis, verifikasi nomor WhatsApp, dan pesan driver terdekat dalam hitungan detik.
      </p>
      <div class="mt-7 flex flex-wrap justify-center gap-3">
        <UiButton to="/register" size="lg">Daftar Gratis</UiButton>
        <UiButton to="/login" size="lg" variant="outline">Sudah punya akun</UiButton>
      </div>
    </section>
  </div>
</template>
