import { defineStore } from 'pinia'
import type { AuthChallenge, AuthSession, Driver, User } from '#shared/types'
import { ApiError, http } from '~/composables/useApi'

interface AuthState {
  user: User | null
  driver: Driver | null
  token: string | null
  initialized: boolean
  loading: boolean
  /** Tantangan OTP aktif (login/registrasi) — diproses di halaman /verifikasi */
  challenge: AuthChallenge | null
  challengePurpose: 'login' | 'register' | null
}

const ROLE_HOME: Record<User['role'], string> = {
  customer: '/customer',
  driver: '/driver',
  admin: '/admin',
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    driver: null,
    token: null,
    initialized: false,
    loading: false,
    challenge: null,
    challengePurpose: null,
  }),

  getters: {
    isAuthenticated: state => Boolean(state.user),
    role: state => state.user?.role ?? null,
    isCustomer: state => state.user?.role === 'customer',
    isDriver: state => state.user?.role === 'driver',
    isAdmin: state => state.user?.role === 'admin',
    homePath: state => (state.user ? ROLE_HOME[state.user.role] : '/login'),
    displayName: state => state.user?.name ?? 'Tamu',
  },

  actions: {
    /** Dipanggil sekali dari app.vue / middleware — cookies first (SSR friendly) */
    async fetchUser(force = false) {
      if (this.initialized && !force) return this.user
      try {
        const res = await http.get<{ data: User & { driver: Driver | null } }>('/auth/me', undefined, { silent: true })
        this.user = res.data
        this.driver = res.data.driver ?? null
        this.token = null
      } catch {
        this.user = null
        this.driver = null
      } finally {
        this.initialized = true
      }
      return this.user
    },

    /**
     * Login: perangkat tepercaya → sesi langsung (return user).
     * Selain itu backend membalas tantangan OTP → simpan & return null
     * (halaman login lanjut ke /verifikasi).
     */
    async login(email: string, password: string, remember = false): Promise<User | null> {
      this.loading = true
      try {
        const res = await http.post<{ data: AuthSession | AuthChallenge }>('/auth/login', { email, password, remember })
        if (isSession(res.data)) {
          this.user = res.data.user
          this.token = res.data.token
          this.initialized = true
          await this.fetchUser(true)
          this.challenge = null
          this.challengePurpose = null
          return res.data.user
        }
        this.challenge = res.data
        this.challengePurpose = 'login'
        return null
      } catch (e) {
        throw e instanceof ApiError ? e : new ApiError('Gagal masuk.', 500)
      } finally {
        this.loading = false
      }
    },

    /** Verifikasi kode OTP 6 digit → sesi aktif */
    async verifyOtp(code: string): Promise<User> {
      this.loading = true
      try {
        if (!this.challenge) throw new ApiError('Sesi verifikasi tidak valid.', 422)
        const res = await http.post<{ data: AuthSession }>('/auth/otp/verify', {
          challenge_id: this.challenge.challenge_id,
          code,
        })
        this.user = res.data.user
        this.token = res.data.token
        this.initialized = true
        this.challenge = null
        await this.fetchUser(true)
        return res.data.user
      } catch (e) {
        throw e instanceof ApiError ? e : new ApiError('Gagal memverifikasi kode.', 500)
      } finally {
        this.loading = false
      }
    },

    /** Minta kode OTP baru (throttle 60 detik di backend) */
    async resendOtp(): Promise<void> {
      if (!this.challenge) throw new ApiError('Sesi verifikasi tidak valid.', 422)
      this.loading = true
      try {
        const res = await http.post<{ data: AuthChallenge }>('/auth/otp/resend', {
          challenge_id: this.challenge.challenge_id,
        })
        this.challenge = res.data
      } finally {
        this.loading = false
      }
    },

    clearChallenge() {
      this.challenge = null
      this.challengePurpose = null
    },

    /** Registrasi → backend membalas tantangan OTP (bukan sesi). Lanjut ke /verifikasi. */
    async register(payload: {
      name: string
      email: string
      phone: string
      password: string
      password_confirmation?: string
      role: 'customer' | 'driver'
      student_id?: string
      campus?: string
      study_program?: string
      vehicle_plate?: string
      vehicle_color?: string
      vehicle_model?: string
    }): Promise<AuthChallenge> {
      this.loading = true
      try {
        const res = await http.post<{ data: AuthChallenge }>('/auth/register', payload)
        this.challenge = res.data
        this.challengePurpose = 'register'
        return res.data
      } finally {
        this.loading = false
      }
    },

    async logout() {
      await http.post('/auth/logout').catch(() => undefined)
      this.$reset()
      this.initialized = true
    },

    async updateProfile(payload: Partial<Pick<User, 'name' | 'phone' | 'avatar_url'>> & { vehicle?: Partial<Driver> }) {
      const res = await http.patch<{ data: User }>('/auth/profile', payload)
      this.user = res.data
      if (this.isDriver) await this.fetchUser(true)
      return res.data
    },

    can(area: string) {
      if (!this.user) return false
      switch (area) {
        case 'customer':
          return this.user.role === 'customer'
        case 'driver':
          return this.user.role === 'driver'
        case 'admin':
          return this.user.role === 'admin'
        default:
          return true
      }
    },
  },
})

export { ROLE_HOME }

function isSession(data: AuthSession | AuthChallenge): data is AuthSession {
  return 'token' in data && 'user' in data
}
