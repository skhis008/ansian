import type { H3Event } from 'h3'
import { createError, getQuery, getRouterParam } from 'h3'
import type {
  DashboardStats,
  DriverProfile,
  Payment,
  RevenueByVehicleType,
  SystemSetting,
  TopDriver,
} from '#shared/types'
import {
  authUser,
  db,
  delay,
  findOr404,
  paginate,
  queryList,
  readPayload,
  resource,
  requireRole,
} from '../api'
import {
  buildChartSeries,
  driverById,
  nowIso,
  paymentsForRide,
  rideWithRelations,
  userById,
} from './db'

/** GET /api/v1/admin/stats */
export async function stats(event: H3Event) {
  requireRole(event, 'admin')
  const rides = db.rides
  const today = new Date().toISOString().slice(0, 10)
  const ridesToday = rides.filter(r => r.created_at.slice(0, 10) === today)
  const completed = rides.filter(r => r.status === 'completed')
  const cancelled = rides.filter(r => r.status === 'cancelled' || r.status === 'failed')
  const gmv = completed.reduce((a, r) => a + r.fare, 0)
  const revenue = Math.round(gmv * 0.08)

  const payload: DashboardStats = {
    total_rides: rides.length,
    rides_today: ridesToday.length,
    total_users: db.users.length,
    customers: db.users.filter(u => u.role === 'customer').length,
    drivers: db.users.filter(u => u.role === 'driver').length,
    online_drivers: db.drivers.filter(d => d.status !== 'offline').length,
    pending_drivers: db.drivers.filter(d => d.verification === 'pending').length,
    gmv_today: ridesToday.filter(r => r.status === 'completed').reduce((a, r) => a + r.fare, 0),
    gmv_month: gmv,
    revenue_today: revenue,
    revenue_month: Math.round(gmv * 0.08),
    avg_fare: completed.length ? Math.round(gmv / completed.length) : 0,
    completion_rate: rides.length ? Number(((completed.length / rides.length) * 100).toFixed(1)) : 0,
    cancellation_rate: rides.length ? Number(((cancelled.length / rides.length) * 100).toFixed(1)) : 0,
    avg_rating: Number((db.drivers.reduce((a, d) => a + d.rating, 0) / (db.drivers.length || 1)).toFixed(2)),
    active_rides: rides.filter(r => ['searching', 'driver_assigned', 'driver_arrived', 'in_progress'].includes(r.status)).length,
    pending_complaints: 3,
    rides_change_pct: 12.4,
    gmv_change_pct: 8.7,
    users_change_pct: 5.2,
  }
  return resource(payload)
}

/** GET /api/v1/admin/charts/rides?days=14 */
export async function chartRides(event: H3Event) {
  requireRole(event, 'admin')
  const days = Math.min(90, Number(getQuery(event).days) || 14)
  return resource(buildChartSeries(days))
}

/** GET /api/v1/admin/charts/revenue?days=14 */
export async function chartRevenue(event: H3Event) {
  requireRole(event, 'admin')
  const days = Math.min(90, Number(getQuery(event).days) || 14)
  const series = buildChartSeries(days)
  return resource(
    series.map(p => ({
      date: p.date,
      label: p.label,
      gross: p.gmv,
      net: Math.round(p.gmv * 0.08),
    })),
  )
}

/** GET /api/v1/admin/charts/vehicle-type */
function revenueByVehicleType(): RevenueByVehicleType[] {
  const completed = db.rides.filter(r => r.status === 'completed')
  const total = completed.reduce((a, r) => a + r.fare, 0) || 1
  const types: RevenueByVehicleType[] = [
    { vehicle_type: 'motorcycle', label: 'Motor', rides: 0, gmv: 0, percentage: 0 },
  ]
  for (const r of completed) {
    if (!r.driver_id) continue
    const d = db.drivers.find(x => x.id === r.driver_id)
    if (!d) continue
    const t = types.find(x => x.vehicle_type === d.vehicle_type)
    if (!t) continue
    t.rides += 1
    t.gmv += r.fare
  }
  for (const t of types) t.percentage = Number(((t.gmv / total) * 100).toFixed(1))
  return types
}

/** GET /api/v1/admin/charts/vehicle-type */
export async function chartVehicleType(event: H3Event) {
  requireRole(event, 'admin')
  return resource(revenueByVehicleType())
}

/** GET /api/v1/admin/top-drivers */
export async function topDrivers(event: H3Event) {
  requireRole(event, 'admin')
  const list: TopDriver[] = db.drivers
    .map(d => driverById(d.id)!)
    .sort((a, b) => b.total_rides - a.total_rides)
    .slice(0, 8)
    .map(d => ({
      id: d.id,
      name: d.user.name,
      avatar_url: d.user.avatar_url,
      driver_code: d.driver_code,
      vehicle_plate: d.vehicle_plate,
      total_rides: d.total_rides,
      rating: d.rating,
      earnings: d.earnings_month,
    }))
  return resource(list)
}

/** GET /api/v1/admin/users */
export async function listUsers(event: H3Event) {
  requireRole(event, 'admin')
  const list = queryList(db.users, event, {
    search: ['name', 'email', 'phone'],
    filters: {
      role: (u, v) => u.role === v,
      status: (u, v) => u.status === v,
    },
    sort: { created_at: 'desc', name: 'asc' },
  })
  const page = paginate(list, event, 15)
  return { data: page.data, links: page.links, meta: page.meta }
}

/** GET /api/v1/admin/users/{user} */
export async function showUser(event: H3Event) {
  requireRole(event, 'admin')
  const id = Number(getRouterParam(event, 'user'))
  const user = findOr404(userById(id), 'Pengguna tidak ditemukan.')
  const rides = db.rides.filter(r => r.customer_id === id)
  const profile = db.drivers.find(d => d.user_id === id)
  return resource({
    ...user,
    driver: profile ?? null,
    stats: {
      total_rides: rides.length,
      completed_rides: rides.filter(r => r.status === 'completed').length,
      total_spent: rides.filter(r => r.status === 'completed').reduce((a, r) => a + r.fare, 0),
    },
    rides: rides.slice(0, 10).map(rideWithRelations),
  })
}

/** PATCH /api/v1/admin/users/{user} */
export async function updateUser(event: H3Event) {
  requireRole(event, 'admin')
  const id = Number(getRouterParam(event, 'user'))
  const user = findOr404(userById(id), 'Pengguna tidak ditemukan.')
  const body = await readPayload(event)
  if (body.name) user.name = String(body.name)
  if (body.email) user.email = String(body.email)
  if (body.phone) user.phone = String(body.phone)
  if (body.role && ['customer', 'driver', 'admin'].includes(body.role)) user.role = body.role
  if (body.status && ['active', 'pending', 'suspended'].includes(body.status)) user.status = body.status
  user.updated_at = nowIso()
  return resource(user, { message: 'Pengguna diperbarui.' })
}

/** DELETE /api/v1/admin/users/{user} */
export async function deleteUser(event: H3Event) {
  const admin = requireRole(event, 'admin')
  const id = Number(getRouterParam(event, 'user'))
  if (id === admin.id) {
    throw createError({ statusCode: 422, data: { message: 'Tidak bisa menghapus akun sendiri.' } })
  }
  const idx = db.users.findIndex(u => u.id === id)
  if (idx === -1) throw createError({ statusCode: 404, data: { message: 'Pengguna tidak ditemukan.' } })
  const [removed] = db.users.splice(idx, 1)
  return resource(removed, { message: 'Pengguna dihapus.' })
}

/** GET /api/v1/admin/rides */
export async function adminListRides(event: H3Event) {
  requireRole(event, 'admin')
  const list = queryList(db.rides, event, {
    search: ['ride_code'],
    filters: {
      status: (r, v) => r.status === v,
      payment_status: (r, v) => r.payment_status === v,
      payment_method: (r, v) => r.payment_method === v,
    },
    sort: { created_at: 'desc', fare: 'desc' },
  })
  const page = paginate(list.map(rideWithRelations), event, 15)
  return { data: page.data, links: page.links, meta: page.meta }
}

/** PATCH /api/v1/admin/rides/{ride} */
export async function adminUpdateRide(event: H3Event) {
  requireRole(event, 'admin')
  const ride = findOr404(db.rides.find(r => r.id === Number(getRouterParam(event, 'ride'))), 'Perjalanan tidak ditemukan.')
  const body = await readPayload(event)
  if (body.status && ['searching', 'driver_assigned', 'driver_arrived', 'in_progress', 'completed', 'cancelled', 'failed'].includes(body.status)) {
    ride.status = body.status
    ride.status_histories.push({ id: Date.now(), status: body.status, note: 'Diubah oleh admin', created_at: nowIso() })
  }
  ride.updated_at = nowIso()
  return resource(rideWithRelations(ride), { message: 'Perjalanan diperbarui.' })
}

/** PATCH /api/v1/admin/drivers/:driver */
export async function adminUpdateDriver(event: H3Event) {
  requireRole(event, 'admin')
  const id = Number(getRouterParam(event, 'driver'))
  const driver = findOr404(
    db.drivers.find(d => d.id === id),
    'Driver tidak ditemukan.',
  )
  const body = await readPayload(event)

  if (body.status && ['offline', 'idle', 'busy'].includes(body.status)) {
    driver.status = body.status
  }
  if (body.user_status && ['active', 'pending', 'suspended'].includes(body.user_status)) {
    const user = db.users.find(u => u.id === driver.user_id)
    if (user) user.status = body.user_status
  }
  if (body.vehicle && typeof body.vehicle === 'object') {
    const v = body.vehicle as Record<string, unknown>
    if (v.vehicle_type && ['motorcycle'].includes(String(v.vehicle_type))) {
      driver.vehicle_type = v.vehicle_type as DriverProfile['vehicle_type']
    }
    if (v.vehicle_plate) driver.vehicle_plate = String(v.vehicle_plate)
    if (v.vehicle_color) driver.vehicle_color = String(v.vehicle_color)
    if (v.vehicle_model) driver.vehicle_model = String(v.vehicle_model)
  }
  if (body.student_id) driver.student_id = String(body.student_id)
  if (body.campus) driver.campus = String(body.campus)
  if (body.study_program) driver.study_program = String(body.study_program)

  return resource(driverById(driver.id)!, { message: 'Data driver diperbarui.' })
}

/** POST /api/v1/admin/drivers/{driver}/verify — verifikasi status mahasiswa */
export async function verifyDriver(event: H3Event) {
  requireRole(event, 'admin')
  const id = Number(getRouterParam(event, 'driver'))
  const driver = findOr404(
    db.drivers.find(d => d.id === id),
    'Driver tidak ditemukan.',
  )
  const body = await readPayload(event)
  if (!['verified', 'rejected', 'pending'].includes(String(body.verification))) {
    throw createError({ statusCode: 422, data: { message: 'Status verifikasi tidak valid.' } })
  }
  driver.verification = body.verification as DriverProfile['verification']
  const user = db.users.find(u => u.id === driver.user_id)
  if (user) user.updated_at = nowIso()
  const label = driver.verification === 'verified' ? 'Terverifikasi' : driver.verification === 'rejected' ? 'Ditolak' : 'Menunggu verifikasi'
  return resource(driverById(driver.id)!, { message: `Status driver: ${label}.` })
}

/** GET /api/v1/admin/payments — semua transaksi lintas pengguna */
export async function adminListPayments(event: H3Event) {
  requireRole(event, 'admin')
  const rows = db.rides
    .map(r => {
      const payment = paymentsForRide(r.id)
      if (!payment) return null
      return {
        ...payment,
        ride_code: r.ride_code,
        customer_name: userById(r.customer_id)?.name ?? '-',
        driver_name: r.driver_id ? (driverById(r.driver_id)?.user.name ?? '-') : '-',
      }
    })
    .filter(Boolean) as Array<
    Payment & { ride_code: string; customer_name: string; driver_name: string }
  >

  const list = queryList(rows, event, {
    search: ['reference', 'ride_code', 'customer_name', 'driver_name'],
    match: (p, term) => p.customer_name.toLowerCase().includes(term) || p.driver_name.toLowerCase().includes(term),
    filters: {
      status: (p, v) => p.status === v,
      method: (p, v) => p.method === v,
      date: (p, v) => p.created_at.slice(0, 10) === v,
    },
    sort: { created_at: 'desc', amount: 'desc' },
  })
  const page = paginate(list, event, 15)
  return { data: page.data, links: page.links, meta: page.meta }
}

/** GET /api/v1/admin/reports?days=30 */
export async function adminReports(event: H3Event) {
  requireRole(event, 'admin')
  const days = Math.min(365, Number(getQuery(event).days) || 30)
  const series = buildChartSeries(days)
  const completed = db.rides.filter(r => r.status === 'completed')
  const byMethod = new Map<string, { method: string; count: number; amount: number }>()
  for (const r of completed) {
    const entry = byMethod.get(r.payment_method) ?? { method: r.payment_method, count: 0, amount: 0 }
    entry.count += 1
    entry.amount += r.fare
    byMethod.set(r.payment_method, entry)
  }
  return resource({
    range: { days, from: series[0]?.date ?? null, to: series[series.length - 1]?.date ?? null },
    series,
    summary: {
      total_rides: completed.length,
      total_gmv: completed.reduce((a, r) => a + r.fare, 0),
      avg_fare: completed.length ? Math.round(completed.reduce((a, r) => a + r.fare, 0) / completed.length) : 0,
      total_distance_km: Number(completed.reduce((a, r) => a + (r.distance_km ?? 0), 0).toFixed(1)),
      total_duration_min: completed.reduce((a, r) => a + (r.duration_min ?? 0), 0),
    },
    by_method: [...byMethod.values()],
    by_vehicle: revenueByVehicleType(),
  })
}

/** GET /api/v1/admin/settings */
export async function getSettings(event: H3Event) {
  requireRole(event, 'admin')
  const grouped = db.settings.reduce<Record<string, SystemSetting[]>>((acc, s) => {
    ;(acc[s.group] ??= []).push(s)
    return acc
  }, {})
  return resource(db.settings, { grouped })
}

/** PUT /api/v1/admin/settings */
export async function updateSettings(event: H3Event) {
  requireRole(event, 'admin')
  const body = await readPayload(event)
  const updates = (body.settings ?? body) as Record<string, string>
  let count = 0
  for (const [key, value] of Object.entries(updates)) {
    const s = db.settings.find(x => x.key === key)
    if (s) {
      s.value = String(value)
      count++
    }
  }
  return resource({ updated: count }, { message: `${count} pengaturan disimpan.` })
}

/** GET /api/v1/admin/activity */
export async function adminActivity(event: H3Event) {
  requireRole(event, 'admin')
  const list = db.rides
    .slice(0, 12)
    .map(r => ({
      id: r.id,
      ride_code: r.ride_code,
      status: r.status,
      fare: r.fare,
      customer_name: userById(r.customer_id)?.name ?? '-',
      driver_name: r.driver_id ? driverById(r.driver_id)?.user.name ?? '-' : '-',
      created_at: r.created_at,
    }))
  await delay(120)
  return resource(list)
}
