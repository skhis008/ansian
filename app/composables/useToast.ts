export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading'

export interface Toast {
  id: number
  message: string
  type: ToastType
  action?: { label: string; onClick: () => void }
}

/**
 * Toast tanpa dependency. Dipakai di luar component (store, composable).
 * Version komponen ada di components/ui/ToastHost.vue
 */
export function useToast() {
  const store = useUiStore()
  return {
    push: (message: string, type: ToastType = 'info', duration?: number) => store.toast(message, type, duration),
    success: (message: string) => store.success(message),
    error: (message: string) => store.error(message),
    info: (message: string) => store.info(message),
    dismiss: (id: number) => store.dismiss(id),
  }
}
