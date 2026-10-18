const SEARCH_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const REVERSE_URL = 'https://api-bdc.io/data/reverse-geocode-client'

// "GB" → "United Kingdom" (the API's own countryName is the long official form).
function countryName(code, fallback) {
  try {
    return (code && new Intl.DisplayNames(['en'], { type: 'region' }).of(code)) || fallback
  } catch {
    return fallback
  }
}

export async function searchLocations(query, signal) {
  const params = new URLSearchParams({ name: query, count: '6', language: 'en', format: 'json' })
  const res = await fetch(`${SEARCH_URL}?${params}`, { signal })
  if (!res.ok) throw new Error(`Search failed (${res.status})`)
  const d = await res.json()
  return (d.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    region: [r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
  }))
}

export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({ latitude: lat, longitude: lon, localityLanguage: 'en' })
  const res = await fetch(`${REVERSE_URL}?${params}`)
  if (!res.ok) throw new Error(`Reverse geocode failed (${res.status})`)
  const d = await res.json()
  return {
    name: d.city || d.locality || 'Current location',
    region: [d.principalSubdivision, countryName(d.countryCode, d.countryName)].filter(Boolean).join(', '),
  }
}
