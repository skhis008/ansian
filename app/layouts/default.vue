<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <MarketingHeader />
    <main class="flex-1">
      <slot />
    </main>
    <MarketingFooter />
  </div>
</template>
