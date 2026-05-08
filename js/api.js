const FILE_PATH = 'data.json'
let fileSha = null

async function ghGet() {
  const url = `https://api.github.com/repos/${cfg.user}/${cfg.repo}/contents/${FILE_PATH}`
  const r = await fetch(url, { headers: { Authorization: `Bearer ${cfg.token}`, Accept: 'application/vnd.github+json' } })
  if (r.status === 404) return null
  if (!r.ok) throw new Error('Error leyendo datos')
  const json = await r.json()
  fileSha = json.sha
  const raw = decodeURIComponent(escape(atob(json.content.replace(/\n/g,''))))
  return JSON.parse(raw)
}

async function ghPut(data) {
  setSyncStatus('saving')
  const url  = `https://api.github.com/repos/${cfg.user}/${cfg.repo}/contents/${FILE_PATH}`
  const body = { message: 'repaso: sync', content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))) }
  if (fileSha) body.sha = fileSha
  const r = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${cfg.token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!r.ok) { setSyncStatus('err'); throw new Error('Error guardando') }
  const json = await r.json()
  fileSha = json.content.sha
  setSyncStatus('ok')
}

function setSyncStatus(s) {
  const dot = document.getElementById('sync-dot')
  const lbl = document.getElementById('sync-label')
  dot.className = 'sync-dot ' + s
  lbl.textContent = s === 'ok' ? 'sincronizado' : s === 'saving' ? 'guardando...' : 'error al guardar'
}

async function persist() {
  // Mantener el historial en máx 500 entradas para no inflar data.json
  const recortado = historial.slice(-500)
  try { await ghPut({ temas, historial: recortado }) }
  catch(e) { toast('No se pudo guardar — revisá el token') }
}
