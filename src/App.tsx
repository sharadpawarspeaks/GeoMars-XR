import { useState } from 'react';
import type {
  TabType,
  MarsCoordinate,
  MarsSite,
  MapLayerConfig,
  MapOverlaysConfig,
  MissionRoutePlan
} from './types/mars';
import { LAYER_CATALOG } from './data/layerCatalog';
import { MARS_SITES } from './data/marsSites';
import { calculateMarsDistanceKm, estimateRoverSolTransit } from './utils/marsMath';

import { GeoMarsHeader } from './components/GeoMarsHeader';
import { MapLayersSidebar } from './components/MapLayersSidebar';
import { LocationDetailsPanel } from './components/LocationDetailsPanel';
import { MarsOverviewPanel } from './components/MarsOverviewPanel';
import { PopularLocationsPanel } from './components/PopularLocationsPanel';
import { ElevationProfilePanel } from './components/ElevationProfilePanel';
import { MarsMap } from './components/MarsMap';
import { MarsGlobe } from './components/MarsGlobe';

import { TerrainView } from './components/TerrainView';
import { MissionsView } from './components/MissionsView';
import { ScienceView } from './components/ScienceView';
import { Info } from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [activeLayer, setActiveLayer] = useState<MapLayerConfig>(LAYER_CATALOG[0]);
  const [layerOpacity, setLayerOpacity] = useState<number>(86);

  // Overlays Configuration (matching reference design)
  const [overlays, setOverlays] = useState<MapOverlaysConfig>({
    roverLandingSites: true,
    missionLocations: true,
    pointsOfInterest: false,
    plannedRoute: false
  });

  // Selected Location / Site state (Default: Jezero Crater)
  const defaultSite = MARS_SITES[0];
  const [selectedSite, setSelectedSite] = useState<MarsSite | null>(defaultSite);
  const [selectedCoordinate, setSelectedCoordinate] = useState<MarsCoordinate | null>({
    lat: defaultSite.lat,
    lng: defaultSite.lng,
    elevationMeters: defaultSite.elevationMeters
  });

  // Panels visibility
  const [isLocationDetailsOpen, setIsLocationDetailsOpen] = useState<boolean>(true);

  // Mission Traverse Route Plan State
  const defaultDest = MARS_SITES[1]; // Gale Crater
  const initialDistance = calculateMarsDistanceKm(
    defaultSite.lat,
    defaultSite.lng,
    defaultDest.lat,
    defaultDest.lng
  );
  const initialTransit = estimateRoverSolTransit(
    initialDistance,
    defaultDest.elevationMeters - defaultSite.elevationMeters
  );

  const [missionRoute] = useState<MissionRoutePlan>({
    start: defaultSite,
    destination: defaultDest,
    startLabel: defaultSite.name,
    destinationLabel: defaultDest.name,
    distanceKm: initialDistance,
    estimatedSolDays: initialTransit.sols,
    difficultyScore: initialTransit.difficulty,
    status: 'Verified'
  });

  // Handler: Select site from search, popular cards, or map markers
  const handleSelectSite = (site: MarsSite | null) => {
    setSelectedSite(site);
    if (site) {
      setSelectedCoordinate({
        lat: site.lat,
        lng: site.lng,
        elevationMeters: site.elevationMeters
      });
      setIsLocationDetailsOpen(true);
    }
  };

  // Handler: Select site from full-screen tabs and return to map
  const handleSelectSiteAndGoToMap = (site: MarsSite) => {
    handleSelectSite(site);
    setActiveTab('map');
  };

  // Handler: Toggle individual overlay switch
  const handleToggleOverlay = (key: keyof MapOverlaysConfig) => {
    setOverlays((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handler: Reset Map Layers to defaults
  const handleResetLayers = () => {
    setActiveLayer(LAYER_CATALOG[0]);
    setLayerOpacity(86);
    setOverlays({
      roverLandingSites: true,
      missionLocations: true,
      pointsOfInterest: false,
      plannedRoute: false
    });
  };

  // Handler: "View in 3D Terrain" button from Location Details panel
  const handleViewIn3DTerrain = (site: MarsSite) => {
    handleSelectSite(site);
    setViewMode('3d');
    if (activeTab !== 'map') {
      setActiveTab('map');
    }
  };

  // Handler: Top Navigation Tab Change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'route') {
      setOverlays((prev) => ({ ...prev, plannedRoute: true }));
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#020A10] text-[#F4F7FA]">
      {/* 1. TOP NAVIGATION BAR */}
      <GeoMarsHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSelectSite={handleSelectSiteAndGoToMap}
      />

      {/* 2. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === 'map' || activeTab === 'route' ? (
          <div className="flex-1 flex overflow-hidden p-3 gap-3">
            {/* LEFT SIDEBAR: MAP LAYERS (280px) */}
            <div className="w-[280px] min-w-[280px] shrink-0 h-full">
              <MapLayersSidebar
                activeLayer={activeLayer}
                onSelectLayer={setActiveLayer}
                overlays={overlays}
                onToggleOverlay={handleToggleOverlay}
                layerOpacity={layerOpacity}
                onChangeOpacity={setLayerOpacity}
                onReset={handleResetLayers}
              />
            </div>

            {/* CENTER REGION: CENTRAL MAP + 3 BOTTOM PANELS */}
            <div className="flex-1 flex flex-col gap-3 min-w-0 h-full">
              {/* Central Mars Map Viewport */}
              <div className="flex-1 min-h-0 bg-[#04121B] border border-[#19303E] rounded-xl overflow-hidden relative shadow-2xl">
                {viewMode === '2d' ? (
                  <MarsMap
                    activeLayer={activeLayer}
                    selectedCoordinate={selectedCoordinate}
                    selectedSite={selectedSite}
                    missionRoute={missionRoute}
                    overlays={overlays}
                    layerOpacity={layerOpacity}
                    viewMode={viewMode}
                    onChangeViewMode={setViewMode}
                    onSelectCoordinate={(coord) => {
                      setSelectedCoordinate(coord);
                      setSelectedSite(null);
                    }}
                    onSelectSite={handleSelectSite}
                    onLoadingChange={() => {}}
                  />
                ) : (
                  <MarsGlobe
                    activeLayer={activeLayer}
                    selectedCoordinate={selectedCoordinate}
                    selectedSite={selectedSite}
                    missionRoute={missionRoute}
                    overlays={overlays}
                    layerOpacity={layerOpacity}
                    viewMode={viewMode}
                    onChangeViewMode={setViewMode}
                    onSelectCoordinate={(coord) => {
                      setSelectedCoordinate(coord);
                      setSelectedSite(null);
                    }}
                    onSelectSite={handleSelectSite}
                    onLoadingChange={() => {}}
                  />
                )}

                {/* Reopen Location Details Button when panel is collapsed */}
                {!isLocationDetailsOpen && (
                  <button
                    onClick={() => setIsLocationDetailsOpen(true)}
                    className="absolute top-4 right-44 z-20 px-3 py-1.5 bg-[#04121B]/90 hover:bg-[#081925] border border-[#19303E] hover:border-[#FF6B35] rounded-xl text-xs font-semibold text-[#F4F7FA] shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
                    title="Open Location Details"
                  >
                    <Info className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>Location Details</span>
                  </button>
                )}
              </div>

              {/* Bottom 3 Panels Row (~195px height) */}
              <div className="h-[195px] shrink-0 flex gap-3">
                {/* 1. Mars Overview Panel */}
                <div className="w-[270px] min-w-[270px] shrink-0 h-full">
                  <MarsOverviewPanel />
                </div>

                {/* 2. Popular Locations Panel */}
                <div className="flex-1 min-w-0 h-full">
                  <PopularLocationsPanel
                    selectedSite={selectedSite}
                    onSelectSite={handleSelectSite}
                    onViewAll={() => setActiveTab('terrain')}
                  />
                </div>

                {/* 3. Elevation Profile Panel */}
                <div className="w-[350px] min-w-[350px] shrink-0 h-full">
                  <ElevationProfilePanel
                    selectedSite={selectedSite}
                    onSelectSite={handleSelectSite}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: LOCATION DETAILS (350px) */}
            {isLocationDetailsOpen && (
              <div className="w-[350px] min-w-[350px] shrink-0 h-full transition-all duration-300">
                <LocationDetailsPanel
                  selectedSite={selectedSite}
                  onClose={() => setIsLocationDetailsOpen(false)}
                  onViewIn3DTerrain={handleViewIn3DTerrain}
                />
              </div>
            )}
          </div>
        ) : activeTab === 'terrain' ? (
          <div className="flex-1 h-full overflow-hidden bg-[#020A10]">
            <TerrainView onSelectSiteAndGoToMap={handleSelectSiteAndGoToMap} />
          </div>
        ) : activeTab === 'missions' ? (
          <div className="flex-1 h-full overflow-hidden bg-[#020A10]">
            <MissionsView onSelectSiteAndGoToMap={handleSelectSiteAndGoToMap} />
          </div>
        ) : (
          <div className="flex-1 h-full overflow-hidden bg-[#020A10]">
            <ScienceView />
          </div>
        )}
      </div>
    </div>
  );
}
