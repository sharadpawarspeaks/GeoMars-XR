import type {
  CandidateRoute,
  MarsHazardZone,
  RouteConstraintsConfig,
  RouteProfilePoint
} from '../types/mars';
import {
  calculateMarsDistanceKm,
  intermediateMarsPoint,
  estimateMolaElevation,
  calculateSlopeDeg,
  estimateLocalSlopeDeg
} from './marsMath';

/**
 * Simulated deterministic terrain hazard zones anchored near major Martian relief features.
 * Used strictly for educational route-planning simulations — NOT certified operational hazard maps.
 */
export const MARS_HAZARD_ZONES: MarsHazardZone[] = [
  {
    id: 'hz-olympus-scarp',
    name: 'Olympus Mons Basal Scarp',
    type: 'steep-scarp',
    lat: 18.2,
    lng: -130.5,
    radiusKm: 260,
    severity: 'Severe',
    description: 'Simulated peripheral cliff scarp (up to 8 km vertical drop) exceeding rover tip-over safety thresholds.',
    isSimulated: true
  },
  {
    id: 'hz-valles-rim',
    name: 'Melas Chasma Escarpment',
    type: 'steep-scarp',
    lat: -11.5,
    lng: -68.0,
    radiusKm: 290,
    severity: 'Severe',
    description: 'Simulated steep canyon drop-off and talus boulder aprons flanking central Valles Marineris.',
    isSimulated: true
  },
  {
    id: 'hz-syrtis-dunes',
    name: 'Syrtis Major Aeolian Dunes',
    type: 'aeolian-dunes',
    lat: 9.8,
    lng: 69.0,
    radiusKm: 210,
    severity: 'High',
    description: 'Simulated low-cohesion dark basaltic sand ripples posing wheel-slip and entrapment risk.',
    isSimulated: true
  },
  {
    id: 'hz-isidis-ejecta',
    name: 'Isidis Rim Boulder Ejecta',
    type: 'boulder-ejecta',
    lat: 14.2,
    lng: 86.5,
    radiusKm: 185,
    severity: 'Moderate',
    description: 'Simulated rough crater-ejecta blocks requiring autonomous hazard avoidance steering.',
    isSimulated: true
  },
  {
    id: 'hz-elysium-fractures',
    name: 'Cerberus Fossae Troughs',
    type: 'crater-rim',
    lat: 9.2,
    lng: 158.0,
    radiusKm: 220,
    severity: 'High',
    description: 'Simulated extensional tectonic fissures and blocky volcanic ridges east of Elysium.',
    isSimulated: true
  },
  {
    id: 'hz-arabia-dust',
    name: 'Arabia Terra Dust Mantle',
    type: 'thermal-dust',
    lat: 20.5,
    lng: 25.0,
    radiusKm: 320,
    severity: 'Moderate',
    description: 'Simulated thick low-thermal-inertia dust deposits reducing wheel traction and solar efficiency.',
    isSimulated: true
  },
  {
    id: 'hz-bagnold-dunes',
    name: 'Aeolis / Bagnold Dune Belt',
    type: 'aeolian-dunes',
    lat: -2.2,
    lng: 136.2,
    radiusKm: 135,
    severity: 'High',
    description: 'Simulated active dark sand dunes and steep crater rim slopes bordering Gale Crater.',
    isSimulated: true
  },
  {
    id: 'hz-neretva-scarp',
    name: 'Jezero Rim / Neretva Scarp',
    type: 'crater-rim',
    lat: 19.6,
    lng: 76.2,
    radiusKm: 95,
    severity: 'Moderate',
    description: 'Simulated rocky crater-wall breach between Jezero Crater and Nili Fossae troughs.',
    isSimulated: true
  }
];

function normalizeLng(lng: number): number {
  let out = lng;
  while (out > 180) out -= 360;
  while (out < -180) out += 360;
  return out;
}

function getRoverSpeedKmPerSol(profile: RouteConstraintsConfig['roverProfile']): number {
  switch (profile) {
    case 'curiosity':
      return 0.1; // 100 m/sol nominal
    case 'exploration-drone':
      return 0.65; // aerial scout / rotorcraft traverse capability
    case 'perseverance':
    default:
      return 0.12; // 120 m/sol nominal
  }
}

/**
 * Evaluates simulated hazard zone exposure along a coordinate.
 */
function evaluateHazardPenalty(
  lat: number,
  lng: number
): { penalty: number; hitZones: MarsHazardZone[] } {
  let penalty = 0;
  const hitZones: MarsHazardZone[] = [];

  for (const zone of MARS_HAZARD_ZONES) {
    const distKm = calculateMarsDistanceKm(lat, lng, zone.lat, zone.lng);
    if (distKm <= zone.radiusKm) {
      const proximity = 1 - distKm / zone.radiusKm;
      const severityBase =
        zone.severity === 'Severe' ? 4.5 : zone.severity === 'High' ? 2.4 : 1.1;
      penalty += severityBase * (0.4 + 0.6 * proximity);
      hitZones.push(zone);
    }
  }

  return { penalty, hitZones };
}

/**
 * Calculates a complete terrain elevation profile along a series of waypoints.
 */
export function generateElevationProfile(
  waypoints: [number, number][],
  samples = 50
): RouteProfilePoint[] {
  if (waypoints.length < 2) return [];

  const legDistances: number[] = [];
  let totalDistanceKm = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = calculateMarsDistanceKm(
      waypoints[i][1],
      waypoints[i][0],
      waypoints[i + 1][1],
      waypoints[i + 1][0]
    );
    legDistances.push(d);
    totalDistanceKm += d;
  }

  const profile: RouteProfilePoint[] = [];

  for (let s = 0; s <= samples; s++) {
    const targetDist = (s / samples) * totalDistanceKm;

    let accum = 0;
    let legIndex = 0;
    let localT = 0;

    for (let i = 0; i < legDistances.length; i++) {
      if (accum + legDistances[i] >= targetDist || i === legDistances.length - 1) {
        legIndex = i;
        const legLen = legDistances[i] > 0 ? legDistances[i] : 1e-6;
        localT = Math.min(1, Math.max(0, (targetDist - accum) / legLen));
        break;
      }
      accum += legDistances[i];
    }

    const pA = waypoints[legIndex];
    const pB = waypoints[legIndex + 1] || waypoints[legIndex];
    const pt = intermediateMarsPoint(pA[1], pA[0], pB[1], pB[0], localT);

    const elev = estimateMolaElevation(pt.lat, pt.lng);

    let slopeDeg = estimateLocalSlopeDeg(pt.lat, pt.lng);
    if (profile.length > 0) {
      const prev = profile[profile.length - 1];
      const dStep = (targetDist - prev.distanceKm) * 1000;
      const stepSlope = calculateSlopeDeg(elev - prev.elevationMeters, dStep);
      slopeDeg = Math.max(slopeDeg * 0.6, stepSlope);
    }

    const roughnessIndex = parseFloat(
      Math.min(1.0, 0.15 + (slopeDeg / 25) * 0.55 + Math.abs(elev % 400) / 1100).toFixed(2)
    );

    profile.push({
      distanceKm: parseFloat(targetDist.toFixed(1)),
      elevationMeters: elev,
      slopeDeg: parseFloat(slopeDeg.toFixed(1)),
      roughnessIndex,
      lat: parseFloat(pt.lat.toFixed(3)),
      lng: parseFloat(normalizeLng(pt.lng).toFixed(3))
    });
  }

  return profile;
}

/**
 * Executes a deterministic A* search over a geodesic-aligned Martian terrain grid.
 * Evaluates MOLA-anchored elevation gradients, local roughness, and simulated hazard zones.
 */
function runDeterministicAStarGrid(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  constraints: RouteConstraintsConfig,
  hazardMultiplier: number
): [number, number][] {
  const directKm = calculateMarsDistanceKm(startLat, startLng, destLat, destLng);
  if (directKm < 1e-2) {
    return [
      [normalizeLng(startLng), startLat],
      [normalizeLng(destLng), destLat]
    ];
  }

  // Longitudinal cols along geodesic arc, lateral rows perpendicular to arc
  const cols = 20;
  const rows = 13; // odd count so center row = (rows - 1) / 2 lies directly on geodesic
  const centerRow = (rows - 1) / 2;

  // Shortest wrapped delta longitude
  let dLng = normalizeLng(destLng) - normalizeLng(startLng);
  if (dLng > 180) dLng -= 360;
  if (dLng < -180) dLng += 360;
  const dLat = destLat - startLat;
  const degSpan = Math.hypot(dLat, dLng) || 1;

  // Lateral unit vector in lat/lng space, scaled proportionally to traverse length
  const lateralWidthDeg = Math.min(28, Math.max(2.5, degSpan * 0.35));
  const perpLat = -dLng / degSpan;
  const perpLng = dLat / degSpan;

  interface GridNode {
    c: number;
    r: number;
    lat: number;
    lng: number;
    elev: number;
    localSlope: number;
    hazardPenalty: number;
  }

  const grid: GridNode[][] = [];
  for (let c = 0; c <= cols; c++) {
    const t = c / cols;
    const base = intermediateMarsPoint(startLat, startLng, destLat, destLng, t);
    // Taper lateral corridor near start and end so endpoints align strictly
    const corridorEnvelope = c === 0 || c === cols ? 0 : Math.sin(t * Math.PI) * 0.7 + 0.3;
    const colNodes: GridNode[] = [];

    for (let r = 0; r < rows; r++) {
      const lateralFrac = (r - centerRow) / centerRow; // -1 .. +1
      const offsetDeg = lateralFrac * lateralWidthDeg * corridorEnvelope;
      const lat = Math.max(-85, Math.min(85, base.lat + perpLat * offsetDeg));
      const lng = normalizeLng(base.lng + perpLng * offsetDeg);
      const elev = estimateMolaElevation(lat, lng);
      const localSlope = estimateLocalSlopeDeg(lat, lng);
      const { penalty } = evaluateHazardPenalty(lat, lng);

      colNodes.push({
        c,
        r,
        lat,
        lng,
        elev,
        localSlope,
        hazardPenalty: penalty
      });
    }
    grid.push(colNodes);
  }

  const key = (c: number, r: number) => `${c}:${r}`;
  const startKey = key(0, centerRow);
  const goalKey = key(cols, centerRow);

  const openSet = new Set<string>([startKey]);
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const fScore = new Map<string, number>([[startKey, directKm]]);

  const nodeByKey = new Map<string, GridNode>();
  for (let c = 0; c <= cols; c++) {
    for (let r = 0; r < rows; r++) {
      nodeByKey.set(key(c, r), grid[c][r]);
    }
  }

  const maxSlopeThreshold = Math.max(8, constraints.maxSlopeDeg);

  while (openSet.size > 0) {
    // Pop lowest fScore node
    let currentKey = '';
    let bestF = Infinity;
    for (const k of openSet) {
      const f = fScore.get(k) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        currentKey = k;
      }
    }

    if (currentKey === goalKey) {
      const pathKeys: string[] = [currentKey];
      let curr = currentKey;
      while (cameFrom.has(curr)) {
        curr = cameFrom.get(curr)!;
        pathKeys.unshift(curr);
      }
      return pathKeys.map((k) => {
        const n = nodeByKey.get(k)!;
        return [parseFloat(n.lng.toFixed(3)), parseFloat(n.lat.toFixed(3))];
      });
    }

    openSet.delete(currentKey);
    closedSet.add(currentKey);

    const curNode = nodeByKey.get(currentKey)!;

    // Explore forward & lateral neighbors (8-connected except backwards)
    const neighborOffsets: [number, number][] = [
      [1, 0],
      [1, -1],
      [1, 1],
      [0, -1],
      [0, 1]
    ];

    for (const [dc, dr] of neighborOffsets) {
      const nc = curNode.c + dc;
      const nr = curNode.r + dr;
      if (nc < 0 || nc > cols || nr < 0 || nr >= rows) continue;
      // Only center row exists at endpoints c === 0 and c === cols
      if ((nc === 0 || nc === cols) && nr !== centerRow) continue;

      const nKey = key(nc, nr);
      if (closedSet.has(nKey)) continue;

      const neighbor = grid[nc][nr];
      const stepKm = Math.max(
        0.05,
        calculateMarsDistanceKm(curNode.lat, curNode.lng, neighbor.lat, neighbor.lng)
      );

      const segSlope = calculateSlopeDeg(neighbor.elev - curNode.elev, stepKm * 1000);
      const effectiveSlope = Math.max(segSlope, neighbor.localSlope);
      const slopeOverLimitPenalty =
        effectiveSlope > maxSlopeThreshold ? (effectiveSlope - maxSlopeThreshold) * 0.45 : 0;

      const slopeCost =
        (effectiveSlope / 15) * constraints.slopePenaltyWeight * 0.55 + slopeOverLimitPenalty;
      const roughnessCost =
        (Math.abs(neighbor.elev % 350) / 350) * constraints.roughnessPenaltyWeight * 0.3;
      const hazardCost = neighbor.hazardPenalty * hazardMultiplier;

      const edgeCost = stepKm * (1 + slopeCost + roughnessCost + hazardCost);
      const tentativeG = (gScore.get(currentKey) ?? Infinity) + edgeCost;

      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        cameFrom.set(nKey, currentKey);
        gScore.set(nKey, tentativeG);
        const hKm = calculateMarsDistanceKm(neighbor.lat, neighbor.lng, destLat, destLng);
        fScore.set(nKey, tentativeG + hKm);
        openSet.add(nKey);
      }
    }
  }

  // Fallback straight geodesic if search exhausts
  return [
    [normalizeLng(startLng), startLat],
    [normalizeLng(destLng), destLat]
  ];
}

function summarizeCandidateRoute(
  id: string,
  name: string,
  description: string,
  waypoints: [number, number][],
  constraints: RouteConstraintsConfig,
  costSlopeFactor: number,
  scienceObjective: string
): CandidateRoute {
  const profile = generateElevationProfile(waypoints, 40);

  let totalDistKm = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistKm += calculateMarsDistanceKm(
      waypoints[i][1],
      waypoints[i][0],
      waypoints[i + 1][1],
      waypoints[i + 1][0]
    );
  }

  const elevDelta =
    profile.length >= 2
      ? Math.abs(profile[profile.length - 1].elevationMeters - profile[0].elevationMeters)
      : 0;
  const maxSlope = profile.length ? Math.max(...profile.map((p) => p.slopeDeg)) : 0;
  const avgSlope = profile.length
    ? profile.reduce((acc, p) => acc + p.slopeDeg, 0) / profile.length
    : 0;

  // Detect simulated hazard zones crossed along this route
  const crossedMap = new Map<string, MarsHazardZone>();
  for (const pt of profile) {
    const { hitZones } = evaluateHazardPenalty(pt.lat, pt.lng);
    for (const hz of hitZones) {
      crossedMap.set(hz.id, hz);
    }
  }
  const hazardsCrossed = Array.from(crossedMap.values());
  const hazardsAvoided = Math.max(0, MARS_HAZARD_ZONES.length - hazardsCrossed.length);

  const speedKmPerSol = getRoverSpeedKmPerSol(constraints.roverProfile);
  const slopeSlowdown = maxSlope > constraints.maxSlopeDeg ? 1.55 : 1 + avgSlope * 0.025;
  const hazardSlowdown = 1 + hazardsCrossed.length * 0.14;
  const estimatedSolDays = Math.max(
    1,
    Math.ceil((totalDistKm / speedKmPerSol) * slopeSlowdown * hazardSlowdown)
  );
  // Active drive hours (~2.5 drive hours per operational Mars Sol)
  const estimatedTravelHours = Math.round(estimatedSolDays * 2.5);

  const terrainCostScore = parseFloat(
    (
      totalDistKm *
      (1 + avgSlope * costSlopeFactor + hazardsCrossed.length * 0.12)
    ).toFixed(1)
  );

  // Simulated route confidence score (clearly flagged non-certified)
  const slopePenalty = Math.max(0, maxSlope - constraints.maxSlopeDeg) * 2.2;
  const hazardPenalty = hazardsCrossed.reduce(
    (acc, hz) => acc + (hz.severity === 'Severe' ? 14 : hz.severity === 'High' ? 9 : 4),
    0
  );
  const routeConfidencePct = Math.max(
    28,
    Math.min(94, Math.round(92 - slopePenalty - hazardPenalty))
  );

  const difficulty: CandidateRoute['difficulty'] =
    maxSlope > 26 || hazardsCrossed.some((h) => h.severity === 'Severe')
      ? 'Severe'
      : maxSlope > 18 || hazardsCrossed.length >= 2
      ? 'High'
      : maxSlope > 10 || hazardsCrossed.length === 1
      ? 'Moderate'
      : 'Low';

  return {
    id,
    name,
    description,
    path: waypoints,
    distanceKm: parseFloat(totalDistKm.toFixed(1)),
    elevationDeltaMeters: Math.round(elevDelta),
    maxSlopeDeg: parseFloat(maxSlope.toFixed(1)),
    avgSlopeDeg: parseFloat(avgSlope.toFixed(1)),
    terrainCostScore,
    estimatedSolDays,
    estimatedTravelHours,
    routeConfidencePct,
    hazardsAvoided,
    hazardsCrossed,
    difficulty,
    profile,
    scienceObjective,
    isSimulated: true
  };
}

/**
 * Deterministic A* planetary pathfinding engine for rover navigation.
 * Generates three candidate routes:
 * 1. Topographically-Optimized A* (Min Total Energy / Slope / Hazard Cost)
 * 2. Direct Geodesic Traverse (Min Arc Distance baseline)
 * 3. Conservative Safe Contour (Strict slope & hazard avoidance A*)
 */
export function calculateCandidateRoutes(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  constraints: RouteConstraintsConfig = {
    maxSlopeDeg: 20,
    slopePenaltyWeight: 1.5,
    roughnessPenaltyWeight: 1.2,
    roverProfile: 'perseverance'
  },
  scienceObjective = 'Stratigraphic mineral survey & core-cache traverse evaluation'
): CandidateRoute[] {
  // 1. Direct Geodesic Traverse (24-step great-circle baseline)
  const directWaypoints: [number, number][] = [];
  const directSteps = 22;
  for (let i = 0; i <= directSteps; i++) {
    const pt = intermediateMarsPoint(startLat, startLng, destLat, destLng, i / directSteps);
    directWaypoints.push([
      parseFloat(normalizeLng(pt.lng).toFixed(3)),
      parseFloat(pt.lat.toFixed(3))
    ]);
  }

  // 2. Topographically-Optimized A* (Balanced energy, slope, and simulated hazard avoidance)
  const aStarWaypoints = runDeterministicAStarGrid(
    startLat,
    startLng,
    destLat,
    destLng,
    constraints,
    1.15
  );

  // 3. Conservative Safe Contour A* (Strict slope limits & strong hazard avoidance)
  const safeConstraints: RouteConstraintsConfig = {
    ...constraints,
    maxSlopeDeg: Math.max(10, constraints.maxSlopeDeg - 4),
    slopePenaltyWeight: constraints.slopePenaltyWeight * 1.85,
    roughnessPenaltyWeight: constraints.roughnessPenaltyWeight * 1.6
  };
  const safeWaypoints = runDeterministicAStarGrid(
    startLat,
    startLng,
    destLat,
    destLng,
    safeConstraints,
    2.4
  );

  return [
    summarizeCandidateRoute(
      'topographic-astar',
      'Topographically-Optimized A*',
      'Deterministic A* grid solver balancing geodesic distance, MOLA slope gradients, and simulated hazard avoidance.',
      aStarWaypoints,
      constraints,
      0.04,
      scienceObjective
    ),
    summarizeCandidateRoute(
      'direct-geodesic',
      'Direct Geodesic Traverse',
      'Shortest spherical arc across Mars datum without obstacle deflection. Baseline for comparing terrain hazards.',
      directWaypoints,
      constraints,
      0.08,
      scienceObjective
    ),
    summarizeCandidateRoute(
      'safe-contour',
      'Conservative Safe Contour A*',
      'High-margin A* traverse prioritizing low slopes and hazard buffer avoidance over shortest distance.',
      safeWaypoints,
      safeConstraints,
      0.02,
      scienceObjective
    )
  ];
}

/**
 * Exports candidate route to GeoJSON FeatureCollection.
 */
export function exportRouteToGeoJson(
  route: CandidateRoute,
  startName = 'Start',
  destName = 'Destination'
): string {
  const geojson = {
    type: 'FeatureCollection',
    metadata: {
      generator: 'GeoMars XR Exploration Simulator',
      routeId: route.id,
      name: route.name,
      distanceKm: route.distanceKm,
      estimatedSols: route.estimatedSolDays,
      routeConfidencePct: route.routeConfidencePct,
      simulationDisclaimer:
        'Simulated deterministic terrain cost and hazard routing for educational/planning demonstration only; not flight-certified.',
      coordinateSystem: 'IAU 2000 Mars (EPSG:4326 Equirectangular)',
      timestamp: new Date().toISOString()
    },
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: route.path
        },
        properties: {
          name: route.name,
          distanceKm: route.distanceKm,
          maxSlopeDeg: route.maxSlopeDeg,
          avgSlopeDeg: route.avgSlopeDeg,
          terrainCost: route.terrainCostScore,
          estimatedSols: route.estimatedSolDays,
          routeConfidencePct: route.routeConfidencePct
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: route.path[0]
        },
        properties: {
          role: 'Waypoint Alpha (Start)',
          label: startName
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: route.path[route.path.length - 1]
        },
        properties: {
          role: 'Waypoint Omega (Destination)',
          label: destName
        }
      }
    ]
  };

  return JSON.stringify(geojson, null, 2);
}
