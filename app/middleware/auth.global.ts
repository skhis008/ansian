export default defineNuxtRouteMiddleware(async to => {
  const auth = useAuthStore()

  /* Public routes */
  const publicPaths = ['/login', '/register', '/faq', '/tentang', '/kebijakan-privasi', '/terms', '/driver/daftar']
  const isPublic = publicPaths.includes(to.path) || to.path === '/'

  if (!auth.initialized) {
    await auth.fetchUser()
  }

  /* Sudah login & buka halaman auth → lempar ke home sesuai role */
  if (auth.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo(auth.homePath)
  }

  if (isPublic) return

  /* Butuh login */
  if (!auth.isAuthenticated) {
    return navigateTo({ path: '/login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : {} })
  }

  /* Gate per role: /rider/* hanya untuk rider, dst. */
  const segment = to.path.split('/')[1]
  const required = segment === 'rider' || segment === 'driver' || segment === 'admin' ? segment : null

  if (required && required !== auth.role) {
    return navigateTo(auth.homePath)
  }
})
