import { defineEventHandler, setResponseHeader } from 'h3'
import { handleApi } from '../../../utils/apiRouter'

/**
 * Catch-all untuk SELURUH endpoint /api/v1/**.
 * Path & method identik dengan routes/api.php Laravel,
 * jadi frontend tidak perlu diubah saat backend aktif.
 *
 * File ini (beserta server/utils/mockApi/*) boleh dihapus
 * setelah backend Laravel aktif — cukup set NUXT_PUBLIC_USE_MOCK=false.
 */
export default defineEventHandler(async event => {
  setResponseHeader(event, 'x-api-mock', 'true')
  return handleApi(event)
})
