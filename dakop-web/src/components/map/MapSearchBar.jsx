import { useEffect, useRef, useState } from 'react'
import { searchPlaces, extractBarangay } from '../../api/geocoding'

export default function MapSearchBar({ onPlaceSelect }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open,    setOpen]    = useState(false)
  const timerRef   = useRef(null)
  const wrapperRef = useRef(null)

  // Debounced search — fires 400 ms after the user stops typing
  useEffect(() => {
    clearTimeout(timerRef.current)
    const q = query.trim()
    if (q.length < 2) { setResults([]); setOpen(false); return }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      const data = await searchPlaces(q)
      setResults(data)
      setOpen(data.length > 0)
      setLoading(false)
    }, 400)
    return () => clearTimeout(timerRef.current)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    function onMouseDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function handleSelect(place) {
    const name   = place.display_name.split(',')[0].trim()
    const addr   = place.address ?? {}
    const suburb = extractBarangay(place) ?? ''
    const city   = addr.city ?? addr.town ?? addr.municipality ?? ''

    setQuery(name)
    setOpen(false)

    onPlaceSelect({
      lat:       parseFloat(place.lat),
      lng:       parseFloat(place.lon),
      placeName: name,
      suburb,
      city,
    })
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div
      ref={wrapperRef}
      className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] w-full max-w-xs sm:max-w-sm px-3 pointer-events-none"
    >
      <div className="relative pointer-events-auto">
        {/* Search input */}
        <div className="flex items-center bg-white/95 backdrop-blur border border-gray-200 rounded-xl shadow-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          <span className="pl-3 text-gray-400 shrink-0 text-sm">
            {loading ? (
              <span className="inline-block animate-spin">↻</span>
            ) : (
              '🔍'
            )}
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            placeholder="Search landmark or barangay..."
            className="flex-1 text-sm bg-transparent px-2 py-2.5 focus:outline-none text-gray-800 placeholder-gray-400"
          />
          {query && (
            <button
              onMouseDown={e => { e.preventDefault(); handleClear() }}
              className="pr-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {open && results.length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-72 overflow-y-auto">
            {results.map((place, i) => {
              const name   = place.display_name.split(',')[0].trim()
              const addr   = place.address ?? {}
              const suburb = extractBarangay(place) ?? ''
              const city   = addr.city ?? addr.town ?? addr.municipality ?? ''
              const type   = addr.amenity ?? addr.shop ?? addr.building ?? ''

              return (
                <button
                  key={i}
                  onMouseDown={() => handleSelect(place)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {[suburb, city].filter(Boolean).join(', ')}
                    {type && ` · ${type}`}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
