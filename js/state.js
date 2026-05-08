let temas    = []
let historial = []
let filt     = 'todos'
const COLORS = [
  ['#E1F5EE','#0F6E56'],['#EEEDFE','#3C3489'],['#FAECE7','#712B13'],
  ['#FBEAF0','#72243E'],['#E6F1FB','#0C447C'],['#EAF3DE','#27500A'],
  ['#FAEEDA','#633806'],['#FCEBEB','#791F1F']
]

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// fmt usa métodos locales para evitar el bug de timezone UTC vs Argentina
function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function fmtFull(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const s = new Date(y, m - 1, d).toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function today() {
  return fmt(new Date())
}

// daysUntil: parsea la fecha como local para evitar el desfase de UTC-3
function daysUntil(s) {
  const [y, m, d] = s.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const now    = new Date(); now.setHours(0, 0, 0, 0)
  return Math.round((target - now) / 86400000)
}

function matColor(mat) {
  const ms = [...new Set(temas.map(t => t.materia))]
  return COLORS[ms.indexOf(mat) % COLORS.length]
}

function toast(msg) {
  const el = document.getElementById('toast')
  el.textContent = msg; el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 2600)
}
