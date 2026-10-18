import { useEffect, useMemo, useState } from 'react'
import { DAY, HOUR, MINUTE } from '../lib/time.js'

// Returns "now" as a UTC timestamp that ticks every second. With the debug
// ?time=HH:MM param it starts at that wall-clock time in the selected
// location, and ?speed=N makes it run N times faster.
export function useLocationClock({ time, speed }, utcOffsetSeconds) {
  const [start] = useState(() => Date.now())
  const [real, setReal] = useState(start)

  useEffect(() => {
    const id = setInterval(() => setReal(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const anchor = useMemo(() => {
    if (!time || utcOffsetSeconds == null) return start
    const offset = utcOffsetSeconds * 1000
    const dayStart = Math.floor((start + offset) / DAY) * DAY
    return dayStart + time.h * HOUR + time.m * MINUTE - offset
  }, [time, utcOffsetSeconds, start])

  return anchor + (real - start) * speed
}
