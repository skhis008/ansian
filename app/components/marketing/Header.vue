<script setup lang="ts">
const auth = useAuthStore()
const open = ref(false)
const links = [
  { label: 'Cara Kerja', to: '/#cara-kerja' },
  { label: 'Fitur', to: '/#fitur' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Tentang', to: '/tentang' },
]
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-ink-200/70 bg-white/85 backdrop-blur-md">
    <div class="container-app flex h-16 items-center gap-6">
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <UiBrandMark class="size-8" />
        <span class="text-[17px] font-bold tracking-tight text-ink-900">{{ $config.public.appName }}</span>
      </NuxtLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Navigasi">
        <a
          v-for="l in links"
          :key="l.to"
          :href="l.to"
          class="rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
        >
          {{ l.label }}
        </a>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <template v-if="auth.isAuthenticated">
          <UiButton :to="auth.homePath" size="sm" variant="soft">
            Buka Dashboard
          </UiButton>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-100 sm:block">
            Masuk
          </NuxtLink>
          <UiButton to="/register" size="sm">Daftar Gratis</UiButton>
        </template>

        <button
          type="button"
          class="rounded-lg p-2 text-ink-600 transition hover:bg-ink-100 md:hidden"
          aria-label="Menu"
          :aria-expanded="open"
          @click="open = !open"
        >
          <UiIcon :name="open ? 'x' : 'menu'" class="size-5" />
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <nav v-if="open" class="border-t border-ink-100 bg-white px-4 py-3 md:hidden">
        <a
          v-for="l in links"
          :key="l.to"
          :href="l.to"
          class="block rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
          @click="open = false"
        >
          {{ l.label }}
        </a>
        <NuxtLink
          v-if="!auth.isAuthenticated"
          to="/login"
          class="mt-2 block rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          @click="open = false"
        >
          Masuk
        </NuxtLink>
      </nav>
    </Transition>
  </header>
</template>
