import { createError, getCookie, setCookie, deleteCookie, getQuery, readBody, type H3Event } from 'h3'
import type { Paginated, User } from '#shared/types'
import { db, userById } from './mockApi/db'

export const SESSION_COOKIE = 'ans_session'
/** Cookie kepercayaan perangkat: lewati OTP 30 hari (mirip trust device Laravel) */
export const DEVICE_COOKIE = 'ans_device'

export interface Session {
  userId: number
  token: string
}

export interface DeviceTrust {
  userId: number
  trusted_at: string
}

/* ---------------- Session (mock Laravel session / Sanctum) ---------------- */

export function readSession(event: H3Event): Session | null {
  const raw = getCookie(event, SESSION_COOKIE)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Session
    if (typeof parsed.userId === 'number' && parsed.token) return parsed
  } catch {
    /* ignore */
  }
  return null
}

export function writeSession(event: H3Event, session: Session) {
  setCookie(event, SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export function clearAuthSession(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export function readDevice(event: H3Event): DeviceTrust | null {
  const raw = getCookie(event, DEVICE_COOKIE)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as DeviceTrust
    if (typeof parsed.userId === 'number' && parsed.trusted_at) return parsed
  } catch {
    /* ignore */
  }
  return null
}

export function trustDevice(event: H3Event, userId: number) {
  setCookie(event, DEVICE_COOKIE, JSON.stringify({ userId, trusted_at: new Date().toISOString() }), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

/** Equivalent to Laravel $request->user() via auth:sanctum middleware */
export function authUser(event: H3Event): User {
  const session = readSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated', data: { message: 'Silakan masuk terlebih dahulu.' } })
  }
  const user = userById(session.userId)
  if (!user) {
    clearAuthSession(event)
    throw createError({ statusCode: 401, statusMessage: 'Unauthenticated', data: { message: 'Sesi tidak valid.' } })
  }
  return user
}

export function optionalUser(event: H3Event): User | null {
  const session = readSession(event)
  return session ? (userById(session.userId) ?? null) : null
}

export function requireRole(event: H3Event, ...roles: User['role'][]): User {
  const user = authUser(event)
  if (!roles.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden', data: { message: 'Anda tidak punya akses ke resource ini.' } })
  }
  return user
}

/* ---------------- Response helpers ---------------- */

export function resource<T>(data: T, meta?: Record<string, unknown>) {
  return meta ? { data, meta } : { data }
}

/** Laravel paginator response */
export function paginate<T>(items: T[], event: H3Event, perPage?: number): Paginated<T> {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const size = Math.min(100, Math.max(1, Number(q.per_page) || perPage || 15))
  const total = items.length
  const lastPage = Math.max(1, Math.ceil(total / size))
  const current = Math.min(page, lastPage)
  const start = (current - 1) * size
  const slice = items.slice(start, start + size)
  const url = (p: number) => `?page=${p}&per_page=${size}`
  return {
    data: slice,
    links: {
      first: url(1),
      last: url(lastPage),
      prev: current > 1 ? url(current - 1) : null,
      next: current < lastPage ? url(current + 1) : null,
    },
    meta: {
      current_page: current,
      from: slice.length ? start + 1 : null,
      last_page: lastPage,
      per_page: size,
      to: slice.length ? start + slice.length : null,
      total,
    },
  }
}

/** Filter + sort helper mirroring Laravel query builder */
export function queryList<T extends Record<string, any>>(
  items: T[],
  event: H3Event,
  opts: {
    search?: string[]
    /** Predikat menerima (item, nilaiFilter) */
    sort?: Record<string, 'asc' | 'desc'>
    filters?: Record<string, (item: T, value: string) => boolean>
    /** Pencarian tambahan di luar field sederhana */
    match?: (item: T, term: string) => boolean
  } = {},
): T[] {
  const q = getQuery(event)
  let result = [...items]

  const term = String(q.q ?? q.search ?? '').trim().toLowerCase()
  if (term) {
    const fields = opts.search ?? []
    result = result.filter(
      item =>
        (fields.length > 0 && fields.some(field => String(item[field] ?? '').toLowerCase().includes(term))) ||
        (opts.match ? opts.match(item, term) : false),
    )
  }

  if (opts.filters) {
    for (const [key, predicate] of Object.entries(opts.filters)) {
      const raw = q[key]
      if (raw === undefined || raw === '' || raw === 'all') continue
      const values = String(raw).split(',')
      result = result.filter(item => values.some(v => predicate(item, v)))
    }
  }

  if (opts.sort && typeof q.sort_by === 'string' && opts.sort[q.sort_by]) {
    const dir = opts.sort[q.sort_by] === 'asc' ? 1 : -1
    const field = q.sort_by
    result.sort((a, b) => {
      const av = a[field]
      const bv = b[field]
      if (av === bv) return 0
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      return av > bv ? dir : -dir
    })
  }

  return result
}

/** Validasi sederhana: return 422 dengan format errors Laravel */
export function validate<T extends Record<string, unknown>>(data: T, rules: Record<string, (value: any) => string | null>) {
  const errors: Record<string, string[]> = {}
  for (const [field, check] of Object.entries(rules)) {
    const message = check(data[field])
    if (message) errors[field] = [message]
  }
  if (Object.keys(errors).length) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Entity',
      data: {
        message: Object.values(errors).flat()[0],
        errors,
      },
    })
  }
}

export const required = (label: string) => (v: unknown) =>
  v === undefined || v === null || v === '' ? `${label} wajib diisi.` : null

export const emailRule = () => (v: unknown) =>
  typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Format email tidak valid.'

export const minRule = (n: number, label = 'Field ini') => (v: unknown) =>
  typeof v === 'string' && v.length < n ? `${label} minimal ${n} karakter.` : null

export function findOr404<T>(item: T | undefined, message = 'Data tidak ditemukan.'): T {
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Not Found', data: { message } })
  return item
}

export function delay(ms = 220) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Body parser yang aman (tidak throw kalau body kosong / bukan JSON) */
export async function readPayload<T extends Record<string, any> = Record<string, any>>(event: H3Event): Promise<T> {
  try {
    return ((await readBody(event)) ?? {}) as T
  } catch {
    return {} as T
  }
}

export { db }
