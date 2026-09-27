<script setup lang="ts">
const year = new Date().getFullYear()
const columns = [
  {
    title: 'Produk',
    links: [
      { label: 'Antar Penumpang', to: '/register' },
      { label: 'Jadi Driver', to: '/driver/daftar' },
      { label: 'Kirim Barang', to: '/#fitur' },
      { label: 'Harga & Tarif', to: '/#harga' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { label: 'Pusat Bantuan', to: '/faq' },
      { label: 'Status Layanan', to: '/#fitur' },
      { label: 'Kontak Kami', to: '/tentang' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Ketentuan Layanan', to: '/terms' },
      { label: 'Kebijakan Privasi', to: '/kebijakan-privasi' },
    ],
  },
]
</script>

<template>
  <footer class="border-t border-ink-200 bg-white">
    <div class="container-app py-12">
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        <div class="lg:col-span-2">
          <div class="flex items-center gap-2.5">
            <UiBrandMark class="size-8" />
            <span class="text-[17px] font-bold tracking-tight text-ink-900">{{ $config.public.appName }}</span>
          </div>
          <p class="mt-3 max-w-sm text-sm leading-relaxed text-ink-500">
            Layanan antarjemput instan untuk kota-kota besar di Indonesia. Aman, cepat, dan harga tertera di depan.
          </p>
          <div class="mt-5 flex gap-2">
            <span class="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-500">
              <UiIcon name="shield-check" class="size-4" />
            </span>
            <span class="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-500">
              <UiIcon name="zap" class="size-4" />
            </span>
          </div>
        </div>

        <div v-for="col in columns" :key="col.title">
          <h3 class="text-sm font-semibold text-ink-900">{{ col.title }}</h3>
          <ul class="mt-3 space-y-2">
            <li v-for="l in col.links" :key="l.to">
              <NuxtLink :to="l.to" class="text-sm text-ink-500 transition hover:text-brand-600">
                {{ l.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-10 flex flex-col gap-3 border-t border-ink-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-ink-400">
          © {{ year }} {{ $config.public.appName }}. Demo frontend — data bersifat simulasi.
        </p>
        <p class="text-xs text-ink-400">
          Dibangun dengan Nuxt · Siap dihubungkan ke Laravel
        </p>
      </div>
    </div>
  </footer>
</template>
