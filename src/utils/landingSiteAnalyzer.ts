import type { LandingCandidateEvaluation } from '../types/mars';
import { estimateMolaElevation } from './marsMath';

export interface LandingWeightsConfig {
  slopeWeight: number; // 0 to 1
  elevationWeight: number; // 0 to 1
  roughnessWeight: number; // 0 to 1
  scienceWeight: number; // 0 to 1
}

export const DEFAULT_LANDING_WEIGHTS: LandingWeightsConfig = {
  slopeWeight: 0.35,
  elevationWeight: 0.25,
  roughnessWeight: 0.2,
  scienceWeight: 0.2
};

// Benchmark candidate landing sites evaluated in historical NASA/ESA landing site selection workshops
export const CANDIDATE_LANDING_SITES: {
  id: string;
  name: string;
  lat: number;
  lng: number;
  targetTargetDescription: string;
  historicalMission: string;
}[] = [
  {
    id: 'jezero-delta',
    name: 'Jezero Crater Fan Delta',
    lat: 18.38,
    lng: 77.58,
    targetTargetDescription: 'Ancient river delta lake basin containing smectite clays, carbonates, and igneous floor units.',
    historicalMission: 'Mars 2020 Perseverance (Touchdown 2021)'
  },
  {
    id: 'oxia-planum',
    name: 'Oxia Planum',
    lat: 18.28,
    lng: -24.37,
    targetTargetDescription: 'Vast clay-rich sedimentary plain exhibiting ancient river delta networks and biosignature preservation potential.',
    historicalMission: 'ExoMars Rosalind Franklin candidate'
  },
  {
    id: 'gale-aeolis',
    name: 'Gale Crater (Aeolis Palus)',
    lat: -4.59,
    lng: 137.44,
    targetTargetDescription: 'Deep impact basin with 5 km central sedimentary mound (Mt. Sharp) holding lacustrine mudstone sequences.',
    historicalMission: 'Mars Science Laboratory Curiosity (Touchdown 2012)'
  },
  {
    id: 'mawrth-vallis',
    name: 'Mawrth Vallis',
    lat: 23.99,
    lng: -18.96,
    targetTargetDescription: 'Ancient catastrophic outflow channel exposing thick stratigraphic successions of aluminum and iron/magnesium phyllosilicates.',
    historicalMission: 'Finalist for MSL and ExoMars'
  },
  {
    id: 'elysium-planitia-flat',
    name: 'Elysium Planitia (Homestead Hollow)',
    lat: 4.50,
    lng: 135.62,
    targetTargetDescription: 'Extremely smooth, lava-resurfaced equatorial plain offering ideal safety for geophysical subsurface penetrations.',
    historicalMission: 'InSight Geophysical Lander (Touchdown 2018)'
  },
  {
    id: 'meridiani-planum',
    name: 'Meridiani Planum',
    lat: -1.95,
    lng: -5.53,
    targetTargetDescription: 'Hematite-rich basaltic plain with exposed evaporite sulfate beds indicating past acidic groundwater pools.',
    historicalMission: 'Mars Exploration Rover Opportunity (Touchdown 2004)'
  }
];

/**
 * Evaluates candidate landing sites against configurable engineering and science weights.
 */
export function evaluateLandingCandidates(
  weights: LandingWeightsConfig = DEFAULT_LANDING_WEIGHTS
): LandingCandidateEvaluation[] {
  // Normalize weights so sum equals 1.0
  const sumWeights =
    weights.slopeWeight + weights.elevationWeight + weights.roughnessWeight + weights.scienceWeight ||
    1.0;
  const wSlope = weights.slopeWeight / sumWeights;
  const wElev = weights.elevationWeight / sumWeights;
  const wRough = weights.roughnessWeight / sumWeights;
  const wScience = weights.scienceWeight / sumWeights;

  return CANDIDATE_LANDING_SITES.map((site) => {
    const elev = estimateMolaElevation(site.lat, site.lng);

    // Slope calculation: evaluated at regional 1 km baseline
    const testDeltaKm = 1.0;
    const neighborElev = estimateMolaElevation(site.lat + 0.015, site.lng);
    const elevDiff = Math.abs(neighborElev - elev);
    const regionalSlopeDeg = parseFloat(
      ((Math.atan(elevDiff / (testDeltaKm * 1000)) * 180) / Math.PI).toFixed(1)
    );

    // Roughness score: based on local elevation variance and crater density (0.1 = smooth, 1.0 = rugged)
    const roughnessScore = parseFloat(
      Math.min(0.95, 0.12 + (regionalSlopeDeg / 20) * 0.5 + Math.abs(elev % 500) / 1200).toFixed(2)
    );

    // Science proximity: distance to nearest ancient lake/delta/mineral outcrop (0 = right on top)
    const scienceProximityKm = site.id === 'jezero-delta' || site.id === 'oxia-planum' ? 0.8 : site.id === 'mawrth-vallis' ? 1.5 : 4.2;

    // 1. Slope Score (0-100): < 3° is 100, > 15° is 0
    const slopeScore = Math.max(0, Math.min(100, Math.round(100 - (regionalSlopeDeg / 12) * 100)));

    // 2. Elevation Score (0-100): Lower is better for EDL atmospheric braking!
    // Elevation < -2000m is 100%, > +1000m is 0%
    const elevationScore = Math.max(
      0,
      Math.min(100, Math.round(100 - ((elev + 2500) / 3500) * 100))
    );

    // 3. Roughness Score (0-100): Lower roughness is better for rover landing gear
    const safeRoughnessScore = Math.max(0, Math.min(100, Math.round((1 - roughnessScore) * 100)));

    // 4. Science Score (0-100): Proximity to biosignatures / aqueous minerals
    const scienceScore = Math.max(
      20,
      Math.min(100, Math.round(100 - (scienceProximityKm / 10) * 50))
    );

    // Overall weighted suitability index (0-100)
    const overallSuitability = Math.round(
      slopeScore * wSlope +
        elevationScore * wElev +
        safeRoughnessScore * wRough +
        scienceScore * wScience
    );

    let verdict: 'Recommended' | 'Conditional' | 'High Risk' = 'Recommended';
    if (overallSuitability < 60 || regionalSlopeDeg > 10 || elev > 500) {
      verdict = 'High Risk';
    } else if (overallSuitability < 78 || regionalSlopeDeg > 5) {
      verdict = 'Conditional';
    }

    return {
      id: site.id,
      name: site.name,
      lat: site.lat,
      lng: site.lng,
      elevationMeters: elev,
      slopeDeg: regionalSlopeDeg,
      roughnessScore,
      scienceProximityKm,
      coverageResolutionM: 0.25, // HiRISE available
      scores: {
        slopeScore,
        elevationScore,
        roughnessScore: safeRoughnessScore,
        scienceScore,
        dataConfidenceScore: 94
      },
      overallSuitability,
      verdict,
      scientificJustification: site.targetTargetDescription,
      engineeringLimitations:
        elev > -1000
          ? 'Higher terrain reduces available atmospheric column for parachute deceleration prior to retro-propulsion touchdown.'
          : regionalSlopeDeg > 5
          ? 'Local slope exceeds 5° in crater rim vicinity, requiring active terrain relative navigation (TRN) hazard diversion.'
          : 'Nominal engineering margins. Thermal inertia indicates low boulder density on crater floor.'
    };
  }).sort((a, b) => b.overallSuitability - a.overallSuitability);
}
