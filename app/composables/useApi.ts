/**
 * HTTP client tunggal untuk seluruh aplikasi.
 *
 * - Saat runtimeConfig.public.useMock = true  → request ke /api/v1/* (mock bawaan Nuxt)
 * - Saat useMock = false                      → request ke Laravel (runtimeConfig.public.apiBase)
 *
 * Kontrak: Laravel Sanctum session cookie. Selalu `credentials: 'include'` dan
 * header X-Requested-With + Accept: application/json (wajib agar 401/419 ter-handle).
 */

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
  signal?: AbortSignal
  /** Jangan lempar error (untuk polling) */
  silent?: boolean
}

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]>

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  /** Pesan per-field untuk form (Laravel validation errors) */
  fieldErrors(): Record<string, string> {
    return Object.fromEntries(Object.entries(this.errors).map(([k, v]) => [k, v[0] ?? '']))
  }
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const config = useRuntimeConfig()
  const base = config.public.useMock ? '' : (config.public.apiBase as string).replace(/\/$/, '')
  let url = `${base}/api/v1${path}`
  if (query) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue
      qs.append(k, String(v))
    }
    const s = qs.toString()
    if (s) url += `?${s}`
  }
  return url
}

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, signal, silent } = options

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
  if (body) headers['Content-Type'] = 'application/json'

  /* SSR: teruskan cookie session agar request ke Laravel terotorisasi. */
  if (import.meta.server) {
    const cookie = useRequestHeaders(['cookie']).cookie
    if (cookie) headers.Cookie = cookie
  }

  try {
    const response = await $fetch.raw<T>(buildUrl(path, query), {
      method,
      body: body as Record<string, unknown> | undefined,
      signal,
      credentials: 'include',
      headers,
    })
    return response._data as T
  } catch (err: unknown) {
    if (silent) return undefined as T
    throw normalizeError(err, silent)
  }
}

function normalizeError(err: unknown, silent?: boolean): ApiError {
  if (err && typeof err === 'object') {
    const anyErr = err as {
      statusCode?: number
      status?: number
      statusMessage?: string
      message?: string
      data?: { message?: string; errors?: Record<string, string[]>; statusMessage?: string }
    }
    const status = anyErr.statusCode ?? anyErr.status ?? 500
    const message =
      anyErr.data?.message ??
      (anyErr.statusMessage && anyErr.statusMessage !== 'Unprocessable Entity' ? anyErr.statusMessage : undefined) ??
      anyErr.message ??
      (silent ? '' : 'Terjadi kesalahan jaringan. Coba lagi.')
    return new ApiError(message, status, anyErr.data?.errors ?? {})
  }
  return new ApiError('Terjadi kesalahan yang tidak diketahui.', 500)
}

export const http = {
  get: <T>(path: string, query?: RequestOptions['query'], opts?: RequestOptions) =>
    apiRequest<T>(path, { method: 'GET', query, ...opts }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { method: 'POST', body, ...opts }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { method: 'PUT', body, ...opts }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { method: 'PATCH', body, ...opts }),
  delete: <T>(path: string, opts?: RequestOptions) => apiRequest<T>(path, { method: 'DELETE', ...opts }),
}
