let calYear  = new Date().getFullYear()
let calMonth = new Date().getMonth() // 0-indexed

function renderCalendar() {
  const gridEl = document.getElementById('cal-grid')
  if (!gridEl) return

  // Header: "Mayo 2026"
  const headerDate = new Date(calYear, calMonth, 1)
  const headerStr  = headerDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  document.getElementById('cal-header').textContent =
    headerStr.charAt(0).toUpperCase() + headerStr.slice(1)

  // Agrupar temas activos por fecha de próximo repaso
  const byDate = {}
  temas.filter(t => t.active).forEach(t => {
    if (!byDate[t.nextReview]) byDate[t.nextReview] = []
    byDate[t.nextReview].push(t)
  })

  const todayStr  = today()
  const lastDay   = new Date(calYear, calMonth + 1, 0).getDate()
  let   startDow  = new Date(calYear, calMonth, 1).getDay() // 0=Dom
  startDow = (startDow + 6) % 7 // convertir a Lun=0 … Dom=6

  const DOW = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
  let html = `<div class="cal-dow-row">${DOW.map(d => `<div class="cal-dow">${d}</div>`).join('')}</div>`
  html += '<div class="cal-days">'

  // Celdas vacías antes del primer día
  for (let i = 0; i < startDow; i++) html += '<div class="cal-cell empty"></div>'

  // Días del mes
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const isToday = dateStr === todayStr
    const topics  = byDate[dateStr] || []
    const isPast  = dateStr < todayStr

    let cellClass = 'cal-cell'
    if (isToday)        cellClass += ' is-today'
    if (topics.length)  cellClass += ' has-topics'
    if (isPast && topics.length) cellClass += ' is-past'

    html += `<div class="${cellClass}">`
    html += `<div class="cal-day-num">${d}</div>`

    if (topics.length) {
      html += '<div class="cal-topics">'
      topics.slice(0, 3).forEach(t => {
        const [bg, fg] = matColor(t.materia)
        html += `<div class="cal-topic-pill" style="background:${bg};color:${fg}" title="${esc(t.nombre)}">${esc(t.nombre)}</div>`
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
