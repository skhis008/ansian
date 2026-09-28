<script setup lang="ts">
import { computed, ref } from 'vue'
import { distanceKm, syntheticRoute } from '#shared/utils/geo'
import { calculateZoneFare, ZONE_RULES } from '#shared/utils/pricing'
import { formatRupiah } from '#shared/utils/format'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Ansian — Antar Jemput Dinusian: Tarif Zona Hemat & Driver Mahasiswa',
  description:
    'Ansian (Antar Jemput Dinusian) melayani antar-jemput motor di area Udinus dan sekitarnya dengan tarif zona yang hemat dan transparan, plus wadah kerja sampingan bagi mahasiswa.',
  ogTitle: 'Ansian — Antar Jemput Dinusian',
  ogDescription: 'Tarif zona hemat, tanpa lonjakan. Driver mahasiswa terverifikasi di area Udinus.',
  ogType: 'website',
})

const ORIGIN = { lat: -6.982835, lng: 110.409352 }
const DEST = { lat: -6.9727, lng: 110.3767 }
const routePath = syntheticRoute(ORIGIN, DEST, 18)

const steps = [
  {
    step: '01',
    title: 'Tentukan lokasi',
    text: 'Pilih titik jemput dan tujuan. Tarif zona langsung terhitung dan tampil sebelum kamu pesan.',
    icon: 'map-pin',
    tone: 'bg-brand-50 text-brand-600',
  },
  {
    step: '02',
    title: 'Pilih pembayaran',
    text: 'Bayar tunai ke driver atau QRIS di akhir perjalanan. Bisa dijadwalkan hingga 7 hari ke depan.',
    icon: 'credit-card',
    tone: 'bg-violet-50 text-violet-600',
  },
  {
    step: '03',
    title: 'Driver menjemput',
    text: 'Driver mahasiswa terdekat menerima order dan posisinya terlihat langsung di peta.',
    icon: 'navigation',
    tone: 'bg-amber-50 text-amber-600',
  },
  {
    step: '04',
    title: 'Perjalanan selesai',
    text: 'Bayar sesuai metode pilihan, lalu beri rating untuk membantu sesama pengguna Ansian.',
    icon: 'check-circle',
    tone: 'bg-emerald-50 text-emerald-600',
  },
]

const features = [
  { icon: 'percent', title: 'Tarif zona hemat', text: 'Tarif ditentukan zona jarak — mulai Rp4.500, tanpa lonjakan harga, tanpa biaya layanan tersembunyi.' },
  { icon: 'wallet', title: 'Bayar fleksibel', text: 'QRIS untuk semua e-wallet dan m-banking, atau tunai langsung ke driver.' },
  { icon: 'shield-check', title: 'Driver mahasiswa terverifikasi', text: 'Khusus mahasiswa — NIM, kampus, SIM, dan kendaraan diverifikasi admin sebelum aktif.' },
  { icon: 'activity', title: 'Tracking real-time', text: 'Pantau posisi driver dan perkiraan tiba secara langsung selama perjalanan.' },
  { icon: 'message-circle', title: 'Chat aman', text: 'Hubungi driver atau customer service kapan saja tanpa bertukar nomor pribadi.' },
  { icon: 'briefcase', title: 'Kerja sampingan mahasiswa', text: 'Punya motor dan waktu luang? Jadi driver Ansian tanpa bingung promosi ke mana-mana.' },
]

const faqs = [
  {
    q: 'Kenapa tarif Ansian lebih hemat?',
    a: 'Tarif ditentukan oleh zona jarak (hijau, kuning, jingga, merah) — bukan perhitungan yang berubah-ubah. Tidak ada lonjakan harga (surge) maupun biaya layanan tambahan; yang tampil di awal itulah yang dibayar, ditambah biaya admin tetap Rp500–Rp1.000.',
  },
  {
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'Tunai langsung kepada driver saat perjalanan selesai, atau QRIS (semua e-wallet dan m-banking) dengan konfirmasi pembayaran di aplikasi.',
  },
  {
    q: 'Siapa yang boleh jadi driver?',
    a: 'Mahasiswa aktif. Cukup daftar dengan NIM, nama kampus, dan data motor, lalu tunggu verifikasi admin. Setelah terverifikasi, kamu bisa langsung menerima order dan mengatur jadwal online sendiri.',
  },
  {
    q: 'Bagaimana cara mendaftar?',
    a: 'Buat akun (bebas mahasiswa atau warga lokal), masukkan kode verifikasi 6 digit yang dikirim ke emailmu, dan selesai. Ingin jadi driver? Isi formulir khusus mahasiswa di halaman Gabung Jadi Driver.',
  },
]

const activeFaq = ref(0)
const heroPickup = ref({ lat: -6.982835, lng: 110.409352, address: 'Kampus Udinus, Semarang', place_name: 'Kampus Udinus' })
const heroDestination = ref({ lat: -6.9727, lng: 110.3767, address: 'Kawasan Bandara Ahmad Yani, Semarang', place_name: 'Bandara Ahmad Yani' })

const heroFare = computed(() => calculateZoneFare(distanceKm(heroPickup.value, heroDestination.value)))

const stats = [
  { value: 'Rp4.500', label: 'tarif zona hijau (0–2,5 km)' },
  { value: '4 zona', label: 'tarif jelas sesuai jarak' },
  { value: 'Rp0', label: 'lonjakan & biaya tersembunyi' },
  { value: 'Rp0', label: 'biaya pendaftaran driver' },
]
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <div class="container-app grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5 text-[11px] font-bold text-brand-700">
            <UiIcon name="map-pin" class="size-3" />
            Area Udinus & sekitarnya
          </span>

          <h1 class="mt-4 text-3xl leading-tight font-bold tracking-tight text-ink-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Antar-jemput <span class="text-brand-600">tarif hemat</span>,<br class="hidden sm:block">
            driver sesama mahasiswa
          </h1>

          <p class="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-600">
            <strong class="font-semibold text-ink-800">Ansian (Antar Jemput Dinusian)</strong> melayani area Udinus dan
            sekitarnya dengan tarif zona yang transparan — tanpa lonjakan, tanpa biaya tersembunyi. Mahasiswa yang ingin
            penghasilan sampingan tidak perlu bingung promosi: daftar, verifikasi, langsung dapat order.
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
                  <p class="text-[10px] text-ink-500">Estimasi tarif (termasuk biaya admin)</p>
                  <p class="text-lg font-bold text-ink-900">{{ formatRupiah(heroFare.total) }}</p>
                </div>
                <UiBadge tone="brand" size="xs">
                  {{ heroFare.zone_label }} · {{ heroFare.distance_km.toLocaleString('id-ID') }} km
                </UiBadge>
              </div>

              <UiButton to="/customer/book" block>Mulai Pesan</UiButton>
            </div>
          </div>

          <div class="absolute -bottom-4 -left-4 hidden items-center gap-2.5 rounded-2xl border border-ink-200 bg-white px-3.5 py-2.5 shadow-lift sm:flex">
            <UiAvatar name="Dimas Saputra" :size="34" />
            <div>
              <p class="text-[12px] font-bold text-ink-900">Dimas (mahasiswa)</p>
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

    <!-- HARGA ZONA -->
    <section id="harga" class="scroll-mt-20 border-y border-ink-200/70 bg-ink-50/40 py-16">
      <div class="container-app">
        <div class="max-w-2xl">
          <h2 class="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Tarif zona yang hemat & jelas</h2>
          <p class="mt-3 text-[15px] text-ink-600">
            Jarak menentukan zona, zona menentukan tarif. Tanpa lonjakan harga — yang tampil di awal itulah yang kamu
            bayar, ditambah biaya admin tetap.
          </p>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="z in ZONE_RULES"
            :key="z.id"
            class="rounded-2xl border border-ink-200/80 bg-white p-5"
            :style="{ borderTopWidth: '4px', borderTopColor: z.color }"
          >
            <div class="flex items-center gap-2">
              <span class="size-3 rounded-full" :style="{ backgroundColor: z.color }" />
              <h3 class="text-[15px] font-bold text-ink-900">{{ z.label }}</h3>
            </div>
            <p class="mt-3 text-[13px] text-ink-500">{{ z.rangeLabel }}</p>
            <p class="mt-1 text-xl font-bold text-ink-900">{{ z.fareRangeLabel }}</p>
            <p class="mt-1 text-[12.5px] text-ink-500">+ biaya admin Rp{{ z.adminFee.toLocaleString('id-ID') }}</p>
          </div>
        </div>

        <p class="mt-6 text-[13px] text-ink-500">
          Contoh: 4,5 km (Zona Kuning) → tarif Rp{{ (5000 + 5000).toLocaleString('id-ID') }} + admin
          Rp500 = <strong class="font-semibold text-ink-700">Rp{{ (10000 + 500).toLocaleString('id-ID') }}</strong>.
          Semua rincian tampil sebelum kamu menekan tombol pesan.
        </p>
      </div>
    </section>

    <!-- FITUR -->
    <section id="fitur" class="scroll-mt-20 py-16">
      <div class="container-app">
        <div class="max-w-2xl">
          <h2 class="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Kenapa memilih Ansian</h2>
          <p class="mt-3 text-[15px] text-ink-600">
            Dibangun untuk dua hal: perjalanan yang lebih hemat, dan peluang penghasilan sampingan mahasiswa.
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
            Khusus mahasiswa
          </span>
          <h2 class="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Kerja sampingan tanpa bingung promosi
          </h2>
          <p class="mt-3 max-w-md text-[14px] leading-relaxed text-white/70">
            Punya motor dan waktu luang antar kuliah? Cukup daftar dengan NIM dan kampusmu — setelah verifikasi admin,
            order masuk sendiri ke aplikasi. Atur jadwal online sesuai ritme kuliahmu.
          </p>
          <div class="mt-6 flex flex-wrap gap-2">
            <span
              v-for="b in ['Tanpa biaya pendaftaran', 'Jadwal online fleksibel', 'Pendapatan transparan']"
              :key="b"
              class="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-semibold"
            >
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
        Buat akun gratis, masukkan kode verifikasi 6 digit yang dikirim ke emailmu, lalu pesan driver terdekat dalam
        hitungan detik.
      </p>
      <div class="mt-7 flex flex-wrap justify-center gap-3">
        <UiButton to="/register" size="lg">Daftar Gratis</UiButton>
        <UiButton to="/login" size="lg" variant="outline">Sudah punya akun</UiButton>
      </div>
    </section>
  </div>
</template>
