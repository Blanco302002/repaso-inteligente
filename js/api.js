// ── Mapeo JS (camelCase) ↔ Supabase (snake_case) ──

function temaToDb(t, userId) {
  return {
    id:          t.id,
    user_id:     userId,
    nombre:      t.nombre,
    materia:     t.materia,
    ef:          t.ef,
    interval:    t.interval,
    repetitions: t.repetitions,
    next_review: t.nextReview,
    last_review: t.lastReview || null,
    active:      t.active
  }
}

function dbToTema(row) {
  return {
    id:          row.id,
    nombre:      row.nombre,
    materia:     row.materia,
    ef:          row.ef,
    interval:    row.interval,
    repetitions: row.repetitions,
    nextReview:  row.next_review,
    lastReview:  row.last_review,
    active:      row.active
  }
}

function historialToDb(h, userId) {
  return {
    id:       h.id,
    user_id:  userId,
    date:     h.date,
    tema_id:  h.temaId || null,
    nombre:   h.nombre,
    materia:  h.materia,
    quality:  h.quality,
    interval: h.interval
  }
}

function dbToHistorial(row) {
  return {
    id:       row.id,
    date:     row.date,
    temaId:   row.tema_id,
    nombre:   row.nombre,
    materia:  row.materia,
    quality:  row.quality,
    interval: row.interval
  }
}

// ── Lectura inicial ──

async function sbGet() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const [{ data: temasData, error: e1 }, { data: histData, error: e2 }] = await Promise.all([
    supabase.from('temas').select('*').eq('user_id', user.id),
    supabase.from('historial').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
  ])

  if (e1) throw new Error(e1.message)
  if (e2) throw new Error(e2.message)

  return {
    temas:     (temasData || []).map(dbToTema),
    historial: (histData  || []).map(dbToHistorial)
  }
}

// ── Persistencia ──

async function persist() {
  setSyncStatus('saving')
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    // Temas: delete + insert (sincronización completa, maneja bien los deletes)
    const { error: delErr } = await supabase.from('temas').delete().eq('user_id', user.id)
    if (delErr) throw new Error(delErr.message)
    if (temas.length > 0) {
      const { error: insErr } = await supabase.from('temas').insert(temas.map(t => temaToDb(t, user.id)))
      if (insErr) throw new Error(insErr.message)
    }

    // Historial: upsert por id (append-only, máx 500)
    const recortado = historial.slice(-500)
    if (recortado.length > 0) {
      const { error: histErr } = await supabase.from('historial').upsert(
        recortado.map(h => historialToDb(h, user.id)),
        { onConflict: 'id' }
      )
      if (histErr) throw new Error(histErr.message)
    }

    setSyncStatus('ok')
  } catch(e) {
    setSyncStatus('err')
    toast('No se pudo guardar — revisá la conexión')
    throw e
  }
}

function setSyncStatus(s) {
  const dot = document.getElementById('sync-dot')
  const lbl = document.getElementById('sync-label')
  if (!dot || !lbl) return
  dot.className = 'sync-dot ' + s
  lbl.textContent = s === 'ok' ? 'sincronizado' : s === 'saving' ? 'guardando...' : 'error al guardar'
}
