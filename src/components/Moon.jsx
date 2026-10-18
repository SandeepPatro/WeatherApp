const R = 40

// Lit part of the disc: a semicircle on the lit side closed by an elliptical
// terminator whose width follows the phase (0 new, 0.25 first quarter,
// 0.5 full, 0.75 last quarter).
function litPath(phase) {
  const rx = Math.abs(Math.cos(phase * 2 * Math.PI)) * R
  const waxing = phase < 0.5
  const crescent = phase < 0.25 || phase > 0.75
  const outerSweep = waxing ? 1 : 0
  const termSweep = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0
  return `M50 ${50 - R} A${R} ${R} 0 0 ${outerSweep} 50 ${50 + R} A${rx} ${R} 0 0 ${termSweep} 50 ${50 - R}Z`
}

export default function Moon({ x, y, phase, opacity, southern }) {
  return (
    <div className="moon" style={{ left: `${x}%`, top: `${y}%`, opacity }}>
      <svg viewBox="0 0 100 100" style={southern ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
        <circle cx="50" cy="50" r={R} fill="rgb(150 160 190 / 0.18)" />
        <path d={litPath(phase)} fill="#f4f1e4" />
        <circle cx="38" cy="40" r="6" fill="rgb(0 0 0 / 0.06)" />
        <circle cx="60" cy="62" r="9" fill="rgb(0 0 0 / 0.05)" />
        <circle cx="62" cy="34" r="4" fill="rgb(0 0 0 / 0.05)" />
      </svg>
    </div>
  )
}
