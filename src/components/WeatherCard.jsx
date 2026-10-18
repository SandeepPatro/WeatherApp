import { clockParts, formatInZone, moonPhaseName } from '../lib/time.js'

const toUnit = (c, unit) => Math.round(unit === 'F' ? (c * 9) / 5 + 32 : c)

export default function WeatherCard({ location, weather, error, now, unit, onUnitChange, condition, label, isDay, moonPhase }) {
  if (!location || (!weather && !error)) {
    return (
      <section className="card card-loading" aria-busy="true">
        <p>Finding your sky…</p>
      </section>
    )
  }

  if (!weather) {
    return (
      <section className="card">
        <h1 className="city">{location.name}</h1>
        <p className="error">Couldn't load the weather: {error}</p>
      </section>
    )
  }

  const zone = (opts) => formatInZone(now, weather.timezone, weather.utcOffsetSeconds, opts)
  const clock = clockParts(now, weather.timezone, weather.utcOffsetSeconds)
  const date = zone({ weekday: 'long', month: 'long', day: 'numeric' })
  const sunTime = (ms) => (ms ? formatInZone(ms, weather.timezone, weather.utcOffsetSeconds, { hour: 'numeric', minute: '2-digit' }) : '—')
  const wind = unit === 'F' ? `${Math.round(weather.windSpeed * 0.621371)} mph` : `${Math.round(weather.windSpeed)} km/h`

  return (
    <section className="card" aria-live="polite">
      <header className="card-head">
        <div>
          <h1 className="city">
            {location.isCurrent && <span className="pin" title="Your location">📍</span>}
            {location.name}
          </h1>
          {location.region && <p className="region">{location.region}</p>}
        </div>
        <div className="unit-toggle" role="group" aria-label="Temperature unit">
          {['C', 'F'].map((u) => (
            <button key={u} type="button" className={unit === u ? 'on' : ''} aria-pressed={unit === u} onClick={() => onUnitChange(u)}>
              °{u}
            </button>
          ))}
        </div>
      </header>

      <div className="clock">
        <span className="clock-main">{clock.hm}</span>
        <span className="clock-sec">:{clock.sec}</span>
        {clock.period && <span className="clock-period">{clock.period}</span>}
      </div>
      <p className="date">{date}</p>

      <div className="now">
        <span className="now-icon" aria-hidden="true">{isDay ? condition.dayIcon : condition.nightIcon}</span>
        <span className="now-temp">
          {toUnit(weather.temperature, unit)}
          <span className="deg">°{unit}</span>
        </span>
      </div>
      <p className="condition">{label}</p>

      <dl className="details">
        <div><dt>Feels like</dt><dd>{toUnit(weather.feelsLike, unit)}°</dd></div>
        <div><dt>Humidity</dt><dd>{weather.humidity}%</dd></div>
        <div><dt>Wind</dt><dd>{wind}</dd></div>
        <div><dt>Clouds</dt><dd>{weather.cloudCover}%</dd></div>
        <div><dt>Sunrise</dt><dd>{sunTime(weather.sunrise)}</dd></div>
        <div><dt>Sunset</dt><dd>{sunTime(weather.sunset)}</dd></div>
      </dl>
      <p className="moon-phase">🌙 {moonPhaseName(moonPhase)}</p>
      {error && <p className="error small">Refresh failed — showing last update.</p>}
    </section>
  )
}
