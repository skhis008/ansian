<script setup lang="ts">
export interface LineChartPoint {
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    series: LineChartPoint[]
    height?: string
    valuePrefix?: string
    color?: string
    fill?: boolean
  }>(),
  { height: 'h-56', valuePrefix: '', color: '#16a34a', fill: true },
)

const max = computed(() => Math.max(1, ...props.series.map(p => p.value)))
const total = computed(() => props.series.reduce((a, p) => a + p.value, 0))

const points = computed(() => {
  const w = 100
  const h = 100
  const n = Math.max(1, props.series.length - 1)
  return props.series.map((p, i) => ({
    ...p,
    x: (i / n) * w,
    y: h - (p.value / max.value) * (h - 8) - 4,
  }))
})

const linePath = computed(() =>
  points.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' '),
)

const areaPath = computed(() => {
  if (!points.value.length) return ''
  const first = points.value[0]!
  const last = points.value[points.value.length - 1]!
  return `${linePath.value} L${last.x},100 L${first.x},100 Z`
})

const uid = `lc-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div>
    <div class="mb-3 flex items-baseline gap-2">
      <p class="text-lg font-bold text-ink-900">{{ valuePrefix }}{{ total.toLocaleString('id-ID') }}</p>
      <p class="text-[11px] text-ink-400">total periode</p>
    </div>

    <div class="relative" :class="height">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="size-full" role="img" aria-label="Grafik tren">
        <defs>
          <linearGradient :id="uid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="color" stop-opacity="0.25" />
            <stop offset="100%" :stop-color="color" stop-opacity="0" />
          </linearGradient>
        </defs>

        <line v-for="g in 4" :key="g" x1="0" :y1="g * 25" x2="100" :y2="g * 25" stroke="#e2e8f0" stroke-width="0.3" />

        <path v-if="fill" :d="areaPath" :fill="`url(#${uid})`" />
        <path :d="linePath" fill="none" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
      </svg>

      <div class="pointer-events-none absolute inset-0">
        <div
          v-for="p in points"
          :key="p.label"
          class="group absolute -translate-x-1/2"
          :style="{ left: `${p.x}%`, top: `${p.y}%` }"
        >
          <span class="block size-1.5 rounded-full bg-white ring-2" :style="{ borderColor: color }" />
          <span
            class="pointer-events-auto absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-ink-900 px-2 py-1 text-[10px] font-semibold whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100"
          >
            {{ p.label }}: {{ valuePrefix }}{{ p.value.toLocaleString('id-ID') }}
          </span>
        </div>
      </div>
    </div>

    <div class="mt-2 flex justify-between text-[10px] text-ink-400">
      <span v-for="p in series" :key="p.label">{{ p.label }}</span>
    </div>
  </div>
</template>
