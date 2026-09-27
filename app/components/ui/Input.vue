<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    modelValue?: string | number | null
    type?: string
    placeholder?: string
    error?: string
    hint?: string
    icon?: string
    required?: boolean
    disabled?: boolean
    loading?: boolean
    autocomplete?: string
    inputmode?: string
    maxlength?: number
    min?: number | string
    max?: number | string
    step?: number | string
    rows?: number
  }>(),
  {
    type: 'text',
    modelValue: '',
    required: false,
    disabled: false,
    loading: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [FocusEvent]
  focus: [FocusEvent]
}>()

const id = useId()
const value = computed({
  get: () => props.modelValue ?? '',
  set: v => emit('update:modelValue', String(v)),
})
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="mb-1.5 block text-[13px] font-semibold text-ink-700">
      {{ label }}
      <span v-if="required" class="text-red-500" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <div v-if="icon" class="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center">
        <UiIcon :name="icon" class="size-[18px] text-ink-400" />
      </div>

      <textarea
        v-if="type === 'textarea'"
        :id="id"
        v-model="value"
        :rows="rows ?? 3"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        :aria-invalid="Boolean(error)"
        class="w-full resize-y rounded-[12px] border bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-xs transition placeholder:text-ink-400 focus:ring-3 focus:outline-none"
        :class="[
          icon ? 'pl-11' : '',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15' : 'border-ink-200 focus:border-brand-500 focus:ring-brand-500/15',
          disabled ? 'cursor-not-allowed bg-ink-50' : '',
        ]"
        @blur="emit('blur', $event)"
      />

      <input
        v-else
        :id="id"
        v-model="value"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :inputmode="inputmode as any"
        :maxlength="maxlength"
        :min="min as any"
        :max="max as any"
        :step="step as any"
        :aria-invalid="Boolean(error)"
        class="h-11 w-full rounded-[12px] border bg-white text-sm text-ink-900 shadow-xs transition placeholder:text-ink-400 focus:ring-3 focus:outline-none"
        :class="[
          icon ? 'pl-11' : 'pl-3.5',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15' : 'border-ink-200 focus:border-brand-500 focus:ring-brand-500/15',
          disabled ? 'cursor-not-allowed bg-ink-50' : '',
        ]"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      >

      <div v-if="loading" class="absolute inset-y-0 right-0 flex w-11 items-center justify-center">
        <span class="size-4 animate-spin rounded-full border-2 border-ink-300 border-t-brand-600" />
      </div>

      <button
        v-else-if="type === 'password' && $slots.suffix"
        type="button"
        class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-400 hover:text-ink-600"
        tabindex="-1"
      >
        <slot name="suffix" />
      </button>
    </div>

    <p v-if="error" class="mt-1.5 flex items-start gap-1 text-xs font-medium text-red-600">
      <UiIcon name="alert-circle" class="mt-px size-3.5 shrink-0" />
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-ink-500">{{ hint }}</p>
  </div>
</template>
