export type TabType = 'map' | 'terrain' | 'missions' | 'science' | 'route';

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
export type LayerGroup = 'base' | 'scientific' | 'highres';

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
}

export interface MapOverlaysConfig {
  roverLandingSites: boolean;
  missionLocations: boolean;
  pointsOfInterest: boolean;
  plannedRoute: boolean;
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
}

export interface TelemetryState {
  fps: number;
  tileLoadCount: number;
  tilesFailedCount: number;
  solarLongLs: string;
  marsSol: number;
  subSolarLat: string;
}
