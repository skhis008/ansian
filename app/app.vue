<script setup lang="ts">
const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const config = useRuntimeConfig()

/* Session di-resolve di server agar tidak flash login state */
await callOnce('auth:init', () => auth.fetchUser())

/* SEO default — setiap halaman menimpanya sendiri */
useHead({
  titleTemplate: title => (title ? `${title} · ${config.public.appName}` : `${config.public.appName} · Antar Jemput Murah & Mudah`),
})

useSeoMeta({
  ogSiteName: config.public.appName as string,
  ogType: 'website',
  ogLocale: 'id_ID',
  twitterCard: 'summary_large_image',
})

onMounted(() => {
  useRealtime().connect()
  if (auth.user) useRealtime().bindUser(auth.user.id)
})
</script>

<template>
  <div class="min-h-dvh bg-ink-50">
    <NuxtLoadingIndicator color="#2563eb" :height="2" />
    <UiToastHost />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Shortcut global -->
    <ClientOnly>
      <div
        v-if="ui.sidebarOpen"
        class="fixed inset-0 z-40 bg-ink-950/40 lg:hidden"
        @click="ui.toggleSidebar(false)"
      />
    </ClientOnly>
  </div>
</template>
