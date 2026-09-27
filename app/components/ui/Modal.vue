<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    description?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    closeOnOverlay?: boolean
  }>(),
  { open: false, size: 'md', closeOnOverlay: true },
)

const emit = defineEmits<{ close: [] }>()

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}

watch(
  () => props.open,
  open => {
    if (!import.meta.client) return
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

onMounted(() => import.meta.client && window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', onKey)
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-ink-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @click.self="closeOnOverlay && emit('close')"
      >
        <div
          class="animate-pop-in w-full rounded-t-3xl bg-white shadow-lift sm:rounded-2xl"
          :class="sizes[size]"
        >
          <div v-if="title || $slots.header" class="flex items-start justify-between gap-4 border-b border-ink-100 p-5">
            <slot name="header">
              <div>
                <h2 class="text-base font-semibold text-ink-900">{{ title }}</h2>
                <p v-if="description" class="mt-1 text-sm text-ink-500">{{ description }}</p>
              </div>
            </slot>
            <button
              type="button"
              class="-mt-1 -mr-1 rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
              aria-label="Tutup"
              @click="emit('close')"
            >
              <UiIcon name="x" class="size-5" />
            </button>
          </div>

          <div class="max-h-[70vh] overflow-y-auto p-5">
            <slot />
          </div>

          <div v-if="$slots.footer" class="flex justify-end gap-2.5 border-t border-ink-100 p-4 sm:px-5">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
