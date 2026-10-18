import { useCallback, useEffect, useMemo, useState } from 'react'
import Scene from './components/Scene.jsx'
import LocationSearch from './components/LocationSearch.jsx'
import WeatherCard from './components/WeatherCard.jsx'
import { reverseGeocode } from './api/geocoding.js'
import { useWeather } from './hooks/useWeather.js'
import { useLocationClock } from './hooks/useLocationClock.js'
import { useUnit } from './hooks/useUnit.js'
import { computeSkyState } from './lib/sky.js'
import { conditionKeyFromCode, getCondition, labelForCode } from './lib/weatherCodes.js'
import { readDebugParams } from './lib/time.js'

const DEBUG = readDebugParams()
const DEFAULT_LOCATION = { name: 'London', region: 'England, United Kingdom', lat: 51.5072, lon: -0.1276 }

export default function App() {
  const [location, setLocation] = useState(null)
  const [notice, setNotice] = useState('')
  const [unit, setUnit] = useUnit()
  const { data: weather, error } = useWeather(location)
  const now = useLocationClock(DEBUG, weather?.utcOffsetSeconds)

  const locate = useCallback(() => {
    const fallback = (msg) => {
      setLocation((l) => l ?? DEFAULT_LOCATION)
      setNotice(msg)
    }
    if (!navigator.geolocation) return fallback('Location is not available, so London is shown. Search for any city above.')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const loc = { lat: coords.latitude, lon: coords.longitude, name: 'Current location', region: '', isCurrent: true }
        try {
          Object.assign(loc, await reverseGeocode(loc.lat, loc.lon))
        } catch {
          // keep the generic name
        }
        setLocation(loc)
        setNotice('')
      },
      () => fallback('Location access was blocked, so London is shown. Search for any city above.'),
      { timeout: 10000, maximumAge: 10 * 60 * 1000 },
    )
  }, [])

  useEffect(() => {
    locate()
  }, [locate])

  const condition = getCondition(DEBUG.weather ?? (weather ? conditionKeyFromCode(weather.weatherCode) : 'clear'))
  const label = DEBUG.weather || !weather ? condition.label : labelForCode(weather.weatherCode)

  const lat = location?.lat ?? DEFAULT_LOCATION.lat
  const lon = location?.lon ?? DEFAULT_LOCATION.lon
  const precipitation = weather?.precipitation ?? 0
  const sky = useMemo(
    () => computeSkyState({ now, lat, lon, condition, precipitation }),
    // condition is rebuilt each render; its key identifies it
    [now, lat, lon, condition.key, precipitation],
  )

  return (
    <div className="app">
      <Scene sky={sky} />
      <main className="ui">
        <LocationSearch
          onSelect={(r) => {
            setLocation(r)
            setNotice('')
          }}
          onLocate={locate}
        />
        <div className="card-wrap">
          <WeatherCard
            location={location}
            weather={weather}
            error={error}
            now={now}
            unit={unit}
            onUnitChange={setUnit}
            condition={condition}
            label={label}
            isDay={sky.isDay}
            moonPhase={sky.moon.phase}
          />
          {notice && <p className="notice">{notice}</p>}
        </div>
      </main>
    </div>
  )
}
