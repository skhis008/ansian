<script setup lang="ts">
const store = useUiStore()

const icons: Record<string, string> = {
  success: 'check-circle',
  error: 'alert-circle',
  warning: 'alert-triangle',
  loading: 'refresh-cw',
  info: 'info',
}

const tones: Record<string, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  loading: 'border-ink-200 bg-white text-ink-700',
  info: 'border-brand-200 bg-brand-50 text-brand-800',
}
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 top-0 z-[200] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
      <TransitionGroup
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-150 ease-in absolute"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-for="toast in store.toasts"
          :key="toast.id"
          class="animate-pop-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lift"
          :class="tones[toast.type]"
          role="status"
        >
          <UiIcon
            :name="icons[toast.type] ?? 'info'"
            class="mt-0.5 size-5 shrink-0"
            :class="toast.type === 'loading' ? 'animate-spin-slow' : ''"
          />
          <p class="flex-1 text-sm leading-snug font-medium">{{ toast.message }}</p>
          <button
            type="button"
            class="-mt-0.5 shrink-0 rounded p-0.5 opacity-50 transition hover:opacity-100"
            aria-label="Tutup"
            @click="store.dismiss(toast.id)"
          >
            <UiIcon name="x" class="size-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
