// SuperMemo 2: q=0 olvidé, q=1 flojo, q=2 bien, q=3 perfecto
function sm2(t, q) {
  let {interval, repetitions, ef} = t
  if (q < 1) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0)      interval = 1
    else if (repetitions === 1) interval = 6
    else                        interval = Math.round(interval * ef)
    repetitions++
    ef = Math.max(1.3, ef + 0.1 - (3 - q) * (0.08 + (3 - q) * 0.02))
  }
  const next = new Date()
  next.setDate(next.getDate() + interval)
  return { interval, repetitions, ef: Math.round(ef * 100) / 100, nextReview: fmt(next) }
}
