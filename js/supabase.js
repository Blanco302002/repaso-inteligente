// Reemplazá estos valores con los de tu proyecto en supabase.com → Settings → API
const SUPABASE_URL      = 'https://zgoqwgtknvxeyienqtda.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_748J1u7bmD0XN9SmqCOOdQ_sxNoDgUG'

const { createClient } = window.supabase
window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
