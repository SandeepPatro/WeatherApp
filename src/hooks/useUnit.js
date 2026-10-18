import { useState } from 'react'

const KEY = 'dynamicweather.unit'

function readUnit() {
  try {
    return localStorage.getItem(KEY) === 'F' ? 'F' : 'C'
  } catch {
    return 'C'
  }
}

export function useUnit() {
  const [unit, setUnitState] = useState(readUnit)
  const setUnit = (next) => {
    setUnitState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // storage unavailable (private mode) — keep the in-memory value
    }
  }
  return [unit, setUnit]
}
