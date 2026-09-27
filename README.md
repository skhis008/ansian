# Ajem-UDINUS-FE

Frontend **AntarJemput** — aplikasi ride hailing (Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS 4).

## Fitur

- **Rider** — pemesanan perjalanan, pelacakan driver di peta, chat, checkout, riwayat perjalanan, pembayaran
- **Driver** — kelola permintaan, perjalanan aktif, chat, pendapatan, profil
- **Admin** — dashboard, manajemen driver/rider, perjalanan, transaksi, laporan, pengaturan
- **Realtime** — Laravel Echo + Pusher (Reverb/Soketi)
- **Peta** — Leaflet + OpenStreetMap
- **Chart** — ECharts
- **State** — Pinia

## Stack

| Layer | Teknologi |
| --- | --- |
| Framework | Nuxt 4 (Vue 3, Composition API, TypeScript strict) |
| Styling | Tailwind CSS 4 |
| State | Pinia |
| Maps | Leaflet + OpenStreetMap |
| Charts | ECharts |
| Realtime | Laravel Echo + Pusher |

## Menjalankan

```bash
npm install
npm run dev
```

Server berjalan di http://localhost:3000

## Build

```bash
npm run build      # build produksi
npm run preview    # preview hasil build
npm run generate   # static generate
```

## Environment

Salin `.env.example` menjadi `.env` lalu sesuaikan. Konfigurasi diambil dari `runtimeConfig` (`nuxt.config.ts`):

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:8000` | Base URL Laravel backend |
| `NUXT_PUBLIC_USE_MOCK` | `true` | `true` = mock API bawaan, `false` = panggil Laravel |
| `NUXT_PUBLIC_APP_URL` | `http://localhost:3000` | URL aplikasi |
| `NUXT_PUBLIC_REALTIME_ENABLED` | `false` | Aktifkan koneksi realtime |
| `NUXT_PUBLIC_REALTIME_KEY` | - | App key Pusher/Reverb |
| `NUXT_PUBLIC_REALTIME_HOST` | `localhost` | Host websocket |
| `NUXT_PUBLIC_REALTIME_PORT` | `8080` | Port websocket |
| `NUXT_PUBLIC_REALTIME_WSS_PORT` | `8081` | Port WSS |
| `NUXT_PUBLIC_REALTIME_TLS` | `false` | Force TLS |
| `NUXT_PUBLIC_REALTIME_CLUSTER` | `mt1` | Cluster Pusher |

## Struktur

```
app/
  assets/        # CSS global
  components/    # UI, map, ride, chat, charts, marketing, pay, driver
  composables/   # useApi, useRealtime, useToast, usePreferences
  layouts/       # app, auth, default
  middleware/    # auth.global.ts
  pages/         # rider/, driver/, admin/, halaman publik
  plugins/       # leaflet.client.ts
  stores/        # auth, ride, chat, driver, notification, ui (Pinia)
  utils/
server/          # API routes + mock API
shared/          # types, mocks, utils
```

## Integrasi Backend

Secara default aplikasi memakai mock API bawaan di `server/utils/mockApi` agar dapat dijalankan mandiri. Untuk terhubung ke Laravel backend, set `NUXT_PUBLIC_USE_MOCK=false` dan `NUXT_PUBLIC_API_BASE` menuju URL backend Anda.

## License

Private — © Ajem-UDINUS
