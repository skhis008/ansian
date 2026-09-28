<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'FAQ — Pertanyaan Umum Ansian',
  description: 'Jawaban lengkap soal tarif zona, pembayaran tunai & QRIS, kode verifikasi email, driver mahasiswa, dan keamanan di Ansian.',
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
    q: 'Area mana saja yang dilayani Ansian?',
    a: 'Ansian melayani area Udinus (kampus Universitas Dian Nuswantoro) dan sekitarnya di Semarang — kos-kosan, rumah, kampus, stasiun, hingga kawasan bisnis yang berjarak hingga ±10 km dari pusat layanan.',
  },
  {
    cat: 'ride',
    q: 'Bagaimana cara memesan perjalanan?',
    a: 'Buka menu Pesan Antar, tentukan titik jemput dan tujuan, tarif zona langsung tampil lengkap dengan biaya adminnya, pilih pembayaran (tunai atau QRIS), lalu konfirmasi. Kamu bisa memantau posisi driver secara real-time di halaman pesanan aktif.',
  },
  {
    cat: 'ride',
    q: 'Apakah perjalanan bisa dijadwalkan?',
    a: 'Bisa. Pada halaman pemesanan kamu dapat memilih tanggal dan jam keberangkatan hingga 7 hari ke depan. Driver ditugaskan sekitar 5 menit sebelum waktu keberangkatan.',
  },
  {
    cat: 'ride',
    q: 'Apakah saya bisa membatalkan perjalanan?',
    a: 'Bisa, dan gratis dalam 2 menit pertama setelah order dibuat. Setelah itu ada biaya pembatalan sesuai kebijakan yang tertera di aplikasi sebelum konfirmasi.',
  },
  {
    cat: 'payment',
    q: 'Kenapa tarif Ansian lebih hemat?',
    a: 'Tarif ditentukan zona jarak: Hijau (0–2,5 km) Rp4.000, Kuning (2,5–6,5 km) Rp5.000–15.000, Jingga (6,5–10,5 km) Rp16.000–20.000, Merah (≥10,5 km) mulai Rp20.000 + Rp1.500/km. Ditambah biaya admin tetap Rp500 (zona hijau/kuning) atau Rp1.000 (zona jingga/merah). Tidak ada lonjakan harga maupun biaya layanan tersembunyi.',
  },
  {
    cat: 'payment',
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'Tunai — dibayar langsung kepada driver saat perjalanan selesai; dan QRIS — scan lewat aplikasi e-wallet atau mobile banking apa pun, lalu konfirmasi pembayaran di aplikasi. Tidak ada metode lain agar sederhana.',
  },
  {
    cat: 'payment',
    q: 'Bagaimana cara membayar dengan QRIS?',
    a: 'Di halaman checkout pilih QRIS, scan kode QR yang ditampilkan, selesaikan pembayaran di aplikasi bank/e-wallet-mu, lalu tekan "Saya Sudah Bayar". Pembayaran diverifikasi oleh tim kami sebelum perjalanan ditandai lunas.',
  },
  {
    cat: 'payment',
    q: 'Apakah tarif sudah termasuk biaya admin?',
    a: 'Ya. Rincian yang tampil sebelum konfirmasi = tarif zona + biaya admin = total yang kamu bayar. Tidak ada biaya tambahan lain.',
  },
  {
    cat: 'driver',
    q: 'Siapa saja yang boleh jadi driver?',
    a: 'Khusus mahasiswa aktif. Kamu perlu mengisi NIM, nama kampus, dan prodi saat mendaftar. Data ini diverifikasi oleh admin sebelum akunmu aktif menerima order.',
  },
  {
    cat: 'driver',
    q: 'Bagaimana cara menjadi driver Ansian?',
    a: 'Daftar lewat halaman Gabung Jadi Driver: isi data akun, data mahasiswa (NIM, kampus, prodi), dan data motor. Setelah mendaftar, masukkan kode verifikasi 6 digit dari email, lalu tunggu verifikasi admin. Setelah disetujui, aktifkan status online dan mulai menerima order.',
  },
  {
    cat: 'account',
    q: 'Kenapa saya diminta kode verifikasi dari email?',
    a: 'Saat mendaftar dan saat login pertama kali, Ansian mengirim kode unik 6 digit ke emailmu untuk memastikan pemilik akun benar-benar kamu. Device yang sudah dipercaya selama 30 hari tidak akan diminta kode lagi.',
  },
  {
    cat: 'account',
    q: 'Saya tidak menerima kode verifikasi, apa yang harus dilakukan?',
    a: 'Pastikan email di akunmu benar dan cek folder spam. Tombol "Kirim ulang" bisa ditekan setelah 60 detik. Jika masih bermasalah, hubungi customer service kami.',
  },
  {
    cat: 'account',
    q: 'Siapa yang boleh memakai Ansian sebagai pelanggan?',
    a: 'Semua orang — mahasiswa maupun warga lokal area Udinus. Cukup buat akun, verifikasi kode dari email, dan kamu siap memesan.',
  },
  {
    cat: 'account',
    q: 'Bagaimana cara mengganti password?',
    a: 'Masuk ke menu Profil, pilih Ubah Password, lalu masukkan password saat ini dan password baru minimal 8 karakter.',
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
        <UiButton to="/customer/chat?new=support" variant="outline">Hubungi CS</UiButton>
        <UiButton to="/register">Mulai Pesan</UiButton>
      </div>
    </UiCard>
  </div>
</template>
