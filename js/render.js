function refresh() {
  renderStats()
  renderDue()
  renderAll()
  renderFilters()
  renderMats()
  if (document.getElementById('tab-things').style.display !== 'none')     renderThings()
  if (document.getElementById('tab-calendario').style.display !== 'none') renderCalendar()
  document.getElementById('nav-count').textContent =
    temas.filter(t => t.active && t.nextReview <= today()).length
}

function renderStats() {
  const due   = temas.filter(t => t.active && t.nextReview <= today()).length
  const total = temas.filter(t => t.active).length
  const mats  = new Set(temas.filter(t => t.active).map(t => t.materia)).size
  const week  = temas.filter(t => t.active && daysUntil(t.nextReview) > 0 && daysUntil(t.nextReview) <= 7).length
  document.getElementById('stats').innerHTML = `
    <div class="stat-card"><div class="stat-n danger">${due}</div><div class="stat-l">PARA HOY</div></div>
    <div class="stat-card"><div class="stat-n warn">${week}</div><div class="stat-l">ESTA SEMANA</div></div>
    <div class="stat-card"><div class="stat-n">${total}</div><div class="stat-l">ACTIVOS</div></div>
    <div class="stat-card"><div class="stat-n accent">${mats}</div><div class="stat-l">MATERIAS</div></div>`
  document.getElementById('hoy-sub').textContent =
    `${due} tema${due !== 1 ? 's' : ''} pendiente${due !== 1 ? 's' : ''} · ${new Date().toLocaleDateString('es-AR', {weekday:'long', day:'numeric', month:'long'})}`
}

function renderDue() {
  const due = temas.filter(t => t.active && t.nextReview <= today())
  const el  = document.getElementById('due-list')
  if (!due.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">✓</span><div class="empty-title">Todo al día</div><div>No hay temas pendientes para hoy.</div></div>`
    return
  }
  el.innerHTML = due.map(t => {
    const [bg, fg] = matColor(t.materia)
    return `<div class="tema-card today">
      <div class="tema-main">
        <div class="tema-name">${esc(t.nombre)}</div>
        <div class="tema-meta">
          <span class="mpill" style="background:${bg};color:${fg}">${esc(t.materia)}</span>
          <span class="tmeta">Int: ${t.interval}d · Rep: ${t.repetitions} · EF: ${t.ef}</span>
        </div>
      </div>
      <div class="rate-row">
        <button class="rb rb-0" onclick="rate('${t.id}',0)">Olvidé</button>
        <button class="rb rb-1" onclick="rate('${t.id}',1)">Flojo</button>
        <button class="rb rb-2" onclick="rate('${t.id}',2)">Bien</button>
      </div>
    </div>`
  }).join('')
}

function renderAll() {
  const filtered = filt === 'todos' ? temas : temas.filter(t => t.materia === filt)
  const sorted   = [...filtered].sort((a, b) => a.nextReview.localeCompare(b.nextReview))
  document.getElementById('temas-sub').textContent = `${filtered.length} tema${filtered.length !== 1 ? 's' : ''}`
  const el = document.getElementById('all-list')
  if (!sorted.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-title">Sin temas</div><div>Agregá el primero.</div></div>`
    return
  }
  el.innerHTML = sorted.map(t => {
    const [bg, fg] = matColor(t.materia)
    const days = daysUntil(t.nextReview)
    let dbg, dfg, dtxt
    if (!t.active)      { dbg='#f0ede8'; dfg='#9a9690'; dtxt='pausado' }
    else if (days <= 0) { dbg='#FCEBEB'; dfg='#A32D2D'; dtxt='hoy' }
    else if (days <= 3) { dbg='#FAEEDA'; dfg='#BA7517'; dtxt=`${days}d` }
    else                { dbg='#E1F5EE'; dfg='#0F6E56'; dtxt=`${days}d` }
    return `<div class="all-card ${t.active ? '' : 'paused'}">
      <div style="flex:1;min-width:0">
        <div class="all-name">${esc(t.nombre)}</div>
        <div class="all-meta"><span class="mpill" style="background:${bg};color:${fg};font-size:10px;padding:1px 7px">${esc(t.materia)}</span> · ${fmtFull(t.nextReview)}</div>
      </div>
      <span class="bdge" style="background:${dbg};color:${dfg}">${dtxt}</span>
      <button class="cbtn" onclick="openEditModal('${t.id}')">Editar</button>
      <button class="cbtn" onclick="toggleActive('${t.id}')">${t.active ? 'Pausar' : 'Activar'}</button>
      <button class="cbtn del" onclick="delTema('${t.id}')">✕</button>
    </div>`
  }).join('')
}

function renderFilters() {
  const mats = [...new Set(temas.map(t => t.materia))]
  document.getElementById('filters').innerHTML =
    `<button class="fpill ${filt === 'todos' ? 'active' : ''}" onclick="setFilt('todos',this)">todos</button>` +
    mats.map(m => `<button class="fpill ${filt === m ? 'active' : ''}" onclick="setFilt(this.dataset.m,this)" data-m="${esc(m)}">${esc(m)}</button>`).join('')
}

function setFilt(s, btn) {
  filt = s
  document.querySelectorAll('.fpill').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  renderAll()
}

function renderMats() {
  const mats = [...new Set(temas.map(t => t.materia))]
  document.getElementById('mat-list').innerHTML = mats.map(m => `<option value="${esc(m)}">`).join('')
}
