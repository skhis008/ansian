<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; title: string; description?: string }>(), { icon: 'inbox' })
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center">
    <span class="grid size-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
      <UiIcon :name="icon" class="size-6" />
    </span>
    <h3 class="mt-4 text-sm font-semibold text-ink-800">{{ title }}</h3>
    <p v-if="description" class="mt-1 max-w-sm text-sm text-ink-500">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </div>
</template>
