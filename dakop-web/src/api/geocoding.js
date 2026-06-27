const NOMINATIM = 'https://nominatim.openstreetmap.org'
const HEADERS   = { 'Accept-Language': 'en', 'User-Agent': 'Dakop/1.0' }

/**
 * Given a lat/lng, return the nearest address from OpenStreetMap.
 * The `address.suburb` field usually contains the barangay name in PH.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const res  = await fetch(
      `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: HEADERS }
    )
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Given a place name (e.g. "Agdao, Davao City, Philippines"),
 * return { lat, lng } of its centre so we can fly the map there.
 */
export async function forwardGeocode(query) {
  try {
    const res  = await fetch(
      `${NOMINATIM}/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: HEADERS }
    )
    const data = await res.json()
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

/**
 * Try to extract the barangay name from a Nominatim reverse-geocode result.
 * OpenStreetMap uses different fields across areas; this checks the most common ones.
 */
export function extractBarangay(geocodeResult) {
  if (!geocodeResult?.address) return null
  const a = geocodeResult.address
  // In Philippine context, barangay usually appears in suburb or quarter
  return a.suburb ?? a.quarter ?? a.village ?? a.neighbourhood ?? null
}

/**
 * Search for landmarks / places biased to the Mindanao/Davao area.
 * Returns a raw Nominatim result array (each item has .lat, .lon, .display_name, .address).
 */
export async function searchPlaces(query) {
  try {
    // bounded=1 restricts results strictly to the Davao City bounding box
    const res = await fetch(
      `${NOMINATIM}/search?format=json&q=${encodeURIComponent(query)}&limit=7&addressdetails=1&countrycodes=ph&viewbox=125.20,7.45,125.70,6.90&bounded=1`,
      { headers: HEADERS }
    )
    return await res.json()
  } catch {
    return []
  }
}

/**
 * Fuzzy-match a geocoded name against our barangay list.
 * Returns the best-matching barangay object, or null if no good match.
 */
export function matchBarangay(geocodedName, barangayList) {
  if (!geocodedName || !barangayList.length) return null

  const needle = geocodedName.toLowerCase().trim()

  // Exact match first
  const exact = barangayList.find(b => b.name.toLowerCase() === needle)
  if (exact) return exact

  // Partial / starts-with match
  const partial = barangayList.find(
    b => b.name.toLowerCase().includes(needle) || needle.includes(b.name.toLowerCase())
  )
  return partial ?? null
}
