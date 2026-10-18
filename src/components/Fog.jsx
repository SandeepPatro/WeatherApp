export default function Fog({ active }) {
  return (
    <div className="fog" style={{ opacity: active ? 1 : 0 }} aria-hidden="true">
      <div className="fog-layer fog-a" />
      <div className="fog-layer fog-b" />
    </div>
  )
}
