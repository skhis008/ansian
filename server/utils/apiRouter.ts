import type { H3Event } from 'h3'
import { getMethod } from 'h3'
import { createError } from 'h3'
import * as auth from './mockApi/auth'
import * as rides from './mockApi/rides'
import * as admin from './mockApi/admin'

/**
 * ============================================================
 *  MOCK ROUTER — cermin 1:1 dari routes/api.php Laravel
 * ============================================================
 *  Cara pakai:
 *   - Frontend memanggil /api/v1/... (sama persis dengan Laravel)
 *   - Saat backend Laravel aktif: set NUXT_PUBLIC_USE_MOCK=false
 *     lalu file ini boleh dihapus tanpa mengubah kode frontend.
 *  Format: "METHOD /path/:param"
 * ========================================================= */

type Handler = (event: H3Event) => Promise<unknown> | unknown

interface Route {
  method: string
  pattern: RegExp
  keys: string[]
  handler: Handler
}

function route(method: string, path: string, handler: Handler): Route {
  const keys: string[] = []
  const pattern = new RegExp(
    `^${path
      .split('/')
      .map(seg => {
        if (seg.startsWith(':')) {
          keys.push(seg.slice(1))
          return '([^/]+)'
        }
        if (seg === '**') return '.*'
        return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      })
      .join('/')}$`,
  )
  return { method, pattern, keys, handler }
}

const routes: Route[] = [
  /* ---------- AUTH ---------- */
  route('POST', '/api/v1/auth/register', auth.register),
  route('POST', '/api/v1/auth/login', auth.login),
  route('POST', '/api/v1/auth/logout', auth.logout),
  route('GET', '/api/v1/auth/me', auth.me),
  route('PATCH', '/api/v1/auth/profile', auth.updateProfile),
  route('PATCH', '/api/v1/auth/password', auth.updatePassword),
  route('GET', '/api/v1/auth/sessions', auth.sessions),

  /* ---------- ME ---------- */
  route('GET', '/api/v1/me/summary', auth.homeSummary),
  route('GET', '/api/v1/me/activity', auth.activity),
  route('GET', '/api/v1/rides/active', rides.getActiveRide),

  /* ---------- FARES ---------- */
  route('POST', '/api/v1/fares/quote', rides.quoteFare),

  /* ---------- RIDES ---------- */
  route('GET', '/api/v1/rides', rides.listRides),
  route('POST', '/api/v1/rides', rides.createRide),
  route('GET', '/api/v1/rides/:ride', rides.showRide),
  route('GET', '/api/v1/rides/:ride/route', rides.rideRoute),
  route('POST', '/api/v1/rides/:ride/cancel', rides.cancelRide),
  route('POST', '/api/v1/rides/:ride/rate', rides.rateRide),
  route('GET', '/api/v1/rides/:ride/timeline', rides.rideTimeline),
  route('POST', '/api/v1/rides/:ride/assign', rides.assignDriver),

  /* ---------- DRIVER ---------- */
  route('GET', '/api/v1/drivers', rides.listDrivers),
  route('GET', '/api/v1/drivers/nearby', rides.nearbyDrivers),
  route('PATCH', '/api/v1/drivers/me', rides.updateMyDriverProfile),
  route('POST', '/api/v1/drivers/me/status', rides.setDriverStatus),
  route('POST', '/api/v1/drivers/me/location', rides.updateDriverLocation),
  route('GET', '/api/v1/drivers/me/earnings', rides.myEarnings),
  route('GET', '/api/v1/drivers/jobs', rides.listJobs),
  route('POST', '/api/v1/drivers/jobs/:ride/accept', rides.acceptJob),
  route('POST', '/api/v1/drivers/jobs/:ride/reject', rides.rejectJob),
  route('GET', '/api/v1/drivers/:driver', rides.showDriver),
  route('POST', '/api/v1/drivers/rides/:ride/arrive', rides.markArrived),
  route('POST', '/api/v1/drivers/rides/:ride/start', rides.startRide),
  route('POST', '/api/v1/drivers/rides/:ride/complete', rides.completeRide),

  /* ---------- CHAT ---------- */
  route('GET', '/api/v1/conversations', rides.listConversations),
  route('POST', '/api/v1/conversations', rides.createConversation),
  route('GET', '/api/v1/conversations/:conversation', rides.showConversation),
  route('GET', '/api/v1/messages/:conversation', rides.listMessages),
  route('POST', '/api/v1/conversations/:conversation/messages', rides.sendMessage),
  route('POST', '/api/v1/conversations/:conversation/read', rides.markRead),

  /* ---------- NOTIFICATIONS ---------- */
  route('GET', '/api/v1/notifications', rides.listNotifications),
  route('POST', '/api/v1/notifications/read-all', rides.readAllNotifications),
  route('POST', '/api/v1/notifications/:notification/read', rides.readNotification),

  /* ---------- PAYMENTS ---------- */
  route('GET', '/api/v1/payments', rides.listPayments),
  route('POST', '/api/v1/payments', rides.createPayment),
  route('POST', '/api/v1/payments/webhook', rides.paymentWebhook),
  route('POST', '/api/v1/payments/:payment/webhook', rides.paymentWebhook),

  /* ---------- ADMIN ---------- */
  route('GET', '/api/v1/admin/stats', admin.stats),
  route('GET', '/api/v1/admin/activity', admin.adminActivity),
  route('GET', '/api/v1/admin/charts/rides', admin.chartRides),
  route('GET', '/api/v1/admin/charts/revenue', admin.chartRevenue),
  route('GET', '/api/v1/admin/charts/vehicle-type', admin.chartVehicleType),
  route('GET', '/api/v1/admin/top-drivers', admin.topDrivers),
  route('GET', '/api/v1/admin/users', admin.listUsers),
  route('GET', '/api/v1/admin/users/:user', admin.showUser),
  route('PATCH', '/api/v1/admin/users/:user', admin.updateUser),
  route('DELETE', '/api/v1/admin/users/:user', admin.deleteUser),
  route('GET', '/api/v1/admin/rides', admin.adminListRides),
  route('PATCH', '/api/v1/admin/rides/:ride', admin.adminUpdateRide),
  route('GET', '/api/v1/admin/payments', admin.adminListPayments),
  route('GET', '/api/v1/admin/reports', admin.adminReports),
  route('PATCH', '/api/v1/admin/drivers/:driver', admin.adminUpdateDriver),
  route('GET', '/api/v1/admin/settings', admin.getSettings),
  route('PUT', '/api/v1/admin/settings', admin.updateSettings),
]

export function handleApi(event: H3Event): unknown | undefined {
  const method = getMethod(event)
  const path = (event.path || '').split('?')[0]!.replace(/\/+$/, '') || '/'
  if (!path.startsWith('/api/v1')) return undefined

  let pathMatched = false
  for (const r of routes) {
    const m = r.pattern.exec(path)
    if (!m) continue
    pathMatched = true
    if (r.method !== method) continue

    r.keys.forEach((key, i) => {
      event.context.params = { ...(event.context.params ?? {}), [key]: decodeURIComponent(m[i + 1]!) }
    })
    return r.handler(event)
  }

  if (pathMatched) {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }
  throw createError({ statusCode: 404, data: { message: `Endpoint ${method} ${path} tidak ditemukan.` } })
}
