<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Ride } from '#shared/types'

const props = defineProps<{ open: boolean; ride: Ride | null }>()
const emit = defineEmits<{
  close: []
  submitted: [payload: { score: number; comment: string | null; tags: string[] }]
}>()

const score = ref(0)
const hovered = ref(0)
const comment = ref('')
const tags = ref<string[]>([])

const TAGS = ['Tepat waktu', 'Ramah', 'Kendaraan Bersih', 'Hemat', 'Aman', 'Rela diantar lagi']

watch(
  () => props.open,
  open => {
    if (open) {
      score.value = 0
      hovered.value = 0
      comment.value = ''
      tags.value = []
    }
  },
)

const displayed = computed(() => hovered.value || score.value)

const label = computed(() => {
  if (!displayed.value) return 'Pilih rating'
  return ['', 'Sangat buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat bagus'][displayed.value]
})

function toggleTag(tag: string) {
  tags.value = tags.value.includes(tag) ? tags.value.filter(t => t !== tag) : [...tags.value, tag]
}

function submit() {
  if (!score.value || !props.ride) return
  emit('submitted', {
    score: score.value,
    comment: comment.value.trim() || null,
    tags: [...tags.value],
  })
}
</script>

<template>
  <UiModal
    :open="open"
    title="Beri Rating Perjalanan"
    :description="`Perjalanan ${ride?.ride_code ?? ''}`"
    size="sm"
    @close="emit('close')"
  >
    <div class="text-center">
      <p class="text-sm text-ink-500">Bagaimana pengalaman kamu?</p>

      <div class="mt-4 flex justify-center gap-1.5">
        <button
          v-for="i in 5"
          :key="i"
          type="button"
          class="rounded-lg p-1 transition hover:scale-110"
          :aria-label="`${i} bintang`"
          @click="score = i"
          @mouseenter="hovered = i"
          @mouseleave="hovered = 0"
        >
          <UiIcon
            name="star"
            class="size-9 transition"
            :class="i <= displayed ? 'fill-amber-400 text-amber-400' : 'text-ink-200'"
          />
        </button>
      </div>

      <p class="mt-2 h-5 text-sm font-semibold" :class="displayed ? 'text-amber-600' : 'text-ink-400'">
        {{ label }}
      </p>
    </div>

    <div class="mt-5 flex flex-wrap justify-center gap-2">
      <button
        v-for="tag in TAGS"
        :key="tag"
        type="button"
        class="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
        :class="tags.includes(tag)
          ? 'border-brand-500 bg-brand-50 text-brand-700'
          : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50'"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <UiInput
      v-model="comment"
      label="Tambahkan komentar (opsional)"
      type="textarea"
      :rows="3"
      placeholder="Ceritakan pengalaman kamu kepada driver…"
      class="mt-5"
      :maxlength="300"
    />

    <template #footer>
      <UiButton variant="ghost" @click="emit('close')">Nanti</UiButton>
      <UiButton :disabled="!score" @click="submit">
        Kirim Rating
      </UiButton>
    </template>
  </UiModal>
</template>
