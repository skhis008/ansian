<script setup lang="ts">
const props = withDefaults(defineProps<{ src?: string | null; name: string; size?: number; rounded?: string }>(), {
  src: null,
  size: 40,
  rounded: 'rounded-full',
})

const hue = computed(() => {
  let h = 0
  for (let i = 0; i < props.name.length; i++) h = (h * 31 + props.name.charCodeAt(i)) % 360
  return h
})

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]!.toUpperCase())
    .join(''),
)
</script>

<template>
  <div
    class="relative flex shrink-0 items-center justify-center overflow-hidden font-semibold select-none"
    :class="rounded"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img
      v-if="src"
      :src="src"
      :alt="name"
      loading="lazy"
      decoding="async"
      :width="size"
      :height="size"
      class="size-full object-cover"
    >
    <template v-else>
      <div
        class="absolute inset-0"
        :style="{ backgroundColor: `hsl(${hue} 70% 93%)` }"
      />
      <span
        :style="{
          color: `hsl(${hue} 55% 34%)`,
          fontSize: `${Math.max(10, size * 0.36)}px`,
        }"
        aria-hidden="true"
      >{{ initials }}</span>
    </template>
  </div>
</template>
