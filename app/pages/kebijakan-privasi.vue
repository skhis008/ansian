<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Kebijakan Privasi — AntarJemput',
  description: 'Kebijakan privasi dan perlindungan data pribadi pengguna aplikasi AntarJemput.',
})

const sections = [
  {
    anchor: 'data-kami',
    title: '1. Data yang Kami Kumpulkan',
    items: [
      'Data akun: nama, alamat email, nomor WhatsApp, dan kata sandi (disimpan dalam bentuk terenkripsi).',
      'Data perjalanan: lokasi jemput dan tujuan, rute, waktu, serta nominal tarif.',
      'Data kendaraan dan dokumen driver: KTP, SIM, STNK, dan foto kendaraan.',
      'Data penggunaan: jenis perangkat, aplikasi, dan halaman yang diakses.',
    ],
  },
  {
    anchor: 'penggunaan',
    title: '2. Penggunaan Data',
    items: [
      'Menyediakan fitur pemesanan, pencarian driver, dan navigasi perjalanan.',
      'Menghubungkan penumpang dengan driver terdekat sesuai lokasi yang dipilih.',
      'Menghitung tarif dan memproses pembayaran.',
      'Mengirim notifikasi terkait perjalanan, pembayaran, dan pembaruan aplikasi.',
      'Meningkatkan kualitas layanan dan mencegah penyalahgunaan.',
    ],
  },
  {
    anchor: 'berbagi',
    title: '3. Berbagi Data',
    items: [
      'Data perjalanan dibagikan kepada driver yang ditugaskan, khusus pada lokasi jemput dan tujuan.',
      'Data pembayaran dibagikan kepada penyedia gerbang pembayaran untuk memproses transaksi.',
      'Data dapat diserahkan kepada otoritas yang berwenang bila diwajibkan oleh hukum.',
      'Kami tidak menjual data pribadi kepada pihak ketiga.',
    ],
  },
  {
    anchor: 'penyimpanan',
    title: '4. Penyimpanan dan Keamanan',
    items: [
      'Data disimpan pada server dengan akses terbatas dan terenkripsi saat pengiriman.',
      'Lokasi riwayat perjalanan disimpan untuk keperluan riwayat dan penyelesaian masalah.',
      'Data transaksi disimpan sesuai kewajiban pembukuan yang berlaku.',
    ],
  },
  {
    anchor: 'hak',
    title: '5. Hak Pengguna',
    items: [
      'Mengakses dan memperbarui data melalui menu Profil.',
      'Meminta salinan data pribadi yang kami simpan.',
      'Meminta penghapusan data denganadie yang berlaku.',
      'Menarik persetujuan atas pemrosesan data tertentu.',
    ],
  },
  {
    anchor: 'keamanan',
    title: '6. Keamanan',
    items: [
      'Kami menerapkan langkah teknis dan organisasi untuk melindungi data dari akses tidak sah.',
      'Tidak ada metode pengiriman yang sepenuhnya aman, sehingga kami sangat menyarankan kamu untuk tidak membagikan kata sandi.',
    ],
  },
  {
    anchor: 'perubahan',
    title: '7. Perubahan Kebijakan',
    items: [
      'Kebijakan ini dapat diperbarui sewaktu-waktu.',
      'Perubahan memberitahukan lewat notifikasi dalam aplikasi atau email.',
    ],
  },
]
</script>

<template>
  <div class="container-app py-12">
    <header class="max-w-2xl">
      <h1 class="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Kebijakan Privasi</h1>
      <p class="mt-3 text-[14px] text-ink-500">
        Terakhir diperbarui: 1 Januari 2026 · Kami menjaga data pribadi kamu sesuai ketentuan hukum yang berlaku.
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
          <ul class="mt-3 space-y-2.5">
            <li v-for="(item, i) in s.items" :key="i" class="flex items-start gap-2.5">
              <UiIcon name="check-circle" class="mt-0.5 size-4 shrink-0 text-brand-600" />
              <span class="text-[14px] leading-relaxed text-ink-600">{{ item }}</span>
            </li>
          </ul>
        </section>

        <UiCard class="bg-ink-50">
          <p class="text-[12.5px] text-ink-600">
            Untuk permintaan terkait data pribadi, hubungi kami melalui customer service di dalam aplikasi atau kirim email
            ke privasi@antarjemput.id.
          </p>
        </UiCard>
      </article>
    </div>
  </div>
</template>
