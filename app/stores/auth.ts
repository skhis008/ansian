import { defineStore } from 'pinia'
import type { AuthSession, Driver, User } from '#shared/types'
import { ApiError, http } from '~/composables/useApi'

interface AuthState {
  user: User | null
  driver: Driver | null
  token: string | null
  initialized: boolean
  loading: boolean
}

const ROLE_HOME: Record<User['role'], string> = {
  rider: '/rider',
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
  }),

  getters: {
    isAuthenticated: state => Boolean(state.user),
    role: state => state.user?.role ?? null,
    isRider: state => state.user?.role === 'rider',
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

    async login(email: string, password: string, remember = false) {
      this.loading = true
      try {
        const res = await http.post<{ data: AuthSession }>('/auth/login', { email, password, remember })
        this.user = res.data.user
        this.token = res.data.token
        this.initialized = true
        await this.fetchUser(true)
        return res.data.user
      } catch (e) {
        throw e instanceof ApiError ? e : new ApiError('Gagal masuk.', 500)
      } finally {
        this.loading = false
      }
    },

    async register(payload: {
      name: string
      email: string
      phone: string
      password: string
      password_confirmation: string
      role: 'rider' | 'driver'
    }) {
      this.loading = true
      try {
        const res = await http.post<{ data: AuthSession }>('/auth/register', payload)
        this.user = res.data.user
        this.token = res.data.token
        this.initialized = true
        await this.fetchUser(true)
        return res.data.user
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
        case 'rider':
          return this.user.role === 'rider'
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
