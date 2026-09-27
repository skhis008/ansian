import type { H3Event } from 'h3'
import { createError } from 'h3'
import type { AuthSession, User } from '#shared/types'
import {
  authUser,
  clearAuthSession,
  delay,
  emailRule,
  minRule,
  optionalUser,
  readPayload,
  readSession,
  required,
  resource,
  validate,
  writeSession,
  db,
  findOr404,
} from '../api'
import {
  activeRideForUser,
  buildChartSeries,
  driverByUserId,
  nowIso,
  rideWithRelations,
} from '#shared/mocks/db'

function issueToken(userId: number): string {
  return `aj_mock_${userId}_${Math.random().toString(36).slice(2, 12)}`
}

function sessionFor(user: User, event: H3Event): AuthSession {
  const token = issueToken(user.id)
  writeSession(event, { userId: user.id, token })
  return { token, user }
}

/** POST /api/v1/auth/register */
export async function register(event: H3Event) {
  await delay(400)
  const body = await readPayload(event)
  validate(body, {
    name: required('Nama'),
    email: emailRule(),
    phone: (v: unknown) =>
      typeof v === 'string' && v.replace(/\D/g, '').length >= 9 ? null : 'Nomor HP tidak valid.',
    password: minRule(8, 'Password'),
    role: (v: unknown) => (v === 'rider' || v === 'driver' ? null : 'Role tidak valid.'),
  })

  const email = String(body.email).toLowerCase().trim()
  if (db.users.some(u => u.email.toLowerCase() === email)) {
    throw createError({
      statusCode: 422,
      data: { message: 'Email sudah terdaftar.', errors: { email: ['Email sudah terdaftar.'] } },
    })
  }

  const user: User = {
    id: Math.max(...db.users.map(u => u.id)) + 1,
    name: String(body.name).trim(),
    email,
    phone: String(body.phone),
    role: body.role,
    avatar_url: null,
    status: 'active',
    rating: null,
    rating_count: 0,
    email_verified_at: null,
    phone_verified_at: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  db.users.push(user)
  db.passwords.set(user.email, String(body.password))

  if (user.role === 'driver') {
    db.drivers.push({
      id: Math.max(...db.drivers.map(d => d.id)) + 1,
      user_id: user.id,
      driver_code: `DRV-${2000 + db.drivers.length}`,
      status: 'offline',
      vehicle_type: 'motorcycle',
      vehicle_plate: '-',
      vehicle_color: '-',
      vehicle_model: '-',
      photo_url: null,
      lat: null,
      lng: null,
      last_seen_at: null,
      rating: 5,
      total_rides: 0,
      online_hours: 0,
      earnings_today: 0,
      earnings_month: 0,
    })
  }

  return resource(sessionFor(user, event))
}

/** POST /api/v1/auth/login */
export async function login(event: H3Event) {
  await delay(450)
  const body = await readPayload(event)

  validate(body, { email: required('Email'), password: required('Password') })
  const email = String(body.email).toLowerCase().trim()
  const user = db.users.find(u => u.email.toLowerCase() === email)

  const isAdminDemo = email === 'admin@antarjemput.id' && body.password === 'admin123'
  const stored = db.passwords.get(email)
  const isValid = Boolean(
    user && (stored ? body.password === stored : body.password === 'password' || body.password === 'password123' || isAdminDemo),
  )

  if (!isValid) {
    throw createError({
      statusCode: 422,
      data: { message: 'Email atau password salah.', errors: { email: ['Email atau password salah.'] } },
    })
  }
  if (user!.status === 'suspended') {
    throw createError({ statusCode: 403, data: { message: 'Akun Anda dinonaktifkan. Hubungi customer service.' } })
  }
  return resource(sessionFor(user!, event))
}

/** POST /api/v1/auth/logout */
export async function logout(event: H3Event) {
  clearAuthSession(event)
  return resource({ message: 'Berhasil keluar.' })
}

/** GET /api/v1/auth/me */
export async function me(event: H3Event) {
  const user = authUser(event)
  return resource({
    ...user,
    driver: user.role === 'driver' ? (driverByUserId(user.id)?.user_id ? driverByUserId(user.id) : null) : null,
  })
}

/** PATCH /api/v1/auth/profile */
export async function updateProfile(event: H3Event) {
  const user = authUser(event)
  const body = await readPayload(event)
  validate(body, { name: (v: unknown) => (typeof v === 'string' && v.trim().length < 3 ? 'Nama minimal 3 karakter.' : null) })

  if (body.name) user.name = String(body.name).trim()
  if (body.phone) user.phone = String(body.phone)
  if (body.avatar_url !== undefined) user.avatar_url = body.avatar_url || null
  user.updated_at = nowIso()

  if (user.role === 'driver' && body.vehicle) {
    const profile = driverByUserId(user.id)
    if (profile) {
      const target = db.drivers.find(d => d.id === profile.id)!
      target.vehicle_type = body.vehicle.vehicle_type ?? target.vehicle_type
      target.vehicle_plate = body.vehicle.vehicle_plate ?? target.vehicle_plate
      target.vehicle_color = body.vehicle.vehicle_color ?? target.vehicle_color
      target.vehicle_model = body.vehicle.vehicle_model ?? target.vehicle_model
    }
  }
  return resource(user)
}

/** PATCH /api/v1/auth/password */
export async function updatePassword(event: H3Event) {
  authUser(event)
  const body = await readPayload(event)
  validate(body, {
    current_password: required('Password saat ini'),
    password: minRule(8, 'Password baru'),
  })
  const user = authUser(event)
  const stored = db.passwords.get(user.email) ?? 'password'
  if (body.current_password !== stored) {
    throw createError({
      statusCode: 422,
      data: {
        message: 'Password saat ini salah.',
        errors: { current_password: ['Password saat ini salah.'] },
      },
    })
  }
  db.passwords.set(user.email, String(body.password))
  return resource({ message: 'Password berhasil diperbarui.' })
}

/** GET /api/v1/auth/sessions */
export async function sessions(event: H3Event) {
  const session = readSession(event)
  return resource({ active: Boolean(session), token_hint: session?.token.slice(-6) ?? null })
}

/** GET /api/v1/rides/active — dipanggil setelah SSR untuk tau ada perjalanan berjalan */
export async function activeRide(event: H3Event) {
  const user = optionalUser(event)
  if (!user) return resource(null)
  const ride = activeRideForUser(user.id, user.role === 'driver' ? 'driver' : 'rider')
  return resource(ride ? rideWithRelations(ride) : null)
}

/** GET /api/v1/me/summary — ringkasan sesuai role untuk halaman depan */
export async function homeSummary(event: H3Event) {
  const user = authUser(event)
  if (user.role === 'rider') {
    const rides = db.rides.filter(r => r.rider_id === user.id)
    const today = new Date().toISOString().slice(0, 10)
    return resource({
      total_rides: rides.length,
      rides_today: rides.filter(r => r.created_at.slice(0, 10) === today).length,
      total_spent: rides.filter(r => r.status === 'completed').reduce((a, r) => a + r.fare, 0),
      wallet_balance: 185_000,
      points: 1240,
      series: buildChartSeries(7),
    })
  }
  const profile = driverByUserId(user.id)
  return resource({
    status: profile?.status ?? 'offline',
    earnings_today: profile?.earnings_today ?? 0,
    earnings_month: profile?.earnings_month ?? 0,
    total_rides: profile?.total_rides ?? 0,
    rating: profile?.rating ?? 5,
    online_hours: profile?.online_hours ?? 0,
    series: buildChartSeries(7),
  })
}

/** GET /api/v1/me/activity — aktivitas terakhir untuk timeline dashboard */
export async function activity(event: H3Event) {
  const user = authUser(event)
  const rides = db.rides
    .filter(r => (user.role === 'rider' ? r.rider_id === user.id : r.driver_id !== null && db.drivers.find(d => d.id === r.driver_id)?.user_id === user.id))
    .slice(0, 8)
    .map(r => ({
      id: r.id,
      ride_code: r.ride_code,
      status: r.status,
      fare: r.fare,
      pickup_name: r.pickup.place_name,
      destination_name: r.destination.place_name,
      created_at: r.created_at,
    }))
  return resource(rides)
}
