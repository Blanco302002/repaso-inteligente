const THINGS_EMAIL_KEY = 'ri_things_email'

// cfg expone thingsEmail para compatibilidad con things.js
let cfg = { thingsEmail: localStorage.getItem(THINGS_EMAIL_KEY) || '' }

let booted = false

async function initAuth() {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      booted = false
      showAuthScreen()
      return
    }
    if (session && !booted) {
      booted = true
      bootApp()
    }
  })
}

function showAuthScreen() {
  document.getElementById('auth-screen').style.display = 'flex'
  document.getElementById('app').style.display = 'none'
}

function switchAuthTab(tab) {
  const isLogin = tab === 'login'
  document.getElementById('auth-login-panel').style.display  = isLogin ? 'block' : 'none'
  document.getElementById('auth-signup-panel').style.display = isLogin ? 'none'  : 'block'
  document.getElementById('tab-login-btn').classList.toggle('active',  isLogin)
  document.getElementById('tab-signup-btn').classList.toggle('active', !isLogin)
}

async function login() {
  const email    = document.getElementById('auth-email').value.trim()
  const password = document.getElementById('auth-password').value
  if (!email || !password) { toast('Completá email y contraseña'); return }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) toast('Error: ' + error.message)
}

async function signup() {
  const email    = document.getElementById('auth-email-reg').value.trim()
  const password = document.getElementById('auth-password-reg').value
  const confirm  = document.getElementById('auth-password-confirm').value
  if (!email || !password)    { toast('Completá email y contraseña'); return }
  if (password !== confirm)   { toast('Las contraseñas no coinciden'); return }
  if (password.length < 6)    { toast('La contraseña debe tener al menos 6 caracteres'); return }
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) { toast('Error: ' + error.message); return }
  if (!data.session) toast('¡Cuenta creada! Revisá tu email para confirmar.')
}

async function logout() {
  await supabase.auth.signOut()
}
