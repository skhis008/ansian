<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: boolean; label?: string; description?: string; disabled?: boolean }>(), {
  modelValue: false,
})
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
const id = useId()
</script>

<template>
  <div class="flex items-start gap-3">
    <button
      :id="id"
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      class="relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50"
      :class="modelValue ? 'bg-brand-600' : 'bg-ink-300'"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span
        class="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        :class="modelValue ? 'translate-x-5' : ''"
      />
    </button>
    <div v-if="label || $slots.default" class="min-w-0">
      <label :for="id" class="cursor-pointer text-sm font-semibold text-ink-800">
        <slot>{{ label }}</slot>
      </label>
      <p v-if="description" class="mt-0.5 text-xs text-ink-500">{{ description }}</p>
    </div>
  </div>
</template>
