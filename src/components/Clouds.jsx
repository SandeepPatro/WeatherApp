import { useMemo } from 'react'

export function CloudShape({ color, className, style }) {
  return (
    <svg viewBox="0 0 200 110" className={className} style={style} aria-hidden="true">
      <g style={{ fill: color }} className="cloud-fill">
        <circle cx="58" cy="68" r="32" />
        <circle cx="98" cy="48" r="40" />
        <circle cx="142" cy="62" r="32" />
        <circle cx="170" cy="78" r="22" />
        <rect x="28" y="66" width="160" height="36" rx="18" />
      </g>
    </svg>
  )
}

// How the cloud sits over the sun/moon for each cover level:
// partial → offset so roughly a third of the disc is hidden; mostly → most of
// it; full → a big cluster (the body itself is faded out underneath).
const COVER_STYLE = {
  partial: { width: 'clamp(130px, 15vw, 190px)', transform: 'translate(-18%, -30%)' },
  mostly: { width: 'clamp(200px, 24vw, 300px)', transform: 'translate(-48%, -58%)' },
  full: { width: 'clamp(280px, 34vw, 440px)', transform: 'translate(-50%, -62%)' },
}

export default function Clouds({ level, tint, cover, body, deckOpacity }) {
  const count = Math.round(level * 12)
  const drifting = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        top: 3 + Math.random() * 45,
        x: Math.random() * 85,
        width: 140 + Math.random() * 220,
        duration: 70 + Math.random() * 90,
        delay: -Math.random() * 160,
        opacity: 0.55 + Math.random() * 0.4,
      })),
    [],
  )

  return (
    <>
      <div className="cloud-deck" style={{ opacity: deckOpacity, '--tint': tint }} />
      {drifting.map((c, i) => (
        <div
          key={c.id}
          className="cloud-drift"
          style={{
            top: `${c.top}%`,
            '--x': `${c.x}%`,
            width: c.width,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            opacity: i < count ? c.opacity : 0,
          }}
        >
          <CloudShape color={tint} />
        </div>
      ))}
      {cover !== 'none' && (
        <div className="cloud-cover" style={{ left: `${body.x}%`, top: `${body.y}%`, opacity: body.opacity > 0 || cover === 'full' ? 1 : 0 }}>
          <CloudShape color={tint} style={COVER_STYLE[cover]} />
        </div>
      )}
    </>
  )
}
