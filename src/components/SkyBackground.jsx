import { useMemo } from 'react'

// Gradient layer + stars. Colors are CSS custom properties registered with
// @property, so the browser animates them smoothly between states.
export default function SkyBackground({ colors, starOpacity }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 70,
        size: Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1,
        delay: -Math.random() * 5,
        duration: 2.5 + Math.random() * 4,
      })),
    [],
  )

  return (
    <>
      <div className="sky" style={{ '--c1': colors[0], '--c2': colors[1], '--c3': colors[2] }} />
      <div className="stars" style={{ opacity: starOpacity }}>
        {stars.map((s) => (
          <span
            key={s.id}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>
    </>
  )
}
