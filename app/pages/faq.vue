<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'FAQ — Pertanyaan Umum AntarJemput',
  description: 'Jawaban lengkap soal tarif, pembayaran, pembatalan, driver, dan keamanan di AntarJemput.',
})

const categories = [
  { value: 'all', label: 'Semua' },
  { value: 'ride', label: 'Perjalanan' },
  { value: 'payment', label: 'Pembayaran' },
  { value: 'driver', label: 'Driver' },
  { value: 'account', label: 'Akun' },
]

const activeCategory = ref('all')

const faqs = [
  {
    cat: 'ride',
    q: 'Bagaimana cara memesan perjalanan?',
    a: 'Buka menu Pesan Antar, tentukan titik jemput dan tujuan, pilih jenis kendaraan, lalu konfirmasi. Sistem akan menampilkan tarif dan mencari driver terdekat. Kamu bisa memantau posisi driver secara real-time di halaman pesanan aktif.',
  },
  {
    cat: 'ride',
    q: 'Apakah perjalanan bisa dijadwalkan?',
    a: 'Bisa. Pada halaman pemesanan kamu dapat memilih tanggal dan jam keberangkatan hingga 7 hari ke depan. Driver ditugaskan sekitar 5 menit sebelum waktu keberangkatan.',
  },
  {
    cat: 'ride',
    q: 'Berapa lama waktu driver datang?',
    a: 'Rata-rata driver tiba dalam 8 menit pada jam sibuk. Kamu akan melihat estimasi tiba yang diperbarui otomatis ketika driver sudah menerima order.',
  },
  {
    cat: 'ride',
    q: 'Apakah saya bisa membatalkan perjalanan?',
    a: 'Bisa, dan gratis dalam 2 menit pertama setelah order dibuat. Setelah itu ada biaya pembatalan sesuai kebijakan yang tertera di aplikasi sebelum konfirmasi.',
  },
  {
    cat: 'payment',
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'QRIS (semua e-wallet dan mobile banking), virtual account, kartu kredit/debit, OVO, DANA, saldo aplikasi, dan pembayaran tunai kepada driver.',
  },
  {
    cat: 'payment',
    q: 'Kapan pembayaran diproses?',
    a: 'Untuk metode non-tunai, pembayaran diproses saat konfirmasi pesanan. Status transaksi dapat dipantau di halaman Pembayaran. Pembayaran tunai dibayarkan langsung setelah perjalanan selesai.',
  },
  {
    cat: 'payment',
    q: 'Apakah tarif sudah termasuk biaya layanan?',
    a: 'Ya. Rincian tarif ditampilkan sebelum konfirmasi, termasuk tarif dasar, biaya jarak, biaya waktu, dan biaya layanan. Tidak ada biaya tersembunyi.',
  },
  {
    cat: 'driver',
    q: 'Bagaimana driver diverifikasi?',
    a: 'Setiap driver wajib mengunggah KTP, SIM, STNK, dan foto kendaraan. Tim admin memverifikasi dokumen sebelum driver dapat menerima order.',
  },
  {
    cat: 'driver',
    q: 'Bagaimana cara menjadi driver?',
    a: 'Daftar lewat halaman Gabung Jadi Driver, isi data diri dan kendaraan, lalu unggah dokumen. Setelah verifikasi, kamu bisa mengaktifkan status online dan menerima permintaan.',
  },
  {
    cat: 'account',
    q: 'Kenapa saya harus verifikasi WhatsApp?',
    a: 'Nomor WhatsApp dipakai driver untuk menghubungi kamu saat Dalam perjalanan dan saat tiba di lokasi jemput, sehingga komunikasi tetap aman tanpa tukar nomor pribadi.',
  },
  {
    cat: 'account',
    q: 'Bagaimana cara mengganti password?',
    a: 'Masuk ke menu Profil, pilih Ubah Password, lalu masukkan password saat ini dan password baru minimal 8 karakter.',
  },
  {
    cat: 'account',
    q: 'Data saya aman?',
    a: 'Kami hanya menggunakan data yang diperlukan untuk  layanan: nama, nomor WhatsApp, dan lokasi selama perjalanan berlangsung. Lokasi riwayat tidak dibagikan ke pihak ketiga.',
  },
]

const filtered = computed(() =>
  activeCategory.value === 'all' ? faqs : faqs.filter(f => f.cat === activeCategory.value),
)
</script>

<template>
  <div class="container-app py-12">
    <header class="max-w-2xl">
      <h1 class="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Pertanyaan umum</h1>
      <p class="mt-3 text-[15px] text-ink-600">
        Kumpulan jawaban yang paling sering dicari. Tidak menemukan jawabannya? Hubungi customer service 24 jam.
      </p>
    </header>

    <div class="mt-8 flex flex-wrap gap-2">
      <button
        v-for="c in categories"
        :key="c.value"
        type="button"
        class="rounded-xl px-3.5 py-2 text-[13px] font-semibold transition"
        :class="activeCategory === c.value ? 'bg-brand-600 text-white' : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'"
        @click="activeCategory = c.value"
      >
        {{ c.label }}
      </button>
    </div>

    <div class="mt-6 max-w-3xl space-y-2.5">
      <details
        v-for="f in filtered"
        :key="f.q"
        class="group rounded-2xl border border-ink-200/80 bg-white transition open:border-brand-300"
      >
        <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
          <span class="text-[14.5px] font-bold text-ink-900">{{ f.q }}</span>
          <UiIcon name="chevron-down" class="size-4 shrink-0 text-ink-400 transition-transform group-open:rotate-180" />
        </summary>
        <p class="px-4 pb-4 text-[13.5px] leading-relaxed text-ink-600">{{ f.a }}</p>
      </details>
    </div>

    <UiCard class="mt-10 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-sm font-bold text-ink-900">Belum menemukan jawaban?</h2>
        <p class="mt-1 text-[13px] text-ink-500">Tim kami siap membantu setiap hari, 24 jam.</p>
      </div>
      <div class="flex gap-2">
        <UiButton to="/rider/chat?new=support" variant="outline">Hubungi CS</UiButton>
        <UiButton to="/register">Mulai Pesan</UiButton>
      </div>
    </UiCard>
  </div>
</template>
