<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Syarat & Ketentuan — Ansian',
  description: 'Syarat dan ketentuan penggunaan aplikasi dan layanan Ansian (Antar Jemput Dinusian) sebagai pelanggan maupun driver mahasiswa.',
})

const sections = [
  {
    anchor: 'lingkup',
    title: '1. Ruang Lingkup Layanan',
    body: [
      'Ansian (Antar Jemput Dinusian) menyediakan layanan antar-jemput berbasis motor yang menghubungkan pelanggan dengan driver mitra di area Udinus dan sekitarnya. Layanan ini merupakan layanan berbasis aplikasi, bukan jasa angkut daring.',
      'Dengan mendaftar dan menggunakan aplikasi, kamu menyatakan berusia minimal 18 tahun, memiliki kapasitas hukum untuk terikat oleh ketentuan di dokumen ini, dan menyetujui seluruh isinya.',
    ],
  },
  {
    anchor: 'akun',
    title: '2. Akun dan Verifikasi',
    body: [
      'Kamu bertanggung jawab menjaga kerahasiaan kredensial akun dan dilarang membagikan akun kepada pihak lain.',
      'Saat mendaftar dan login, kami mengirim kode verifikasi unik 6 digit ke alamat email terdaftar untuk memastikan pemilik akun. Device yang sudah dipercaya tidak akan diminta kode lagi selama 30 hari.',
      'Pelanggan dapat berupa mahasiswa maupun warga lokal. Bagi driver, verifikasi bersifat wajib: khusus mahasiswa aktif dengan NIM, nama kampus, SIM, dan data kendaraan yang ditinjau oleh admin. Pendaftaran yang tidak dapat diverifikasi akan ditolak.',
    ],
  },
  {
    anchor: 'pemesanan',
    title: '3. Pemesanan dan Pembatalan',
    body: [
      'Pemesanan dianggap aktif setelah kamu menekan tombol konfirmasi. Kami dapat menolak atau membatalkan pesanan apabila terjadi keadaan kahar, kecurangan, atau permintaan yang tidak wajar.',
      'Pembatalan gratis tersedia dalam dua menit pertama setelah pesanan dibuat. Setelahnya, biaya pembatalan yang berlaku ditampilkan sebelum kamu menyelesaikan konfirmasi.',
    ],
  },
  {
    anchor: 'tarif',
    title: '4. Tarif dan Pembayaran',
    body: [
      'Tarif ditentukan oleh zona jarak: Zona Hijau (0–2,5 km), Zona Kuning (2,5–6,5 km), Zona Jingga (6,5–10,5 km), dan Zona Merah (≥10,5 km), ditambah biaya admin tetap sesuai zona. Rincian tarif ditampilkan secara transparan sebelum konfirmasi, tanpa lonjakan harga maupun biaya tersembunyi.',
      'Pembayaran dilakukan tunai kepada driver, atau QRIS melalui aplikasi e-wallet/mobile banking apa pun. Untuk QRIS, pembayaran diverifikasi oleh tim kami sebelum perjalanan ditandai lunas.',
    ],
  },
  {
    anchor: 'driver',
    title: '5. Tanggung Jawab Driver',
    body: [
      'Driver wajib mahasiswa aktif, mengendarai dengan aman, merawat kendaraan secara berkala, menjaga kerahasiaan data pelanggan, dan menerapkan prosedur keselamatan yang berlaku.',
      'Driver dilarang mengendarai dalam keadaan mabuk, kelelahan, atau menggunakan obat yang mengganggu kemampuan mengendarai.',
    ],
  },
  {
    anchor: 'privasi',
    title: '6. Privasi dan Data',
    body: [
      'Pengolahan data diatur secara terpisah dalam Kebijakan Privasi kami. Ringkasnya, data lokasi hanya digunakan selama perjalanan berlangsung untuk kebutuhan operasional.',
      'Kami tidak menjual data pribadi kepada pihak ketiga.',
    ],
  },
  {
    anchor: 'tanggung-jawab',
    title: '7. Pembatasan Tanggung Jawab',
    body: [
      'Batas tanggung jawab kami mengikuti ketentuan hukum yang berlaku, kecuali kekurangan yang disebabkan oleh kelalaian berat.',
      'Kami tidak bertanggung jawab atas kerugian yang tidak dapat diprediksi secara wajar, misalnya akibat faktor di luar kendali kami.',
    ],
  },
  {
    anchor: 'perubahan',
    title: '8. Perubahan Ketentuan',
    body: [
      'Kami dapat memperbarui ketentuan ini kapan saja. Perubahan diberitahukan lewat notifikasi dalam aplikasi atau email paling lambat tujuh hari sebelum berlaku.',
      'Menggunakan aplikasi setelah perubahan berlaku dianggap sebagai persetujuan kamu terhadap ketentuan terbaru.',
    ],
  },
  {
    anchor: 'kontak',
    title: '9. Kontak',
    body: [
      'Pertanyaan mengenai ketentuan ini dapat disampaikan melalui customer service di dalam aplikasi atau ke legal@ansian.id.',
    ],
  },
]
</script>
<template>
  <div class="container-app py-12">
    <header class="max-w-2xl">
      <h1 class="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Syarat & Ketentuan</h1>
      <p class="mt-3 text-[14px] text-ink-500">
        Terakhir diperbarui: 1 Januari 2026 · Berlaku untuk seluruh pengguna di area layanan Ansian.
      </p>
    </header>

    <div class="mt-10 grid gap-8 lg:grid-cols-[220px_1fr]">
      <nav class="hidden lg:block">
        <div class="sticky top-24">
          <p class="mb-3 text-[11px] font-bold tracking-wide text-ink-400 uppercase">Daftar Isi</p>
          <ol class="space-y-1.5">
            <li v-for="s in sections" :key="s.anchor">
              <a
                :href="`#${s.anchor}`"
                class="block rounded-lg px-2.5 py-1.5 text-[12.5px] text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
              >
                {{ s.title }}
              </a>
            </li>
          </ol>
        </div>
      </nav>

      <article class="max-w-3xl space-y-8">
        <section v-for="s in sections" :id="s.anchor" :key="s.anchor" class="scroll-mt-24">
          <h2 class="text-lg font-bold text-ink-900">{{ s.title }}</h2>
          <div class="mt-3 space-y-3">
            <p v-for="(para, i) in s.body" :key="i" class="text-[14px] leading-relaxed text-ink-600">{{ para }}</p>
          </div>
        </section>

        <UiCard class="bg-ink-50">
          <p class="text-[12.5px] text-ink-600">
            Dengan menekan tombol Daftar atau Setuju, kamu menyatakan sudah membaca, memahami, dan menyetujui seluruh isi
            dokumen ini beserta Kebijakan Privasi kami.
          </p>
        </UiCard>
      </article>
    </div>
  </div>
</template>
