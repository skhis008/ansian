export type ColorMode = 'light' | 'dark'

/** Preferensi tema map (bukan dark mode UI) — disimpan per perangkat. */
export function useColorModePreference() {
  const mode = useState<ColorMode>('map-theme', () => 'light')

  if (import.meta.client && !mode.value) {
    const saved = localStorage.getItem('ans:map-theme')
    mode.value = saved === 'dark' ? 'dark' : 'light'
  }

  function set(value: ColorMode) {
    mode.value = value
    if (import.meta.client) localStorage.setItem('ans:map-theme', value)
  }

  function toggle() {
    set(mode.value === 'light' ? 'dark' : 'light')
  }

  return { mode, set, toggle, isDark: computed(() => mode.value === 'dark') }
}
