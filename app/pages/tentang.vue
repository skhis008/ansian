<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Tentang Kami — Ansian',
  description:
    'Ansian (Antar Jemput Dinusian) adalah antar-jemput motor berbasis zona tarif di area Udinus dan sekitarnya, sekaligus wadah kerja sampingan bagi mahasiswa.',
})

const values = [
  {
    icon: 'percent',
    title: 'Tarif jujur, lebih hemat',
    text: 'Tarif ditentukan zona jarak dan tampil sebelum pesan — tanpa lonjakan harga, tanpa biaya layanan tersembunyi.',
  },
  {
    icon: 'briefcase',
    title: 'Peluang untuk mahasiswa',
    text: 'Ansian lahir karena mahasiswa sering bingung mau promosi ke mana untuk kerja sampingan. Di sini, order datang sendiri.',
  },
  {
    icon: 'shield-check',
    title: 'Driver terverifikasi',
    text: 'Setiap driver adalah mahasiswa dengan NIM dan kendaraan yang diverifikasi admin sebelum boleh menerima order.',
  },
  {
    icon: 'users',
    title: 'Untuk warga lokal juga',
    text: 'Pelanggan bebas siapa saja — mahasiswa maupun warga lokal area Udinus — dengan pelayanan yang sama.',
  },
]

const timeline = [
  { year: '2025', title: 'Ide lahir dari kampus', text: 'Mahasiswa ingin penghasilan sampingan tapi bingung promosi; perjalanan antar-jemput di sekitar kampus masih acak-acakan.' },
  { year: '2026', title: 'Ansian dirancang', text: 'Konsep tarif zona yang hemat dan pendaftaran driver khusus mahasiswa dirancang tim kecil di Semarang.' },
  { year: '2026', title: 'Peluncuran area Udinus', text: 'Uji coba layanan motor di area Udinus dan sekitarnya, dengan pembayaran tunai dan QRIS.' },
]

const team = [
  { name: 'Alif Fahri Octavianto (Rio)', role: 'Frontend Developer & Founder', initials: 'AF' },
  { name: 'Wiratama Rava Rahardia (Wira)', role: 'Backend Developer', initials: 'WR' },
  { name: 'Farid Nur Cahyo (Farid)', role: 'Customer Service & UI/UX Design', initials: 'FN' },
  { name: 'M Setya Angga Adi Prabowo (Angga)', role: 'Customer Service', initials: 'MS' },
]
</script>

<template>
  <div class="container-app py-12">
    <header class="max-w-3xl">
      <h1 class="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Tentang Ansian</h1>
      <p class="mt-4 text-[15px] leading-relaxed text-ink-600">
        <strong class="font-semibold text-ink-800">Ansian (Antar Jemput Dinusian)</strong> dibangun untuk dua hal yang
        saling terhubung: membuat perjalanan antar-jemput di area Udinus lebih hemat, dan membuka peluang kerja
        sampingan bagi mahasiswa yang selama ini bingung mau promosi ke mana.
      </p>
    </header>

    <section class="mt-12 grid gap-5 lg:grid-cols-3">
      <UiCard class="lg:col-span-2">
        <h2 class="text-lg font-bold text-ink-900">Misi kami</h2>
        <p class="mt-3 text-[14px] leading-relaxed text-ink-600">
          Menyediakan layanan antar-jemput motor dengan tarif zona yang hemat dan transparan bagi warga area Udinus —
          sambil menjadi wadah penghasilan sampingan yang mudah diakses mahasiswa, tanpa perlu repot mencari pelanggan
          sendiri.
        </p>
        <p class="mt-3 text-[14px] leading-relaxed text-ink-600">
          Setiap keputusan produk — dari tarif yang tampil di awal, verifikasi kode lewat email, sampai pendaftaran
          driver khusus mahasiswa — dibuat agar sederhana, jujur, dan menguntungkan kedua belah pihak.
        </p>
      </UiCard>

      <UiCard>
        <h2 class="text-lg font-bold text-ink-900">Fakta singkat</h2>
        <dl class="mt-4 space-y-3">
          <div v-for="f in [
            ['Nama', 'Ansian (Antar Jemput Dinusian)'],
            ['Area layanan', 'Udinus & sekitarnya, Semarang'],
            ['Armada', 'Motor'],
            ['Pembayaran', 'Tunai & QRIS'],
            ['Tarif', '4 zona, tanpa lonjakan'],
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
        Pesan perjalanan hemat sebagai pelanggan, atau daftar sebagai driver mahasiswa dan mulai penghasilan sampinganmu.
      </p>
      <div class="mt-5 flex flex-wrap justify-center gap-2">
        <UiButton to="/register">Daftar Sebagai Pelanggan</UiButton>
        <UiButton to="/driver/daftar" variant="outline">Gabung Jadi Driver</UiButton>
      </div>
    </UiCard>
  </div>
</template>
