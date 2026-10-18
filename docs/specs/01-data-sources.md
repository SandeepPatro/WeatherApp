# 01 — Data sources

All free, no API keys.

| Need | Source | Notes |
|---|---|---|
| Current weather | Open-Meteo Forecast `api.open-meteo.com/v1/forecast` | `current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,cloud_cover,precipitation,wind_speed_10m,is_day`. Free for non-commercial use. |
| Sunrise/sunset, timezone, UTC offset | Same call | `daily=sunrise,sunset&timezone=auto`. Local ISO strings are converted to UTC ms with `utc_offset_seconds` (`src/api/weather.js`). |
| City search | Open-Meteo Geocoding `geocoding-api.open-meteo.com/v1/search` | Debounced 300 ms, 6 results (`src/api/geocoding.js`). |
| Current location name | BigDataCloud reverse geocode `api-bdc.io/data/reverse-geocode-client` | Client-side free endpoint. Country name shortened via `Intl.DisplayNames`. |
| User position | `navigator.geolocation` | Falls back to London if denied/unavailable. |
| Sun & moon position, moon phase | `suncalc` npm library | Computed locally, no network. |

Weather refreshes every 10 minutes (`src/hooks/useWeather.js`).
