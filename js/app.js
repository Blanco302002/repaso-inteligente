async function bootApp() {
  document.getElementById('setup-screen').style.display = 'none'
  document.getElementById('app').style.display = 'block'
  setSyncStatus('saving')
  try {
    const data = await ghGet()
    temas = data?.temas || []
  } catch(e) {
    toast('Error conectando con GitHub')
    setSyncStatus('err')
    return
  }
  setSyncStatus('ok')
  refresh()
  document.getElementById('inp-fecha').value = today()
}

async function addTema() {
  const nombre  = document.getElementById('inp-tema').value.trim()
  const materia = document.getElementById('inp-mat').value.trim()
  const estado  = document.getElementById('inp-estado').value
  const fecha   = document.getElementById('inp-fecha').value || today()
  if (!nombre || !materia) { toast('Completá nombre y materia'); return }
  const efMap  = { nuevo:2.5, flojo:1.6, regular:2.0, bien:2.8 }
  const intMap = { nuevo:1,   flojo:1,   regular:3,   bien:7   }
  temas.push({
    id: crypto.randomUUID(), nombre, materia,
    ef: efMap[estado], interval: intMap[estado], repetitions: 0,
    nextReview: fecha, lastReview: null, active: true
  })
  await persist()
  clearForm()
  showTab('hoy', document.querySelectorAll('.nav-item')[0]) // índice 0 = Hoy
  refresh()
  toast('Tema agregado')
}

function clearForm() {
  ['inp-tema', 'inp-mat'].forEach(id => document.getElementById(id).value = '')
  document.getElementById('inp-estado').value = 'nuevo'
  document.getElementById('inp-fecha').value  = today()
}

async function rate(id, q) {
  const i = temas.findIndex(t => t.id === id)
  if (i < 0) return
  const res = sm2(temas[i], q)
  Object.assign(temas[i], res, { lastReview: today() })
  await persist()
  refresh()
  const msgs = ['Mañana lo repasamos', 'Intervalo reducido', `Próximo en ${res.interval} días`]
  toast(msgs[q])
}

async function delTema(id) {
  if (!confirm('¿Eliminar este tema?')) return
  temas = temas.filter(t => t.id !== id)
  await persist()
  refresh()
}

async function toggleActive(id) {
  const t = temas.find(t => t.id === id)
  if (!t) return
  t.active = !t.active
  await persist()
  refresh()
}

function showTab(id, btn) {
  ['hoy', 'temas', 'nuevo', 'things', 'calendario'].forEach(t => {
    const el = document.getElementById('tab-' + t)
    el.style.display = t === id ? 'flex' : 'none'
    if (t === id) el.style.flexDirection = 'column'
  })
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'))
  if (btn) btn.classList.add('active')
  if (id === 'things')     renderThings()
  if (id === 'calendario') renderCalendar()
}

// ── EDITAR TEMA ──
function openEditModal(id) {
  const t = temas.find(t => t.id === id)
  if (!t) return
  document.getElementById('edit-id').value      = t.id
  document.getElementById('edit-nombre').value  = t.nombre
  document.getElementById('edit-materia').value = t.materia
  document.getElementById('edit-fecha').value   = t.nextReview
  document.getElementById('edit-ef').value      = t.ef
  document.getElementById('edit-modal').style.display = 'flex'
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none'
}

async function saveEdit() {
  const id      = document.getElementById('edit-id').value
  const nombre  = document.getElementById('edit-nombre').value.trim()
  const materia = document.getElementById('edit-materia').value.trim()
  const fecha   = document.getElementById('edit-fecha').value
  const ef      = parseFloat(document.getElementById('edit-ef').value)
  if (!nombre || !materia || !fecha) { toast('Completá todos los campos'); return }
  const t = temas.find(t => t.id === id)
  if (!t) return
  t.nombre     = nombre
  t.materia    = materia
  t.nextReview = fecha
  t.ef         = Math.max(1.3, Math.min(5, isNaN(ef) ? t.ef : ef))
  closeEditModal()
  await persist()
  refresh()
  toast('Tema actualizado')
}

// ── INIT ──
if (loadConfig()) {
  bootApp()
} else {
  document.getElementById('setup-screen').style.display = 'flex'
}
