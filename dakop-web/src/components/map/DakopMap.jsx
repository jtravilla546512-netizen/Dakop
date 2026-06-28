import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon   from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

// Coloured drop-pin icon for each checkpoint type
function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid white;transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
    iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28],
  })
}

// Pulsing blue icon for the pin being placed by the user
const PLACING_ICON = L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;border-radius:50%;
    background:#2563eb;border:3px solid white;
    box-shadow:0 0 0 4px rgba(37,99,235,.35)"></div>`,
  iconSize: [22, 22], iconAnchor: [11, 11],
})

const REPORT_ICONS = {
  hpg:       makeIcon('#dc2626'),
  lto:       makeIcon('#ea580c'),
  speed_gun: makeIcon('#2563eb'),
}

// Davao City centre
const DAVAO_CENTER = [7.1907, 125.4553]

// ── Internal: listens to map clicks and forwards them to parent ──────────────
function ClickHandler({ onMapClick, waitingForPin }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
    // Change cursor to crosshair while in pin-placement mode
    mousemove: (e) => {
      e.target._container.style.cursor = waitingForPin ? 'crosshair' : ''
    },
  })
  return null
}

// ── Internal: moves the map when flyToPosition changes ──────────────────────
function FlyToController({ position }) {
  const map = useMap()
  useEffect(() => {
    if (!position) return
    map.flyTo([position.lat, position.lng], position.zoom ?? 15, { duration: 1.2 })
  }, [position]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// ── Internal: keeps Leaflet in sync with its container size ──────────────────
// Fixes the blank/grey map on mobile, sidebar toggles, and orientation changes.
// Leaflet measures its container once on init; if the size changes (or was 0 at
// mount) it must be told to recalculate via invalidateSize().
function ResizeHandler() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()

    // Recalculate whenever the container's size changes
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)

    // And once shortly after mount, in case it started at 0 height
    const timer = setTimeout(() => map.invalidateSize(), 250)

    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [map])
  return null
}

// ── Public component ─────────────────────────────────────────────────────────
export default function DakopMap({
  reports        = [],    // active reports to display
  pendingPin     = null,  // { lat, lng } — the pin the user is placing right now
  flyToPosition  = null,  // { lat, lng, zoom } — fly here when it changes
  waitingForPin  = false, // true = crosshair mode, instruction overlay
  onMapClick,             // called with { lat, lng } on every map click
}) {
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={DAVAO_CENTER}
        zoom={13}
        className="w-full h-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onMapClick={onMapClick} waitingForPin={waitingForPin} />
        <FlyToController position={flyToPosition} />
        <ResizeHandler />

        {/* Active reports */}
        {reports.map(report => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={REPORT_ICONS[report.type] ?? REPORT_ICONS.hpg}
          >
            <Popup>
              <div className="text-sm min-w-[170px]">
                <p className="font-semibold text-gray-800 mb-0.5">
                  {report.type === 'speed_gun' ? 'Speed Gun' : (report.type?.toUpperCase() ?? 'Checkpoint')} Checkpoint
                </p>
                <p className="text-gray-500 text-xs">
                  {report.location?.barangay}, {report.location?.city}
                </p>
                {report.landmark && (
                  <p className="text-gray-600 text-xs mt-1">📍 {report.landmark}</p>
                )}
                {report.description && (
                  <p className="text-gray-600 mt-1 text-xs">{report.description}</p>
                )}
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>✓ {report.still_here_count} still here</span>
                  <span>✗ {report.no_longer_here_count} gone</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pin the user is currently placing (before submit) */}
        {pendingPin && (
          <>
            <Marker position={[pendingPin.lat, pendingPin.lng]} icon={PLACING_ICON} />
            <Circle
              center={[pendingPin.lat, pendingPin.lng]}
              radius={80}
              pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.1, weight: 1.5 }}
            />
          </>
        )}
      </MapContainer>

      {/* Overlay shown while waiting for user to click the map */}
      {waitingForPin && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center z-10 pointer-events-none px-4">
          <div className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-base">📍</span>
            Click on the map to mark the exact location
          </div>
        </div>
      )}
    </div>
  )
}
