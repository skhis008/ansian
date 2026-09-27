<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'soft'
    size?: 'xs' | 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    block?: boolean
    to?: string | Record<string, unknown>
    href?: string
    type?: 'button' | 'submit' | 'reset'
    iconOnly?: boolean
    pill?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    loading: false,
    disabled: false,
    block: false,
    iconOnly: false,
    pill: false,
  },
)

const emit = defineEmits<{ click: [MouseEvent] }>()

const isDisabled = computed(() => props.disabled || props.loading)

const classes = computed(() => {
  const variants: Record<string, string> = {
    primary: 'bg-brand-600 text-white shadow-soft hover:bg-brand-700',
    secondary: 'bg-ink-900 text-white shadow-soft hover:bg-ink-800',
    outline: 'border border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50',
    ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
    soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    danger: 'bg-red-600 text-white shadow-soft hover:bg-red-700',
    success: 'bg-emerald-600 text-white shadow-soft hover:bg-emerald-700',
  }

  const sizes: Record<string, { box: string; text: string; radius: string }> = {
    xs: { box: 'h-8 px-2.5', text: 'text-xs', radius: 'rounded-lg' },
    sm: { box: 'h-9 px-3.5', text: 'text-[13px]', radius: 'rounded-[10px]' },
    md: { box: 'h-11 px-4.5', text: 'text-sm', radius: 'rounded-xl' },
    lg: { box: 'h-13 px-6', text: 'text-base', radius: 'rounded-[14px]' },
  }

  const s = sizes[props.size]!
  const iconWidth =
    props.size === 'xs' ? 'w-8' : props.size === 'sm' ? 'w-9' : props.size === 'lg' ? 'w-13' : 'w-11'

  return [
    'relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap',
    'transition-[background-color,color,box-shadow,border-color,transform] duration-150',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none',
    variants[props.variant],
    s.box,
    s.text,
    props.pill ? 'rounded-full' : s.radius,
    props.block ? 'w-full' : '',
    props.iconOnly ? `${iconWidth} px-0` : '',
  ]
    .filter(Boolean)
    .join(' ')
})

const tag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return 'button'
})

const componentProps = computed(() => {
  if (props.to) return { to: props.to, class: classes.value }
  if (props.href) return { href: props.href, target: '_blank', rel: 'noopener', class: classes.value }
  return {
    type: props.type,
    class: classes.value,
    disabled: isDisabled.value,
    'aria-busy': props.loading || undefined,
  }
})
</script>

<template>
  <component :is="tag" v-bind="componentProps" @click="emit('click', $event)">
    <span
      v-if="loading"
      class="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <template v-else>
      <slot name="icon" />
      <slot />
    </template>
  </component>
</template>
