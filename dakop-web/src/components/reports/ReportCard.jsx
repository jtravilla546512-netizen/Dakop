import { useState } from 'react'
import api from '../../api/axios'
import { useGuestToken } from '../../contexts/GuestTokenContext'

const TYPE_LABEL = { hpg: 'HPG', lto: 'LTO', speed_gun: 'Speed Gun' }
const TYPE_COLOR = {
  hpg:       'bg-red-100 text-red-700 border-red-200',
  lto:       'bg-orange-100 text-orange-700 border-orange-200',
  speed_gun: 'bg-blue-100 text-blue-700 border-blue-200',
}

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function ReportCard({ report, onVote, onFlyTo }) {
  const guestToken          = useGuestToken()
  const [voting,  setVoting] = useState(false)
  const [voted,   setVoted]  = useState(false)
  const [counts,  setCounts] = useState({
    still_here_count:     report.still_here_count,
    no_longer_here_count: report.no_longer_here_count,
  })

  async function handleVote(e, vote) {
    e.stopPropagation()
    if (voting || voted) return
    setVoting(true)
    try {
      const res = await api.post(`/reports/${report.id}/confirm`, {
        vote,
        guest_token: guestToken,
      })
      setCounts({
        still_here_count:     res.data.still_here_count,
        no_longer_here_count: res.data.no_longer_here_count,
      })
      setVoted(true)
      onVote?.()
    } catch (err) {
      if (err.response?.status === 409) setVoted(true)
    } finally {
      setVoting(false)
    }
  }

  const location    = report.location
  const locationStr = location ? `${location.barangay}, ${location.city}` : '—'

  return (
    <div
      onClick={() => onFlyTo?.({ lat: report.latitude, lng: report.longitude, zoom: 17 })}
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
    >
      {/* Type badge + time */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLOR[report.type]}`}>
          {TYPE_LABEL[report.type]}
        </span>
        <span className="text-xs text-gray-400">{timeAgo(report.created_at)}</span>
      </div>

      {/* Location */}
      <p className="text-sm font-medium text-gray-800 mb-1">{locationStr}</p>
      {location?.province && (
        <p className="text-xs text-gray-400 mb-2">{location.province}</p>
      )}

      {/* Landmark */}
      {report.landmark && (
        <p className="text-xs text-gray-500 mb-1">📍 {report.landmark}</p>
      )}

      {/* Description */}
      {report.description && (
        <p className="text-sm text-gray-600 mb-3 leading-snug">{report.description}</p>
      )}

      {/* Confirmation buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={e => handleVote(e, 'still_here')}
          disabled={voting || voted}
          className="flex-1 text-xs py-1.5 rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          ✓ Still here ({counts.still_here_count})
        </button>
        <button
          onClick={e => handleVote(e, 'no_longer_here')}
          disabled={voting || voted}
          className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          ✗ Gone ({counts.no_longer_here_count})
        </button>
      </div>

      {voted && (
        <p className="text-xs text-center text-gray-400 mt-2">Thanks for the update!</p>
      )}
    </div>
  )
}
