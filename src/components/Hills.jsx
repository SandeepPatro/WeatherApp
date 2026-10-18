// Horizon silhouette the sun and moon set behind.
export default function Hills({ color }) {
  return (
    <svg className="hills" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
      <path
        className="hill-back"
        style={{ fill: color }}
        d="M0 95 C120 55 220 70 330 92 S560 60 690 80 S900 58 1000 72 V220 H0 Z"
      />
      <path
        className="hill-front"
        style={{ fill: color }}
        d="M0 140 C140 110 260 120 400 138 S640 108 780 126 S940 120 1000 112 V220 H0 Z"
      />
    </svg>
  )
}
