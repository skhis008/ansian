import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Plugin Leaflet (client-only).
 * Membereskan default marker icon ke CDN resmi Leaflet karena Vite
 * tidak menyelesaikan path gambar di dalam node_modules.
 */
export default defineNuxtPlugin(() => {
  const iconRetina = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
  const icon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
  const shadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
  L.Icon.Default.mergeOptions({ iconRetinaUrl: iconRetina, iconUrl: icon, shadowUrl: shadow })

  return { provide: { leaflet: L } }
})
