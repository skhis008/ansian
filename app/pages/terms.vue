<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Syarat & Ketentuan — AntarJemput',
  description: 'Syarat dan ketentuan penggunaan aplikasi dan layanan AntarJemput sebagai penumpang maupun driver.',
})

const sections = [
  {
    anchor: 'lingkup',
    title: '1. Ruang Lingkup Layanan',
    body: [
      'AntarJemput menyediakan layanan pengangkutan jalan yang menghubungkan penumpang dengan driver mitra. Layanan ini merupakan layanan berbasis aplikasi, bukan jasa angkut daring..',
      'Dengan mendaftar dan menggunakan aplikasi, kamu menyatakan berusia minimal 18 tahun, memiliki kapasitas hukum untuk terikat oleh ketentuan di dokumen ini, dan menyetujui seluruh isinya.',
    ],
  },
  {
    anchor: 'akun',
    title: '2. Akun dan Verifikasi',
    body: [
      'Kamu bertanggung jawab menjaga kerahasiaan kredensial akun dan dilarang membagikan akun kepada pihak lain.',
      'Kami dapat mewajibkan verifikasi nomor WhatsApp. Bagi driver, verifikasi KTP, SIM, STNK, dan foto kendaraan bersifat wajib. Driver yang tidak dapat diverifikasi akan ditolak dan keanggotaannya dibatalkan.',
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
      'Tarif dihitung berdasarkan tarif dasar, jarak tempuh, durasi perjalanan, dan biaya layanan yang berlaku. Rincian tarif ditampilkan secara transparan sebelum konfirmasi.',
      'Pembayaran dapat dilakukan melalui QRIS, virtual account, kartu, e-wallet, saldo aplikasi, atau tunai kepada driver. Pemrosesan pembayaran dilakukan oleh penyedia gerbang pembayaran yang bekerja sama dengan kami.',
    ],
  },
  {
    anchor: 'driver',
    title: '5. Tanggung Jawab Driver',
    body: [
      'Driver wajib mengendarai dengan aman,awatan kendaraan secara berkala, merah dari menyimpan data penumpang, dan menerapkan prosedur keselamatan yang berlaku.',
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
      'Kami dapat memperbarui ketentuan ini kapan saja. Perubahan memberitahukan lewat notifikasi dalam aplikasi atau email paling lambat tujuh hari sebelum berlaku.',
      'Menggunakan aplikasi setelah perubahan berlaku dianggap sebagai persetujuan kamu terhadap ketentuan terbaru.',
    ],
  },
  {
    anchor: 'kontak',
    title: '9. Kontak',
    body: [
      'Pertanyaan mengenai ketentuan ini dapat disampaikan melalui customer service di dalam aplikasi atau ke legal@antarjemput.id.',
    ],
  },
]
</script>
<template>
  <div class="container-app py-12">
    <header class="max-w-2xl">
      <h1 class="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Syarat & Ketentuan</h1>
      <p class="mt-3 text-[14px] text-ink-500">
        Terakhir diperbarui: 1 Januari 2026 · Berlaku untuk seluruh pengguna di wilayah operasi.
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
