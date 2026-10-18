import SunCalc from 'suncalc'
import { DAY } from './time.js'

// Scene geometry, in % of the viewport. The sun rises at the left edge and
// sets at the right edge, following an arc that peaks at solar noon.
export const HORIZON = 78
const ARC = 58
const LEFT = 8
const SPAN = 84

const DEG = 180 / Math.PI

// Sky gradient keyframes [top, middle, bottom] by sun altitude in degrees.
const SKY_KEYS = [
  { alt: -18, c: ['#05070f', '#0b1026', '#141a38'] },
  { alt: -10, c: ['#0b1030', '#1c2350', '#2e3466'] },
  { alt: -5, c: ['#1a2050', '#4a3f78', '#a0587a'] },
  { alt: 0, c: ['#2c3d80', '#c0607a', '#f59a5c'] },
  { alt: 5, c: ['#3a68b0', '#e89a78', '#ffd08a'] },
  { alt: 12, c: ['#3a82d0', '#7fb6e8', '#cfe6f5'] },
  { alt: 35, c: ['#2a72c8', '#5aa2e6', '#a8d4f5'] },
]

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const toRgb = (c) => (typeof c === 'string' ? hexToRgb(c) : c)
const mix = (a, b, t) => {
  const ca = toRgb(a)
  const cb = toRgb(b)
  return ca.map((v, i) => Math.round(v + (cb[i] - v) * t))
}
const css = (c) => `rgb(${toRgb(c).join(' ')})`

function skyColors(sunAlt) {
  if (sunAlt <= SKY_KEYS[0].alt) return SKY_KEYS[0].c.map(toRgb)
  for (let i = 1; i < SKY_KEYS.length; i++) {
    const hi = SKY_KEYS[i]
    if (sunAlt <= hi.alt) {
      const lo = SKY_KEYS[i - 1]
      const t = (sunAlt - lo.alt) / (hi.alt - lo.alt)
      return lo.c.map((c, j) => mix(c, hi.c[j], t))
    }
  }
  return SKY_KEYS[SKY_KEYS.length - 1].c.map(toRgb)
}

const isValid = (d) => d instanceof Date && !Number.isNaN(d.getTime())

// Where are we between sunrise and sunset (day), or sunset and the next
// sunrise (night)? progress runs 0 → 1 across each half.
export function dayNightProgress(now, lat, lon, sunAlt) {
  const events = []
  for (const d of [-1, 0, 1]) {
    const t = SunCalc.getTimes(new Date(now + d * DAY), lat, lon)
    if (isValid(t.sunrise)) events.push({ type: 'rise', t: t.sunrise.getTime() })
    if (isValid(t.sunset)) events.push({ type: 'set', t: t.sunset.getTime() })
  }
  events.sort((a, b) => a.t - b.t)

  const prev = events.filter((e) => e.t <= now).pop()
  const next = events.find((e) => e.t > now)
  if (prev && next && prev.type !== next.type) {
    return { isDay: prev.type === 'rise', progress: (now - prev.t) / (next.t - prev.t) }
  }

  // Polar day/night: no sunrise/sunset nearby, so fall back to solar time.
  const solarHour = (((now / 3_600_000 + lon / 15) % 24) + 24) % 24
  const isDay = sunAlt > 0
  return isDay
    ? { isDay, progress: clamp((solarHour - 6) / 12, 0.05, 0.95) }
    : { isDay, progress: clamp(((solarHour - 18 + 24) % 24) / 12, 0.05, 0.95) }
}

export function computeSkyState({ now, lat, lon, condition, precipitation = 0 }) {
  const date = new Date(now)
  const sunAlt = SunCalc.getPosition(date, lat, lon).altitude * DEG
  const moonAlt = SunCalc.getMoonPosition(date, lat, lon).altitude * DEG
  const illum = SunCalc.getMoonIllumination(date)
  const { isDay, progress } = dayNightProgress(now, lat, lon, sunAlt)

  // Sun: on the arc by day; at night it keeps sinking off the right edge and
  // later comes back up from below the left edge.
  const pSun = isDay ? progress : progress < 0.5 ? 1 + progress * 0.5 : (progress - 1) * 0.5
  const sun = {
    x: LEFT + pSun * SPAN,
    y: HORIZON - Math.sin(pSun * Math.PI) * ARC,
    color: css(mix('#ff9a4d', '#fff4cf', smoothstep(0, 18, sunAlt))),
  }

  // Moon: always on the opposite side of the sun. It crosses left → right
  // during the night and is shown only when it is actually above the horizon.
  const moon = {
    x: isDay ? LEFT + SPAN - progress * SPAN : LEFT + progress * SPAN,
    y: HORIZON - Math.sin(progress * Math.PI) * ARC * (isDay ? 0.55 : 0.85),
    phase: illum.phase,
    fraction: illum.fraction,
    southern: lat < 0,
  }

  // Weather.
  const cloudLevel = condition.cloud
  const cover = condition.cover
  const coverFade = { none: 1, partial: 1, mostly: 0.55, full: 0 }[cover]

  sun.opacity = (isDay || sun.y < HORIZON + 12 ? 1 : 0) * coverFade
  const moonUp = illum.fraction < 0.03 ? 0 : smoothstep(-1, 3, moonAlt)
  moon.opacity = moonUp * (isDay ? 0.45 : 1) * coverFade

  // Sky colors, greyed out under heavy cloud.
  let colors = skyColors(sunAlt)
  const light = smoothstep(-8, 8, sunAlt)
  if (condition.key === 'thunder') {
    colors = colors.map((c) => mix(c, mix('#14161d', '#454b57', light), 0.7))
  } else if (condition.key === 'fog') {
    colors = colors.map((c) => mix(c, mix('#232733', '#b9c0ca', light), 0.5))
  } else if (cloudLevel > 0.5) {
    colors = colors.map((c) => mix(c, mix('#1d212b', '#8c95a3', light), cloudLevel * 0.55))
  }

  // Cloud tint: bright by day, warm at sunrise/sunset, dark blue-grey at night.
  const golden = smoothstep(-4, 2, sunAlt) * (1 - smoothstep(4, 12, sunAlt))
  let cloudTint = mix(mix('#2e3448', '#f4f6fa', light), '#f2b49c', golden * 0.6)
  if (condition.key === 'thunder') cloudTint = mix(cloudTint, '#3d424d', 0.65)
  else if (cover === 'full') cloudTint = mix(cloudTint, '#7d8592', 0.45)
  else if (cover === 'mostly') cloudTint = mix(cloudTint, '#a7aeb9', 0.3)

  const precip =
    condition.key === 'snow'
      ? { type: 'snow', intensity: clamp(0.5 + precipitation / 4, 0.5, 1) }
      : condition.key === 'drizzle'
        ? { type: 'rain', intensity: 0.3 }
        : condition.key === 'rain'
          ? { type: 'rain', intensity: clamp(0.55 + precipitation / 8, 0.55, 1) }
          : condition.key === 'thunder'
            ? { type: 'rain', intensity: 1 }
            : { type: null, intensity: 0 }

  return {
    isDay,
    progress,
    sunAlt,
    moonAlt,
    sun,
    moon,
    body: isDay || sun.y < HORIZON + 6 ? sun : moon, // the one the clouds should cover
    colors: colors.map(css),
    hill: css(mix(colors[2], '#04050a', 0.78)),
    starOpacity: smoothstep(-4, -12, sunAlt) * (1 - cloudLevel),
    cloudLevel,
    cloudTint: css(cloudTint),
    cover,
    deckOpacity: condition.deck,
    precip,
    fog: condition.key === 'fog',
    storm: condition.key === 'thunder',
  }
}
