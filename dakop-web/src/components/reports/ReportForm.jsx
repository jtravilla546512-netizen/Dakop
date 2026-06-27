import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'
import { reverseGeocode, forwardGeocode, extractBarangay } from '../../api/geocoding'

const TYPE_OPTIONS = [
  { value: 'hpg',       label: 'HPG',       active: 'bg-red-600 text-white border-red-600' },
  { value: 'lto',       label: 'LTO',       active: 'bg-orange-500 text-white border-orange-500' },
  { value: 'speed_gun', label: 'Speed Gun', active: 'bg-blue-600 text-white border-blue-600' },
]

export default function ReportForm({
  latlng,           // { lat, lng } | null — pin position on map
  prefillData,      // { lat, lng, placeName, suburb, city } from landmark search
  onClose,
  onSubmitted,
  onRequestPin,     // called when user wants to (re)place the pin
  onBarangaySelect, // called with { lat, lng, zoom } to fly the map there
}) {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm] = useState({ type: 'hpg', description: '', landmark: '', barangay_id: '' })
  const [loc,  setLoc]  = useState({ region_id: '', province_id: '', city_id: '' })

  const [regions,   setRegions]   = useState([])
  const [provinces, setProvinces] = useState([])
  const [cities,    setCities]    = useState([])
  const [barangays, setBarangays] = useState([])

  const [geocoding, setGeocoding] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  // Tracks the lat/lng that prefillData last set so the latlng effect skips it
  const prefillAppliedRef = useRef(null)
  // Prevents the latlng effect from firing on first render (mount effect handles that)
  const isFirstRenderRef  = useRef(true)

  // ── Load regions once ────────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/regions').then(r => setRegions(r.data.data))
  }, [])

  // ── On mount: GPS auto-fill for logged-in users ──────────────────────────────
  useEffect(() => {
    if (!user) return
    if (latlng) {
      // Form opened after the user already clicked the map
      autoDetectLocation(latlng.lat, latlng.lng)
    } else if (navigator.geolocation) {
      // No pin yet — use the device GPS to pre-fill location dropdowns
      setGeocoding(true)
      navigator.geolocation.getCurrentPosition(
        pos => autoDetectLocation(pos.coords.latitude, pos.coords.longitude),
        ()  => setGeocoding(false),
        { timeout: 8000, maximumAge: 60000 }
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── When user moves / re-drops the pin on the map ───────────────────────────
  useEffect(() => {
    if (isFirstRenderRef.current) { isFirstRenderRef.current = false; return }
    if (!latlng) return
    // Skip when this pin was set by a search result (prefillData handles that)
    const pf = prefillAppliedRef.current
    if (pf && pf.lat === latlng.lat && pf.lng === latlng.lng) return
    autoDetectLocation(latlng.lat, latlng.lng)
  }, [latlng]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── When a landmark is selected from the search bar ─────────────────────────
  useEffect(() => {
    if (!prefillData) return
    prefillAppliedRef.current = { lat: prefillData.lat, lng: prefillData.lng }
    applyLocation(prefillData.city, prefillData.suburb, prefillData.placeName)
  }, [prefillData]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core: city+suburb name → IDs, then populate all dropdowns ────────────────
  async function applyLocation(city, suburb, landmarkName = null) {
    if (!city) return
    setGeocoding(true)
    try {
      const res      = await api.get('/locations/resolve', { params: { city, suburb } })
      const resolved = res.data
      if (!resolved) return

      // Fetch all three lists in parallel — 3 requests instead of O(regions×provinces×cities)
      const [provRes, cityRes, bgyRes] = await Promise.all([
        api.get(`/regions/${resolved.region.id}/provinces`),
        api.get(`/provinces/${resolved.province.id}/cities`),
        api.get(`/cities/${resolved.city.id}/barangays`),
      ])

      setProvinces(provRes.data.data)
      setCities(cityRes.data.data)
      setBarangays(bgyRes.data.data)
      setLoc({
        region_id:   String(resolved.region.id),
        province_id: String(resolved.province.id),
        city_id:     String(resolved.city.id),
      })

      const patch = {}
      if (resolved.barangay) patch.barangay_id = String(resolved.barangay.id)
      if (landmarkName)      patch.landmark     = landmarkName
      if (Object.keys(patch).length) setForm(f => ({ ...f, ...patch }))
    } catch {
      // City not in DB yet — leave dropdowns as-is
    } finally {
      setGeocoding(false)
    }
  }

  async function autoDetectLocation(lat, lng) {
    setGeocoding(true)
    try {
      const result = await reverseGeocode(lat, lng)
      if (!result?.address) return
      const a      = result.address
      const city   = a.city ?? a.town ?? a.municipality ?? ''
      const suburb = extractBarangay(result) ?? ''
      await applyLocation(city, suburb)
    } finally {
      setGeocoding(false)
    }
  }

  // ── Barangay dropdown — also flies map to selected barangay ─────────────────
  async function handleBarangayChange(barangayId) {
    setForm(f => ({ ...f, barangay_id: barangayId }))
    if (!barangayId) return
    const bgy  = barangays.find(b => String(b.id) === String(barangayId))
    const city = cities.find(c => String(c.id) === String(loc.city_id))
    if (!bgy || !city) return
    const pos = await forwardGeocode(`${bgy.name}, ${city.name}, Philippines`)
    if (pos) onBarangaySelect?.({ ...pos, zoom: 15 })
  }

  // ── Cascading clear helpers ──────────────────────────────────────────────────
  function changeRegion(id) {
    setLoc({ region_id: id, province_id: '', city_id: '' })
    setProvinces([]); setCities([]); setBarangays([])
    setForm(f => ({ ...f, barangay_id: '' }))
  }
  function changeProvince(id) {
    setLoc(l => ({ ...l, province_id: id, city_id: '' }))
    setCities([]); setBarangays([])
    setForm(f => ({ ...f, barangay_id: '' }))
  }
  function changeCity(id) {
    setLoc(l => ({ ...l, city_id: id }))
    setBarangays([])
    setForm(f => ({ ...f, barangay_id: '' }))
  }

  const selectedCity = cities.find(c => String(c.id) === String(loc.city_id))
  const cityHasData  = selectedCity?.has_data ?? true

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (!user)             { navigate('/login'); return }
    if (!latlng)           { setError('Please click on the map to mark the exact location.'); return }
    if (!form.barangay_id) { setError('Please select a barangay.'); return }

    setLoading(true); setError(null)
    try {
      await api.post('/reports', {
        ...form,
        latitude:  latlng.lat,
        longitude: latlng.lng,
      })
      onSubmitted?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sel = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">Report Checkpoint</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Step 1 — Type */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              1 — Type of checkpoint
            </p>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-colors ${
                    form.type === t.value ? t.active : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Location dropdowns */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              2 — Location
              {geocoding && (
                <span className="ml-2 text-blue-500 normal-case font-normal animate-pulse">
                  Detecting…
                </span>
              )}
            </p>
            <div className="flex flex-col gap-2">
              <select value={loc.region_id} onChange={e => changeRegion(e.target.value)} className={sel}>
                <option value="">Select region</option>
                {regions.map(r => (
                  <option key={r.id} value={r.id} disabled={!r.has_data}>
                    {r.has_data ? r.name : `${r.name} — Coming Soon`}
                  </option>
                ))}
              </select>

              <select value={loc.province_id} onChange={e => changeProvince(e.target.value)} disabled={!loc.region_id} className={sel}>
                <option value="">Select province</option>
                {provinces.map(p => (
                  <option key={p.id} value={p.id} disabled={!p.has_data}>
                    {p.has_data ? p.name : `${p.name} — Coming Soon`}
                  </option>
                ))}
              </select>

              <select value={loc.city_id} onChange={e => changeCity(e.target.value)} disabled={!loc.province_id} className={sel}>
                <option value="">Select city / municipality</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id} disabled={!c.has_data}>
                    {c.has_data ? c.name : `${c.name} — Coming Soon`}
                  </option>
                ))}
              </select>

              {loc.city_id && !cityHasData ? (
                <div className="text-sm border border-amber-200 rounded-lg px-3 py-2 bg-amber-50 text-amber-700">
                  🚧 Barangay data for <strong>{selectedCity?.name}</strong> is coming soon.
                </div>
              ) : (
                <select
                  value={form.barangay_id}
                  onChange={e => handleBarangayChange(e.target.value)}
                  disabled={!loc.city_id || barangays.length === 0}
                  className={sel}
                >
                  <option value="">Select barangay</option>
                  {barangays.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Step 3 — Exact pin on map */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              3 — Exact spot on map
            </p>
            {latlng ? (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span className="text-blue-500 text-xs font-bold shrink-0">GPS</span>
                <span className="text-xs text-blue-700 font-mono flex-1">
                  {latlng.lat.toFixed(6)}, {latlng.lng.toFixed(6)}
                </span>
                <button
                  type="button"
                  onClick={onRequestPin}
                  className="text-xs text-blue-600 hover:underline font-medium whitespace-nowrap"
                >
                  Move pin
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onRequestPin}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Tap here then click the map to drop a pin
              </button>
            )}
          </div>

          {/* Step 4 — Details */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              4 — Details (optional)
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={form.landmark}
                onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))}
                placeholder="Nearest landmark (e.g. near Gaisano Mall)"
                maxLength={255}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Additional info (e.g. 2 officers checking IDs)"
                rows={2}
                maxLength={500}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !latlng || (loc.city_id && !cityHasData)}
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting…' : 'Submit Report'}
          </button>

        </form>
      </div>

      {!user && (
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400">
            <a href="/login" className="text-blue-600 underline">Log in</a> to submit a report.
          </p>
        </div>
      )}
    </div>
  )
}
