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
  // On mobile the sheet starts open so the reports list is the first thing seen.
  // (Ignored on desktop, where the side panel is always visible.)
  const [sidebarOpen,   setSidebarOpen]   = useState(true)

  const [loadingReports, setLoadingReports] = useState(true)
  const intervalRef = useRef(null)

  // ── Fetch / poll reports ─────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    const params = {}
    if (filters.type) params.type = filters.type
    try {
      const res = await api.get('/reports', { params })
      setReports(res.data.data)
    } catch { /* silent */ }
    finally { setLoadingReports(false) }
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
    setShowForm(true)
    setSidebarOpen(true)  // bring the form into view on mobile (it lives in the bottom sheet)
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
    // Definite height (viewport minus the 3.5rem header) so flex children — and
    // the Leaflet map inside them — get real pixel heights on mobile too.
    // 100svh = "small viewport height": accounts for the mobile browser address bar.
    <div className="flex flex-col lg:flex-row h-[calc(100svh-3.5rem)] overflow-hidden relative">

      {/* ── MAP ─────────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        <DakopMap
          reports={reports}
          pendingPin={pendingPin}
          flyToPosition={flyToPosition}
          waitingForPin={waitingForPin}
          onMapClick={handleMapClick}
        />

        {/* Landmark / barangay search bar — floats over the map.
            Hidden on mobile while the report form is open so it doesn't overlap it. */}
        <div className={showForm ? 'hidden lg:block' : 'block'}>
          <MapSearchBar onPlaceSelect={handlePlaceSelect} />
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────────── */}
      <aside
        className={`
          ${sidebarOpen ? 'flex' : 'hidden'} lg:flex
          flex-col w-full lg:w-80 xl:w-96 bg-white
          border-t lg:border-t-0 lg:border-l border-gray-200
          absolute bottom-0 left-0 right-0 h-[70svh] rounded-t-2xl lg:rounded-none shadow-2xl lg:shadow-none
          lg:static lg:h-full overflow-hidden z-20
        `}
      >
        {/* Mobile grab handle — tap to minimize the sheet and reveal the map */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Minimize"
          className="lg:hidden shrink-0 w-full flex items-center justify-center pt-2.5 pb-2 border-b border-gray-100 active:bg-gray-50"
        >
          <span className="h-1.5 w-10 rounded-full bg-gray-300" />
        </button>

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
                <span className="text-xs text-gray-400">
                  {loadingReports ? '…' : `${reports.length} found`}
                </span>
              </div>

              {loadingReports ? (
                <div className="space-y-3">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-4 w-12 bg-gray-200 rounded-full" />
                        <div className="h-3 w-10 bg-gray-100 rounded" />
                      </div>
                      <div className="h-3.5 w-2/3 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-1/3 bg-gray-100 rounded mb-4" />
                      <div className="flex gap-2">
                        <div className="h-7 flex-1 bg-gray-100 rounded-lg" />
                        <div className="h-7 flex-1 bg-gray-100 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reports.length === 0 ? (
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

      {/* Collapsed peek bar — mobile only. Shown when the sheet is minimized;
          tap to bring the list (or the in-progress report) back up. */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden absolute bottom-0 left-0 right-0 z-30
            bg-white border-t border-gray-200 shadow-2xl rounded-t-2xl
            px-4 py-3 flex items-center justify-between active:bg-gray-50"
        >
          <span className="text-sm font-semibold text-gray-700">
            {showForm
              ? '✎ Continue your report'
              : `View ${reports.length} active report${reports.length === 1 ? '' : 's'}`}
          </span>
          <span className="text-gray-400 text-lg leading-none">⌃</span>
        </button>
      )}
    </div>
  )
}
