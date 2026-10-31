/**
 * Mathematical and astronomical utilities for Mars planetary navigation.
 * Mars mean volumetric radius = 3389.5 km
 */
export const MARS_RADIUS_KM = 3389.5;

/**
 * Calculates Great-Circle distance across Mars surface using Haversine formula.
 */
export function calculateMarsDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return MARS_RADIUS_KM * c;
}

/**
 * Formats coordinates into standard planetary scientific notation.
 * e.g. "18.38° N, 77.58° E"
 */
export function formatMarsCoordinate(lat: number, lng: number): string {
  // Normalize longitude to -180 .. 180
  let normLng = lng;
  while (normLng > 180) normLng -= 360;
  while (normLng < -180) normLng += 360;

  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = normLng >= 0 ? 'E' : 'W';

  return `${Math.abs(lat).toFixed(2)}° ${latDir}, ${Math.abs(normLng).toFixed(2)}° ${lngDir}`;
}

/**
 * Formats 0-360 positive East planetocentric longitude commonly used by USGS/NASA.
 */
export function formatPlanetocentricLon(lng: number): string {
  let lon360 = lng % 360;
  if (lon360 < 0) lon360 += 360;
  return `${lon360.toFixed(2)}° E (Planetocentric)`;
}

/**
 * Formats elevation with sign and unit.
 */
export function formatElevation(meters?: number): string {
  if (meters === undefined || isNaN(meters)) return 'Uncalibrated datum';
  const prefix = meters > 0 ? '+' : '';
  return `${prefix}${meters.toLocaleString()} m (MOLA datum)`;
}

/**
 * Estimates nominal rover drive duration in Martian Sols.
 * Based on nominal Perseverance/Curiosity drive rate of ~120 m/sol sustained.
 */
export function estimateRoverSolTransit(distanceKm: number, elevationDeltaMeters = 0): {
  sols: number;
  difficulty: 'Low' | 'Moderate' | 'High' | 'Severe';
} {
  if (distanceKm <= 0) {
    return { sols: 0, difficulty: 'Low' };
  }

  // Base traverse rate: ~0.12 km / sol (120 meters per operational sol)
  const baseRateKmPerSol = 0.12;
  const slopeRatio = Math.abs(elevationDeltaMeters) / (distanceKm * 1000);

  let difficultyFactor = 1.0;
  let difficulty: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';

  if (slopeRatio > 0.15 || distanceKm > 500) {
    difficulty = 'Severe';
    difficultyFactor = 2.4;
  } else if (slopeRatio > 0.08 || distanceKm > 100) {
    difficulty = 'High';
    difficultyFactor = 1.7;
  } else if (slopeRatio > 0.03 || distanceKm > 20) {
    difficulty = 'Moderate';
    difficultyFactor = 1.3;
  }

  const sols = Math.ceil((distanceKm / baseRateKmPerSol) * difficultyFactor);
  return { sols, difficulty };
}

/**
 * Approximate Mars Sol (MY 38 approximate reference)
 */
export function getMarsMissionTelemetry(): {
  currentSol: number;
  solarLongLs: string;
  subSolarLat: string;
  utcString: string;
} {
  const now = new Date();
  // Simplified calculation for mission display
  const daysSinceEpoch = (now.getTime() - new Date('2021-02-18T20:55:00Z').getTime()) / (1000 * 60 * 60 * 24);
  const solPerseverance = Math.floor(daysSinceEpoch * (24 / 24.65979));

  return {
    currentSol: solPerseverance,
    solarLongLs: '142.4° (Early Autumn)',
    subSolarLat: '8.2° S',
    utcString: now.toUTCString().replace('GMT', 'UTC')
  };
}
