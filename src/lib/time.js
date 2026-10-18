import { CONDITION_KEYS } from './weatherCodes.js'

export const MINUTE = 60_000
export const HOUR = 3_600_000
export const DAY = 86_400_000

// Format a UTC timestamp in the location's timezone. Falls back to shifting by
// the raw UTC offset if the browser doesn't know the IANA zone name.
export function formatInZone(ms, timeZone, offsetSeconds, options) {
  try {
    return new Intl.DateTimeFormat(undefined, { ...options, timeZone }).format(ms)
  } catch {
    return new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' }).format(ms + offsetSeconds * 1000)
  }
}

// Clock split into "6:05", "07", "PM" so seconds can be styled separately.
export function clockParts(ms, timeZone, offsetSeconds) {
  const options = { hour: 'numeric', minute: '2-digit', second: '2-digit' }
  let parts
  try {
    parts = new Intl.DateTimeFormat(undefined, { ...options, timeZone }).formatToParts(ms)
  } catch {
    parts = new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' }).formatToParts(ms + offsetSeconds * 1000)
  }
  const get = (type) => parts.find((p) => p.type === type)?.value ?? ''
  return { hm: `${get('hour')}:${get('minute')}`, sec: get('second').padStart(2, '0'), period: get('dayPeriod') }
}

// Debug overrides: ?time=18:00&weather=rain&speed=60
export function readDebugParams() {
  const p = new URLSearchParams(window.location.search)
  const match = /^(\d{1,2}):(\d{2})$/.exec(p.get('time') ?? '')
  const time = match && Number(match[1]) < 24 && Number(match[2]) < 60
    ? { h: Number(match[1]), m: Number(match[2]) }
    : null
  const weather = CONDITION_KEYS.includes(p.get('weather')) ? p.get('weather') : null
  const speed = Math.max(1, Number(p.get('speed')) || 1)
  return { time, weather, speed }
}

export function moonPhaseName(phase) {
  if (phase < 0.03 || phase > 0.97) return 'New moon'
  if (phase < 0.22) return 'Waxing crescent'
  if (phase < 0.28) return 'First quarter'
  if (phase < 0.47) return 'Waxing gibbous'
  if (phase < 0.53) return 'Full moon'
  if (phase < 0.72) return 'Waning gibbous'
  if (phase < 0.78) return 'Last quarter'
  return 'Waning crescent'
}
