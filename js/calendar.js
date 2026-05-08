let calYear  = new Date().getFullYear()
let calMonth = new Date().getMonth()
let calByDate = {} // mapa dateStr → array de temas, para el tooltip

function renderCalendar() {
  const gridEl = document.getElementById('cal-grid')
  if (!gridEl) return

  // Header
  const headerStr = new Date(calYear, calMonth, 1)
    .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  document.getElementById('cal-header').textContent =
    headerStr.charAt(0).toUpperCase() + headerStr.slice(1)

  // Agrupar temas activos por fecha
  calByDate = {}
  temas.filter(t => t.active).forEach(t => {
    if (!calByDate[t.nextReview]) calByDate[t.nextReview] = []
    calByDate[t.nextReview].push(t)
  })

  const todayStr = today()
  const lastDay  = new Date(calYear, calMonth + 1, 0).getDate()
  let startDow   = new Date(calYear, calMonth, 1).getDay()
  startDow = (startDow + 6) % 7 // Lun=0 … Dom=6

  const DOW = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
  let html = `<div class="cal-dow-row">${DOW.map(d => `<div class="cal-dow">${d}</div>`).join('')}</div>`
  html += '<div class="cal-days">'

  for (let i = 0; i < startDow; i++) html += '<div class="cal-cell empty"></div>'

  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const isToday = dateStr === todayStr
    const isPast  = dateStr < todayStr
    const topics  = calByDate[dateStr] || []

    let cls = 'cal-cell'
    if (isToday)       cls += ' is-today'
    if (topics.length) cls += ' has-topics'
    if (isPast && topics.length) cls += ' is-past'

    const hoverAttrs = topics.length
      ? `onmouseenter="showCalTooltip(event,'${dateStr}')" onmouseleave="hideCalTooltip()" onmousemove="moveCalTooltip(event)"`
      : ''

    html += `<div class="${cls}" ${hoverAttrs}>`
    html += `<div class="cal-day-num">${d}</div>`

    if (topics.length) {
      html += '<div class="cal-topics">'
      // Mostrar hasta 3 pills (el resto lo ve en el tooltip)
      topics.slice(0, 3).forEach(t => {
        const [bg, fg] = matColor(t.materia)
        html += `<div class="cal-topic-pill" style="background:${bg};color:${fg}">${esc(t.nombre)}</div>`
      })
      if (topics.length > 3) {
        html += `<div class="cal-topic-more">+${topics.length - 3} más</div>`
      }
      html += '</div>'
    }
    html += '</div>'
  }

  html += '</div>'
  gridEl.innerHTML = html
}

// ── TOOLTIP ──
function showCalTooltip(e, dateStr) {
  const tip    = document.getElementById('cal-tooltip')
  const topics = calByDate[dateStr] || []
  if (!topics.length) return

  const [y, m, d] = dateStr.split('-').map(Number)
  const label = new Date(y, m - 1, d)
    .toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  tip.innerHTML = `
    <div class="cal-tooltip-date">${label}</div>
    ${topics.map(t => `
      <div class="cal-tooltip-item">
        <div class="cal-tooltip-name">${esc(t.nombre)}</div>
        <div class="cal-tooltip-mat">${esc(t.materia)} · EF ${t.ef}</div>
      </div>`).join('')}`

  tip.classList.add('show')
  moveCalTooltip(e)
}

function moveCalTooltip(e) {
  const tip = document.getElementById('cal-tooltip')
  const tw  = tip.offsetWidth  || 220
  const th  = tip.offsetHeight || 80
  let x = e.clientX + 14
  let y = e.clientY + 14
  if (x + tw > window.innerWidth  - 12) x = e.clientX - tw - 14
  if (y + th > window.innerHeight - 12) y = e.clientY - th - 14
  tip.style.left = x + 'px'
  tip.style.top  = y + 'px'
}

function hideCalTooltip() {
  document.getElementById('cal-tooltip').classList.remove('show')
}

function calPrev() {
  calMonth--
  if (calMonth < 0) { calMonth = 11; calYear-- }
  renderCalendar()
}

function calNext() {
  calMonth++
  if (calMonth > 11) { calMonth = 0; calYear++ }
  renderCalendar()
}
