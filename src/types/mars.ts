<<<<<<< HEAD
export type TabType = 'home' | 'map' | 'terrain' | 'route' | 'science' | 'discover' | 'missions' | 'about';
=======
export type TabType = 'map' | 'terrain' | 'missions' | 'science' | 'route';
>>>>>>> origin/main

export interface MarsCoordinate {
  lat: number;
  lng: number;
  elevationMeters?: number;
}

export type SiteCategory = 'rover' | 'lander' | 'volcano' | 'canyon' | 'crater' | 'basin' | 'delta';

export interface MarsSite {
  id: string;
  name: string;
  category: SiteCategory;
  lat: number;
  lng: number;
  elevationMeters: number;
  diameterKm?: number;
  description: string;
  mission?: string;
  missionStatus?: 'Active' | 'Completed' | 'Decommissioned' | 'Natural Feature';
  agency?: string;
  year?: number;
  geology: string;
  scienceHighlights: string[];
  featured?: boolean;
}

export type LayerCategory = 'imagery' | 'elevation' | 'roughness' | 'scientific';
export type LayerStatus = 'connected' | 'unavailable' | 'calibrating';
<<<<<<< HEAD
export type LayerGroup = 'imagery' | 'topography' | 'thermal' | 'highres' | 'base' | 'scientific';
=======
export type LayerGroup = 'base' | 'scientific' | 'highres';
>>>>>>> origin/main

export interface MapLayerConfig {
  id: string;
  name: string;
  subtitle?: string;
  group?: LayerGroup;
  category: LayerCategory;
  provider: 'NASA Mars Trek' | 'USGS Astrogeology' | 'ESA / DLR' | 'MOLA Science Team';
  serviceType: 'wmts' | 'wms' | 'vector' | 'offline';
  status: LayerStatus;
  resolution: string;
  description: string;
  layerIdentifier?: string;
  endpointUrl?: string;
  wmtsTemplate?: string;
  unavailableReason?: string;
  opacity?: number;
  legendNotes?: string;
<<<<<<< HEAD
  texturePath?: string;
=======
>>>>>>> origin/main
}

export interface MapOverlaysConfig {
  roverLandingSites: boolean;
  missionLocations: boolean;
  pointsOfInterest: boolean;
  plannedRoute: boolean;
}

<<<<<<< HEAD
export interface RouteProfilePoint {
  distanceKm: number;
  elevationMeters: number;
  slopeDeg: number;
  roughnessIndex: number;
  lat: number;
  lng: number;
}

export interface CandidateRoute {
  id: string;
  name: string;
  description: string;
  path: [number, number][]; // [lng, lat]
  distanceKm: number;
  elevationDeltaMeters: number;
  maxSlopeDeg: number;
  avgSlopeDeg: number;
  terrainCostScore: number;
  estimatedSolDays: number;
  difficulty: 'Low' | 'Moderate' | 'High' | 'Severe';
  profile: RouteProfilePoint[];
}

export interface RouteConstraintsConfig {
  maxSlopeDeg: number;
  roughnessPenaltyWeight: number;
  slopePenaltyWeight: number;
  roverProfile: 'perseverance' | 'curiosity' | 'exploration-drone';
}

=======
>>>>>>> origin/main
export interface MissionRoutePlan {
  start: MarsSite | MarsCoordinate | null;
  destination: MarsSite | MarsCoordinate | null;
  startLabel: string;
  destinationLabel: string;
  distanceKm: number;
  estimatedSolDays: number;
  difficultyScore: 'Low' | 'Moderate' | 'High' | 'Severe';
  status: 'Idle' | 'Selected' | 'Planning' | 'Verified';
<<<<<<< HEAD
  activeCandidateRoute?: CandidateRoute;
  alternativeRoutes?: CandidateRoute[];
  constraints?: RouteConstraintsConfig;
}

export interface LandingSiteCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0 to 1
  idealRange: string;
}

export interface LandingCandidateEvaluation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  slopeDeg: number;
  roughnessScore: number;
  scienceProximityKm: number;
  coverageResolutionM: number;
  scores: {
    slopeScore: number; // 0-100
    elevationScore: number; // 0-100 (atmospheric braking EDL)
    roughnessScore: number; // 0-100
    scienceScore: number; // 0-100
    dataConfidenceScore: number; // 0-100
  };
  overallSuitability: number; // 0-100 weighted
  verdict: 'Recommended' | 'Conditional' | 'High Risk';
  scientificJustification: string;
  engineeringLimitations: string;
}

export interface ScienceComparisonPair {
  id: string;
  title: string;
  description: string;
  leftLayerId: string;
  rightLayerId: string;
  leftLabel: string;
  rightLabel: string;
  scientificGoal: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: string[];
  suggestedQuestions?: string[];
=======
>>>>>>> origin/main
}

export interface TelemetryState {
  fps: number;
  tileLoadCount: number;
  tilesFailedCount: number;
  solarLongLs: string;
  marsSol: number;
  subSolarLat: string;
}
