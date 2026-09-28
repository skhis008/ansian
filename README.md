# Ansian — Antar Jemput Dinusian

Frontend **Ansian (Antar Jemput Dinusian)** — layanan antar jemput berbasis motor kawasan Udinus/Semarang.
Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS 4.

Dua pilar produk:

1. **Tarif lebih terjangkau & transparan** — zona jarak (hijau/kuning/jingga/merah), tanpa surge, tanpa biaya tersembunyi.
2. **Lowongan kerja sampingan bagi mahasiswa** — driver khusus mahasiswa (NIM + kampus, diverifikasi admin).

## Fitur

- **Pelanggan** — pesan perjalanan (motor), kirim barang, peta, chat, checkout **Tunai/QRIS**, riwayat, verifikasi kode email (OTP)
- **Driver (mahasiswa)** — pendaftaran via `/driver/daftar` (NIM, kampus, prodi), banner status verifikasi, permintaan order, pendapatan, profil kendaraan
- **Admin** — dashboard, verifikasi driver, pengguna, perjalanan, transaksi (termasuk **Tandai Lunas**), laporan, pengaturan zona tarif
- **Peta** — Leaflet + OpenStreetMap (pusat default: Kampus Udinus `-6.982835, 110.4093524`)
- **State** — Pinia · **Chart** — komponen chart internal (tanpa ECharts)

## Stack

| Layer | Teknologi |
| --- | --- |
| Framework | Nuxt 4 (Vue 3, Composition API, TypeScript strict) |
| Styling | Tailwind CSS 4 |
| State | Pinia |
| Maps | Leaflet + OpenStreetMap |
| Realtime | Laravel Echo + Pusher/Reverb (opsional) |

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # vue-tsc
npm run build && npm run preview
```

> Catatan environment Termux: file bin `node_modules` dengan shebang `#!/usr/bin/env node`
> perlu di-patch bila `/usr/bin/env` tidak ada (`sed -i "1s|.*|#!$(which node)|" <file>`).

## Akun demo (mode mock)

| Role | Email | Password |
| --- | --- | --- |
| Pelanggan | `customer@ansian.id` | `password` |
| Driver | `driver@ansian.id` | `password` |
| Admin | `admin@ansian.id` | `admin123` |

Login/registrasi meminta **kode OTP 6 digit** (mode mock: kode tampil di layar sebagai `dev_code`,
produksi Laravel mengirim via email). Perangkat yang lolos OTP diberi cookie `ans_device` (percaya 30 hari),
sehingga login berikutnya cukup password.

## Environment

Salin `.env.example` menjadi `.env` lalu sesuaikan (`nuxt.config.ts → runtimeConfig`):

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:8000` | Base URL Laravel backend |
| `NUXT_PUBLIC_USE_MOCK` | `true` | `true` = mock API bawaan, `false` = panggil Laravel |
| `NUXT_PUBLIC_APP_URL` | `http://localhost:3000` | URL aplikasi |
| `NUXT_PUBLIC_REALTIME_*` | - | Konfigurasi Pusher/Reverb (opsional) |

---

## Kontrak Backend (untuk tim Laravel)

Frontend berjalan mandiri dengan mock API di `server/utils/mockApi/*` yang **meniru 1:1 `routes/api.php`**.
Saat backend aktif: set `NUXT_PUBLIC_USE_MOCK=false` — file mock boleh dihapus tanpa mengubah kode frontend.
Perubahan kontrak terhadap versi lama tercatat di bawah.

### 1. Naming & role

| Lama | Baru |
| --- | --- |
| route `/rider/*`, role `rider` | route **`/customer/*`**, role **`customer`** |
| field `rider_id`, `rider_name`, `rider_rating` | **`customer_id`**, **`customer_name`**, **`customer_rating`** |
| cookie `aj_session` | **`ans_session`** |
| token mock `aj_mock_*` | **`ans_mock_*`** |
| kode trip `AJ-…` | **`ASN-…`** |
| promo `AJHEMAT30` | **`ANSIAN30`** |
| cancel reason `rider_cancel` | **`customer_cancel`** |
| kendaraan `motorcycle/car/van` | **`motorcycle` saja** |
| pembayaran `cash/qris/midtrans/xendit/wallet` | **`cash` + `qris` saja** (tanpa gateway/`checkout_url`) |

### 2. Auth + OTP (endpoint baru/berubah)

- `POST /auth/register` → **tidak mengembalikan sesi**. Balas:
  `{ challenge_id, email_masked, expires_in: 300, dev_code? }` (status 200).
  Field driver: **`student_id` (NIM), `campus`, `study_program?`, `vehicle_plate/color/model?`** — wajib `student_id`+`campus`.
- `POST /auth/login` → cek password:
  - cookie **`ans_device`** cocok (userId, 30 hari) → sesi normal `{ token, user }`
  - selain itu → **challenge OTP** (format sama dengan register)
- `POST /auth/otp/verify` `{ challenge_id, code }` → `{ token, user }`
  - kode 6 digit, TTL 300 detik, maks 5 percobaan, salah → 422 + sisa percobaan
  - sukses → set `email_verified_at` (purpose register), set cookie `ans_device` (30 hari), buat sesi
- `POST /auth/otp/resend` `{ challenge_id }` → challenge baru; throttle 60 detik (429)

### 3. Tarif zona (satu sumber kebenaran: `shared/utils/pricing.ts`)

`POST /fares/quote { pickup, destination }` →

```jsonc
{
  "zone": "green|yellow|orange|red",
  "zone_label": "Zona Hijau", "zone_color": "#16a34a",
  "distance_km": 1.92, "duration_min": 4,
  "zone_fare": 4000, "admin_fee": 500, "total": 4500,
  "currency": "IDR", "route": [...], "nearest_drivers": 5
}
```

Rumus (WAJIB sama persis di backend, **tanpa surge/biaya layanan**):

| Zona | Jarak | Tarif zona | Admin |
| --- | --- | --- | --- |
| Hijau | 0 – 2,5 km | tetap Rp4.000 | Rp500 |
| Kuning | 2,5 – 6,5 km | lurus Rp5.000@3km → Rp15.000@6km (clamp) | Rp500 |
| Jingga | 6,5 – 10,5 km | lurus Rp16.000@7km → Rp20.000@10km (clamp) | Rp1.000 |
| Merah | ≥ 10,5 km | Rp20.000 + max(0, km−11) × Rp1.500 | Rp1.000 |

`total = zone_fare + admin_fee`, pembulatan kelipatan Rp100.

### 4. Pembayaran (tanpa gateway)

- `GET /payments/qris` → `{ image_url, merchant_name, enabled, instructions[] }` — QR statis dari backend
- `POST /payments { ride_id, method: 'cash'|'qris' }` → `Payment` (tanpa `gateway`, tanpa `checkout_url`);
  cash → `unpaid`, qris → `pending`
- `POST /payments/{payment}/webhook` (atau `/payments/webhook`) body `{ reference, transaction_status }`
  → konfirmasi `settlement`/`success` → `paid`. Dipakai ulang sebagai aksi admin **"Tandai Lunas"**
- `POST /rides` menerima `payment_method: 'cash'|'qris'` saja (422 untuk selain itu)

### 5. Driver mahasiswa

`DriverProfile` bertambah:

```ts
student_id: string      // NIM
campus: string
study_program: string
verification: 'pending' | 'verified' | 'rejected'
```

- `GET /admin/stats` → field `riders` diganti **`customers`**; `pending_drivers` = jumlah profil berstatus `pending`
- `POST /admin/drivers/{driver}/verify` `{ verification }` → ubah status verifikasi (endpoint baru)
- `PATCH /admin/drivers/{driver}` menerima `student_id/campus/study_program`
- `GET /me/summary` (driver) menyertakan `verification`
- Order baru untuk driver non-`verified` → kebijakan backend (mock: tetap boleh, UI menampilkan banner)

### 6. Lain-lain

- `GET /admin/payments` baris: `customer_name` (bukan `rider_name`), tanpa kolom `gateway`
- `DriverJob`: `customer_name`, `customer_rating`, **tanpa** `surge_multiplier`
- `Ride`: **tanpa** `surge_multiplier`
- `payment_status` nilai: `unpaid | pending | paid | failed | refunded`
- Email demo/domain: `*@ansian.id` (`customer@`, `driver@`, `admin@`, `support@`, `legal@`, `bantuan@`)
- Pengaturan sistem (group `fare`) menyimpan entri zona (lihat `server/utils/mockApi/db.ts → buildSettings`)

---

## Struktur

```
app/
  assets/        # CSS global
  components/    # UI, map, ride, chat, charts, marketing, pay, driver
  composables/   # useApi, useRealtime, useToast, usePreferences
  layouts/       # app, auth, default
  middleware/    # auth.global.ts
  pages/         # customer/, driver/, admin/, verifikasi, halaman publik
  plugins/       # leaflet.client.ts
  stores/        # auth, ride, chat, driver, notification, ui (Pinia)
server/          # routes/api/v1 catch-all + utils/apiRouter.ts
  utils/mockApi/ # db, auth (OTP), rides, admin — HAPUS saat backend aktif
shared/
  types/         # kontrak tipe (AuthChallenge, FareQuote zona, DriverProfile, …)
  utils/         # geo (titik Semarang), pricing (TARIF ZONA), format
```

## License

Private — © Ansian (tim: Alif Fahri Octavianto, Wiratama Rava Rahardia, Farid Nur Cahyo, M Setya Angga Adi Prabowo)
