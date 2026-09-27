import type { LatLng, Place } from '#shared/types'

export const EARTH_RADIUS_KM = 6371.0088
const toRad = (deg: number) => (deg * Math.PI) / 180

/** Haversine distance in KM */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function bearing(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const dLng = toRad(b.lng - a.lng)
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180) / Math.PI
}

/** Rute dummy (polyline) antara 2 titik dengan wiggle deterministik — dipakai mock & fallback. */
export function syntheticRoute(from: LatLng, to: LatLng, steps = 24): LatLng[] {
  const points: LatLng[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const jitter = Math.sin(t * Math.PI) * 0.006
    points.push({
      lat: from.lat + (to.lat - from.lat) * t + jitter,
      lng: from.lng + (to.lng - from.lng) * t + Math.cos(t * Math.PI) * 0.006,
    })
  }
  return points
}

export function pathLengthKm(points: LatLng[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) total += distanceKm(points[i - 1]!, points[i]!)
  return total
}

export function pathDurationMin(points: LatLng[], avgSpeedKmh = 26): number {
  return (pathLengthKm(points) / avgSpeedKmh) * 60
}

/** Sebar titik driver di sekitar titik acuan */
export function nearbyPoint(center: LatLng, minKm: number, maxKm: number, seed = 0): LatLng {
  const t = ((seed % 360) * Math.PI) / 180
  const dist = minKm + (maxKm - minKm) * (((seed * 37) % 100) / 100)
  const dLat = (dist / 110.574) * Math.sin(t)
  const dLng = (dist / (111.32 * Math.cos(toRad(center.lat)))) * Math.cos(t)
  return { lat: center.lat + dLat, lng: center.lng + dLng }
}

export function boundsOf(points: LatLng[]): [LatLng, LatLng] | null {
  if (!points.length) return null
  let minLat = Infinity
  let minLng = Infinity
  let maxLat = -Infinity
  let maxLng = -Infinity
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat
    if (p.lat > maxLat) maxLat = p.lat
    if (p.lng < minLng) minLng = p.lng
    if (p.lng > maxLng) maxLng = p.lng
  }
  return [
    { lat: minLat, lng: minLng },
    { lat: maxLat, lng: maxLng },
  ]
}

/** Titik tengah + padding untuk zoom ke rute */
export function paddedCenter(points: LatLng[], pad = 0.35) {
  const b = boundsOf(points)
  if (!b) return null
  const [sw, ne] = b
  return {
    center: { lat: (sw.lat + ne.lat) / 2, lng: (sw.lng + ne.lng) / 2 } satisfies LatLng,
    bounds: b,
    pad,
  }
}

export function toPlace(lat: number, lng: number, address: string, placeName?: string): Place {
  return { lat, lng, address, place_name: placeName ?? address }
}

export function samePoint(a?: LatLng | null, b?: LatLng | null, toleranceM = 30): boolean {
  if (!a || !b) return false
  return distanceKm(a, b) * 1000 <= toleranceM
}

/* ---------- Geocoding via Nominatim (OSM) ---------- */

const cache = new Map<string, { results: Place[]; ts: number }>()
const CACHE_TTL = 10 * 60 * 1000

export interface GeocodeResult {
  display_name: string
  lat: number
  lon: number
  type: string
}

/**
 * Forward geocoding. Dipanggil dari client (butuh CORS + user-agent browser).
 * Fallback ke hasil lokal bila offline / gagal.
 */
export async function geocodeSearch(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim()
  if (q.length < 3) return []
  const cached = cache.get(q)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.results

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=id&q=${encodeURIComponent(q)}`
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Nominatim ${res.status}`)
    const json = (await res.json()) as GeocodeResult[]
    const results = json.map(r => ({
      lat: Number(r.lat),
      lng: Number(r.lon),
      address: r.display_name,
      place_name: r.display_name.split(',').slice(0, 2).join(',').trim(),
    }))
    cache.set(q, { results, ts: Date.now() })
    return results
  } catch {
    return localGeocodeFallback(q)
  }
}

const LOCAL_PLACES: Place[] = [
  { lat: -6.208763, lng: 106.8456, address: 'Bundaran HI, Jakarta Pusat', place_name: 'Bundaran HI' },
  { lat: -6.175392, lng: 106.827153, address: 'Monas,Jakarta Pusat', place_name: 'Monas' },
  { lat: -6.1944, lng: 106.8229, address: 'Grand Indonesia, Jakarta Pusat', place_name: 'Grand Indonesia' },
  { lat: -6.2305, lng: 106.8003, address: 'Tanah Abang, Jakarta Pusat', place_name: 'Tanah Abang' },
  { lat: -6.1447, lng: 106.8261, address: 'Kuningan, Jakarta Selatan', place_name: 'Kuningan' },
  { lat: -6.2615, lng: 106.8106, address: 'Kemang Village, Jakarta Selatan', place_name: 'Kemang Village' },
  { lat: -6.2, lng: 106.816666, address: 'Sudirman, Jakarta Pusat', place_name: 'Sudirman' },
  { lat: -6.1256, lng: 106.7298, address: 'Kasih Kemal, Jakarta Barat', place_name: 'Kasih Kemal' },
]

/** Pencarian lokal saat Nominatim tidak tersedia (demo / offline) */
export function localGeocodeFallback(query: string): Place[] {
  const q = query.toLowerCase()
  const scored = LOCAL_PLACES.map(p => {
    const name = (p.place_name ?? '').toLowerCase()
    const address = p.address.toLowerCase()
    let score = 0
    if (name === q) score = 100
    else if (name.startsWith(q)) score = 80
    else if (name.includes(q)) score = 60
    else if (address.includes(q)) score = 40
    return { p, score }
  })
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(s => s.p)
}

/**
 * Reverse geocode — nama jalan dari koordinat.
 */
export async function reverseGeocode(point: LatLng, signal?: AbortSignal): Promise<string> {
  const key = `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.results[0]?.address ?? ''
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17&lat=${point.lat}&lon=${point.lng}`
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error('reverse failed')
    const json = (await res.json()) as { display_name?: string }
    const address = json.display_name ?? ''
    cache.set(key, { results: [{ lat: point.lat, lng: point.lng, address }], ts: Date.now() })
    return address
  } catch {
    const nearest = LOCAL_PLACES.reduce(
      (acc, p) => (distanceKm(p, point) < distanceKm(acc, point) ? p : acc),
      LOCAL_PLACES[0]!,
    )
    return `${nearest.address} (±${(distanceKm(nearest, point) * 1000).toFixed(0)} m)`
  }
}

/* ---------- OSRM routing (gratis, tanpa API key) ---------- */

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

export interface OsrmRoute {
  points: LatLng[]
  distanceKm: number
  durationMin: number
}

/** Route via OSRM, fallback ke syntheticRoute. */
export async function fetchRoute(from: LatLng, to: LatLng, signal?: AbortSignal): Promise<OsrmRoute> {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`
  try {
    const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&alternatives=false&steps=false`
    const res = await fetch(url, { signal })
    if (!res.ok) throw new Error(`OSRM ${res.status}`)
    const json = (await res.json()) as {
      code: string
      routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[]
    }
    const route = json.routes?.[0]
    if (!route) throw new Error('no route')
    return {
      points: route.geometry.coordinates.map(([lng, lat]) => ({ lat: lat!, lng: lng! })),
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    }
  } catch {
    const points = syntheticRoute(from, to)
    return {
      points,
      distanceKm: pathLengthKm(points),
      durationMin: pathDurationMin(points),
    }
  }
}

/** Harga standar (belum termasuk surge) — akan ditimpa server Laravel */
export const FARE_CONFIG = {
  baseFare: 5000,
  perKm: 2500,
  perMinute: 150,
  minFare: 8000,
  serviceFeePercent: 0.08,
  avgSpeedKmh: 26,
} as const

export function estimateFare(distanceKmValue: number, durationMinValue: number, surge = 1) {
  const distanceFare = distanceKmValue * FARE_CONFIG.perKm
  const timeFare = durationMinValue * FARE_CONFIG.perMinute
  const beforeSurge = Math.max(FARE_CONFIG.minFare, FARE_CONFIG.baseFare + distanceFare + timeFare)
  const surgeFare = Math.max(0, beforeSurge * (surge - 1))
  const total = beforeSurge + surgeFare
  const serviceFee = Math.round(total * FARE_CONFIG.serviceFeePercent)
  return {
    distance_km: Math.round(distanceKmValue * 100) / 100,
    duration_min: Math.round(durationMinValue),
    base_fare: FARE_CONFIG.baseFare,
    distance_fare: Math.round(distanceFare),
    surge_fare: Math.round(surgeFare),
    service_fee: serviceFee,
    total: Math.round(total + serviceFee),
    currency: 'IDR',
    surge_multiplier: surge,
  }
}

/** Posisi user saat ini dengan fallback ke Jakarta Pusat */
export function currentPosition(): Promise<LatLng> {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve({ lat: -6.208763, lng: 106.8456 })
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: -6.208763, lng: 106.8456 }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 },
    )
  })
}
