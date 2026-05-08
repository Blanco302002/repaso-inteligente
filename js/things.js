function renderThings() {
  const due         = temas.filter(t => t.active && t.nextReview <= today())
  const thingsEmail = cfg?.thingsEmail || ''

  // Campo de configuración del correo
  const configEl = document.getElementById('things-email-config')
  if (configEl) {
    configEl.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;max-width:440px">
        <input class="things-email-input" type="email" id="things-email-input"
          value="${esc(thingsEmail)}" placeholder="tu-correo@things.am">
        <button class="exp-btn go" onclick="saveThingsEmail()">Guardar</button>
      </div>
      <div style="font-size:11px;color:var(--ink3);margin-top:6px;font-family:var(--mono)">
        Things → Ajustes → Correo para Things — copiá esa dirección acá.
      </div>`
  }

  // Lista de tareas para enviar
  const listEl = document.getElementById('things-email-list')
  if (!listEl) return

  if (!thingsEmail) {
    listEl.innerHTML = `<div class="info-box warn">Guardá tu correo de Things arriba para poder enviar.</div>`
    return
  }
  if (!due.length) {
    listEl.innerHTML = `<div style="color:var(--ink3);font-family:var(--mono);font-size:13px">No hay temas pendientes para hoy.</div>`
    return
  }

  const rows = due.map(t => {
    const [bg, fg] = matColor(t.materia)
    const subject  = encodeURIComponent('📚 ' + t.nombre)
    const body     = encodeURIComponent(`Materia: ${t.materia}\nRepaso del ${today()}`)
    const mailto   = `mailto:${thingsEmail}?subject=${subject}&body=${body}`
    return `<div class="email-task-row">
      <span class="mpill" style="background:${bg};color:${fg}">${esc(t.materia)}</span>
      <span style="flex:1;font-size:14px;font-weight:500">${esc(t.nombre)}</span>
      <a href="${mailto}" class="exp-btn go" style="text-decoration:none">Enviar →</a>
    </div>`
  }).join('')

  listEl.innerHTML = `
    <div class="exp-row">
      <button class="exp-btn go" onclick="sendAllThingsEmails()">Enviar todos (${due.length}) →</button>
    </div>
    ${rows}`
}

function saveThingsEmail() {
  const email = document.getElementById('things-email-input').value.trim()
  cfg.thingsEmail = email
  localStorage.setItem(THINGS_EMAIL_KEY, email)
  renderThings()
  toast('Correo guardado')
}

function sendAllThingsEmails() {
  const due         = temas.filter(t => t.active && t.nextReview <= today())
  const thingsEmail = cfg?.thingsEmail || ''
  if (!thingsEmail) { toast('Configurá tu correo de Things primero'); return }
  if (!due.length)  { toast('No hay temas para hoy'); return }
  due.forEach(t => {
    const subject = encodeURIComponent('📚 ' + t.nombre)
    const body    = encodeURIComponent(`Materia: ${t.materia}\nRepaso del ${today()}`)
    window.open(`mailto:${thingsEmail}?subject=${subject}&body=${body}`)
  })
}
