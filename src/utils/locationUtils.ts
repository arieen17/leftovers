/**
 * Location utility functions for distance calculations and coordinate operations
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 0.1) {
    return "< 0.1 mi";
  }
  return `${distance} mi`;
}

/**
 * Calculate the center point of multiple coordinates
 */
export function getCenterPoint(coordinates: Coordinates[]): Coordinates {
  if (coordinates.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  const sum = coordinates.reduce(
    (acc, coord) => ({
      latitude: acc.latitude + coord.latitude,
      longitude: acc.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: sum.latitude / coordinates.length,
    longitude: sum.longitude / coordinates.length,
  };
}

/**
 * Calculate the bounding box that encompasses all coordinates
 */
export function getBoundingBox(coordinates: Coordinates[]): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  if (coordinates.length === 0) {
    return { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 };
  }

  const lats = coordinates.map((coord) => coord.latitude);
  const lons = coordinates.map((coord) => coord.longitude);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
  };
}
