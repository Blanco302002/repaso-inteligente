function renderProgreso() {
  const el = document.getElementById('progreso-content')
  if (!el) return

  const racha    = calcRacha()
  const activos  = temas.filter(t => t.active)
  const efProm   = activos.length
    ? (activos.reduce((s, t) => s + t.ef, 0) / activos.length).toFixed(2)
    : '—'
  const totalRep = historial.length
  const semanaN  = ultimos7DiasCount()

  const heat = buildHeatmap()
  const pie  = buildPie()

  el.innerHTML = `
    <!-- Cards superiores -->
    <div class="stats-row" style="margin-bottom:24px">
      <div class="stat-card">
        <div class="stat-n ${racha > 0 ? 'accent' : ''}">${racha}</div>
        <div class="stat-l">RACHA (DÍAS)</div>
      </div>
      <div class="stat-card">
        <div class="stat-n">${totalRep}</div>
        <div class="stat-l">REPASOS TOTALES</div>
      </div>
      <div class="stat-card">
        <div class="stat-n">${semanaN}</div>
        <div class="stat-l">ESTA SEMANA</div>
      </div>
      <div class="stat-card">
        <div class="stat-n accent">${efProm}</div>
        <div class="stat-l">EF PROMEDIO</div>
      </div>
    </div>

    <!-- Heatmap -->
    <div class="slabel" style="margin-bottom:12px">Actividad — últimas 13 semanas</div>
    <div class="heatmap-wrap">
      <div class="heatmap-dows">
        <span></span><span>L</span><span></span><span>M</span><span></span><span>V</span><span></span>
      </div>
      <div class="heatmap">
        ${heat.html}
      </div>
    </div>
    <div class="heatmap-legend">
      <span>Menos</span>
      <span class="heatmap-cell l0"></span>
      <span class="heatmap-cell l1"></span>
      <span class="heatmap-cell l2"></span>
      <span class="heatmap-cell l3"></span>
      <span class="heatmap-cell l4"></span>
      <span>Más</span>
    </div>

    <!-- Pie por materia -->
    ${pie.total > 0 ? `
    <div class="slabel" style="margin-top:32px;margin-bottom:12px">Temas por materia</div>
    <div class="pie-wrap">
      <svg class="pie-svg" viewBox="0 0 100 100">${pie.svg}</svg>
      <div class="pie-legend">
        ${pie.legend}
      </div>
    </div>` : ''}
  `
}

// ── HEATMAP ──
function buildHeatmap() {
  const today = new Date(); today.setHours(0,0,0,0)
  const dow   = (today.getDay() + 6) % 7   // L=0 ... D=6
  const start = new Date(today)
  start.setDate(start.getDate() - dow - 12 * 7)

  const cells = []
  const cur   = new Date(start)
  for (let i = 0; i < 13 * 7; i++) {
    const dateStr  = fmt(cur)
    const isFuture = cur > today
    const count    = isFuture ? 0 : historial.filter(h => h.date === dateStr).length
    cells.push({ dateStr, count, isFuture, dt: new Date(cur) })
    cur.setDate(cur.getDate() + 1)
  }

  const html = cells.map(c => {
    if (c.isFuture) return `<div class="heatmap-cell future"></div>`
    const lvl   = c.count === 0 ? 0 : c.count <= 2 ? 1 : c.count <= 4 ? 2 : c.count <= 7 ? 3 : 4
    const fecha = c.dt.toLocaleDateString('es-AR', { weekday:'short', day:'numeric', month:'short' })
    const txt   = c.count === 0 ? 'sin repasos' : `${c.count} repaso${c.count!==1?'s':''}`
    return `<div class="heatmap-cell l${lvl}" title="${fecha} · ${txt}"></div>`
  }).join('')

  return { html }
}

// ── PIE CHART ──
function buildPie() {
  const activos = temas.filter(t => t.active)
  if (!activos.length) return { svg: '', legend: '', total: 0 }

  const counts = {}
  activos.forEach(t => { counts[t.materia] = (counts[t.materia] || 0) + 1 })
  const total   = activos.length
  const entries = Object.entries(counts).sort((a,b) => b[1] - a[1])

  let angle = 0
  const slicePaths = []
  const legendRows = []

  entries.forEach(([m, n]) => {
    const [bg, fg] = matColor(m)
    const pct      = n / total
    const start    = angle
    const end      = angle + pct * 2 * Math.PI
    angle = end

    const path = pieSlice(50, 50, 50, start, end, n === total)
    slicePaths.push(`<path d="${path}" fill="${fg}" stroke="var(--paper)" stroke-width="0.5"/>`)
    legendRows.push(`
      <div class="pie-legend-row">
        <span class="pie-dot" style="background:${fg}"></span>
        <span class="pie-mat">${esc(m)}</span>
        <span class="pie-n">${n} · ${Math.round(pct * 100)}%</span>
      </div>`)
  })

  return { svg: slicePaths.join(''), legend: legendRows.join(''), total }
}

function pieSlice(cx, cy, r, startAngle, endAngle, isFull) {
  if (isFull) {
    return `M ${cx-r} ${cy} A ${r} ${r} 0 1 1 ${cx+r} ${cy} A ${r} ${r} 0 1 1 ${cx-r} ${cy} Z`
  }
  const x1 = cx + r * Math.sin(startAngle)
  const y1 = cy - r * Math.cos(startAngle)
  const x2 = cx + r * Math.sin(endAngle)
  const y2 = cy - r * Math.cos(endAngle)
  const large = endAngle - startAngle > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
}

// ── Helpers ──

function calcRacha() {
  if (!historial.length) return 0
  const fechas = [...new Set(historial.map(h => h.date))].sort().reverse()
  const todayStr = today()
  let racha    = 0
  let esperado = fechas[0] === todayStr ? todayStr : restarDia(todayStr)

  for (const f of fechas) {
    if (f === esperado) { racha++; esperado = restarDia(esperado) }
    else if (f < esperado) break
  }
  return racha
}

function restarDia(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d - 1)
  return fmt(dt)
}

function ultimos7DiasCount() {
  let n = 0
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i)
    n += historial.filter(h => h.date === fmt(dt)).length
  }
  return n
}
