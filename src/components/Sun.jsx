export default function Sun({ x, y, color, opacity }) {
  return (
    <div
      className="sun"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        opacity,
        background: `radial-gradient(circle, #fffdf3 0%, ${color} 62%)`,
        boxShadow: `0 0 50px 14px ${color}, 0 0 140px 50px ${color.replace(')', ' / 0.35)')}`,
      }}
    />
  )
}
