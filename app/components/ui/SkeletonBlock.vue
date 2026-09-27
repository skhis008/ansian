<script setup lang="ts">
withDefaults(defineProps<{ lines?: number; height?: string; rounded?: string; width?: string }>(), {
  lines: 3,
  height: 'h-4',
  rounded: 'rounded-md',
})
</script>

<template>
  <div class="w-full space-y-2" aria-hidden="true">
    <div
      v-for="i in lines"
      :key="i"
      class="skeleton"
      :class="[height, rounded, width ?? (i === lines ? 'w-2/3' : 'w-full')]"
    />
  </div>
</template>
