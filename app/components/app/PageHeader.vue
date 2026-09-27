<script setup lang="ts">
withDefaults(defineProps<{ title?: string; description?: string; icon?: string }>(), {})
</script>

<template>
  <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div class="min-w-0">
      <h2 v-if="title" class="text-lg font-bold tracking-tight text-ink-900">{{ title }}</h2>
      <p v-if="description" class="mt-0.5 text-sm text-ink-500">{{ description }}</p>
      <slot />
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
