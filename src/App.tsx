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
import { useAppRouter } from './router/useAppRouter';

import { GeoMarsHeader } from './components/GeoMarsHeader';
import { MapLayersSidebar } from './components/MapLayersSidebar';
import { LocationDetailsPanel } from './components/LocationDetailsPanel';
import { MarsOverviewPanel } from './components/MarsOverviewPanel';
import { ElevationProfilePanel } from './components/ElevationProfilePanel';
import { MissionActivityPanel } from './components/MissionActivityPanel';
import { MarsMap } from './components/MarsMap';
import { MarsGlobe } from './components/MarsGlobe';

import { HomeView } from './components/HomeView';
import { TerrainView } from './components/TerrainView';
import { ScienceView } from './components/ScienceView';
import { RoutePlannerView } from './components/RoutePlannerView';
import { AboutView } from './components/AboutView';
import { MissionReportModal } from './components/MissionReportModal';
import { Info } from 'lucide-react';

export default function App() {
  const { currentPath, navigate } = useAppRouter();

  // Active layer & view mode
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [activeLayer, setActiveLayer] = useState<MapLayerConfig>(LAYER_CATALOG[0]);
  const [layerOpacity, setLayerOpacity] = useState<number>(86);

  // Modals state (Mission Dossier)
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Overlays Configuration
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

  // Derive activeTab from currentPath
  const activeTab: TabType = 
    currentPath === '/' ? 'home' :
    currentPath === '/explore' ? 'map' :
    currentPath === '/route-planner' ? 'route' :
    currentPath === '/terrain-lab' ? 'terrain' :
    currentPath === '/mission-data' ? 'science' :
    currentPath === '/about' ? 'about' : 'map';

  // Handler: Top Navigation Tab Change
  const handleTabChange = (tab: TabType) => {
    switch (tab) {
      case 'home':
        navigate('/');
        break;
      case 'map':
        navigate('/explore');
        break;
      case 'route':
        setOverlays((prev) => ({ ...prev, plannedRoute: true }));
        navigate('/route-planner');
        break;
      case 'terrain':
        navigate('/terrain-lab');
        break;
      case 'science':
      case 'discover':
      case 'missions':
        navigate('/mission-data');
        break;
      case 'about':
        navigate('/about');
        break;
      default:
        navigate('/explore');
    }
  };

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

  // Handler: Select site from anywhere and go to map
  const handleSelectSiteAndGoToMap = (site: MarsSite) => {
    handleSelectSite(site);
    navigate('/explore');
  };

  // Handler: Select layer from anywhere and go to map
  const handleSelectLayerAndGoToMap = (layer: MapLayerConfig) => {
    setActiveLayer(layer);
    navigate('/explore');
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
    navigate('/explore');
  };

  // Handler: "Analyze Terrain" button from Location Intelligence panel
  const handleAnalyzeTerrain = (site: MarsSite) => {
    setSelectedSite(site);
    navigate('/terrain-lab');
  };

  // Handler: "Plan Route" button from Location Intelligence panel
  const handlePlanRoute = (site: MarsSite) => {
    setSelectedSite(site);
    setOverlays((prev) => ({ ...prev, plannedRoute: true }));
    navigate('/route-planner');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080B12] text-[#F5F7FA]">
      {/* 1. TOP NAVIGATION BAR */}
      <GeoMarsHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSelectSite={handleSelectSiteAndGoToMap}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* 2. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {currentPath === '/' ? (
          <HomeView
            onNavigate={navigate}
            onSelectSiteAndGoToMap={handleSelectSiteAndGoToMap}
            onSelectLayerAndGoToMap={handleSelectLayerAndGoToMap}
          />
        ) : currentPath === '/explore' ? (
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

            {/* CENTER REGION: CENTRAL MAP + 3 BOTTOM DOCK PANELS */}
            <div className="flex-1 flex flex-col gap-3 min-w-0 h-full">
              {/* Central Mars Map Viewport */}
              <div className="flex-1 min-h-0 bg-[#111824] border border-[#273244] rounded-xl overflow-hidden relative shadow-2xl">
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

                {/* Reopen Location Intelligence Button when panel is collapsed */}
                {!isLocationDetailsOpen && (
                  <button
                    onClick={() => setIsLocationDetailsOpen(true)}
                    className="absolute top-4 right-44 z-20 px-3 py-1.5 bg-[#111824]/90 hover:bg-[#0D121C] border border-[#273244] hover:border-[#FF6B35] rounded-xl text-xs font-semibold text-[#F5F7FA] shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
                    title="Open Location Intelligence"
                  >
                    <Info className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>Location Intelligence</span>
                  </button>
                )}
              </div>

              {/* Bottom Information Dock (3 Cards Horizontally Arranged) */}
              <div className="h-[188px] shrink-0 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Card 1 — Mars Overview */}
                <div className="min-w-0 h-full">
                  <MarsOverviewPanel
                    selectedSite={selectedSite}
                    activeLayer={activeLayer}
                    selectedCoordinate={selectedCoordinate}
                  />
                </div>

                {/* Card 2 — Elevation Profile */}
                <div className="min-w-0 h-full">
                  <ElevationProfilePanel
                    selectedSite={selectedSite}
                    onSelectSite={handleSelectSite}
                    missionRoute={missionRoute}
                    isRouteActive={overlays.plannedRoute}
                  />
                </div>

                {/* Card 3 — Mission Activity */}
                <div className="min-w-0 h-full">
                  <MissionActivityPanel
                    selectedSite={selectedSite}
                    onExploreMissions={() => navigate('/mission-data')}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: LOCATION INTELLIGENCE (350px) */}
            {isLocationDetailsOpen && (
              <div className="w-[350px] min-w-[350px] shrink-0 h-full transition-all duration-300">
                <LocationDetailsPanel
                  selectedSite={selectedSite}
                  onClose={() => setIsLocationDetailsOpen(false)}
                  onViewIn3DTerrain={handleViewIn3DTerrain}
                  onAnalyzeTerrain={handleAnalyzeTerrain}
                  onPlanRoute={handlePlanRoute}
                />
              </div>
            )}
          </div>
        ) : currentPath === '/terrain-lab' ? (
          <div className="flex-1 h-full overflow-hidden bg-[#080B12]">
            <TerrainView onSelectSiteAndGoToMap={handleSelectSiteAndGoToMap} />
          </div>
        ) : currentPath === '/route-planner' ? (
          <div className="flex-1 h-full overflow-hidden bg-[#080B12]">
            <RoutePlannerView
              onSelectSiteAndGoToMap={handleSelectSiteAndGoToMap}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              activeLayer={activeLayer}
            />
          </div>
        ) : currentPath === '/mission-data' ? (
          <div className="flex-1 h-full overflow-hidden bg-[#080B12]">
            <ScienceView
              onSelectSiteAndGoToMap={handleSelectSiteAndGoToMap}
              onSelectLayerAndGoToMap={handleSelectLayerAndGoToMap}
            />
          </div>
        ) : currentPath === '/about' ? (
          <div className="flex-1 h-full overflow-hidden bg-[#080B12]">
            <AboutView onNavigate={navigate} />
          </div>
        ) : (
          <HomeView
            onNavigate={navigate}
            onSelectSiteAndGoToMap={handleSelectSiteAndGoToMap}
            onSelectLayerAndGoToMap={handleSelectLayerAndGoToMap}
          />
        )}
      </div>

      {/* 3. MISSION DOSSIER REPORT MODAL */}
      <MissionReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedSite={selectedSite}
        selectedCoordinate={selectedCoordinate}
        activeLayer={activeLayer}
        missionRoute={missionRoute}
      />
    </div>
  );
}
