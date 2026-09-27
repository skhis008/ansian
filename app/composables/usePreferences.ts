export type ColorMode = 'light' | 'dark'

/** Preferensi tema map (bukan dark mode UI) — disimpan per perangkat. */
export function useColorModePreference() {
  const mode = useState<ColorMode>('map-theme', () => 'light')

  if (import.meta.client && !mode.value) {
    const saved = localStorage.getItem('aj:map-theme')
    mode.value = saved === 'dark' ? 'dark' : 'light'
  }

  function set(value: ColorMode) {
    mode.value = value
    if (import.meta.client) localStorage.setItem('aj:map-theme', value)
  }

  function toggle() {
    set(mode.value === 'light' ? 'dark' : 'light')
  }

  return { mode, set, toggle, isDark: computed(() => mode.value === 'dark') }
}

/** Jam Indonesia (WIB) untuk countdown & jam operasional. */
export function useIndonesiaTime() {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    timer = setInterval(() => (now.value = new Date()), 1000)
  })
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  const clock = computed(() =>
    new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(now.value),
  )

  return { now, clock }
}
