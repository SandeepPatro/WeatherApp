# 02 — Sky engine

`src/lib/sky.js` → `computeSkyState({ now, lat, lon, condition, precipitation })` is a pure function that returns everything the scene draws.

## Day/night progress
- SunCalc sunrise/sunset for yesterday, today, tomorrow → previous and next event.
- Day: `progress` 0 at sunrise → 1 at sunset. Night: 0 at sunset → 1 at next sunrise.
- Polar day/night (no events): falls back to solar time.

## Positions (% of viewport, horizon at 78%)
- **Sun** rises at the **left** edge, sets at the **right** edge, on an arc peaking at solar noon. At night it sinks off-screen.
- **Moon** is always on the **opposite side** of the sun (left at sunset, crosses left → right overnight). Visible only when SunCalc says it is above the horizon and illumination ≥ 3%; faint (45%) by day. Phase is drawn from SunCalc illumination (mirrored in the southern hemisphere).

## Colors
- Gradient keyframes by sun altitude: night (−18°), twilight (−10°, −5°), sunset (0°), golden hour (5°), day (12°, 35°), interpolated.
- Greyed out under heavy cloud, darker in storms, hazy in fog.
- Colors are CSS `@property` variables with 2.5 s transitions, so changes (time ticking, switching city) fade smoothly.
- Stars fade in below −4° sun altitude and are hidden by cloud.
