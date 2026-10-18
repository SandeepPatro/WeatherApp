import { useEffect, useState } from 'react'
import { fetchWeather } from '../api/weather.js'

const REFRESH_MS = 10 * 60 * 1000

export function useWeather(location) {
  const [state, setState] = useState({ data: null, error: null, loading: false })

  useEffect(() => {
    if (!location) return
    let controller

    const load = async () => {
      controller?.abort()
      controller = new AbortController()
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const data = await fetchWeather(location.lat, location.lon, controller.signal)
        setState({ data, error: null, loading: false })
      } catch (e) {
        if (e.name !== 'AbortError') setState((s) => ({ ...s, error: e.message, loading: false }))
      }
    }

    load()
    const id = setInterval(load, REFRESH_MS)
    return () => {
      clearInterval(id)
      controller?.abort()
    }
  }, [location])

  return state
}
