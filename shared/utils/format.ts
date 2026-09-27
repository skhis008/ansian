export const IDR = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const NUM = new Intl.NumberFormat('id-ID')

/** Laravel: format angka dengan pemisah ribuan */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '0'
  return NUM.format(value)
}

/** Format Rupiah tanpa simbol (untuk input / ringkasan) */
export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Rp0'
  return `Rp${NUM.format(Math.round(value))}`
}

export function formatRupiahShort(value: number | null | undefined): string {
  const n = value ?? 0
  if (Math.abs(n) >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1).replace('.0', '')}M`
  if (Math.abs(n) >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1).replace('.0', '')}jt`
  if (Math.abs(n) >= 1_000) return `Rp${Math.round(n / 1_000)}rb`
  return `Rp${NUM.format(n)}`
}

export function formatCompact(value: number | null | undefined): string {
  const n = value ?? 0
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}rb`
  return NUM.format(n)
}

const DATE_FMT = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
const DATE_TIME_FMT = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const TIME_FMT = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' })
const DAY_FMT = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDate(value: string | Date | null | undefined, fallback = '-'): string {
  const d = toDate(value)
  return d ? DATE_FMT.format(d) : fallback
}

export function formatDateTime(value: string | Date | null | undefined, fallback = '-'): string {
  const d = toDate(value)
  return d ? DATE_TIME_FMT.format(d) : fallback
}

export function formatTime(value: string | Date | null | undefined, fallback = '-'): string {
  const d = toDate(value)
  return d ? TIME_FMT.format(d) : fallback
}

export function formatDay(value: string | Date | null | undefined, fallback = '-'): string {
  const d = toDate(value)
  return d ? DAY_FMT.format(d) : fallback
}

export function formatRelative(value: string | Date | null | undefined): string {
  const d = toDate(value)
  if (!d) return '-'
  const diff = Date.now() - d.getTime()
  const abs = Math.abs(diff)
  const future = diff < 0
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60_000, 'minute'],
    [3_600_000, 'hour'],
    [86_400_000, 'day'],
    [604_800_000, 'week'],
    [2_592_000_000, 'month'],
  ]
  if (abs < 45_000) return 'baru saja'
  for (let i = 0; i < units.length; i++) {
    const [ms, unit] = units[i]!
    const next = units[i + 1]?.[0] ?? Infinity
    if (abs < next) {
      const v = Math.round(abs / ms)
      return new Intl.RelativeTimeFormat('id', { numeric: 'auto' }).format(future ? v : -v, unit)
    }
  }
  return DATE_FMT.format(d)
}

/** "2 menit lagi" / "3 menit lalu" untuk countdown order */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  if (s < 60) return `${s} detik`
  const m = Math.floor(s / 60)
  const r = s % 60
  return r ? `${m} mnt ${r} dtk` : `${m} menit`
}

export function formatDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes))
  if (m < 60) return `${m} menit`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h} jam ${r} menit` : `${h} jam`
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1).replace('.', ',')} km`
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits).replace(/\.0$/, '')}%`
}

export function formatRating(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) return '-'
  return value.toFixed(digits)
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]!.toUpperCase())
    .join('')
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 9) return phone
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function slugToTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
