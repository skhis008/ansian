export type ZoneId = 'green' | 'yellow' | 'orange' | 'red'

export interface ZoneRule {
  id: ZoneId
  label: string
  color: string
  minKm: number
  maxKm: number | null
  adminFee: number
  /** Rentang jarak untuk tampilan (marketing) */
  rangeLabel: string
  /** Rentang tarif zona untuk tampilan (marketing), sebelum biaya admin */
  fareRangeLabel: string
}

/**
 * Aturan tarif zona Ansian — SATU-SATUNYA sumber kebenaran (frontend & mock).
 * Backend Laravel harus mereplikasi rumus di `calculateZoneFare` persis seperti ini
 * (lihat README.md → "Kontrak Tarif Zona").
 */
export const ZONE_RULES: ZoneRule[] = [
  {
    id: 'green',
    label: 'Zona Hijau',
    color: '#16a34a',
    minKm: 0,
    maxKm: 2.5,
    adminFee: 500,
    rangeLabel: '0 – 2,5 km',
    fareRangeLabel: 'Rp4.000',
  },
  {
    id: 'yellow',
    label: 'Zona Kuning',
    color: '#eab308',
    minKm: 2.5,
    maxKm: 6.5,
    adminFee: 500,
    rangeLabel: '2,5 – 6,5 km',
    fareRangeLabel: 'Rp5.000 – Rp15.000',
  },
  {
    id: 'orange',
    label: 'Zona Jingga',
    color: '#f97316',
    minKm: 6.5,
    maxKm: 10.5,
    adminFee: 1000,
    rangeLabel: '6,5 – 10,5 km',
    fareRangeLabel: 'Rp16.000 – Rp20.000',
  },
  {
    id: 'red',
    label: 'Zona Merah',
    color: '#ef4444',
    minKm: 10.5,
    maxKm: null,
    adminFee: 1000,
    rangeLabel: '≥ 10,5 km',
    fareRangeLabel: 'Rp20.000 + Rp1.500/km',
  },
]

const round100 = (v: number) => Math.round(v / 100) * 100
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const lerp = (v0: number, v1: number, t: number) => v0 + (v1 - v0) * t

export function zoneForDistance(distanceKm: number): ZoneRule {
  if (distanceKm < 2.5) return ZONE_RULES[0]!
  if (distanceKm < 6.5) return ZONE_RULES[1]!
  if (distanceKm < 10.5) return ZONE_RULES[2]!
  return ZONE_RULES[3]!
}

/**
 * Rumus tarif per zona:
 * - Hijau  (<2,5 km)  : tetap 4.000
 * - Kuning (2,5–6,5)  : lurus 5.000@3km → 15.000@6km (clamp di batas zona)
 * - Jingga (6,5–10,5) : lurus 16.000@7km → 20.000@10km (clamp di batas zona)
 * - Merah  (≥10,5 km) : 20.000 + max(0, km−11) × 1.500
 * total = tarif zona + biaya admin. Tanpa surge/biaya layanan.
 */
export function calculateZoneFare(distanceKm: number): {
  zone: ZoneId
  zone_label: string
  zone_color: string
  distance_km: number
  zone_fare: number
  admin_fee: number
  total: number
  currency: 'IDR'
} {
  const d = Math.max(0, distanceKm)
  const rule = zoneForDistance(d)
  let zoneFare: number

  switch (rule.id) {
    case 'green':
      zoneFare = 4000
      break
    case 'yellow':
      zoneFare = clamp(round100(lerp(5000, 15000, (d - 3) / 3)), 5000, 15000)
      break
    case 'orange':
      zoneFare = clamp(round100(lerp(16000, 20000, (d - 7) / 3)), 16000, 20000)
      break
    default:
      zoneFare = round100(20000 + Math.max(0, d - 11) * 1500)
  }

  return {
    zone: rule.id,
    zone_label: rule.label,
    zone_color: rule.color,
    distance_km: Math.round(d * 100) / 100,
    zone_fare: zoneFare,
    admin_fee: rule.adminFee,
    total: zoneFare + rule.adminFee,
    currency: 'IDR',
  }
}

/** Biaya admin singkat untuk label (mis. "Rp500") */
export function adminFeeLabel(distanceKm: number): string {
  return `Rp${zoneForDistance(distanceKm).adminFee.toLocaleString('id-ID')}`
}
