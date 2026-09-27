/**
 * ============================================================
 *  DOMAIN TYPES — cerminan langsung dari Laravel Eloquent
 *  Aturan kontrak dengan backend:
 *  1. Semua tanggal = string ISO-8601 (Laravel default serialize)
 *  2. Semua nilai uang = integer Rupiah TANPA titik/pemisah
 *  3. Enum = string lowercase sesuai kolom DB
 *  4. Response list dibungkus { data, links, meta } (Laravel Resource Collection)
 * ============================================================
 */

/* ---------- Enums (harus sama dengan value di Laravel) ---------- */

export const USER_ROLES = ['rider', 'driver', 'admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const USER_STATUSES = ['active', 'pending', 'suspended'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const DRIVER_STATUSES = ['offline', 'idle', 'busy'] as const
export type DriverStatus = (typeof DRIVER_STATUSES)[number]

export const VEHICLE_TYPES = ['motorcycle', 'car', 'van'] as const
export type VehicleType = (typeof VEHICLE_TYPES)[number]

export const RIDE_STATUSES = [
  'searching',
  'driver_assigned',
  'driver_arrived',
  'in_progress',
  'completed',
  'cancelled',
  'failed',
] as const
export type RideStatus = (typeof RIDE_STATUSES)[number]

export const RIDE_STATUS_LABELS: Record<RideStatus, string> = {
  searching: 'Mencari driver',
  driver_assigned: 'Driver ditugaskan',
  driver_arrived: 'Driver tiba',
  in_progress: 'Dalam perjalanan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  failed: 'Gagal',
}

export const PAYMENT_METHODS = ['cash', 'wallet', 'qris', 'midtrans', 'xendit'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  wallet: 'Dompet',
  qris: 'QRIS',
  midtrans: 'Midtrans',
  xendit: 'Xendit',
}

export const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'refunded', 'failed'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Belum Bayar',
  pending: 'Menunggu',
  paid: 'Lunas',
  refunded: 'Dikembalikan',
  failed: 'Gagal',
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Aktif',
  pending: 'Menunggu',
  suspended: 'Ditangguhkan',
}

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  offline: 'Offline',
  idle: 'Online',
  busy: 'Menjalankan Perjalanan',
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  motorcycle: 'Motor',
  car: 'Mobil',
  van: 'Van',
}

export const SERVICE_TYPES = ['instant', 'scheduled'] as const
export type ServiceType = (typeof SERVICE_TYPES)[number]

export const CANCEL_REASONS = [
  'rider_cancel',
  'driver_cancel',
  'no_driver',
  'rider_no_show',
  'driver_no_show',
  'wrong_address',
  'other',
] as const
export type CancelReason = (typeof CANCEL_REASONS)[number]

export const CHAT_MESSAGE_TYPES = ['text', 'system', 'location', 'image'] as const
export type ChatMessageType = (typeof CHAT_MESSAGE_TYPES)[number]

/* ---------- Shared ---------- */

export interface LatLng {
  lat: number
  lng: number
}

export interface Place extends LatLng {
  address: string
  place_name?: string | null
}

/** Laravel `Illuminate\Http\Resources\Json\Resource` */
export interface ApiResource<T> {
  data: T
  meta?: Record<string, unknown>
  links?: Record<string, string>
}

/** Laravel paginator response */
export interface Paginated<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

/* ---------- User ---------- */

export interface User {
  id: number
  name: string
  email: string
  phone: string
  role: UserRole
  avatar_url: string | null
  status: UserStatus
  rating: number | null
  rating_count: number
  email_verified_at: string | null
  phone_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthSession {
  token: string
  user: User
}

/* ---------- Driver ---------- */

export interface DriverProfile {
  id: number
  user_id: number
  driver_code: string
  status: DriverStatus
  vehicle_type: VehicleType
  vehicle_plate: string
  vehicle_color: string
  vehicle_model: string
  photo_url: string | null
  lat: number | null
  lng: number | null
  last_seen_at: string | null
  rating: number
  total_rides: number
  online_hours: number
  earnings_today: number
  earnings_month: number
}

export interface Driver extends DriverProfile {
  user: User
}

/* ---------- Ride ---------- */

export interface RideStatusHistory {
  id: number
  status: RideStatus
  note: string | null
  created_at: string
}

export interface RideRating {
  id: number
  reviewer_id: number
  score: number
  comment: string | null
  tags: string[]
  created_at: string
}

export interface Ride {
  id: number
  ride_code: string
  status: RideStatus
  service_type: ServiceType
  scheduled_at: string | null
  pickup: Place
  destination: Place
  pickup_note: string | null
  distance_km: number
  duration_min: number
  fare: number
  surge_multiplier: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  cancel_reason: CancelReason | null
  rider_id: number
  driver_id: number | null
  rider?: User
  driver?: Driver | null
  rating?: RideRating | null
  status_histories: RideStatusHistory[]
  started_at: string | null
  arrived_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export interface FareQuote {
  distance_km: number
  duration_min: number
  base_fare: number
  distance_fare: number
  surge_fare: number
  service_fee: number
  total: number
  currency: string
  surge_multiplier: number
  route?: LatLng[]
  nearest_drivers: number
}

export interface Payment {
  id: number
  ride_id: number
  gateway: 'midtrans' | 'xendit' | 'manual'
  method: PaymentMethod
  amount: number
  status: PaymentStatus
  reference: string
  checkout_url: string | null
  paid_at: string | null
  created_at: string
}

/* ---------- Chat ---------- */

export interface Conversation {
  id: number
  type: 'ride' | 'support'
  ride_id: number | null
  ride_code: string | null
  counterpart: User
  last_message: ChatMessage | null
  unread_count: number
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: number
  conversation_id: number
  sender_id: number
  sender_name: string
  is_mine: boolean
  body: string
  type: ChatMessageType
  attachment_url: string | null
  attachment_meta: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

/* ---------- Notification ---------- */

export interface AppNotification {
  id: number
  type: 'ride' | 'chat' | 'payment' | 'promo' | 'system'
  title: string
  body: string
  data: Record<string, unknown>
  read_at: string | null
  created_at: string
}

/* ---------- Admin ---------- */

export interface DashboardStats {
  total_rides: number
  rides_today: number
  total_users: number
  riders: number
  drivers: number
  online_drivers: number
  pending_drivers: number
  gmv_today: number
  gmv_month: number
  revenue_today: number
  revenue_month: number
  avg_fare: number
  completion_rate: number
  cancellation_rate: number
  avg_rating: number
  active_rides: number
  pending_complaints: number
  rides_change_pct: number
  gmv_change_pct: number
  users_change_pct: number
}

export interface ChartPoint {
  date: string
  label: string
  rides: number
  gmv: number
  completed: number
  cancelled: number
}

export interface TopDriver {
  id: number
  name: string
  avatar_url: string | null
  driver_code: string
  vehicle_plate: string
  total_rides: number
  rating: number
  earnings: number
}

export interface RevenueByVehicleType {
  vehicle_type: VehicleType
  label: string
  rides: number
  gmv: number
  percentage: number
}

export interface SystemSetting {
  key: string
  value: string
  group: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'text'
}

/* ---------- Driver job queue ---------- */

export interface DriverJob {
  id: number
  ride_id: number
  /** Driver yang sudah dikunci ke job ini (null = terbuka untuk semua driver) */
  driver_id: number | null
  ride_code: string
  pickup: Place
  destination: Place
  distance_km: number
  duration_min: number
  fare: number
  surge_multiplier: number
  rider_name: string
  rider_rating: number
  distance_to_pickup_km: number
  expires_in_seconds: number
  created_at: string
}

export interface DriverEarnings {
  today: number
  week: number
  month: number
  total: number
  trips_today: number
  trips_week: number
  trips_month: number
  average_fare: number
  series: ChartPoint[]
}
