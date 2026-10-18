import { useEffect, useState } from 'react'

// Random full-screen flashes every 3–10 s while a thunderstorm is active.
export default function Lightning({ active }) {
  const [flash, setFlash] = useState(0)

  useEffect(() => {
    if (!active) return
    let id
    const schedule = () => {
      id = setTimeout(() => {
        setFlash((f) => f + 1)
        schedule()
      }, 3000 + Math.random() * 7000)
    }
    schedule()
    return () => clearTimeout(id)
  }, [active])

  if (!active) return null
  return <div key={flash} className={flash ? 'lightning flash' : 'lightning'} aria-hidden="true" />
}
