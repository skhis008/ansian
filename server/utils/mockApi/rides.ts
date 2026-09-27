import type { H3Event } from 'h3'
import { createError, getQuery, getRouterParam } from 'h3'
import type { FareQuote, Ride, RideStatus, DriverJob, ChatMessage, ChatMessageType, Payment } from '#shared/types'
import { distanceKm, estimateFare, syntheticRoute, pathLengthKm, pathDurationMin, nearbyPoint } from '#shared/utils/geo'
import {
  authUser,
  db,
  delay,
  findOr404,
  paginate,
  queryList,
  readPayload,
  required,
  resource,
  validate,
} from '../api'
import {
  activeRideForUser,
  buildChartSeries,
  driverById,
  driverByUserId,
  nowIso,
  paymentsForRide,
  rideByCode,
  rideById,
  rideWithRelations,
  userById,
} from '#shared/mocks/db'

/* ==================================================================
 * FARES
 * ================================================================== */

/** POST /api/v1/fares/quote */
export async function quoteFare(event: H3Event) {
  const body = await readPayload(event)
  validate(body, {
    pickup: (v: unknown) => (v && typeof v === 'object' ? null : 'Titik penjemputan wajib diisi.'),
    destination: (v: unknown) => (v && typeof v === 'object' ? null : 'Tujuan wajib diisi.'),
  })

  const p = body.pickup as { lat: number; lng: number }
  const d = body.destination as { lat: number; lng: number }
  const straight = distanceKm(p, d)
  const route = syntheticRoute(p, d, 20)
  const distance = Math.max(0.4, pathLengthKm(route))
  const duration = Math.max(2, Math.round(pathDurationMin(route)))
  const hour = new Date().getHours()
  const peak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
  const surge = peak ? 1.3 : 1

  const payload = estimateFare(distance, duration, surge)
  const quote: FareQuote = {
    ...payload,
    route,
    nearest_drivers: 4 + Math.floor(Math.random() * 6),
  }
  quote.nearest_drivers = Math.min(9, 3 + Math.round(distance))
  void straight
  return resource(quote)
}

/* ==================================================================
 * RIDES
 * ================================================================== */

/** GET /api/v1/rides */
export async function listRides(event: H3Event) {
  const user = authUser(event)
  const q = getQuery(event)

  let rides = db.rides.slice()
  if (user.role === 'rider') {
    rides = rides.filter(r => r.rider_id === user.id)
  } else if (user.role === 'driver') {
    const profile = driverByUserId(user.id)
    rides = rides.filter(r => r.driver_id === profile?.id)
  }

  const activeFilter = String(q.filter ?? '')
  if (activeFilter === 'active') {
    rides = rides.filter(r => ['searching', 'driver_assigned', 'driver_arrived', 'in_progress'].includes(r.status))
  } else if (activeFilter === 'completed') {
    rides = rides.filter(r => r.status === 'completed')
  } else if (activeFilter === 'cancelled') {
    rides = rides.filter(r => ['cancelled', 'failed'].includes(r.status))
  }

  rides = queryList(rides, event, {
    search: ['ride_code'],
    match: (r, term) =>
      r.pickup.address.toLowerCase().includes(term) ||
      (r.pickup.place_name ?? '').toLowerCase().includes(term) ||
      r.destination.address.toLowerCase().includes(term) ||
      (r.destination.place_name ?? '').toLowerCase().includes(term),
    filters: {
      status: (r, v) => r.status === v,
      payment_status: (r, v) => r.payment_status === v,
      date: (r, v) => r.created_at.slice(0, 10) === v,
    },
    sort: { created_at: 'desc', fare: 'desc' },
  })

  const enriched = rides.map(rideWithRelations)
  const perPage = Number(q.per_page) || 10
  const page = paginate(enriched, event, perPage)
  return { data: page.data, links: page.links, meta: page.meta }
}

/**
 * Simulasi dispatch otomatis: di backend produksi ini digantikan queue + driver matching.
 * Dipanggil saat ride berstatus `searching` sudah menunggu beberapa detik.
 */
function simulateDispatch(ride: Ride): Ride {
  if (ride.status !== 'searching') return ride
  if (Date.now() - new Date(ride.created_at).getTime() < 8000) return ride

  const driver = db.drivers.find(d => d.status === 'idle')
  if (!driver) return ride

  ride.status = 'driver_assigned'
  ride.driver_id = driver.id
  ride.updated_at = nowIso()
  ride.status_histories.push({
    id: Date.now(),
    status: 'driver_assigned',
    note: `Driver ${driver.vehicle_plate} ditugaskan otomatis`,
    created_at: nowIso(),
  })

  driver.status = 'busy'
  driver.earnings_today += Math.round(ride.fare * 0.8)
  driver.total_rides += 1

  // Permintaan terbuka ditutup karena sudah ada driver yang Locks ride ini.
  db.jobs.splice(0, db.jobs.length, ...db.jobs.filter(j => j.ride_code !== ride.ride_code))
  return ride
}

/** GET /api/v1/rides/active */
export async function getActiveRide(event: H3Event) {
  const user = authUser(event)
  const ride = activeRideForUser(user.id, user.role === 'driver' ? 'driver' : 'rider')
  if (ride) simulateDispatch(ride)
  return resource(ride ? rideWithRelations(ride) : null)
}

/** GET /api/v1/rides/{ride} */
export async function showRide(event: H3Event) {
  const user = authUser(event)
  const ride = findOr404(rideById(Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')
  authorizeRide(user, ride)
  return resource(rideWithRelations(ride))
}

/** GET /api/v1/rides/{ride}/route — polyline perjalanan (OSRM di backend produksi) */
export async function rideRoute(event: H3Event) {
  const user = authUser(event)
  const ride = findOr404(rideById(Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')
  authorizeRide(user, ride)
  return resource(syntheticRoute(ride.pickup, ride.destination))
}

/** POST /api/v1/rides */
export async function createRide(event: H3Event) {
  const user = authUser(event)
  if (user.role === 'admin') {
    throw createError({ statusCode: 403, data: { message: 'Admin tidak dapat membuat perjalanan.' } })
  }
  if (user.role === 'driver') {
    throw createError({ statusCode: 403, data: { message: 'Gunakan menu Terima untuk mengerjakan perjalanan.' } })
  }

  const body = await readPayload(event)
  validate(body, {
    pickup: required('Titik penjemputan'),
    destination: required('Tujuan'),
  })

  const existing = activeRideForUser(user.id, 'rider')
  if (existing) {
    throw createError({ statusCode: 409, data: { message: 'Anda masih punya perjalanan yang sedang berjalan.' } })
  }

  const p = body.pickup
  const d = body.destination
  if (p.lat === d.lat && p.lng === d.lng) {
    throw createError({ statusCode: 422, data: { message: 'Titik penjemputan dan tujuan tidak boleh sama.', errors: { destination: ['Lokasi tujuan harus berbeda.'] } } })
  }

  const route = syntheticRoute(p, d, 20)
  const distance = pathLengthKm(route)
  const duration = pathDurationMin(route)
  const surge = Number(body.surge_multiplier) || 1
  const fare = estimateFare(distance, duration, surge)

  const now = new Date()
  const code = `AJ-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 9000) + 1000)}`

  const ride: Ride = {
    id: Math.max(...db.rides.map(r => r.id)) + 1,
    ride_code: code,
    status: 'searching',
    service_type: body.scheduled_at ? 'scheduled' : 'instant',
    scheduled_at: body.scheduled_at ?? null,
    pickup: { lat: p.lat, lng: p.lng, address: p.address, place_name: p.place_name ?? p.address },
    destination: { lat: d.lat, lng: d.lng, address: d.address, place_name: d.place_name ?? d.address },
    pickup_note: body.pickup_note ?? null,
    distance_km: fare.distance_km,
    duration_min: fare.duration_min,
    fare: body.fare_override ?? fare.total,
    surge_multiplier: surge,
    payment_method: body.payment_method ?? 'cash',
    payment_status: body.payment_method === 'cash' ? 'unpaid' : 'unpaid',
    cancel_reason: null,
    rider_id: user.id,
    driver_id: null,
    status_histories: [{ id: Date.now(), status: 'searching', note: null, created_at: nowIso() }],
    started_at: null,
    arrived_at: null,
    completed_at: null,
    cancelled_at: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  db.rides.unshift(ride)
  spawnJobs(ride)
  return resource(rideWithRelations(ride), { message: 'Mencari driver terdekat…' })
}

/** POST /api/v1/rides/{ride}/cancel */
export async function cancelRide(event: H3Event) {
  const user = authUser(event)
  const ride = findOr404(rideById(Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')
  authorizeRide(user, ride)

  if (['completed', 'cancelled', 'failed'].includes(ride.status)) {
    throw createError({ statusCode: 409, data: { message: 'Perjalanan sudah tidak aktif.' } })
  }

  const body = await readPayload(event)
  const reason = body.reason ?? (user.role === 'driver' ? 'driver_cancel' : 'rider_cancel')
  ride.status = 'cancelled'
  ride.cancel_reason = reason
  ride.cancelled_at = nowIso()
  ride.updated_at = nowIso()
  ride.status_histories.push({
    id: Date.now(),
    status: 'cancelled',
    note: body.note ?? 'Dibatalkan',
    created_at: nowIso(),
  })

  if (ride.driver_id) {
    const d = db.drivers.find(x => x.id === ride.driver_id)
    if (d && d.status === 'busy') d.status = 'idle'
  }
  db.jobs.splice(0, db.jobs.length, ...db.jobs.filter(j => j.ride_code !== ride.ride_code))

  return resource(rideWithRelations(ride), { message: 'Perjalanan dibatalkan.' })
}

/** POST /api/v1/rides/{ride}/rate */
export async function rateRide(event: H3Event) {
  const user = authUser(event)
  const ride = findOr404(rideById(Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')

  if (ride.status !== 'completed') {
    throw createError({ statusCode: 409, data: { message: 'Hanya perjalanan selesai yang bisa diberi rating.' } })
  }
  if (ride.rider_id !== user.id) {
    throw createError({ statusCode: 403, data: { message: 'Tidak berwenang.' } })
  }
  if (ride.rating) {
    throw createError({ statusCode: 409, data: { message: 'Anda sudah memberi rating untuk perjalanan ini.' } })
  }

  const body = await readPayload(event)
  validate(body, { score: (v: unknown) => (typeof v === 'number' && v >= 1 && v <= 5 ? null : 'Rating harus 1-5.') })

  ride.rating = {
    id: Date.now(),
    reviewer_id: user.id,
    score: body.score,
    comment: body.comment ?? null,
    tags: body.tags ?? [],
    created_at: nowIso(),
  }
  ride.updated_at = nowIso()

  if (ride.driver_id) {
    const d = db.drivers.find(x => x.id === ride.driver_id)
    if (d) {
      const count = d.total_rides > 0 ? d.total_rides : 1
      d.rating = Number(((d.rating * count + body.score) / (count + 1)).toFixed(2))
      const owner = userById(d.user_id)
      if (owner) {
        owner.rating = d.rating
        owner.rating_count += 1
      }
    }
  }
  return resource(rideWithRelations(ride), { message: 'Terima kasih atas penilaian Anda.' })
}

/** GET /api/v1/rides/{ride}/timeline */
export async function rideTimeline(event: H3Event) {
  const user = authUser(event)
  const ride = findOr404(rideById(Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')
  authorizeRide(user, ride)
  return resource(ride.status_histories)
}

/* ==================================================================
 * DRIVER
 * ================================================================== */

/** GET /api/v1/drivers — daftar driver (admin) */
export async function listDrivers(event: H3Event) {
  const user = authUser(event)
  if (user.role === 'rider') {
    throw createError({ statusCode: 403, data: { message: 'Tidak punya akses.' } })
  }
  const list = db.drivers
    .map(d => driverById(d.id)!)
    .filter(Boolean)
    .map(d => ({ ...d, status: d.status, search_name: `${d.user.name} ${d.driver_code} ${d.vehicle_plate}` }))

  const filtered = queryList(list as any, event, {
    search: ['search_name'],
    filters: {
      status: (d: any, v) => d.status === v,
      vehicle_type: (d: any, v) => d.vehicle_type === v,
    },
    sort: { rating: 'desc', total_rides: 'desc', earnings_month: 'desc' },
  })
  const page = paginate(filtered as any, event, 15)
  return { data: page.data, links: page.links, meta: page.meta }
}

/** GET /api/v1/drivers/nearby */
export async function nearbyDrivers(event: H3Event) {
  const q = getQuery(event)
  const lat = Number(q.lat)
  const lng = Number(q.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw createError({ statusCode: 422, data: { message: 'Parameter lat & lng wajib diisi.' } })
  }
  const radius = Number(q.radius) || 5

  const drivers = db.drivers
    .filter(d => d.status !== 'offline' && d.lat !== null && d.lng !== null)
    .map(d => ({
      ...driverById(d.id)!,
      distance_km: Number(distanceKm({ lat: d.lat!, lng: d.lng! }, { lat, lng }).toFixed(2)),
    }))
    .filter(d => d.distance_km <= radius)
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 10)

  return resource(drivers)
}

/** GET /api/v1/drivers/{driver} */
export async function showDriver(event: H3Event) {
  const user = authUser(event)
  if (user.role === 'rider') {
    throw createError({ statusCode: 403, data: { message: 'Tidak punya akses.' } })
  }
  return resource(findOr404(driverById(Number(getRouterParam(event, 'driver'))), 'Driver tidak ditemukan.'))
}

/** PATCH /api/v1/drivers/me */
export async function updateMyDriverProfile(event: H3Event) {
  const user = authUser(event)
  if (user.role !== 'driver') {
    throw createError({ statusCode: 403, data: { message: 'Hanya driver yang bisa mengakses.' } })
  }
  const body = await readPayload(event)
  const profile = findOr404(driverByUserId(user.id), 'Profil driver tidak ditemukan.')

  if (body.vehicle) {
    profile.vehicle_type = body.vehicle.vehicle_type ?? profile.vehicle_type
    profile.vehicle_plate = body.vehicle.vehicle_plate ?? profile.vehicle_plate
    profile.vehicle_color = body.vehicle.vehicle_color ?? profile.vehicle_color
    profile.vehicle_model = body.vehicle.vehicle_model ?? profile.vehicle_model
  }
  if (body.photo_url !== undefined) profile.photo_url = body.photo_url
  return resource(profile, { message: 'Profil diperbarui.' })
}

/** POST /api/v1/drivers/me/status */
export async function setDriverStatus(event: H3Event) {
  const user = authUser(event)
  if (user.role !== 'driver') {
    throw createError({ statusCode: 403, data: { message: 'Hanya driver yang bisa mengakses.' } })
  }
  const body = await readPayload(event)
  validate(body, { status: (v: unknown) => (['online', 'offline'].includes(String(v)) ? null : 'Status tidak valid.') })

  const profile = findOr404(driverByUserId(user.id), 'Profil driver tidak ditemukan.')
  profile.status = body.status === 'online' ? 'idle' : 'offline'
  profile.last_seen_at = nowIso()
  return resource(profile, { message: profile.status === 'idle' ? 'Anda sekarang online' : 'Anda sekarang offline' })
}

/** POST /api/v1/drivers/me/location */
export async function updateDriverLocation(event: H3Event) {
  const user = authUser(event)
  if (user.role !== 'driver') return resource(null)
  const body = await readPayload(event)
  const profile = findOr404(driverByUserId(user.id), 'Profil driver tidak ditemukan.')
  profile.lat = Number(body.lat) || profile.lat
  profile.lng = Number(body.lng) || profile.lng
  profile.last_seen_at = nowIso()
  return resource({ lat: profile.lat, lng: profile.lng, last_seen_at: profile.last_seen_at })
}

/** GET /api/v1/drivers/me/earnings */
export async function myEarnings(event: H3Event) {
  const user = authUser(event)
  if (user.role !== 'driver') {
    throw createError({ statusCode: 403, data: { message: 'Hanya driver yang bisa mengakses.' } })
  }
  const profile = findOr404(driverByUserId(user.id), 'Profil driver tidak ditemukan.')
  const mine = db.rides.filter(r => r.driver_id === profile.id)
  const completed = mine.filter(r => r.status === 'completed')
  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = Date.now() - 7 * 86_400_000

  const sum = (list: Ride[]) => list.reduce((a, r) => a + r.fare, 0)
  const monthPrefix = new Date().toISOString().slice(0, 7)
  return resource({
    today: profile.earnings_today,
    week: sum(completed.filter(r => new Date(r.created_at).getTime() > weekAgo)),
    month: profile.earnings_month,
    total: sum(completed),
    trips_today: completed.filter(r => r.created_at.slice(0, 10) === today).length,
    trips_week: completed.filter(r => new Date(r.created_at).getTime() > weekAgo).length,
    trips_month: completed.filter(r => r.created_at.slice(0, 7) === monthPrefix).length || completed.length,
    average_fare: completed.length ? Math.round(sum(completed) / completed.length) : 0,
    series: buildChartSeries(7),
  })
}

/** GET /api/v1/drivers/jobs — antrean permintaan terdekat */
export async function listJobs(event: H3Event) {
  const user = authUser(event)
  if (user.role !== 'driver') {
    throw createError({ statusCode: 403, data: { message: 'Hanya driver yang bisa mengakses.' } })
  }
  const profile = findOr404(driverByUserId(user.id), 'Profil driver tidak ditemukan.')
  if (profile.status === 'offline') return { data: [], links: {}, meta: null }

  const origin = profile.lat ? { lat: profile.lat, lng: profile.lng! } : null
  const jobs = db.jobs
    .filter(j => j.driver_id === null || j.driver_id === profile.id)
    .map(j => ({
      ...j,
      distance_to_pickup_km: origin ? Number(distanceKm(origin, j.pickup).toFixed(2)) : 0.8,
    }))
    .sort((a, b) => a.distance_to_pickup_km - b.distance_to_pickup_km)

  return { data: jobs, links: {}, meta: { total: jobs.length } }
}

/** POST /api/v1/drivers/jobs/{ride}/accept */
export async function acceptJob(event: H3Event) {
  const user = authUser(event)
  const ride = findOr404(rideById(Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')
  const profile = findOr404(driverByUserId(user.id), 'Profil driver tidak ditemukan.')

  if (ride.status !== 'searching') {
    throw createError({ statusCode: 409, data: { message: 'Perjalanan sudah diambil driver lain.' } })
  }

  ride.status = 'driver_assigned'
  ride.driver_id = profile.id
  ride.updated_at = nowIso()
  ride.status_histories.push({ id: Date.now(), status: 'driver_assigned', note: null, created_at: nowIso() })
  profile.status = 'busy'
  profile.earnings_today += ride.fare * 0.8
  profile.total_rides += 1

  db.jobs.splice(0, db.jobs.length, ...db.jobs.filter(j => j.ride_code !== ride.ride_code))
  return resource(rideWithRelations(ride), { message: 'Perjalanan diterima. Segera menuju lokasi!' })
}

/** POST /api/v1/drivers/jobs/{ride}/reject */
export async function rejectJob(event: H3Event) {
  const user = authUser(event)
  const ride = findOr404(rideById(Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')
  db.jobs.splice(0, db.jobs.length, ...db.jobs.filter(j => j.ride_code !== ride.ride_code))
  void user
  return resource({ rejected: true }, { message: 'Permintaan dilewati.' })
}

/** POST /api/v1/drivers/rides/{ride}/arrive */
export async function markArrived(event: H3Event) {
  const user = authUser(event)
  const ride = findOr404(rideById(Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')
  authorizeRide(user, ride)
  if (ride.status !== 'driver_assigned') {
    throw createError({ statusCode: 409, data: { message: 'Status perjalanan tidak sesuai.' } })
  }
  transition(ride, 'driver_arrived', 'Driver sudah di lokasi')
  return resource(rideWithRelations(ride), { message: 'Penumpang sudah diinformasikan.' })
}

/** POST /api/v1/drivers/rides/{ride}/start */
export async function startRide(event: H3Event) {
  const user = authUser(event)
  const ride = findOr404(rideById(Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')
  authorizeRide(user, ride)
  if (ride.status !== 'driver_arrived') {
    throw createError({ statusCode: 409, data: { message: 'Tandai driver tiba dulu sebelum memulai.' } })
  }
  ride.started_at = nowIso()
  transition(ride, 'in_progress', 'Perjalanan dimulai')
  return resource(rideWithRelations(ride), { message: 'Selamat jalan! Have a nice trip.' })
}

/** POST /api/v1/drivers/rides/{ride}/complete */
export async function completeRide(event: H3Event) {
  const user = authUser(event)
  const ride = findOr404(rideById(Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')
  authorizeRide(user, ride)
  if (ride.status !== 'in_progress') {
    throw createError({ statusCode: 409, data: { message: 'Perjalanan belum dimulai.' } })
  }
  ride.completed_at = nowIso()
  transition(ride, 'completed', 'Perjalanan selesai')

  if (ride.driver_id) {
    const d = db.drivers.find(x => x.id === ride.driver_id)
    if (d) {
      d.status = 'idle'
      d.earnings_today = Math.round(d.earnings_today + ride.fare * 0.8)
      d.earnings_month += ride.fare * 0.8
    }
  }
  if (ride.payment_status === 'unpaid' && ride.payment_method === 'cash') {
    ride.payment_status = 'paid'
  }
  return resource(rideWithRelations(ride), { message: 'Perjalanan selesai. Terima kasih!' })
}

/** POST /api/v1/rides/{ride}/assign — dipanggil admin */
export async function assignDriver(event: H3Event) {
  const user = authUser(event)
  if (user.role !== 'admin') throw createError({ statusCode: 403, data: { message: 'Khusus admin.' } })
  const ride = findOr404(rideById(Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')
  const body = await readPayload(event)
  const driver = findOr404(driverById(Number(body.driver_id)), 'Driver tidak ditemukan.')
  ride.driver_id = driver.id
  ride.status = 'driver_assigned'
  ride.updated_at = nowIso()
  ride.status_histories.push({ id: Date.now(), status: 'driver_assigned', note: `Ditugaskan manual: ${driver.user.name}`, created_at: nowIso() })
  return resource(rideWithRelations(ride), { message: 'Driver ditugaskan.' })
}

/* ==================================================================
 * CHAT
 * ================================================================== */

/** GET /api/v1/conversations */
export async function listConversations(event: H3Event) {
  const user = authUser(event)
  const list = db.conversations
    .filter(c => c.type === 'support' || c.counterpart.id === user.id || c.ride_id === null || rideOwnedBy(c.ride_id, user.id))
    .map(c => ({ ...c, unread_count: c.counterpart.id === user.id ? c.unread_count : c.type === 'support' ? 0 : c.unread_count }))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  return { data: list, links: {}, meta: { total: list.length } }
}

/** POST /api/v1/conversations */
export async function createConversation(event: H3Event) {
  const user = authUser(event)
  const body = await readPayload(event)
  const ride = findOr404(rideByCode(String(body.ride_code ?? '')), 'Perjalanan tidak ditemukan.')

  let conv = db.conversations.find(c => c.ride_id === ride.id && c.type === 'ride')
  if (!conv) {
    /* Kalau driver belum ada, percakapan tetap dibuat dengan Lawan sebagai CS (user admin) */
    const counterpart = ride.driver_id
      ? userById(driverById(ride.driver_id)!.user.id)
      : db.users.find(u => u.role === 'admin')
    const driverUser = findOr404(counterpart, 'lawan percakapan tidak ditemukan')
    conv = {
      id: Math.max(...db.conversations.map(c => c.id)) + 1,
      type: 'ride',
      ride_id: ride.id,
      ride_code: ride.ride_code,
      counterpart: driverUser,
      last_message: null,
      unread_count: 0,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    db.conversations.push(conv)
  }
  return resource(conv)
}

/** GET /api/v1/conversations/{conversation} */
export async function showConversation(event: H3Event) {
  const user = authUser(event)
  const id = Number(getRouterParam(event, 'conversation'))
  const conv = findOr404(db.conversations.find(c => c.id === id), 'Percakapan tidak ditemukan.')
  return resource({ ...conv, messages: messagesFor(conv.id, user.id) })
}

/** GET /api/v1/messages/{conversation} */
export async function listMessages(event: H3Event) {
  const user = authUser(event)
  const id = Number(getRouterParam(event, 'conversation'))
  const conv = findOr404(db.conversations.find(c => c.id === id), 'Percakapan tidak ditemukan.')
  const q = getQuery(event)
  const perPage = Math.min(100, Number(q.per_page) || 30)
  const all = messagesFor(conv.id, user.id)
  const page = paginate(all, event, perPage)
  return { data: page.data, links: page.links, meta: page.meta }
}

/** POST /api/v1/conversations/{conversation}/messages */
export async function sendMessage(event: H3Event) {
  const user = authUser(event)
  const convId = Number(getRouterParam(event, 'conversation'))
  const conv = findOr404(db.conversations.find(c => c.id === convId), 'Percakapan tidak ditemukan.')
  const body = await readPayload(event)
  validate(body, { body: (v: unknown) => (typeof v === 'string' && v.trim().length ? null : 'Pesan tidak boleh kosong.') })

  const type = (body.type ?? 'text') as ChatMessageType
  const message: ChatMessage = {
    id: db.counters.message++,
    conversation_id: conv.id,
    sender_id: user.id,
    sender_name: user.name,
    is_mine: true,
    body: String(body.body).trim(),
    type,
    attachment_url: body.attachment_url ?? null,
    attachment_meta: body.attachment_meta ?? null,
    read_at: null,
    created_at: nowIso(),
  }
  db.messages.push(message)
  conv.last_message = message
  conv.updated_at = message.created_at

  // Simulasi balasan otomatis lawas (mock realtime)
  if (conv.type === 'ride' && conv.counterpart.id !== user.id) {
    setTimeout(() => {
      const reply = autoReply(message.body)
      const auto: ChatMessage = {
        id: db.counters.message++,
        conversation_id: conv.id,
        sender_id: conv.counterpart.id,
        sender_name: conv.counterpart.name,
        is_mine: false,
        body: reply,
        type: 'text',
        attachment_url: null,
        attachment_meta: null,
        read_at: null,
        created_at: new Date().toISOString(),
      }
      db.messages.push(auto)
      conv.last_message = auto
      conv.updated_at = auto.created_at
    }, 1600)
  }

  return resource(message, { message: 'Pesan terkirim' })
}

/** POST /api/v1/conversations/{conversation}/read */
export async function markRead(event: H3Event) {
  const convId = Number(getRouterParam(event, 'conversation'))
  const conv = findOr404(db.conversations.find(c => c.id === convId), 'Percakapan tidak ditemukan.')
  conv.unread_count = 0
  for (const m of messagesOf(convId)) if (!m.read_at) m.read_at = nowIso()
  return resource({ unread_count: 0 })
}

/* ==================================================================
 * NOTIFICATIONS
 * ================================================================== */

/** GET /api/v1/notifications */
export async function listNotifications(event: H3Event) {
  const user = authUser(event)
  const q = getQuery(event)
  let list = db.notifications.slice()
  if (q.unread === '1') list = list.filter(n => !n.read_at)
  const page = paginate(list, event, 20)
  void user
  return { data: page.data, links: page.links, meta: page.meta }
}

/** POST /api/v1/notifications/{notification}/read */
export async function readNotification(event: H3Event) {
  const n = findOr404(db.notifications.find(x => x.id === Number(getRouterParam(event, 'notification'))), 'Notifikasi tidak ditemukan.')
  n.read_at = nowIso()
  return resource(n)
}

/** POST /api/v1/notifications/read-all */
export async function readAllNotifications(event: H3Event) {
  authUser(event)
  for (const n of db.notifications) n.read_at = n.read_at ?? nowIso()
  return resource({ message: 'Semua notifikasi ditandai terbaca.' })
}

/* ==================================================================
 * PAYMENTS
 * ================================================================== */

/** GET /api/v1/payments */
export async function listPayments(event: H3Event) {
  const user = authUser(event)
  const rides = db.rides.filter(r => r.rider_id === user.id || (user.role === 'driver' && r.driver_id === driverByUserId(user.id)?.id))
  const payments = rides.map(r => paymentsForRide(r.id)).filter(Boolean) as Payment[]
  const sorted = payments.sort((a, b) => b.created_at.localeCompare(a.created_at))
  const page = paginate(sorted, event, 15)
  return { data: page.data, links: page.links, meta: page.meta }
}

/** POST /api/v1/payments */
export async function createPayment(event: H3Event) {
  const user = authUser(event)
  const body = await readPayload(event)
  const ride = findOr404(rideById(Number(body.ride_id)), 'Perjalanan tidak ditemukan.')
  if (ride.rider_id !== user.id) {
    throw createError({ statusCode: 403, data: { message: 'Tidak berwenang.' } })
  }
  validate(body, {
    method: (v: unknown) => (['qris', 'midtrans', 'xendit', 'wallet', 'cash'].includes(String(v)) ? null : 'Metode pembayaran tidak valid.'),
  })
  await delay(500)

  ride.payment_method = body.method
  ride.payment_status = 'pending'
  ride.updated_at = nowIso()

  const payment = paymentsForRide(ride.id)!
  return resource(payment, {
    message: 'Redirect ke halaman pembayaran…',
    checkout_url: payment.checkout_url,
  })
}

/** POST /api/v1/payments/{payment}/webhook — dipanggil gateway (tanpa auth) */
export async function paymentWebhook(event: H3Event) {
  const body = await readPayload(event)
  const payment = db.rides
    .map(r => paymentsForRide(r.id))
    .find(p => p && p.reference === body.reference)
  if (!payment) {
    throw createError({ statusCode: 404, data: { message: 'Pembayaran tidak ditemukan.' } })
  }
  const ride = rideById(payment.ride_id)!
  const statusMap: Record<string, string> = {
    settlement: 'paid',
    success: 'paid',
    pending: 'pending',
    expire: 'failed',
    deny: 'failed',
    failure: 'failed',
    refund: 'refunded',
  }
  ride.payment_status = statusMap[String(body.transaction_status ?? body.status).toLowerCase()] as Ride['payment_status']
  ride.updated_at = nowIso()
  return resource({ reference: payment.reference, status: ride.payment_status })
}

/* ==================================================================
 * HELPERS
 * ================================================================== */

function authorizeRide(user: { id: number; role: string }, ride: Ride) {
  if (user.role === 'admin') return
  if (user.role === 'rider' && ride.rider_id === user.id) return
  if (user.role === 'driver') {
    const profile = driverByUserId(user.id)
    if (profile && ride.driver_id === profile.id) return
  }
  throw createError({ statusCode: 403, data: { message: 'Anda tidak punya akses ke perjalanan ini.' } })
}

function transition(ride: Ride, status: RideStatus, note: string) {
  ride.status = status
  ride.updated_at = nowIso()
  ride.status_histories.push({ id: Date.now(), status, note, created_at: nowIso() })
}

function rideOwnedBy(rideId: number | null, userId: number): boolean {
  if (!rideId) return true
  const ride = rideById(rideId)
  if (!ride) return false
  if (ride.rider_id === userId) return true
  const profile = db.drivers.find(d => d.user_id === userId)
  return Boolean(profile && ride.driver_id === profile.id)
}

function messagesFor(conversationId: number, userId: number): ChatMessage[] {
  return messagesOf(conversationId).map(m => ({ ...m, is_mine: m.sender_id === userId }))
}

function messagesOf(conversationId: number): ChatMessage[] {
  return db.messages
    .filter(m => m.conversation_id === conversationId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

function autoReply(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('lama') || t.includes('lambat')) return 'Maaf ya, macet di jalan. Saya kurang lebih 5 menit lagi sampai.'
  if (t.includes('alamat') || t.includes('lokasi')) return 'Baik, saya cek dulu lokasi yang Anda kirim ya.'
  if (t.includes('harga') || t.includes('tarif')) return 'Tarif sudah tertera di aplikasi ya, Kak. Tidak ada biaya tambahan.'
  if (t.includes('bayar') || t.includes('payment')) return 'Pembayaran lewat QRIS, saldo, atau tunai ya sesuai pilihan di aplikasi.'
  if (t.includes('halo') || t.includes('hai') || t.includes('hello')) return 'Halo! Saya Dimas, siap mengantar. Ada yang bisa dibantu?'
  return 'Siap, understood. Terima kasih sudah memberi tahu 🙏'
}

export function spawnJobs(ride: Ride) {
  const id = db.counters.job++
  const job: DriverJob = {
    id,
    ride_id: ride.id,
    driver_id: null,
    ride_code: ride.ride_code,
    pickup: ride.pickup,
    destination: ride.destination,
    distance_km: ride.distance_km,
    duration_min: ride.duration_min,
    fare: ride.fare,
    surge_multiplier: ride.surge_multiplier,
    rider_name: userById(ride.rider_id)?.name ?? 'Penumpang',
    rider_rating: 4.9,
    distance_to_pickup_km: 0.6,
    expires_in_seconds: 60,
    created_at: nowIso(),
  }
  db.jobs.unshift(job)
  void nearbyPoint
}
