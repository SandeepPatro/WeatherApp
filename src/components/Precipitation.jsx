import { useEffect, useRef } from 'react'

// Full-page rain or snow drawn on a canvas.
export default function Precipitation({ type, intensity }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!type || intensity <= 0) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let raf

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const area = Math.min(1.4, Math.max(0.35, (w * h) / (1440 * 900)))
    const count = Math.round((type === 'snow' ? 240 : 480) * intensity * area * (reduced ? 0.3 : 1))

    const make = (anywhere) =>
      type === 'snow'
        ? { x: Math.random() * w, y: anywhere ? Math.random() * h : -10, r: 1 + Math.random() * 2.6, vy: 0.5 + Math.random() * 1.2, phase: Math.random() * Math.PI * 2 }
        : { x: Math.random() * (w + 200) - 100, y: anywhere ? Math.random() * h : -30, len: 12 + Math.random() * 16, vy: 13 + Math.random() * 9 }
    const drops = Array.from({ length: count }, () => make(true))

    let last = performance.now()
    const tick = (t) => {
      const dt = Math.min(50, t - last) / 16.67
      last = t
      ctx.clearRect(0, 0, w, h)
      ctx.beginPath()
      if (type === 'snow') {
        ctx.fillStyle = 'rgb(255 255 255 / 0.85)'
        for (const d of drops) {
          d.phase += 0.02 * dt
          d.y += d.vy * dt
          d.x += Math.sin(d.phase) * 0.6 * dt
          if (d.y > h + 5) Object.assign(d, make(false))
          ctx.moveTo(d.x + d.r, d.y)
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        }
        ctx.fill()
      } else {
        const slant = 0.18
        ctx.strokeStyle = 'rgb(205 218 238 / 0.5)'
        ctx.lineWidth = 1.2
        for (const d of drops) {
          d.y += d.vy * dt
          d.x += d.vy * slant * dt
          if (d.y > h + d.len) Object.assign(d, make(false))
          ctx.moveTo(d.x, d.y)
          ctx.lineTo(d.x - d.len * slant, d.y - d.len)
        }
        ctx.stroke()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      ctx.clearRect(0, 0, w, h)
    }
  }, [type, intensity])

  return <canvas ref={ref} className="precip" aria-hidden="true" />
}
