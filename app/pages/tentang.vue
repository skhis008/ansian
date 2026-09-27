<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Tentang Kami — AntarJemput',
  description: 'AntarJemput adalah platform transport online yang menghubungkan penumpang dengan driver terverifikasi di sekitar Jakarta dan kota-kota lain.',
})

const values = [
  {
    icon: 'shield-check',
    title: 'Keamanan lebih dulu',
    text: 'Setiap driver melewati verifikasi dokumen, dan setiap perjalanan terlacak. Kami mengutamakan keselamatan baik penumpang maupun driver.',
  },
  {
    icon: 'percent',
    title: 'Transparansi penuh',
    text: 'Tarif dihitung dengan rumus yang sama untuk semua pengguna dan ditampilkan lengkap sebelum konfirmasi.',
  },
  {
    icon: 'activity',
    title: 'Teknologi sederhana',
    text: 'Arsitektur backend Laravel dengan realtime WebSocket, dan frontend Nuxt yang ringan serta cepat.',
  },
  {
    icon: 'users',
    title: 'Kesetaraan driver',
    text: 'Driver bebas mengatur waktu online, memilih perjalanan yang sesuai, dan transparan soal pendapatan.',
  },
]

const timeline = [
  { year: '2024', title: 'Awal proyek', text: 'Konsep dan prototipe aplikasi dibangun untuk menjeda kesenjangan transportasi di Jabodetabek.' },
  { year: '2025', title: 'Uji coba di Jakarta', text: 'Meluncur dengan 120 driver terverifikasi di 3 wilayah dan rata-rata rating 4,8.' },
  { year: '2026', title: 'Ekspansi', text: 'Peluncuran dashboard admin, pembayaran QRIS, serta perluasan ke Bandung dan Surabaya.' },
]

const team = [
  { name: 'Andi Saputra', role: 'Founder & CEO', initials: 'AS' },
  { name: 'Nadia Rahman', role: 'Head of Operations', initials: 'NR' },
  { name: 'Bayu Setiawan', role: 'Engineering Lead', initials: 'BS' },
  { name: 'Sinta Maharani', role: 'Head of Support', initials: 'SM' },
]
</script>

<template>
  <div class="container-app py-12">
    <header class="max-w-3xl">
      <h1 class="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Tentang AntarJemput</h1>
      <p class="mt-4 text-[15px] leading-relaxed text-ink-600">
        Kami membangun AntarJemput karena menemukan satu hal sederhana: Transportasi di kota besar seharusnya sesederhana mengetuk aplikasi —
        tarif jelas, driver cepat datang, dan perjalanan terasa aman.
      </p>
    </header>

    <section class="mt-12 grid gap-5 lg:grid-cols-3">
      <UiCard class="lg:col-span-2">
        <h2 class="text-lg font-bold text-ink-900">Misi kami</h2>
        <p class="mt-3 text-[14px] leading-relaxed text-ink-600">
          Memberikan akses transport yang andal dan terjangkau bagi semua orang, sekaligus membuka peluang pendapatan
          yang layak bagi driver. Kami percaya teknologi yang baik adalah yang terasa transparan, tidak membingungkan,
          dan tidak memaksa.
        </p>
        <p class="mt-3 text-[14px] leading-relaxed text-ink-600">
          Setiap keputusan produk — mulai dari tarif terbuka, driver terdekat, sampai chat bawaan — dibuat dengan satu
          tujuan: membuat perjalanan terasa aman dari titik pertama hingga tiba.
        </p>
      </UiCard>

      <UiCard>
        <h2 class="text-lg font-bold text-ink-900">Fakta singkat</h2>
        <dl class="mt-4 space-y-3">
          <div v-for="f in [
            ['Didirikan', 'Jakarta, 2024'],
            ['Kota beroperasi', 'Jakarta, Bandung, Surabaya'],
            ['Driver aktif', '18.400+'],
            ['Rating rata-rata', '4,9 / 5'],
            ['Perjalanan selesai', '2,4 juta+'],
          ]" :key="f[0]" class="flex items-center justify-between gap-3 border-b border-ink-100 pb-2.5 last:border-0">
            <dt class="text-[13px] text-ink-500">{{ f[0] }}</dt>
            <dd class="text-[13px] font-bold text-ink-900">{{ f[1] }}</dd>
          </div>
        </dl>
      </UiCard>
    </section>

    <section class="mt-14">
      <h2 class="text-xl font-bold tracking-tight text-ink-900">Nilai kami</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div v-for="v in values" :key="v.title" class="rounded-2xl border border-ink-200/80 bg-white p-5">
          <span class="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <UiIcon :name="v.icon" class="size-5" />
          </span>
          <h3 class="mt-4 text-[15px] font-bold text-ink-900">{{ v.title }}</h3>
          <p class="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">{{ v.text }}</p>
        </div>
      </div>
    </section>

    <section class="mt-14">
      <h2 class="text-xl font-bold tracking-tight text-ink-900">Perjalanan kami</h2>
      <ol class="mt-6 space-y-3">
        <li v-for="t in timeline" :key="t.year" class="flex gap-4 rounded-2xl border border-ink-200/80 bg-white p-5">
          <span class="shrink-0 rounded-lg bg-ink-900 px-2.5 py-1 font-mono text-xs font-bold text-white">{{ t.year }}</span>
          <div>
            <h3 class="text-[14.5px] font-bold text-ink-900">{{ t.title }}</h3>
            <p class="mt-1 text-[13.5px] leading-relaxed text-ink-600">{{ t.text }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="mt-14">
      <h2 class="text-xl font-bold tracking-tight text-ink-900">Tim kami</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="m in team" :key="m.name" class="rounded-2xl border border-ink-200/80 bg-white p-5 text-center">
          <span class="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-100 text-base font-bold text-brand-700">
            {{ m.initials }}
          </span>
          <p class="mt-3 text-[14px] font-bold text-ink-900">{{ m.name }}</p>
          <p class="text-[12px] text-ink-500">{{ m.role }}</p>
        </div>
      </div>
    </section>

    <UiCard class="mt-14 text-center">
      <h2 class="text-lg font-bold text-ink-900">Ingin jadi bagian dari perjalanan ini?</h2>
      <p class="mx-auto mt-2 max-w-md text-[13.5px] text-ink-600">
        Baik sebagai penumpang yang mencari perjalanan aman, atau driver yang ingin bekerja lebih baik.
      </p>
      <div class="mt-5 flex flex-wrap justify-center gap-2">
        <UiButton to="/register">Daftar sebagai Penumpang</UiButton>
        <UiButton to="/driver/daftar" variant="outline">Gabung Jadi Driver</UiButton>
      </div>
    </UiCard>
  </div>
</template>
