<script setup lang="ts">
withDefaults(defineProps<{ padded?: boolean; hover?: boolean; as?: 'div' | 'section' | 'article' | 'li' }>(), {
  padded: true,
  hover: false,
  as: 'div',
})
</script>

<template>
  <component
    :is="as"
    class="rounded-2xl border border-ink-200/80 bg-white shadow-soft"
    :class="[padded ? 'p-5' : '', hover ? 'transition-shadow duration-200 hover:shadow-lift' : '']"
  >
    <slot />
  </component>
</template>
