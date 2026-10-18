import { useEffect, useRef, useState } from 'react'
import { searchLocations } from '../api/geocoding.js'

export default function LocationSearch({ onSelect, onLocate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [status, setStatus] = useState('')
  const boxRef = useRef(null)

  // Debounced search as the user types.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setStatus('')
      return
    }
    const controller = new AbortController()
    const id = setTimeout(async () => {
      try {
        setStatus('Searching…')
        const found = await searchLocations(q, controller.signal)
        setResults(found)
        setActive(found.length ? 0 : -1)
        setStatus(found.length ? '' : 'No places found')
      } catch (e) {
        if (e.name !== 'AbortError') setStatus('Search unavailable, try again')
      }
    }, 300)
    return () => {
      clearTimeout(id)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    const onDown = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])

  const choose = (r) => {
    onSelect(r)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(results.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter' && results[active]) {
      choose(results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && (results.length > 0 || status)

  return (
    <div className="search" ref={boxRef}>
      <div className="search-row">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          placeholder="Search any city…"
          aria-label="Search location"
          aria-expanded={showList ? 'true' : 'false'}
          aria-controls="search-results"
          role="combobox"
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="locate-btn" onClick={onLocate} title="Use my location" aria-label="Use my location">
          📍
        </button>
      </div>
      {showList && (
        <ul className="search-results" id="search-results" role="listbox">
          {results.map((r, i) => (
            <li
              key={r.id}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(r)}
            >
              <span className="result-name">{r.name}</span>
              <span className="result-region">{r.region}</span>
            </li>
          ))}
          {status && <li className="search-status">{status}</li>}
        </ul>
      )}
    </div>
  )
}
