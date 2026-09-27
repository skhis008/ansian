import type {
  AppNotification,
  ChartPoint,
  Conversation,
  ChatMessage,
  Driver,
  DriverJob,
  DriverProfile,
  Payment,
  Ride,
  RideStatusHistory,
  SystemSetting,
  User,
  VehicleType,
} from '#shared/types'

/**
 * Mock database in-memory.
 * WAJIB mirror dengan isi tabel Laravel (users, driver_profiles, rides,
 * ride_status_histories, conversations, messages, notifications, payments, settings).
 */

export const CENTER = { lat: -6.208763, lng: 106.8456 }

const PLACES = [
  { lat: -6.175392, lng: 106.827153, address: 'Monas, Medan Barat, Jakarta Pusat', place_name: 'Monas' },
  { lat: -6.1944, lng: 106.8229, address: 'Jl. Jend. Sudirman No.1, Jakarta Pusat', place_name: 'Grand Indonesia' },
  { lat: -6.2305, lng: 106.8003, address: 'Jl. MH Thamrin No.1, Jakarta Pusat', place_name: 'Tanah Abang' },
  { lat: -6.1447, lng: 106.8261, address: 'Jl. Kuningan No.5, Jakarta Selatan', place_name: 'Kuningan' },
  { lat: -6.2615, lng: 106.8106, address: 'Jl. Pangeran Antasari No.36, Jakarta Selatan', place_name: 'Kemang Village' },
  { lat: -6.2, lng: 106.816666, address: 'Jl. Jenderal Sudirman Kav. 52, Jakarta Pusat', place_name: 'Sudirman' },
  { lat: -6.1256, lng: 106.7298, address: 'Jl. Kasih Kemal No.3, Jakarta Barat', place_name: 'Kasih Kemal' },
  { lat: -6.2426, lng: 106.8004, address: 'Jl. Sabang, Jakarta Selatan', place_name: 'Sabang' },
  { lat: -6.2197, lng: 106.8195, address: 'Jl. Cikini Raya No.9, Jakarta Pusat', place_name: 'Cikini' },
  { lat: -6.1497, lng: 106.8261, address: 'Jl. Tebet Barat Dalam No.88, Jakarta Selatan', place_name: 'Tebet' },
]

const FIRST = ['Ahmad', 'Budi', 'Candra', 'Dewi', 'Eko', 'Fajar', 'Galih', 'Hendra', 'Indra', 'Joko', 'Kevin', 'Lukman', 'Miko', 'Nanda', 'Oscar', 'Putra', 'Rizky', 'Satria', 'Taufik', 'Umar']
const LAST = ['Saputra', 'Wijaya', 'Ramadhan', 'Pratama', 'Nugroho', 'Kusuma', 'Hidayat', 'Maulana', 'Setiawan', 'Firmansyah']

export function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

export function makeName(i: number): string {
  return `${FIRST[i % FIRST.length]} ${LAST[(i * 3 + 1) % LAST.length]}`
}

function hoursAgo(h: number, m = 0): string {
  return new Date(Date.now() - h * 3_600_000 - m * 60_000).toISOString()
}
function hoursAhead(h: number): string {
  return new Date(Date.now() + h * 3_600_000).toISOString()
}

const AVATAR_SVG = (name: string, hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="hsl(${hue} 70% 92%)"/><text x="48" y="60" font-family="sans-serif" font-size="34" font-weight="600" fill="hsl(${hue} 60% 35%)" text-anchor="middle">${name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')}</text></svg>`,
  )}`

/* ---------------- USERS ---------------- */

function buildUsers(): User[] {
  const users: User[] = []
  const now = new Date().toISOString()

  users.push({
    id: 1,
    name: 'Rani Kusuma',
    email: 'rider@antarjemput.id',
    phone: '081234567890',
    role: 'rider',
    avatar_url: AVATAR_SVG('Rani Kusuma', 220),
    status: 'active',
    rating: null,
    rating_count: 0,
    email_verified_at: now,
    phone_verified_at: now,
    created_at: hoursAgo(720),
    updated_at: now,
  })

  users.push({
    id: 2,
    name: 'Dimas Anggara',
    email: 'driver@antarjemput.id',
    phone: '081298765432',
    role: 'driver',
    avatar_url: AVATAR_SVG('Dimas Anggara', 160),
    status: 'active',
    rating: 4.87,
    rating_count: 1243,
    email_verified_at: now,
    phone_verified_at: now,
    created_at: hoursAgo(1400),
    updated_at: hoursAgo(0, 2),
  })

  users.push({
    id: 3,
    name: 'Admin AntarJemput',
    email: 'admin@antarjemput.id',
    phone: '08111222333',
    role: 'admin',
    avatar_url: AVATAR_SVG('Admin AntarJemput', 265),
    status: 'active',
    rating: null,
    rating_count: 0,
    email_verified_at: now,
    phone_verified_at: now,
    created_at: hoursAgo(3000),
    updated_at: hoursAgo(24),
  })

  for (let i = 0; i < 46; i++) {
    const isDriver = i < 22
    const id = 100 + i
    const name = makeName(i + 4)
    users.push({
      id,
      name,
      email: `${isDriver ? 'driver' : 'rider'}${id}@antarjemput.id`,
      phone: `0812${String(1000000 + i * 137).slice(0, 8)}`,
      role: isDriver ? 'driver' : 'rider',
      avatar_url: AVATAR_SVG(name, (i * 37) % 360),
      status: i % 17 === 0 ? 'suspended' : i % 11 === 0 ? 'pending' : 'active',
      rating: isDriver ? Number((4.5 + ((i * 13) % 50) / 100).toFixed(2)) : null,
      rating_count: isDriver ? 40 + i * 11 : 0,
      email_verified_at: i % 7 === 0 ? null : hoursAgo(600 - i * 6),
      phone_verified_at: hoursAgo(600 - i * 6),
      created_at: hoursAgo(30 * (i + 1)),
      updated_at: hoursAgo(i * 3),
    })
  }
  return users
}

/* ---------------- DRIVERS ---------------- */

const VEHICLES: { type: VehicleType; models: string[]; colors: string[] }[] = [
  { type: 'motorcycle', models: ['Honda Beat', 'Yamaha Mio', 'Honda Vario 160', 'Suzuki Smash'], colors: ['Hitam', 'Merah', 'Biru', 'Putih'] },
  { type: 'motorcycle', models: ['Yamaha NMAX', 'Honda PCX', 'Scoopy Prestige'], colors: ['Hitam', 'Cokelat', 'Abu-abu'] },
  { type: 'car', models: ['Toyota Avanza', 'Daihatsu Xenia', 'Mitsubishi Xpander'], colors: ['Silver', 'Putih', 'Hitam'] },
  { type: 'van', models: ['Toyota Hiace', 'Mitsubishi L300'], colors: ['Putih', 'Silver'] },
]

function buildDriverProfiles(users: User[]): DriverProfile[] {
  const drivers: DriverProfile[] = []
  const driverUsers = users.filter(u => u.role === 'driver')

  driverUsers.forEach((u, i) => {
    const spec = VEHICLES[i % VEHICLES.length]!
    const plate = `${['B', 'B', 'F', 'D'][i % 4]} ${String(1000 + i * 37).slice(0, 4)} ${['ABC', 'QWE', 'ZXC', 'KLM'][i % 4]}`
    const status = i === 0 ? 'busy' : i < 14 ? 'idle' : i < 18 ? 'busy' : 'offline'
    const p = PLACES[(i * 5) % PLACES.length]!
    drivers.push({
      id: i + 1,
      user_id: u.id,
      driver_code: `DRV-${String(1001 + i)}`,
      status,
      vehicle_type: spec.type,
      vehicle_plate: plate,
      vehicle_color: spec.colors[i % spec.colors.length]!,
      vehicle_model: spec.models[i % spec.models.length]!,
      photo_url: null,
      lat: p.lat + ((i % 7) - 3) * 0.004,
      lng: p.lng + ((i % 5) - 2) * 0.004,
      last_seen_at: status === 'offline' ? hoursAgo(6 + i) : hoursAgo(0, i),
      rating: Number((4.5 + ((i * 13) % 50) / 100).toFixed(2)),
      total_rides: 60 + i * 27,
      online_hours: Math.round(400 + i * 31),
      earnings_today: i < 14 ? 180_000 + i * 21_500 : 0,
      earnings_month: 3_200_000 + i * 415_000,
    })
  })
  return drivers
}

/* ---------------- RIDES ---------------- */

const STATUS_FLOW: Ride['status'][] = ['searching', 'driver_assigned', 'driver_arrived', 'in_progress', 'completed']

function buildRides(users: User[], drivers: DriverProfile[]): Ride[] {
  const rides: Ride[] = []
  const riders = users.filter(u => u.role === 'rider')
  const rnd = seeded(42)
  const ACTIVE: Ride['status'][] = ['searching', 'driver_assigned', 'driver_arrived', 'in_progress']
  /* Satu penumpang hanya boleh punya satu perjalanan aktif. */
  const activeRiderIds = new Set<number>()

  for (let i = 0; i < 64; i++) {
    const pickup = PLACES[i % PLACES.length]!
    const dest = PLACES[(i * 3 + 4) % PLACES.length]!
    const distance = Number((1.2 + rnd() * 18).toFixed(1))
    const duration = Math.round((distance / 24) * 60 + 2)
    const surge = i % 9 === 0 ? 1.4 : i % 5 === 0 ? 1.2 : 1
    const fare = Math.max(8000, Math.round((5000 + distance * 2500 + duration * 150) * surge + (5000 + distance * 2500 + duration * 150) * surge * 0.08))

    let status: Ride['status']
    if (i === 0) status = 'searching'
    else if (i === 1) status = 'driver_assigned'
    else if (i === 2) status = 'driver_arrived'
    else if (i === 3) status = 'in_progress'
    else if (i % 13 === 0) status = 'cancelled'
    else if (i % 17 === 0) status = 'failed'
    else status = 'completed'

    const createdHoursAgo = i === 0 ? 0.02 : 0.2 + i * 3.4
    const createdAt = hoursAgo(createdHoursAgo)
    /* Demo: driver pertama menerima perjalanan assigned, passenger pertama yang searching. */
    const driver = status === 'searching' ? null : drivers[status === 'driver_assigned' ? 0 : i % drivers.length]!
    const isActive = ACTIVE.includes(status)
    let rider = riders[i % riders.length]!
    if (isActive) {
      const free = riders.find(r => !activeRiderIds.has(r.id))
      if (free) rider = free
      activeRiderIds.add(rider.id)
    }
    const completed = status === 'completed'

    const histories: RideStatusHistory[] = [
      { id: i * 10 + 1, status: 'searching', note: null, created_at: createdAt },
    ]
    const step = STATUS_FLOW.indexOf(status)
    const flowTimes = [0.05, 0.2, 0.3, 0.5]
    for (let s = 1; s <= step; s++) {
      histories.push({
        id: i * 10 + 1 + s,
        status: STATUS_FLOW[s]!,
        note: null,
        created_at: hoursAgo(Math.max(0.01, createdHoursAgo - flowTimes[s - 1]!)),
      })
    }
    if (status === 'cancelled' || status === 'failed') {
      histories.push({
        id: i * 10 + 9,
        status,
        note: status === 'cancelled' ? 'Dibatalkan oleh penumpang' : 'Tidak ada driver yang menerima',
        created_at: hoursAgo(Math.max(0.01, createdHoursAgo - 0.4)),
      })
    }

    rides.push({
      id: 1000 + i,
      ride_code: `AJ-${String(2609000 + i)}`,
      status,
      service_type: i % 7 === 0 ? 'scheduled' : 'instant',
      scheduled_at: i % 7 === 0 ? hoursAhead(2 + i) : null,
      pickup: { ...pickup },
      destination: { ...dest },
      pickup_note: i % 4 === 0 ? 'Pintu belakang, please hubungi saat tiba' : null,
      distance_km: distance,
      duration_min: duration,
      fare,
      surge_multiplier: surge,
      payment_method: (['cash', 'qris', 'midtrans', 'wallet', 'xendit'] as const)[i % 5]!,
      payment_status: completed ? 'paid' : status === 'cancelled' ? 'refunded' : 'unpaid',
      cancel_reason: status === 'cancelled' ? 'rider_cancel' : status === 'failed' ? 'no_driver' : null,
      rider_id: rider.id,
      driver_id: driver?.id ?? null,
      status_histories: histories,
      started_at: step >= 3 ? hoursAgo(Math.max(0.01, createdHoursAgo - 0.5)) : null,
      arrived_at: step >= 2 ? hoursAgo(Math.max(0.01, createdHoursAgo - 0.3)) : null,
      completed_at: completed ? hoursAgo(Math.max(0.01, createdHoursAgo - 0.05)) : null,
      cancelled_at: status === 'cancelled' || status === 'failed' ? hoursAgo(Math.max(0.01, createdHoursAgo - 0.4)) : null,
      created_at: createdAt,
      updated_at: histories[histories.length - 1]!.created_at,
    })
  }
  return rides
}

/* ---------------- CHAT ---------------- */

function buildConversations(users: User[], rides: Ride[]): { convs: Conversation[]; msgs: ChatMessage[] } {
  const rnd = seeded(7)
  const drivers = users.filter(u => u.role === 'driver')
  const convs: Conversation[] = []
  const msgs: ChatMessage[] = []
  let msgId = 1

  for (let i = 0; i < 6; i++) {
    const counterpart = drivers[i % drivers.length]!
    const ride = rides[i]!
    const seedMessages = [
      { body: 'Halo Pak/Mbu, saya Dimas. Mohon tunggu sebentar ya, saya menuju lokasi penjemputan.', mine: false },
      { body: 'Baik, saya sudah siap di depan gerbang.', mine: true },
      { body: 'Siap, 3 menit lagi sampai. Motor saya Yamaha NMX, plat B 1234 KLM.', mine: false },
      { body: 'Oke, noted. Terima kasih 🙏', mine: true },
      { body: 'Sudah saya sampai lokasi, mari naik ya.', mine: false },
    ]
    const created = msgs
    seedMessages.forEach((m, k) => {
      created.push({
        id: msgId++,
        conversation_id: i + 1,
        sender_id: m.mine ? 1 : counterpart.id,
        sender_name: m.mine ? 'Rani Kusuma' : counterpart.name,
        is_mine: m.mine,
        body: m.body,
        type: 'text',
        attachment_url: null,
        attachment_meta: null,
        read_at: hoursAgo(1),
        created_at: hoursAgo(Math.max(0.05, 2 - k * 0.4 - i * 0.1)),
      })
    })
    const last = created[created.length - 1]!
    convs.push({
      id: i + 1,
      type: 'ride',
      ride_id: ride.id,
      ride_code: ride.ride_code,
      counterpart,
      last_message: { ...last, is_mine: last.sender_id === 1 },
      unread_count: i === 0 ? 2 : 0,
      created_at: hoursAgo(3),
      updated_at: last.created_at,
    })
  }

  convs.push({
    id: 7,
    type: 'support',
    ride_id: null,
    ride_code: null,
    counterpart: {
      id: 3,
      name: 'Bantuan AntarJemput',
      email: 'support@antarjemput.id',
      phone: '1500450',
      role: 'admin',
      avatar_url: null,
      status: 'active',
      rating: null,
      rating_count: 0,
      email_verified_at: null,
      phone_verified_at: null,
      created_at: hoursAgo(3),
      updated_at: hoursAgo(3),
    },
    last_message: {
      id: msgId++,
      conversation_id: 7,
      sender_id: 3,
      sender_name: 'Bantuan AntarJemput',
      is_mine: true,
      body: 'Halo! Ada yang bisa kami bantu?',
      type: 'text',
      attachment_url: null,
      attachment_meta: null,
      read_at: hoursAgo(1),
      created_at: hoursAgo(3),
    },
    unread_count: 0,
    created_at: hoursAgo(3),
    updated_at: hoursAgo(3),
  })
  msgs.push(convs[convs.length - 1]!.last_message as ChatMessage)
  msgs.sort((a, b) => a.created_at.localeCompare(b.created_at))

  return { convs, msgs }
}

/* ---------------- NOTIFICATIONS ---------------- */

function buildNotifications(rides: Ride[]): AppNotification[] {
  const active = rides.find(r => r.status === 'in_progress')!
  return [
    {
      id: 1,
      type: 'ride',
      title: 'Driver sedang menuju lokasi',
      body: `${'Dimas Anggara'} akan tiba dalam 4 menit. Plat B 1234 KLM.`,
      data: { ride_id: active.id, ride_code: active.ride_code },
      read_at: null,
      created_at: hoursAgo(0.1),
    },
    {
      id: 2,
      type: 'promo',
      title: 'Diskon 30% untuk 3 perjalanan',
      body: 'Gunakan kode AJHEMAT30 sebelum 30 September.',
      data: { code: 'AJHEMAT30' },
      read_at: null,
      created_at: hoursAgo(2),
    },
    {
      id: 3,
      type: 'payment',
      title: 'Pembayaran berhasil',
      body: 'Pembayaran Rp18.500 via QRIS telah dikonfirmasi.',
      data: { ride_id: rides[5]!.id },
      read_at: hoursAgo(5),
      created_at: hoursAgo(6),
    },
    {
      id: 4,
      type: 'system',
      title: 'Fitur baru: kirim barang',
      body: 'Kini kamu bisa kirim paket dengan layanan antar Express.',
      data: {},
      read_at: hoursAgo(20),
      created_at: hoursAgo(22),
    },
  ]
}

/* ---------------- SETTINGS ---------------- */

function buildSettings(): SystemSetting[] {
  return [
    { key: 'app.name', value: 'AntarJemput', group: 'general', label: 'Nama Aplikasi', type: 'string' },
    { key: 'fare.base', value: '5000', group: 'fare', label: 'Tarif dasar (Rp)', type: 'number' },
    { key: 'fare.per_km', value: '2500', group: 'fare', label: 'Tarif per km (Rp)', type: 'number' },
    { key: 'fare.per_min', value: '150', group: 'fare', label: 'Tarif per menit (Rp)', type: 'number' },
    { key: 'fare.min', value: '8000', group: 'fare', label: 'Tarif minimum (Rp)', type: 'number' },
    { key: 'fare.service_fee', value: '0.08', group: 'fare', label: 'Biaya layanan (%)', type: 'number' },
    { key: 'ride.search_radius_km', value: '5', group: 'ride', label: 'Radius pencarian driver (km)', type: 'number' },
    { key: 'ride.cancel_free_min', value: '2', group: 'ride', label: 'Gratis pembatalan (menit)', type: 'number' },
    { key: 'driver.max_document', value: '4.7', group: 'driver', label: 'Rating minimum driver', type: 'number' },
    { key: 'payment.midtrans.enabled', value: 'true', group: 'payment', label: 'Aktifkan Midtrans', type: 'boolean' },
    { key: 'payment.xendit.enabled', value: 'true', group: 'payment', label: 'Aktifkan Xendit', type: 'boolean' },
    { key: 'chat.auto_reply', value: 'true', group: 'chat', label: 'Balasan otomatis CS', type: 'boolean' },
  ]
}

/* ---------------- DB ---------------- */

const users = buildUsers()
const drivers = buildDriverProfiles(users)
const rides = buildRides(users, drivers)
const { convs: conversations, msgs: messages } = buildConversations(users, rides)
const notifications = buildNotifications(rides)
const settings = buildSettings()
const jobs: DriverJob[] = []

export const db = {
  users,
  drivers,
  rides,
  conversations,
  messages,
  notifications,
  settings,
  jobs,
  counters: { job: 1, message: 1000, notification: 100 },
  /* Password akun mock, key = email. Hanya untuk demo frontend, bukan kontrak backend. */
  passwords: new Map<string, string>(users.map(u => [u.email, u.role === 'admin' ? 'admin123' : 'password'])),
}

export const nowIso = () => new Date().toISOString()

export function userById(id: number): User | undefined {
  return db.users.find(u => u.id === id)
}

export function driverById(id: number): Driver | undefined {
  const profile = db.drivers.find(d => d.id === id)
  if (!profile) return undefined
  return { ...profile, user: userById(profile.user_id)! }
}

export function driverByUserId(userId: number): Driver | undefined {
  const profile = db.drivers.find(d => d.user_id === userId)
  if (!profile) return undefined
  return { ...profile, user: userById(profile.user_id)! }
}

export function rideById(id: number): Ride | undefined {
  return db.rides.find(r => r.id === id)
}

export function rideByCode(code: string): Ride | undefined {
  return db.rides.find(r => r.ride_code === code)
}

export function activeRideForUser(userId: number, role: 'rider' | 'driver'): Ride | undefined {
  return db.rides.find(r => {
    if (role === 'rider') return r.rider_id === userId && ['searching', 'driver_assigned', 'driver_arrived', 'in_progress'].includes(r.status)
    if (r.driver_id === null) return false
    const profile = db.drivers.find(d => d.id === r.driver_id)
    return profile?.user_id === userId && ['driver_assigned', 'driver_arrived', 'in_progress'].includes(r.status)
  })
}

export function rideWithRelations(ride: Ride): Ride {
  const rider = userById(ride.rider_id)
  const driver = ride.driver_id ? driverById(ride.driver_id) : null
  const rating = ride.rating ?? (ride.status === 'completed' && ride.id % 3 === 0
    ? {
        id: ride.id * 10,
        reviewer_id: ride.rider_id,
        score: 5,
        comment: 'Driver ramah dan cepat. Pasti langganan!',
        tags: ['ramah', 'tepat waktu'],
        created_at: ride.completed_at ?? ride.updated_at,
      }
    : null)
  return { ...ride, rider, driver, rating }
}

export function paymentsForRide(rideId: number): Payment | undefined {
  const ride = rideById(rideId)
  if (!ride) return undefined
  return {
    id: rideId * 7,
    ride_id: rideId,
    gateway: ride.payment_method === 'xendit' ? 'xendit' : ride.payment_method === 'midtrans' ? 'midtrans' : 'manual',
    method: ride.payment_method,
    amount: ride.fare,
    status: ride.payment_status,
    reference: `INV-${ride.ride_code}-${(rideId * 7919) % 100000}`,
    checkout_url: ride.payment_method === 'cash' || ride.payment_method === 'wallet' ? null : `https://checkout.example/${ride.ride_code}`,
    paid_at: ride.payment_status === 'paid' ? (ride.completed_at ?? ride.updated_at) : null,
    created_at: ride.created_at,
  }
}

export function buildChartSeries(days = 14): ChartPoint[] {
  const rnd = seeded(99)
  const series: ChartPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    const rides = 120 + Math.round(rnd() * 180)
    const cancelled = Math.round(rides * (0.04 + rnd() * 0.06))
    const completed = rides - cancelled
    series.push({
      date: d.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(d),
      rides,
      completed,
      cancelled,
      gmv: completed * (16_000 + Math.round(rnd() * 9_000)),
    })
  }
  return series
}
