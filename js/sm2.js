// SM-2 mejorado: q=0 olvidé, q=1 flojo, q=2 bien
//
// Cambios vs SM-2 clásico:
//  · Ramp-up gradual (1, 2, 4, 7, ...) en lugar del salto 1→6
//  · "Flojo" produce intervalos intermedios reales (no solo afecta EF)
//  · "Olvidé" no resetea de cero si la card ya estaba dominada
//  · EF acotado a [1.3, 3.0]
//  · Intervalo máximo 365 días

function sm2(t, q) {
  let { interval, repetitions, ef } = t

  if (q === 0) {
    // Olvidé — lapsa pero conserva contexto
    interval    = 1
    repetitions = repetitions > 2 ? 2 : 0
    ef          = Math.max(1.3, ef - 0.20)
  } else {
    // Ajuste de EF
    ef = q === 1
      ? Math.max(1.3, ef - 0.15)   // Flojo
      : Math.min(3.0, ef + 0.10)   // Bien

    interval = calcInterval(interval, ef, repetitions, q)
    repetitions++
  }

  interval = Math.min(365, Math.max(1, interval))

  const next = new Date()
  next.setDate(next.getDate() + interval)
  return { interval, repetitions, ef: Math.round(ef * 100) / 100, nextReview: fmt(next) }
}

// Devuelve el intervalo (en días) sin mutar
function calcInterval(curInt, ef, rep, q) {
  // Tabla de ramp-up para los primeros pasos (suaviza el salto)
  // [Flojo, Bien]
  const tabla = [
    [1, 2],   // rep 0 → 1 día / 2 días
    [2, 4],   // rep 1 → 2 días / 4 días
    [4, 7],   // rep 2 → 4 días / 7 días
  ]
  if (rep < tabla.length) return tabla[rep][q - 1]

  // De rep ≥ 3: crecimiento exponencial
  const mult = q === 1 ? 1.3 : ef
  return Math.round(curInt * mult)
}

// Previsualiza el intervalo que resultaría de cada calificación (sin mutar)
function previewSm2(t, q) {
  if (q === 0) return 1
  return calcInterval(t.interval, t.ef, t.repetitions, q)
}
