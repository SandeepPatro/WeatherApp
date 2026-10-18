# 03 — Weather effects

WMO `weather_code` → condition bucket (`src/lib/weatherCodes.js`):

| Condition | Codes | Sun/moon cover | Effects |
|---|---|---|---|
| clear | 0 | none | — |
| mostlyClear | 1 | none | a few drifting clouds |
| partly | 2 | **partial** — cloud slightly covers the sun | more clouds |
| overcast | 3 | mostly (sun at 55%) | cloud deck, grey sky |
| fog | 45, 48 | partial | drifting haze layers |
| drizzle | 51–57 | full (sun hidden) | light rain |
| rain | 61–67, 80–82 | full | rain over whole page, heavier with mm/h |
| snow | 71–77, 85–86 | full | falling snow |
| thunder | 95–99 | full | heavy rain + random lightning flashes (3–10 s) |

- The covering cloud follows whichever body is visible (sun by day / at the horizon, otherwise moon).
- Rain and snow are drawn on a full-page canvas (`Precipitation.jsx`); particle count scales with screen size and is reduced for `prefers-reduced-motion`.
- Cloud tint: white by day, warm at sunrise/sunset, dark blue-grey at night, dark grey in storms.
