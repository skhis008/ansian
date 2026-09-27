# Ajem-UDINUS-FE

Frontend **AntarJemput** — aplikasi ride hailing (Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS 4).

> **Repo ini dipakai bareng, bukan sendirian.**
> Kalau kamu anggota tim: baca **[Kolaborasi](#kolaborasi--untuk-anggota-tim)** dulu,
> terutama bagian [Sebelum Ngoding](#sebelum-ngoding-wajib), sebelum mulai ngoding.

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
| Backend | Laravel (`CUKLIZ/Ajem-UDINUS-BE`) |

## Menjalankan

Prasyarat: **Node.js >= 20.19.0** (lihat `package.json` → `engines`).

```bash
npm install     # atau `npm ci` kalau ikut lockfile persis
npm run dev
```

Server berjalan di http://localhost:3000 — **dari device lain / HP** perlu ekspos network:

```bash
npm run dev -- --host
```

Secara default `npm run dev` hanya bind ke `localhost` (IPv6), jadi `127.0.0.1:3000` **tidak** bisa diakses. Selalu pakai `--host` kalau mau dibuka dari HP atau diproxy Apache.

### Login demo

Default app memakai mock API bawaan, jadi bisa langsung login tanpa backend:

| Role | Email | Password |
| --- | --- | --- |
| Rider | `rider@antarjemput.id` | `password` |
| Driver | `driver@antarjemput.id` | `password` |
| Admin | `admin@antarjemput.id` | `admin123` |

---

# Kolaborasi — Untuk Anggota Tim

## Sebelum Ngoding (Wajib)

Lima aturan ini. Kalau ada yang dilewati, ujung-ujungnya konflik dan capek.

### 1. Selalu tarik perubahan terbaru dulu

```bash
git pull                 # kalau sudah di main
git pull --rebase        # kalau sedang di branch sendiri
```

Jangan mulai coding dari versi kode yang sudah berubah oleh orang lain. Kalau sedang di branch kamu, `git pull --rebase` supaya commit kamu menumpuk di atas kode orang lain dan diff-nya enak dibaca.

### 2. Never push langsung ke `main`

`main` itu versi yang dipakai bersama. Semua perubahan lewat **branch + Pull Request**, biar orang lain bisa review dulu.

```bash
git switch -c feature/nama-fitur      # atau fix/nama-bug, docs/nama-dok
```

### 3. Jangan commit hasil build & dependency

Sudah otomatis ke-ignore lewat `.gitignore` (`node_modules`, `.output`, `.nuxt`, `.env*`).
Tapi sebelum commit, **cek dulu**:

```bash
git status
```

Kalau muncul `node_modules/` atau `.output/` di daftar — itu `.gitignore` ketimpa. Jangan dipaksakan commit.

### 4. Commit kecil & satu tujuan

Satu commit = satu alasan. Jangan campur refactor, fixes, dan fitur dalam satu commit. PR yang 5 commit lebih gampang di-review daripada 1 commit 500 baris.

### 5. Jangan edit kontrak API diam-diam

`server/utils/apiRouter.ts` itu **cermin 1:1 dari `routes/api.php` Laravel**. Path dan method harus sama persis dengan backend, supaya frontend tidak perlu diubah saat backend aktif. Kalau kamu perlu endpoint baru, bilang dulu — jangan bikin path sendiri, karena nanti tidak akan match dengan Laravel.

---

## Alur Kerja Harian

```bash
# 1. Tarik perubahan terbaru
git pull --rebase

# 2. Buat branch
git switch -c feature/chat-realtime

# 3. Ngoding...

# 4. Pastikan bersih & rapi
git status
git diff                    # baca diffmu sendiri sebelum push

# 5. Commit
git add app/components/chat/ChatWindow.vue
git commit -m "feat(chat): tampilkan indikator unread di daftar chat"

# 6. Push
git push -u origin feature/chat-realtime

# 7. Buka Pull Request di GitHub, minta review ke teammate
```

### Penamaan Branch

| Prefix | Dipakai untuk |
| --- | --- |
| `feature/` | fitur baru |
| `fix/` | perbaikan bug |
| `refactor/` | bongkar-pasang kode tanpa mengubah fungsi |
| `docs/` | dokumentasi |
| `chore/` | tooling, config, dependency |

Contoh: `feature/rider-pagination`, `fix/leaflet-marker-abnormal`, `docs/tambah-tabel-api`.

### Setelah PR di-merge

```bash
git switch main
git pull
git branch -d feature/chat-realtime   # hapus branch yang sudah selesai
```

---

## Cara Push ke GitHub

### A. First time — clone repo

```bash
git clone https://github.com/CUKLIZ/Ajem-UDINUS-FE.git
cd Ajem-UDINUS-FE
npm ci
npm run dev
```

### B. Login GitHub (sekali saja)

Repo ini **private**, jadi butuh autentikasi. Dua cara:

**Cara 1 — pakai GitHub CLI (paling gampang, recommended)**

```bash
gh auth login                                   # pilih GitHub.com → HTTPS → Login with browser
gh auth setup-git                               # bikin git otomatis pakai token gh
```

Langkah `gh auth setup-git` **wajib**. Tanpa itu, `git push` bakal berhenti minta password dan gagal — karena GitHub sudah tidak menerima password sebagai autentikasi.

Cek sudah benar:

```bash
gh auth status          # harus muncul ✓ Logged in
git config --get credential.helper    # harus ada isinya, kalau kosong berarti belum setup
```

**Cara 2 — Personal Access Token (kalau tidak pakai `gh`)**

Buat token di GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained token**, beri akses repo `Ajem-UDINUS-FE` (Contents: Read & write). Lalu saat `git push` ditanya password, **paste token itu** di kolom password (username tetap `CUKLIZ`).

### C. Push

```bash
# Push pertama kali di branch baru (set tracking)
git push -u origin feature/nama-fitur

# Push berikutnya di branch yang sama
git push
```

Kalau `git push` ditanya **username/password** padahal `gh auth setup-git` sudah dijalankan, jalankan `gh auth status` — kemungkinan besar token-nya kedaluwarsa, `gh auth refresh` untuk perbarui.

### D. Kalau `credential.helper` belum di-set

Gejala: `git push` berhenti dan minta `Username for 'https://github.com'` / `Password`, padahal kamu nggak pernah mau input password. Fix:

```bash
gh auth setup-git
```

Atau, tanpa mengubah config global — push dengan helper gh secara inline:

```bash
git -c credential.helper= -c credential.helper='!gh auth git-credential' push
```

---

## Aturan Commit

Pakai **Conventional Commits** — facilitates buat review dan generate changelog:

```
<type>(<scope>): <deskripsi singkat>
```

| Type | Untuk |
| --- | --- |
| `feat` | fitur baru |
| `fix` | perbaikan bug |
| `refactor` | ubah struktur, bukan perilaku |
| `style` | format/whitespace (tanpa perubahan logika) |
| `docs` | dokumentasi |
| `test` | nambah/ubah test |
| `chore` | tooling, config, dependency |
| `perf` | optimasi performa |

Scope yang umum dipakai: `chat`, `ride`, `driver`, `auth`, `admin`, `map`, `pay`, `api`, `ui`.

Contoh:

```
feat(ride): tambah pagination di riwayat perjalanan rider
fix(auth): session hilang setelah hard refresh
refactor(ui): pecah RideCard jadi komponen kecil
docs(api): lengkapi tabel endpoint
chore(deps): bump nuxt ke 4.5.2
```

### Kalau ada Konflik Merge

Jangan panik, dan **jangan** langsung `git reset --hard` (itu membuang kerjaanmu).

```bash
git pull --rebase origin main
# muncul: CONFLICT (content): Merge conflict in ...

# 1. Buka file yang konflik, perbaiki tanda <<<<<<< ======== >>>>>>>
# 2. Tandai sudah beres
git add app/components/...
# 3. Lanjutkan rebase
git rebase --continue
# 4. Kalau mau batal
git rebase --abort
```

Kalau **`npm install` / `npm run dev` tiba-tiba error setelah pull**, hampir selalu karena lockfile berubah. Jalankan `npm install` ulang.

---

## Build

```bash
npm run build      # build produksi  -> .output/
npm run preview    # preview hasil build
npm run generate   # static generate (caveat: lihat di bawah)
```
### Catatan penting soal production

App ini **bukan situs statis** — ada SSR (`routeRules` → `ssr: true` untuk `/rider/**`, `/driver/**`, `/admin/**`) dan ada Nitro server routes (`server/routes/api/v1/`). Jadi:

- **Jangan** menaruh hasil build langsung di document root Apache (`/srv/httpd`) dan berharap route-nya jalan. Yang kepake cuma aset statis, SSR dan API-nya mati.
- `.output/` **harus dijalankan pakai Node**:

  ```bash
  npm run build
  node .output/server/index.mjs        # default port 3000
  # atau: PORT=8080 NITRO_HOST=127.0.0.1 node .output/server/index.mjs
  ```

  Untuk production, jalankan pakai **pm2** atau **systemd** supaya auto-restart, lalu set **Apache sebagai reverse proxy** ke `127.0.0.1:3000`. Itupun bukan "menaruh file di `/srv/httpd`" — httpd cuma proxy, file-nya tetap milik proses Node.
- `npm run generate` (fully static) **tidak disarankan** untuk app ini: halaman `/rider`, `/driver`, `/admin` jadi hollow shell tanpa SSR, dan mock API mati. Kalau memang harus, wajib `NUXT_PUBLIC_USE_MOCK=false` + arahkan ke backend Laravel.

---

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

**`.env` jangan pernah di-commit** — sudah ke-ignore, tapi tetap hati-hati saat `git add`.

---

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

### Routing Halaman

| Prefix | Layout | Akses |
| --- | --- | --- |
| `/`, `/tentang`, `/faq`, `/terms`, `/kebijakan-privasi` | `default` | Publik, di-prerender |
| `/login`, `/register` | `auth` | Publik, di-prerender |
| `/rider/**` | `app` | Rider |
| `/driver/**` | `app` | Driver |
| `/admin/**` | `app` | Admin |

Proteksi akses lewat `app/middleware/auth.global.ts` — jangan bypass dengan menonaktifkan middleware.

### Kontrak API

Semua panggilan frontend lewat `/api/v1/...`, yang **sama persis dengan path + method di `routes/api.php` Laravel**. Kalau backend aktif: set `NUXT_PUBLIC_USE_MOCK=false`, lalu file mock (`server/routes/`, `server/utils/mockApi/`) boleh dihapus **tanpa mengubah kode frontend**.

Endpoint yang ter-cover (semua di `server/utils/apiRouter.ts`):

| Group | Endpoint |
| --- | --- |
| Auth | `register`, `login`, `logout`, `me`, `profile`, `password`, `sessions` |
| Me | `me/summary`, `me/activity` |
| Rides | `rides`, `rides/:id`, `rides/:id/route`, `rides/:id/cancel`, `rides/:id/rate`, `rides/:id/timeline`, `rides/active` |
| Fare | `fares/quote` |
| Driver | `drivers`, `drivers/nearby`, `drivers/me`, `drivers/me/status`, `drivers/me/location`, `drivers/me/earnings`, `drivers/jobs`, `drivers/jobs/:ride/accept`, `drivers/jobs/:ride/reject`, `drivers/rides/:ride/arrive|start|complete` |
| Chat | `conversations`, `conversations/:id`, `messages/:conversation`, `conversations/:id/messages`, `conversations/:id/read` |
| Notification | `notifications`, `notifications/read-all`, `notifications/:id/read` |
| Payment | `payments`, `payments/webhook` |
| Admin | `stats`, `activity`, `charts/*`, `top-drivers`, `users`, `rides`, `payments`, `reports`, `settings` |

Tambah endpoint baru? Update di **dua tempat**: `server/utils/apiRouter.ts` (mock) dan `Ajem-UDINUS-BE/routes/api.php` (Laravel). Kalau cuma salah satu, frontend bakal Proxy to/backend tidak sinkron.

---

## Integrasi Backend

Secara default aplikasi memakai mock API bawaan di `server/utils/mockApi` agar dapat dijalankan mandiri. Untuk terhubung ke Laravel backend, set `NUXT_PUBLIC_USE_MOCK=false` dan `NUXT_PUBLIC_API_BASE` menuju URL backend Anda (`CUKLIZ/Ajem-UDINUS-BE`).

---

## Kualitas Kode

```bash
npm run typecheck   # TypeScript strict — WAJIB lolos, exit 0
npm run lint        # ESLint (flat config via @nuxt/eslint)
npm run lint:fix    # ESLint + autofix
```

> **Status saat ini: `npm run lint` belum bersih.** Baseline: **23 error + 50 warning**.
> Jadi `lint` **belum bisa dipakai sebagai gerbang** (exit 1) — perlu PR terpisah
> sampai hijau. `npm run typecheck` **sudah hijau** (0 error).

Rule yang paling banyak violation:

| Rule | Jumlah | Catatan |
| --- | --- | --- |
| `vue/require-default-prop` | 25 | props optional butuh `default` |
| `@typescript-eslint/no-unused-vars` | 20 | impor/variabel tak terpakai |
| `@typescript-eslint/no-explicit-any` | 20 | sudah di-set `warn` |
| `vue/first-attribute-linebreak` | 3 | formatting |
| `import/no-duplicates` | 2 | impor `h3` berulang |
| `vue/no-required-prop-with-default` | 2 | |
| `vue/no-ref-as-operand` | 1 | lihat catatan di bawah |

### ⚠️ Jangan asal `lint --fix` untuk `no-unused-vars`

Ada minimal satu kasus di mana "variabel unused" itu **memang harus tetap ada** —
memanggilnya efek sampingnya yang penting:

```ts
// server/utils/mockApi/rides.ts — createConversation
const user = authUser(event)   // ❌ JANGAN dihapus barisnya
```

`authUser()` **throw 401** kalau tidak ada session (lihat `server/utils/api.ts`). Baris
itu adalah **auth guard** untuk endpoint tersebut. Assignment-nya yang tidak dipakai, bukan
panggilannya. Kalau dihapus, endpoint `POST /api/v1/conversations` jadi bisa diakses
tanpa login. Perbaikannya hanya buang assignment-nya:

```ts
authUser(event)   // ✅ guard tetap jalan, tanpa variabel sia-sia
```

---

## Troubleshooting

### `ERR_MODULE_NOT_FOUND: .../node_modules/dist/index.mjs`

Semua binary di `node_modules/.bin` rusak. Biasanya karena project **dipindah** dengan `cp -r` — symlink ikut ter-dereference jadi file biasa, dan path relatif di dalam file binary jadi nyasar.

```bash
npm rebuild
```

Sebagai pengingat: kalau memang harus menyalin project, pakai `cp -a` / `rsync -a`, atau `mv`. Jangan pernah `cp -r` folder yang berisi `node_modules`.

### `npm run dev` tidak bisa diakses dari HP

Default bind ke `localhost` saja. Pakai `npm run dev -- --host`.

### `npm run typecheck` keluar stack trace padahal sukses

Kalau muncul `(Vue) Resolve plugin path failed: ... ERR_PACKAGE_PATH_NOT_EXPORTED`, **itu bukan error**. Cuma plugin bahasa Vue yang gagal resolve subpath `vue-router/volar/...` yang tidak di-export di versi `vue-router` yang terpasang. Exit code tetap `0` dan jumlah `error TS` = 0. Abaikan saja.

### `npm install` / `npm run dev` error setelah `git pull`

Hampir selalu karena `package-lock.json` berubah. Jalankan `npm install` ulang, lalu `npm run dev`.

---

## License

Private — © Ajem-UDINUS. Repo ini private; jangan dibagikan ke luar tim tanpa izin.
