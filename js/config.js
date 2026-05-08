const CFG_KEY = 'ri_config'
let cfg = null

function loadConfig() {
  try { cfg = JSON.parse(localStorage.getItem(CFG_KEY)) } catch(e) {}
  return !!(cfg?.user && cfg?.repo && cfg?.token)
}

function saveConfig() {
  const user        = document.getElementById('cfg-user').value.trim()
  const repo        = document.getElementById('cfg-repo').value.trim()
  const token       = document.getElementById('cfg-token').value.trim()
  const thingsEmail = document.getElementById('cfg-things-email').value.trim()
  if (!user || !repo || !token) { toast('Completá todos los campos'); return }
  cfg = { user, repo, token, thingsEmail }
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg))
  bootApp()
}
