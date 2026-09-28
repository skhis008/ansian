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
  { lat: -6.982835, lng: 110.409352, address: 'Kampus Udinus, Pendrikan Kidul, Semarang Tengah', place_name: 'Kampus Udinus' },
  { lat: -6.9913, lng: 110.4163, address: 'Simpang Lima, Semarang', place_name: 'Simpang Lima' },
  { lat: -6.9789, lng: 110.4168, address: 'Pandanaran, Semarang', place_name: 'Pandanaran' },
  { lat: -6.9735, lng: 110.4287, address: 'Sriwawansari, Semarang Tengah', place_name: 'Sriwawansari' },
  { lat: -6.9944, lng: 110.4064, address: 'Stasiun Tawang, Semarang', place_name: 'Stasiun Tawang' },
  { lat: -6.9727, lng: 110.3767, address: 'Bandara Ahmad Yani, Semarang', place_name: 'Bandara Ahmad Yani' },
  { lat: -6.9663, lng: 110.4638, address: 'Genuk, Semarang Timur', place_name: 'Genuk' },
  { lat: -6.9881, lng: 110.3932, address: 'Salaman Mloyo, Semarang Barat', place_name: 'Salaman Mloyo' },
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

/** Posisi user saat ini dengan fallback ke pusat area Udinus */
export function currentPosition(): Promise<LatLng> {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve({ lat: -6.982835, lng: 110.409352 })
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: -6.982835, lng: 110.409352 }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 },
    )
  })
}
