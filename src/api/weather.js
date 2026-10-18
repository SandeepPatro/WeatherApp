const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'weather_code',
  'cloud_cover',
  'precipitation',
  'wind_speed_10m',
  'is_day',
].join(',')

// Open-Meteo returns local wall-clock strings like "2026-10-18T07:12" when
// timezone=auto; convert them to UTC milliseconds using the location's offset.
function localIsoToUtc(iso, offsetSeconds) {
  if (!iso) return null
  const t = Date.parse(`${iso}Z`)
  return Number.isNaN(t) ? null : t - offsetSeconds * 1000
}

export async function fetchWeather(lat, lon, signal) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: CURRENT_FIELDS,
    daily: 'sunrise,sunset',
    timezone: 'auto',
    forecast_days: '1',
  })
  const res = await fetch(`${FORECAST_URL}?${params}`, { signal })
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`)
  const d = await res.json()
  const offset = d.utc_offset_seconds ?? 0

  return {
    timezone: d.timezone,
    utcOffsetSeconds: offset,
    temperature: d.current.temperature_2m,
    feelsLike: d.current.apparent_temperature,
    humidity: d.current.relative_humidity_2m,
    weatherCode: d.current.weather_code,
    cloudCover: d.current.cloud_cover,
    precipitation: d.current.precipitation,
    windSpeed: d.current.wind_speed_10m,
    isDay: d.current.is_day === 1,
    sunrise: localIsoToUtc(d.daily?.sunrise?.[0], offset),
    sunset: localIsoToUtc(d.daily?.sunset?.[0], offset),
    fetchedAt: Date.now(),
  }
}
