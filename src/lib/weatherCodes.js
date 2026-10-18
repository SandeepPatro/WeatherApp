// Visual "condition" buckets that drive the sky effects.
// cloud: ambient cloud amount 0–1; cover: how much the sun/moon is hidden;
// deck: opacity of the overcast layer across the top of the sky.
const CONDITIONS = {
  clear: { label: 'Clear sky', dayIcon: '☀️', nightIcon: '🌙', cloud: 0, cover: 'none', deck: 0 },
  mostlyClear: { label: 'Mainly clear', dayIcon: '🌤️', nightIcon: '🌙', cloud: 0.15, cover: 'none', deck: 0 },
  partly: { label: 'Partly cloudy', dayIcon: '⛅', nightIcon: '☁️', cloud: 0.45, cover: 'partial', deck: 0 },
  overcast: { label: 'Overcast', dayIcon: '☁️', nightIcon: '☁️', cloud: 0.85, cover: 'mostly', deck: 0.5 },
  fog: { label: 'Fog', dayIcon: '🌫️', nightIcon: '🌫️', cloud: 0.5, cover: 'partial', deck: 0.3 },
  drizzle: { label: 'Drizzle', dayIcon: '🌦️', nightIcon: '🌧️', cloud: 0.9, cover: 'full', deck: 0.65 },
  rain: { label: 'Rain', dayIcon: '🌧️', nightIcon: '🌧️', cloud: 1, cover: 'full', deck: 0.8 },
  snow: { label: 'Snow', dayIcon: '🌨️', nightIcon: '🌨️', cloud: 1, cover: 'full', deck: 0.7 },
  thunder: { label: 'Thunderstorm', dayIcon: '⛈️', nightIcon: '⛈️', cloud: 1, cover: 'full', deck: 0.92 },
}

export const CONDITION_KEYS = Object.keys(CONDITIONS)

// WMO weather interpretation codes used by Open-Meteo.
const CODE_LABELS = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Violent showers',
  85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
}

export function conditionKeyFromCode(code) {
  if (code === 0) return 'clear'
  if (code === 1) return 'mostlyClear'
  if (code === 2) return 'partly'
  if (code === 3) return 'overcast'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'thunder'
  return 'clear'
}

export function getCondition(key) {
  return { key, ...(CONDITIONS[key] ?? CONDITIONS.clear) }
}

export function labelForCode(code) {
  return CODE_LABELS[code] ?? getCondition(conditionKeyFromCode(code)).label
}
