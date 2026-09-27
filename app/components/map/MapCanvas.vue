<script setup lang="ts">
import type { LatLng, Place } from '#shared/types'

const props = withDefaults(
  defineProps<{
    center?: LatLng
    zoom?: number
    pickup?: Place | null
    destination?: Place | null
    route?: LatLng[] | null
    driver?: LatLng | null
    myLocation?: boolean
    /** Mode interaktif: tampilkan kontrol zoom & SEARCH */
    interactive?: boolean
    height?: string
    showTrafficNote?: boolean
    fitToRoute?: boolean
  }>(),
  {
    center: () => ({ lat: -6.208763, lng: 106.8456 }),
    zoom: 13,
    pickup: null,
    destination: null,
    route: null,
    driver: null,
    myLocation: false,
    interactive: true,
    height: 'h-72',
    showTrafficNote: true,
    fitToRoute: true,
  },
)

const emit = defineEmits<{
  'update:center': [LatLng]
  ready: []
  click: [LatLng]
}>()

const mapEl = ref<HTMLElement | null>(null)
let map: import('leaflet').Map | null = null
let routeLine: import('leaflet').Polyline | null = null
let pickupMarker: import('leaflet').Marker | null = null
let destMarker: import('leaflet').Marker | null = null
let driverMarker: import('leaflet').Marker | null = null
let meMarker: import('leaflet').Marker | null = null
let meCircle: import('leaflet').Circle | null = null
let L: typeof import('leaflet') | null = null

const mapReady = ref(false)
const zoomLabel = ref(props.zoom)

const TILES = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  },
  streets: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  },
}

const theme = useColorModePreference()
const tile = computed(() => TILES[theme.mode.value])

onMounted(async () => {
  if (!mapEl.value) return
  const leaflet = await import('leaflet')
  L = leaflet.default ?? leaflet
  const { mapIcons } = await import('~/utils/mapIcons')

  const mapOptions: import('leaflet').MapOptions & { tap?: boolean } = {
    center: [props.center.lat, props.center.lng],
    zoom: props.zoom,
    zoomControl: false,
    attributionControl: true,
    preferCanvas: true,
    tap: props.interactive,
  }

  map = L.map(mapEl.value, mapOptions)

  L.tileLayer(tile.value.url, {
    attribution: tile.value.attribution,
    maxZoom: tile.value.maxZoom,
    detectRetina: true,
    crossOrigin: true,
  }).addTo(map)

  if (props.interactive) {
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
      emit('click', { lat: e.latlng.lat, lng: e.latlng.lng })
    })
  }

  map.on('zoomend', () => {
    if (map) zoomLabel.value = map.getZoom()
  })

  syncMarkers(mapIcons)
  mapReady.value = true
  emit('ready')
  fitBounds()
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})

/* ---------- reactive sync ---------- */

watch(
  () => [props.pickup, props.destination, props.route, props.driver, props.myLocation] as const,
  async () => {
    if (!map) return
    const { mapIcons } = await import('~/utils/mapIcons')
    syncMarkers(mapIcons)
    if (props.fitToRoute) fitBounds()
  },
  { deep: true },
)

watch(
  () => props.center,
  c => {
    if (map && c) map.setView([c.lat, c.lng], map.getZoom(), { animate: true })
  },
)

watch(
  () => tile.value.url,
  url => {
    const leaflet = L
    if (!map || !leaflet) return
    const layers: import('leaflet').TileLayer[] = []
    map.eachLayer(layer => {
      if (layer instanceof leaflet.TileLayer) layers.push(layer as import('leaflet').TileLayer)
    })
    for (const layer of layers) layer.remove()
    leaflet
      .tileLayer(url, {
        attribution: tile.value.attribution,
        maxZoom: tile.value.maxZoom,
        detectRetina: true,
        crossOrigin: true,
      })
      .addTo(map)
  },
)

async function syncMarkers(icons: typeof import('~/utils/mapIcons').mapIcons) {
  if (!map || !L) return

  if (props.pickup) {
    if (!pickupMarker) {
      pickupMarker = L.marker([props.pickup.lat, props.pickup.lng], { icon: icons.pickup(), zIndexOffset: 500 }).addTo(map)
      pickupMarker.bindPopup(`<strong>Penjemputan</strong><br/>${props.pickup.place_name ?? props.pickup.address}`)
    } else pickupMarker.setLatLng([props.pickup.lat, props.pickup.lng])
  }

  if (props.destination) {
    if (!destMarker) {
      destMarker = L.marker([props.destination.lat, props.destination.lng], { icon: icons.destination(), zIndexOffset: 500 }).addTo(map)
      destMarker.bindPopup(`<strong>Tujuan</strong><br/>${props.destination.place_name ?? props.destination.address}`)
    } else destMarker.setLatLng([props.destination.lat, props.destination.lng])
  }

  if (props.route?.length) {
    const latlngs = props.route.map(p => [p.lat, p.lng] as [number, number])
    if (!routeLine) {
      routeLine = L.polyline(latlngs, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map)
    } else routeLine.setLatLngs(latlngs)
  }

  if (props.driver) {
    if (!driverMarker) {
      driverMarker = L.marker([props.driver.lat, props.driver.lng], { icon: icons.driver(), zIndexOffset: 1000 }).addTo(map)
    } else driverMarker.setLatLng([props.driver.lat, props.driver.lng])
  }

  if (props.myLocation && props.center) {
    if (!meMarker) {
      meMarker = L.marker([props.center.lat, props.center.lng], { icon: icons.me(), zIndexOffset: 800 }).addTo(map)
      meCircle = L.circle([props.center.lat, props.center.lng], {
        radius: 120,
        color: '#0ea5e9',
        weight: 1,
        opacity: 0.5,
        fillColor: '#0ea5e9',
        fillOpacity: 0.08,
      }).addTo(map)
    } else {
      meMarker.setLatLng([props.center.lat, props.center.lng])
      meCircle?.setLatLng([props.center.lat, props.center.lng])
    }
  }
}

function fitBounds() {
  if (!map || !L) return
  const points: [number, number][] = []
  if (props.pickup) points.push([props.pickup.lat, props.pickup.lng])
  if (props.destination) points.push([props.destination.lat, props.destination.lng])
  if (props.route?.length) points.push(...(props.route.map(p => [p.lat, p.lng] as [number, number])))
  if (props.driver) points.push([props.driver.lat, props.driver.lng])

  if (points.length === 0) {
    map.setView([props.center.lat, props.center.lng], props.zoom)
    return
  }
  if (points.length === 1) {
    map.setView(points[0]!, Math.max(props.zoom, 15))
    return
  }
  map.fitBounds(L.latLngBounds(points), { padding: [56, 56], maxZoom: 16 })
}

function zoomBy(delta: number) {
  map?.setZoom((map.getZoom() ?? props.zoom) + delta)
}

function recenter() {
  if (!map || !L) return
  if (props.pickup && props.destination) fitBounds()
  else map.setView([props.center.lat, props.center.lng], 15)
}

function invalidate() {
  map?.invalidateSize()
}

defineExpose({ recenter, invalidate, zoomBy, fitBounds })

// Watchdog: /map sering gagal render saat container berada di tab tersembunyi
let ro: ResizeObserver | null = null
onMounted(() => {
  if (!mapEl.value) return
  ro = new ResizeObserver(() => map?.invalidateSize({ animate: false }))
  ro.observe(mapEl.value)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div class="relative isolate overflow-hidden bg-ink-100" :class="height">
    <div ref="mapEl" class="size-full" :class="!interactive ? 'pointer-events-none' : ''" />

    <div
      v-if="!mapReady"
      class="absolute inset-0 grid place-items-center bg-ink-100"
    >
      <div class="flex flex-col items-center gap-2 text-ink-400">
        <UiIcon name="map-pin" class="size-7 animate-bounce-dot" />
        <span class="text-xs font-medium">Memuat peta…</span>
      </div>
    </div>

    <div
      v-if="interactive"
      class="absolute top-3 right-3 z-[500] flex flex-col gap-1.5"
    >
      <button
        type="button"
        class="grid size-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 shadow-soft transition hover:bg-ink-50 hover:text-ink-900"
        aria-label="Perbesar"
        @click="zoomBy(1)"
      >
        <UiIcon name="plus" class="size-4" />
      </button>
      <button
        type="button"
        class="grid size-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 shadow-soft transition hover:bg-ink-50 hover:text-ink-900"
        aria-label="Perkecil"
        @click="zoomBy(-1)"
      >
        <UiIcon name="minus" class="size-4" />
      </button>
      <button
        type="button"
        class="grid size-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 shadow-soft transition hover:bg-ink-50 hover:text-ink-900"
        aria-label="Lokasi saya"
        @click="recenter"
      >
        <UiIcon name="navigation" class="size-4" />
      </button>
    </div>

    <div
      v-if="showTrafficNote && mapReady"
      class="pointer-events-none absolute bottom-2 left-2 z-[500] flex items-center gap-1.5 rounded-md bg-white/85 px-2 py-1 text-[10px] font-medium text-ink-600 backdrop-blur"
    >
      <span class="size-1.5 rounded-full bg-emerald-500" />
      Lalu lintas: Lancar
    </div>

    <slot />
  </div>
</template>
