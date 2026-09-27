<script setup lang="ts">
import type { Place } from '#shared/types'
import { currentPosition, geocodeSearch, localGeocodeFallback, reverseGeocode } from '#shared/utils/geo'

const props = withDefaults(
  defineProps<{
    modelValue: Place | null
    placeholder?: string
    label?: string
    icon?: string
    /** Tipe marker di peta */
    kind?: 'pickup' | 'destination'
    required?: boolean
    error?: string
  }>(),
  { placeholder: 'Cari lokasi...', label: 'Lokasi', kind: 'pickup', required: false },
)

const emit = defineEmits<{ 'update:modelValue': [Place | null] }>()

const query = ref('')
const open = ref(false)
const loading = ref(false)
const results = ref<Place[]>([])
const locating = ref(false)
const activeIndex = ref(-1)
const boxRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
let debounce: ReturnType<typeof setTimeout> | null = null
let controller: AbortController | null = null

const value = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const displayText = computed(() => {
  if (query.value) return query.value
  if (props.modelValue) return props.modelValue.place_name || props.modelValue.address
  return ''
})

async function search(q: string) {
  query.value = q
  open.value = true
  activeIndex.value = -1
  if (q.trim().length < 3) {
    results.value = []
    return
  }
  loading.value = true
  controller?.abort()
  controller = new AbortController()
  try {
    const remote = await geocodeSearch(q, controller.signal)
    results.value = remote.length ? remote : localGeocodeFallback(q)
  } finally {
    loading.value = false
  }
}

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(() => search(v), 320)
}

function select(place: Place) {
  value.value = place
  query.value = ''
  results.value = []
  open.value = false
  activeIndex.value = -1
}

async function useMyLocation() {
  locating.value = true
  try {
    const pos = await currentPosition()
    const address = await reverseGeocode(pos)
    select({ ...pos, address, place_name: address.split(',').slice(0, 2).join(',').trim() })
  } finally {
    locating.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!open.value || !results.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % results.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length
  } else if (e.key === 'Enter' && activeIndex.value >= 0) {
    e.preventDefault()
    select(results.value[activeIndex.value]!)
  } else if (e.key === 'Escape') {
    open.value = false
  }
}

function onClickOutside(e: MouseEvent) {
  if (boxRef.value && !boxRef.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  if (debounce) clearTimeout(debounce)
  controller?.abort()
})

const tone = computed(() => (props.kind === 'pickup' ? 'bg-ink-900' : 'bg-rose-600'))
</script>

<template>
  <div ref="boxRef" class="relative">
    <label v-if="label" class="mb-1.5 block text-[13px] font-semibold text-ink-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div
      class="flex items-center gap-2.5 rounded-[12px] border bg-white px-3 transition focus-within:ring-3"
      :class="error ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500/15' : 'border-ink-200 focus-within:border-brand-500 focus-within:ring-brand-500/15'"
    >
      <span class="grid size-6 shrink-0 place-items-center rounded-full text-white" :class="tone">
        <span class="size-1.5 rounded-full bg-white" />
      </span>

      <input
        ref="inputRef"
        :value="displayText"
        type="text"
        :placeholder="placeholder"
        autocomplete="off"
        class="h-12 min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
        role="combobox"
        :aria-expanded="open"
        aria-autocomplete="list"
        @input="onInput"
        @focus="open = true"
        @keydown="onKeydown"
      >

      <span v-if="loading" class="size-4 shrink-0 animate-spin rounded-full border-2 border-ink-300 border-t-brand-600" />
      <button
        v-else
        type="button"
        class="shrink-0 rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-brand-600"
        title="Gunakan lokasi saya"
        aria-label="Gunakan lokasi saya"
        @click="useMyLocation"
      >
        <UiIcon :name="locating ? 'refresh-cw' : 'navigation'" class="size-4" :class="locating ? 'animate-spin' : ''" />
      </button>
    </div>

    <p v-if="error" class="mt-1.5 text-xs font-medium text-red-600">{{ error }}</p>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && (results.length || query.length >= 3)"
        class="absolute top-full right-0 left-0 z-[60] mt-1.5 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lift"
      >
        <ul v-if="results.length" class="max-h-72 overflow-y-auto py-1" role="listbox">
          <li v-for="(r, i) in results" :key="`${r.lat}-${r.lng}-${i}`" role="option" :aria-selected="i === activeIndex">
            <button
              type="button"
              class="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition"
              :class="i === activeIndex ? 'bg-brand-50' : 'hover:bg-ink-50'"
              @click="select(r)"
            >
              <UiIcon name="map-pin" class="mt-0.5 size-4 shrink-0 text-ink-400" />
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-semibold text-ink-800">{{ r.place_name }}</span>
                <span class="block truncate text-xs text-ink-500">{{ r.address }}</span>
              </span>
            </button>
          </li>
        </ul>
        <p v-else class="px-3 py-3 text-sm text-ink-500">Tidak ada lokasi ditemukan.</p>
        <p class="border-t border-ink-100 bg-ink-50/60 px-3 py-1.5 text-[10px] text-ink-400">
          Pencarian dari OpenStreetMap / Nominatim
        </p>
      </div>
    </Transition>
  </div>
</template>
