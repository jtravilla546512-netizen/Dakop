import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import DakopMap from '../components/map/DakopMap'
import MapSearchBar from '../components/map/MapSearchBar'
import ReportCard from '../components/reports/ReportCard'
import ReportForm from '../components/reports/ReportForm'
import FilterBar from '../components/reports/FilterBar'

const POLL_INTERVAL = 30_000

export default function HomePage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [reports, setReports] = useState([])
  // Only type filter remains — location filters removed
  const [filters, setFilters] = useState({ type: '' })

  // ── Form / pin state ──────────────────────────────────────────────────────
  const [showForm,      setShowForm]      = useState(false)
  const [pendingPin,    setPendingPin]    = useState(null)
  const [waitingForPin, setWaitingForPin] = useState(false)
  const [flyToPosition, setFlyToPosition] = useState(null)
  const [prefillData,   setPrefillData]   = useState(null)
  const [sidebarOpen,   setSidebarOpen]   = useState(false)

  const intervalRef = useRef(null)

  // ── Fetch / poll reports ─────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    const params = {}
    if (filters.type) params.type = filters.type
    try {
      const res = await api.get('/reports', { params })
      setReports(res.data.data)
    } catch { /* silent */ }
  }, [filters])

  useEffect(() => {
    fetchReports()
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(fetchReports, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [fetchReports])

  // ── "Report Checkpoint" button ────────────────────────────────────────────
  // Fix 1: only this one button exists; guests are redirected to login here
  function handleReportButton() {
    if (!user) { navigate('/login'); return }
    setShowForm(true)
    setWaitingForPin(true)
    setSidebarOpen(false)
  }

  // ── Map click ─────────────────────────────────────────────────────────────
  // Fix 5: guests clicking the map do nothing — only the Report button redirects
  function handleMapClick(latlng) {
    if (!user) return  // silently ignore — no redirect

    setPendingPin(latlng)
    setWaitingForPin(false)
    if (!showForm) setShowForm(true)
  }

  // ── Landmark search result selected ──────────────────────────────────────
  function handlePlaceSelect({ lat, lng, placeName, suburb, city }) {
    if (!user) { navigate('/login'); return }
    const pos = { lat, lng }
    setFlyToPosition({ ...pos, zoom: 17 })
    setPendingPin(pos)
    setPrefillData({ ...pos, placeName, suburb, city })
    setShowForm(true)
    setWaitingForPin(false)
    setSidebarOpen(true)
  }

  // ── "Move pin" from form ──────────────────────────────────────────────────
  function handleRequestPin() {
    setWaitingForPin(true)
    setSidebarOpen(false)
  }

  // ── Barangay selected in form → fly map there ────────────────────────────
  function handleBarangaySelect(position) {
    setFlyToPosition(position)
  }

  // ── Report card clicked → zoom map to that report ─────────────────────────
  // Fix 3: clicking a card flies the map to that location
  function handleCardFlyTo(position) {
    setFlyToPosition(position)
    setSidebarOpen(false)  // on mobile, hide sidebar to show the map
  }

  // ── Close form ────────────────────────────────────────────────────────────
  function handleCloseForm() {
    setShowForm(false)
    setPendingPin(null)
    setPrefillData(null)
    setWaitingForPin(false)
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

      {/* ── MAP ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <DakopMap
          reports={reports}
          pendingPin={pendingPin}
          flyToPosition={flyToPosition}
          waitingForPin={waitingForPin}
          onMapClick={handleMapClick}
        />

        {/* Landmark / barangay search bar — floats over the map */}
        <MapSearchBar onPlaceSelect={handlePlaceSelect} />

        {/* Mobile: toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="absolute top-3 right-3 z-10 lg:hidden bg-white border border-gray-200 shadow rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700"
        >
          {sidebarOpen ? 'Show map' : `Feed (${reports.length})`}
        </button>
      </div>

      {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────────── */}
      <aside
        className={`
          ${sidebarOpen ? 'flex' : 'hidden'} lg:flex
          flex-col w-full lg:w-80 xl:w-96 bg-white
          border-t lg:border-t-0 lg:border-l border-gray-200
          absolute bottom-0 left-0 right-0 h-[60vh]
          lg:static lg:h-auto overflow-hidden z-20
        `}
      >
        {/* Report form replaces the feed when open */}
        {showForm ? (
          <ReportForm
            latlng={pendingPin}
            prefillData={prefillData}
            onClose={handleCloseForm}
            onSubmitted={fetchReports}
            onRequestPin={handleRequestPin}
            onBarangaySelect={handleBarangaySelect}
          />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Fix 2: type-only filter */}
            <FilterBar filters={filters} onChange={setFilters} />

            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Active reports
                </h2>
                <span className="text-xs text-gray-400">{reports.length} found</span>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm">No active checkpoints reported</p>
                  <p className="text-xs mt-1">
                    {user
                      ? 'Use the search bar or click the map to report one.'
                      : <><a href="/login" className="text-blue-600 underline">Log in</a> to report one.</>
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map(r => (
                    <ReportCard
                      key={r.id}
                      report={r}
                      onVote={fetchReports}
                      onFlyTo={handleCardFlyTo}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fix 1: single Report Checkpoint button — always at the bottom of the sidebar */}
        {!showForm && (
          <div className="px-4 py-3 border-t border-gray-100 shrink-0">
            <button
              onClick={handleReportButton}
              className="w-full flex items-center justify-center gap-2
                bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold
                py-2.5 rounded-xl transition-colors shadow"
            >
              <span>＋</span> Report Checkpoint
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
