import L from 'leaflet'
import type { LatLng } from '#shared/types'

/** Ikon custom berbasis divIcon — ringan, tanpa aset gambar. */

const svg = (body: string, size = 34) =>
  `<div style="width:${size}px;height:${size}px;display:grid;place-items:center">${body}</div>`

const shape = (fill: string, ring: string, glyph: string, glyphColor = '#fff') =>
  svg(`
    <span style="position:relative;display:grid;place-items:center;width:100%;height:100%">
      <span style="position:absolute;inset:0;background:${fill};border:2.5px solid ${ring};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 10px rgba(15,23,42,.28)"></span>
      <span style="position:relative;transform:rotate(45deg);color:${glyphColor};display:grid;place-items:center;line-height:1">${glyph}</span>
    </span>
  `)

export const mapIcons = {
  /** Titik penjemputan */
  pickup: () =>
    L.divIcon({
      className: 'map-pin-wrap',
      html: shape('#0f172a', '#ffffff', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/></svg>'),
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32],
    }),

  destination: () =>
    L.divIcon({
      className: 'map-pin-wrap',
      html: shape('#e11d48', '#ffffff', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 1 1 16 0Z"/></svg>'),
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32],
    }),

  driver: () =>
    L.divIcon({
      className: 'map-pin-wrap',
      html: svg(`
        <span style="position:relative;display:grid;place-items:center;width:100%;height:100%">
          <span style="position:absolute;inset:0;border-radius:50%;background:rgba(37,99,235,.25);animation:pulse-ring 2s infinite"></span>
          <span style="position:relative;width:34px;height:34px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 4px 12px rgba(37,99,235,.4);display:grid;place-items:center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M6.5 17v1.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V17M20.5 17v1.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V17M3 17v-4.2a2 2 0 0 1 .2-.9l1.9-3.8A2 2 0 0 1 6.9 7h10.2a2 2 0 0 1 1.8 1.1l1.9 3.8c.13.28.2.59.2.9V17M7 13h.01M17 13h.01"/></svg>
          </span>
        </span>
      `, 44),
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -20],
    }),

  driverSmall: () =>
    L.divIcon({
      className: 'map-pin-wrap',
      html: svg(`
        <span style="position:relative;display:grid;place-items:center;width:100%;height:100%">
          <span style="position:relative;width:28px;height:28px;border-radius:50%;background:#2563eb;border:2.5px solid #fff;box-shadow:0 3px 8px rgba(37,99,235,.35);display:grid;place-items:center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M6.5 17v1.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V17M20.5 17v1.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V17M3 17v-4.2a2 2 0 0 1 .2-.9l1.9-3.8A2 2 0 0 1 6.9 7h10.2a2 2 0 0 1 1.8 1.1l1.9 3.8c.13.28.2.59.2.9V17M7 13h.01M17 13h.01"/></svg>
          </span>
        </span>
      `, 28),
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    }),

  me: () =>
    L.divIcon({
      className: 'map-pin-wrap',
      html: svg(`
        <span style="position:relative;display:grid;place-items:center;width:100%;height:100%">
          <span style="position:absolute;inset:0;border-radius:50%;background:rgba(14,165,233,.28);animation:pulse-ring 2.2s infinite"></span>
          <span style="position:relative;width:18px;height:18px;border-radius:50%;background:#0ea5e9;border:3px solid #fff;box-shadow:0 2px 8px rgba(14,165,233,.5)"></span>
        </span>
      `, 34),
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    }),

  /** Titik kecil untuk sebaran driver di panel pilih driver */
  clusterDot: (color = '#2563eb') =>
    L.divIcon({
      className: 'map-pin-wrap',
      html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(15,23,42,.25)"></span>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    }),
}

export function toLatLng(p: LatLng): L.LatLngExpression {
  return [p.lat, p.lng]
}
