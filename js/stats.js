function renderProgreso() {
  const el = document.getElementById('progreso-content')
  if (!el) return

  // ── Racha ──
  const racha = calcRacha()

  // ── Últimos 7 días (del historial) ──
  const semana = ultimos7Dias()

  // ── Stats de temas ──
  const activos    = temas.filter(t => t.active)
  const efProm     = activos.length
    ? (activos.reduce((s, t) => s + t.ef, 0) / activos.length).toFixed(2)
    : '—'
  const dificiles  = activos.filter(t => t.ef < 1.7).sort((a,b) => a.ef - b.ef)
  const dominados  = activos.filter(t => t.ef >= 2.5 && t.repetitions >= 3).sort((a,b) => b.ef - a.ef)

  // ── Por materia ──
  const materias = [...new Set(activos.map(t => t.materia))].map(m => {
    const grupo = activos.filter(t => t.materia === m)
    const ef    = (grupo.reduce((s,t) => s+t.ef, 0) / grupo.length).toFixed(2)
    return { m, n: grupo.length, ef }
  }).sort((a,b) => a.ef - b.ef)

  const totalRep = historial.length

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
        <div class="stat-n">${semana.reduce((s,d)=>s+d.n,0)}</div>
        <div class="stat-l">ESTA SEMANA</div>
      </div>
      <div class="stat-card">
        <div class="stat-n accent">${efProm}</div>
        <div class="stat-l">EF PROMEDIO</div>
      </div>
    </div>

    <!-- Actividad semanal -->
    <div class="slabel" style="margin-bottom:12px">Actividad — últimos 7 días</div>
    ${semana.every(d => d.n === 0)
      ? `<div style="color:var(--ink3);font-family:var(--mono);font-size:13px;margin-bottom:24px">
           Todavía no hay repasos registrados. ¡Estudiá algo hoy!
         </div>`
      : `<div class="week-chart">
          ${semana.map(d => {
            const max = Math.max(...semana.map(x=>x.n), 1)
            const pct = Math.round((d.n / max) * 100)
            return `<div class="week-col">
              <div class="week-bar-wrap">
                <div class="week-bar" style="height:${pct}%"></div>
              </div>
              <div class="week-label">${d.label}</div>
              <div class="week-n">${d.n || ''}</div>
            </div>`
          }).join('')}
        </div>`
    }

    <!-- Por materia -->
    ${materias.length ? `
    <div class="slabel" style="margin-bottom:12px">Por materia</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:24px">
      ${materias.map(({m, n, ef}) => {
        const [bg, fg] = matColor(m)
        const pct = Math.round(((ef - 1.3) / (5 - 1.3)) * 100)
        return `<div class="mat-stat-row">
          <span class="mpill" style="background:${bg};color:${fg};min-width:120px;text-align:center">${esc(m)}</span>
          <div class="mat-bar-track">
            <div class="mat-bar-fill" style="width:${pct}%;background:${fg}"></div>
          </div>
          <span style="font-family:var(--mono);font-size:11px;color:var(--ink3);white-space:nowrap">
            ${n} tema${n!==1?'s':''} · EF ${ef}
          </span>
        </div>`
      }).join('')}
    </div>` : ''}

    <!-- Necesitan atención -->
    ${dificiles.length ? `
    <div class="slabel" style="margin-bottom:10px">Necesitan atención <span style="font-weight:400;text-transform:none;letter-spacing:0">(EF < 1.7)</span></div>
    <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:24px">
      ${dificiles.slice(0,5).map(t => {
        const [bg, fg] = matColor(t.materia)
        return `<div class="all-card" style="padding:10px 14px">
          <div style="flex:1;min-width:0">
            <div class="all-name" style="font-size:13px">${esc(t.nombre)}</div>
            <div class="all-meta"><span class="mpill" style="background:${bg};color:${fg};font-size:10px;padding:1px 7px">${esc(t.materia)}</span></div>
          </div>
          <span class="bdge" style="background:var(--danger-bg);color:var(--danger)">EF ${t.ef}</span>
        </div>`
      }).join('')}
    </div>` : ''}

    <!-- Bien aprendidos -->
    ${dominados.length ? `
    <div class="slabel" style="margin-bottom:10px">Bien aprendidos <span style="font-weight:400;text-transform:none;letter-spacing:0">(EF ≥ 2.5 · +3 repasos)</span></div>
    <div style="display:flex;flex-direction:column;gap:5px">
      ${dominados.slice(0,5).map(t => {
        const [bg, fg] = matColor(t.materia)
        return `<div class="all-card" style="padding:10px 14px">
          <div style="flex:1;min-width:0">
            <div class="all-name" style="font-size:13px">${esc(t.nombre)}</div>
            <div class="all-meta"><span class="mpill" style="background:${bg};color:${fg};font-size:10px;padding:1px 7px">${esc(t.materia)}</span></div>
          </div>
          <span class="bdge" style="background:var(--accent-bg);color:var(--accent2)">EF ${t.ef}</span>
        </div>`
      }).join('')}
    </div>` : ''}
  `
}

// Racha: días consecutivos con al menos un repaso
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

// Últimos 7 días con conteo de repasos
function ultimos7Dias() {
  const dias = []
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i)
    const str   = fmt(dt)
    const label = dt.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.','').slice(0,3)
    const n     = historial.filter(h => h.date === str).length
    dias.push({ str, label, n })
  }
  return dias
}
