export type TabType =
  | 'home'
  | 'map'
  | 'terrain'
  | 'route'
  | 'science'
  | 'discover'
  | 'missions'
  | 'about';

export interface MarsCoordinate {
  lat: number;
  lng: number;
  elevationMeters?: number;
}

export type SiteCategory =
  | 'rover'
  | 'lander'
  | 'volcano'
  | 'canyon'
  | 'crater'
  | 'basin'
  | 'delta';

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
  interestingFacts?: string[];
  missionRelevance?: string;
  sourceAttribution?: string;
  featured?: boolean;
}

export type LayerCategory = 'imagery' | 'elevation' | 'roughness' | 'scientific';
export type LayerStatus = 'connected' | 'unavailable' | 'calibrating';
export type LayerGroup =
  | 'imagery'
  | 'topography'
  | 'thermal'
  | 'highres'
  | 'base'
  | 'scientific';

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
  texturePath?: string;
}

export interface MapOverlaysConfig {
  roverLandingSites: boolean;
  missionLocations: boolean;
  pointsOfInterest: boolean;
  plannedRoute: boolean;
}

export interface RouteProfilePoint {
  distanceKm: number;
  elevationMeters: number;
  slopeDeg: number;
  roughnessIndex: number;
  lat: number;
  lng: number;
}

export interface MarsHazardZone {
  id: string;
  name: string;
  type: 'steep-scarp' | 'aeolian-dunes' | 'crater-rim' | 'boulder-ejecta' | 'thermal-dust';
  lat: number;
  lng: number;
  radiusKm: number;
  severity: 'Moderate' | 'High' | 'Severe';
  description: string;
  isSimulated: true;
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
  estimatedTravelHours: number;
  routeConfidencePct: number;
  hazardsAvoided: number;
  hazardsCrossed: MarsHazardZone[];
  difficulty: 'Low' | 'Moderate' | 'High' | 'Severe';
  profile: RouteProfilePoint[];
  scienceObjective?: string;
  isSimulated: true;
}

export interface RouteConstraintsConfig {
  maxSlopeDeg: number;
  roughnessPenaltyWeight: number;
  slopePenaltyWeight: number;
  roverProfile: 'perseverance' | 'curiosity' | 'exploration-drone';
}

export interface MissionRoutePlan {
  start: MarsSite | MarsCoordinate | null;
  destination: MarsSite | MarsCoordinate | null;
  startLabel: string;
  destinationLabel: string;
  distanceKm: number;
  estimatedSolDays: number;
  difficultyScore: 'Low' | 'Moderate' | 'High' | 'Severe';
  status: 'Idle' | 'Selected' | 'Planning' | 'Verified';
  activeCandidateRoute?: CandidateRoute;
  alternativeRoutes?: CandidateRoute[];
  constraints?: RouteConstraintsConfig;
  scienceObjective?: string;
  missionProgressPct?: number;
}

export interface LandingSiteCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
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
    slopeScore: number;
    elevationScore: number;
    roughnessScore: number;
    scienceScore: number;
    dataConfidenceScore: number;
  };
  overallSuitability: number;
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
  mode?: 'verified-corpus' | 'server-ai';
}

export interface TelemetryState {
  fps: number;
  tileLoadCount: number;
  tilesFailedCount: number;
  solarLongLs: string;
  marsSol: number;
  subSolarLat: string;
}
