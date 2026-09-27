import { defineStore } from 'pinia'
import type { FareQuote, Place, Ride, RideStatus, PaymentMethod } from '#shared/types'
import { http, ApiError } from '~/composables/useApi'
import { useToast } from '~/composables/useToast'

interface RideState {
  activeRide: Ride | null
  quote: FareQuote | null
  quoting: boolean
  booking: boolean
  lastError: string | null
  polling: boolean
}

const ALLOWED: Record<RideStatus, RideStatus[]> = {
  searching: ['driver_assigned', 'cancelled', 'failed'],
  driver_assigned: ['driver_arrived', 'cancelled', 'failed'],
  driver_arrived: ['in_progress', 'cancelled', 'failed'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
  failed: [],
}

export const useRideStore = defineStore('ride', {
  state: (): RideState => ({
    activeRide: null,
    quote: null,
    quoting: false,
    booking: false,
    lastError: null,
    polling: false,
  }),

  getters: {
    hasActiveRide: state => Boolean(state.activeRide && ['searching', 'driver_assigned', 'driver_arrived', 'in_progress'].includes(state.activeRide.status)),
    status: state => state.activeRide?.status ?? null,
    canCancel: state => Boolean(state.activeRide && ['searching', 'driver_assigned', 'driver_arrived'].includes(state.activeRide.status)),
    progressStep: state => {
      const map: Partial<Record<RideStatus, number>> = {
        searching: 1,
        driver_assigned: 2,
        driver_arrived: 3,
        in_progress: 4,
        completed: 5,
      }
      return state.activeRide ? (map[state.activeRide.status] ?? 0) : 0
    },
  },

  actions: {
    setActive(ride: Ride | null) {
      this.activeRide = ride
    },

    async fetchActive(silent = true) {
      try {
        const res = await http.get<{ data: Ride | null }>('/rides/active', undefined, { silent })
        this.activeRide = res.data
        return res.data
      } catch {
        return this.activeRide
      }
    },

    async getQuote(pickup: Place, destination: Place) {
      this.quoting = true
      this.lastError = null
      try {
        const res = await http.post<{ data: FareQuote }>('/fares/quote', { pickup, destination })
        this.quote = res.data
        return res.data
      } catch (e) {
        this.lastError = e instanceof ApiError ? e.message : 'Gagal menghitung ongkos.'
        return null
      } finally {
        this.quoting = false
      }
    },

    async book(payload: {
      pickup: Place
      destination: Place
      payment_method: PaymentMethod
      pickup_note?: string
      scheduled_at?: string | null
    }) {
      this.booking = true
      try {
        const res = await http.post<{ data: Ride }>('/rides', payload)
        this.activeRide = res.data
        this.quote = null
        return res.data
      } finally {
        this.booking = false
      }
    },

    /** Update status perjalanan (dipakai driver & polling) */
    async transition(rideId: number, action: 'cancel' | 'arrive' | 'start' | 'complete' | 'rate', data: Record<string, unknown> = {}) {
      const paths: Record<string, string> = {
        cancel: `/rides/${rideId}/cancel`,
        arrive: `/drivers/rides/${rideId}/arrive`,
        start: `/drivers/rides/${rideId}/start`,
        complete: `/drivers/rides/${rideId}/complete`,
        rate: `/rides/${rideId}/rate`,
      }
      const res = await http.post<{ data: Ride; message?: string }>(paths[action]!, data)
      this.mergeRide(res.data)
      return res
    },

    acceptJob(rideId: number) {
      return http.post<{ data: Ride }>(`/drivers/jobs/${rideId}/accept`)
    },
    rejectJob(rideId: number) {
      return http.post(`/drivers/jobs/${rideId}/reject`)
    },

    mergeRide(ride: Ride) {
      if (this.activeRide && this.activeRide.id === ride.id) {
        this.activeRide = ride
      } else if (['searching', 'driver_assigned', 'driver_arrived', 'in_progress'].includes(ride.status)) {
        this.activeRide = ride
      } else if (this.activeRide?.id === ride.id) {
        this.activeRide = ride
      }
    },

    /** Dipakai realtime: validasi transisi status agar tidak lompat tahap */
    applyRealtimeStatus(rideId: number, status: RideStatus) {
      const current = this.activeRide
      if (!current || current.id !== rideId) return false
      if (current.status === status) return false
      if (!ALLOWED[current.status]?.includes(status)) return false
      current.status = status
      current.updated_at = new Date().toISOString()
      return true
    },

    clear() {
      this.activeRide = null
      this.quote = null
    },

    /** Polling ringan: berbeda dari realtime, dipakai saat Echo belum aktif */
    startPolling(intervalMs = 6000) {
      if (this.polling) return
      this.polling = true
      const tick = async () => {
        if (!this.polling) return
        await this.fetchActive()
        timer = setTimeout(tick, intervalMs)
      }
      let timer: ReturnType<typeof setTimeout> = setTimeout(tick, intervalMs)
      void useToast()
    },

    stopPolling() {
      this.polling = false
    },
  },
})
