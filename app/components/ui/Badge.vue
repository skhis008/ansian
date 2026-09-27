<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'brand' | 'gray' | 'success' | 'warning' | 'danger' | 'info' | 'purple'; dot?: boolean; size?: 'xs' | 'sm' | 'md' }>(), {
  tone: 'gray',
  dot: false,
  size: 'sm',
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap"
    :class="{
      'px-2 py-0.5 text-[11px]': size === 'xs',
      'px-2.5 py-1 text-xs': size === 'sm',
      'px-3 py-1.5 text-sm': size === 'md',
      'bg-brand-50 text-brand-700 ring-1 ring-brand-100 ring-inset': tone === 'brand',
      'bg-ink-100 text-ink-700 ring-1 ring-ink-200 ring-inset': tone === 'gray',
      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 ring-inset': tone === 'success',
      'bg-amber-50 text-amber-700 ring-1 ring-amber-100 ring-inset': tone === 'warning',
      'bg-red-50 text-red-700 ring-1 ring-red-100 ring-inset': tone === 'danger',
      'bg-sky-50 text-sky-700 ring-1 ring-sky-100 ring-inset': tone === 'info',
      'bg-violet-50 text-violet-700 ring-1 ring-violet-100 ring-inset': tone === 'purple',
    }"
  >
    <span
      v-if="dot"
      class="size-1.5 rounded-full bg-current"
      aria-hidden="true"
    />
    <slot />
  </span>
</template>
