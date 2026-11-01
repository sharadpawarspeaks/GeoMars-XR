/**
<<<<<<< HEAD
 * Mathematical and planetary geodesy utilities for Mars exploration.
 * Mars mean volumetric radius = 3389.5 km
 * Mars equatorial radius = 3396.2 km, polar radius = 3376.2 km
 */
export const MARS_RADIUS_KM = 3389.5;
export const MARS_EQUATORIAL_RADIUS_KM = 3396.2;
export const MARS_POLAR_RADIUS_KM = 3376.2;
export const MARS_SURFACE_GRAVITY = 3.72; // m/s²
=======
 * Mathematical and astronomical utilities for Mars planetary navigation.
 * Mars mean volumetric radius = 3389.5 km
 */
export const MARS_RADIUS_KM = 3389.5;
>>>>>>> origin/main

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
<<<<<<< HEAD
 * Intermediate point along great circle path at fraction t (0 <= t <= 1)
 */
export function intermediateMarsPoint(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  t: number
): { lat: number; lng: number } {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const f1 = toRad(lat1);
  const l1 = toRad(lon1);
  const f2 = toRad(lat2);
  const l2 = toRad(lon2);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((f2 - f1) / 2) ** 2 +
          Math.cos(f1) * Math.cos(f2) * Math.sin((l2 - l1) / 2) ** 2
      )
    );

  if (d < 1e-6) return { lat: lat1, lng: lon1 };

  const a = Math.sin((1 - t) * d) / Math.sin(d);
  const b = Math.sin(t * d) / Math.sin(d);

  const x = a * Math.cos(f1) * Math.cos(l1) + b * Math.cos(f2) * Math.cos(l2);
  const y = a * Math.cos(f1) * Math.sin(l1) + b * Math.cos(f2) * Math.sin(l2);
  const z = a * Math.sin(f1) + b * Math.sin(f2);

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lng = Math.atan2(y, x);

  return { lat: toDeg(lat), lng: toDeg(lng) };
}

/**
 * Standard MOLA areoid approximation for Martian elevation (meters).
 * Uses planetary spherical harmonic approximation anchored by known benchmarks:
 * - Olympus Mons (+21,287 m)
 * - Tharsis Rise (+8,000 to +14,000 m)
 * - Valles Marineris (-7,000 m)
 * - Hellas Basin (-7,152 m)
 * - Northern Lowlands / Utopia (-4,000 m)
 * - Jezero Crater (-2,560 m)
 * - Gale Crater (-4,450 m)
 */
export function estimateMolaElevation(lat: number, lng: number): number {
  // Normalize longitude to -180 .. 180
  let normLng = lng;
  while (normLng > 180) normLng -= 360;
  while (normLng < -180) normLng += 360;

  // Major geographic focal features
  const olympusDist = calculateMarsDistanceKm(lat, normLng, 18.65, -133.8);
  if (olympusDist < 350) {
    const flankFactor = Math.max(0, 1 - olympusDist / 350);
    return Math.round(1800 + flankFactor * 19487);
  }

  const vallesDist = calculateMarsDistanceKm(lat, normLng, -14.0, -59.2);
  if (vallesDist < 450) {
    const canyonFactor = Math.max(0, 1 - vallesDist / 450);
    return Math.round(2000 - canyonFactor * 9000);
  }

  const hellasDist = calculateMarsDistanceKm(lat, normLng, -42.4, 70.5);
  if (hellasDist < 1100) {
    const basinFactor = Math.max(0, 1 - hellasDist / 1100);
    return Math.round(-1500 - basinFactor * 5652);
  }

  const jezeroDist = calculateMarsDistanceKm(lat, normLng, 18.38, 77.58);
  if (jezeroDist < 150) {
    const jFactor = Math.max(0, 1 - jezeroDist / 150);
    return Math.round(-2100 - jFactor * 460);
  }

  const galeDist = calculateMarsDistanceKm(lat, normLng, -4.59, 137.44);
  if (galeDist < 180) {
    const gFactor = Math.max(0, 1 - galeDist / 180);
    return Math.round(-3800 - gFactor * 650);
  }

  // Crustal Dichotomy global baseline:
  // Southern hemisphere elevated (mean ~ +1 to +2 km), Northern Lowlands low (mean ~ -3.5 to -4.5 km)
  const dichotomy = Math.sin((lat * Math.PI) / 180);
  let baseElev = dichotomy < 0 ? 1500 * Math.abs(dichotomy) : -3500 * dichotomy;

  // Tharsis bulge broad swell (centered near equator, -100° lon)
  const tharsisDist = calculateMarsDistanceKm(lat, normLng, 0, -100);
  if (tharsisDist < 3000) {
    const tharsisSwell = Math.max(0, 1 - tharsisDist / 3000) * 6000;
    baseElev += tharsisSwell;
  }

  // Regional terrain undulations
  const wave =
    Math.sin((lat * Math.PI) / 45) * 450 +
    Math.cos((normLng * Math.PI) / 60) * 600 +
    Math.sin(((lat + normLng) * Math.PI) / 30) * 250;

  return Math.round(baseElev + wave);
}

/**
 * Calculates terrain slope angle in degrees between two elevation samples over a given distance.
 */
export function calculateSlopeDeg(elevDeltaMeters: number, distanceMeters: number): number {
  if (distanceMeters <= 0) return 0;
  const rad = Math.atan(Math.abs(elevDeltaMeters) / distanceMeters);
  return (rad * 180) / Math.PI;
}

/**
=======
>>>>>>> origin/main
 * Formats coordinates into standard planetary scientific notation.
 * e.g. "18.38° N, 77.58° E"
 */
export function formatMarsCoordinate(lat: number, lng: number): string {
<<<<<<< HEAD
=======
  // Normalize longitude to -180 .. 180
>>>>>>> origin/main
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
<<<<<<< HEAD
 * Base rate: ~0.12 km/sol (120 m/sol nominal for Perseverance/Curiosity)
 */
export function estimateRoverSolTransit(
  distanceKm: number,
  elevationDeltaMeters = 0
): {
=======
 * Based on nominal Perseverance/Curiosity drive rate of ~120 m/sol sustained.
 */
export function estimateRoverSolTransit(distanceKm: number, elevationDeltaMeters = 0): {
>>>>>>> origin/main
  sols: number;
  difficulty: 'Low' | 'Moderate' | 'High' | 'Severe';
} {
  if (distanceKm <= 0) {
    return { sols: 0, difficulty: 'Low' };
  }

<<<<<<< HEAD
=======
  // Base traverse rate: ~0.12 km / sol (120 meters per operational sol)
>>>>>>> origin/main
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
<<<<<<< HEAD
 * Approximate Mars Sol & Mission Telemetry
=======
 * Approximate Mars Sol (MY 38 approximate reference)
>>>>>>> origin/main
 */
export function getMarsMissionTelemetry(): {
  currentSol: number;
  solarLongLs: string;
  subSolarLat: string;
  utcString: string;
} {
  const now = new Date();
<<<<<<< HEAD
  const daysSinceEpoch =
    (now.getTime() - new Date('2021-02-18T20:55:00Z').getTime()) / (1000 * 60 * 60 * 24);
=======
  // Simplified calculation for mission display
  const daysSinceEpoch = (now.getTime() - new Date('2021-02-18T20:55:00Z').getTime()) / (1000 * 60 * 60 * 24);
>>>>>>> origin/main
  const solPerseverance = Math.floor(daysSinceEpoch * (24 / 24.65979));

  return {
    currentSol: solPerseverance,
    solarLongLs: '142.4° (Early Autumn)',
    subSolarLat: '8.2° S',
    utcString: now.toUTCString().replace('GMT', 'UTC')
  };
}
