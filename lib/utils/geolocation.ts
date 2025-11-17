/**
 * Geolocation Utility for Netanya Neighborhoods
 * Maps user's GPS coordinates to nearest neighborhood
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

// Approximate center coordinates for each Netanya neighborhood
// Source: Google Maps estimates
const NEIGHBORHOOD_CENTERS: Record<string, Coordinates> = {
  tsafon: { latitude: 32.3407, longitude: 34.8594 }, // North Netanya
  merkaz: { latitude: 32.3327, longitude: 34.8533 }, // Center Netanya
  darom: { latitude: 32.2781, longitude: 34.8533 }, // South Netanya
  'mizrah-hair': { latitude: 32.3213, longitude: 34.8681 }, // East Netanya
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Find nearest neighborhood based on GPS coordinates
 */
function findNearestNeighborhood(userCoords: Coordinates): string {
  let nearestSlug = 'merkaz' // Default to center
  let minDistance = Infinity

  for (const [slug, coords] of Object.entries(NEIGHBORHOOD_CENTERS)) {
    const distance = calculateDistance(userCoords, coords)
    if (distance < minDistance) {
      minDistance = distance
      nearestSlug = slug
    }
  }

  return nearestSlug
}

/**
 * Get user's location and return nearest neighborhood slug
 * Returns Promise<string | null>
 */
export async function detectNeighborhood(): Promise<string | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000, // 10 seconds
        maximumAge: 300000, // 5 minutes cache
      })
    })

    const userCoords: Coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }

    // Check if user is actually in Netanya area
    // Netanya bounding box: roughly 32.27-32.35 lat, 34.84-34.88 lon
    if (
      userCoords.latitude < 32.25 ||
      userCoords.latitude > 32.37 ||
      userCoords.longitude < 34.82 ||
      userCoords.longitude > 34.90
    ) {
      // User is not in Netanya, return null
      return null
    }

    return findNearestNeighborhood(userCoords)
  } catch (error) {
    // User denied permission or error occurred - this is expected behavior, fail silently
    return null
  }
}

/**
 * Check if geolocation is supported
 */
export function isGeolocationSupported(): boolean {
  return typeof window !== 'undefined' && 'geolocation' in navigator
}
