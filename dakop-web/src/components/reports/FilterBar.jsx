export default function FilterBar({ filters, onChange }) {
  const hasFilter = !!filters.type

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter</h2>

      <select
        value={filters.type}
        onChange={e => onChange({ ...filters, type: e.target.value })}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All types</option>
        <option value="hpg">HPG only</option>
        <option value="lto">LTO only</option>
        <option value="speed_gun">Speed Gun only</option>
      </select>

      {hasFilter && (
        <button
          onClick={() => onChange({ ...filters, type: '' })}
          className="text-xs text-blue-600 hover:underline text-left mt-0.5"
        >
          Clear filter
        </button>
      )}
    </div>
  )
}
