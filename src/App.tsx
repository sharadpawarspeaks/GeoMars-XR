import { useState, useCallback, useMemo } from 'react';
import type {
  TabType,
  MarsCoordinate,
  MarsSite,
  MapLayerConfig,
  MapOverlaysConfig,
  MissionRoutePlan,
  RouteConstraintsConfig
} from './types/mars';
import { LAYER_CATALOG } from './data/layerCatalog';
import { MARS_SITES } from './data/marsSites';
import { calculateCandidateRoutes } from './utils/roverRouter';
import { useAppRouter, tabToRoute } from './router/useAppRouter';

import { GeoMarsHeader } from './components/GeoMarsHeader';
import { MapLayersSidebar } from './components/MapLayersSidebar';
import { LocationDetailsPanel } from './components/LocationDetailsPanel';
import { MarsOverviewPanel } from './components/MarsOverviewPanel';
import { ElevationProfilePanel } from './components/ElevationProfilePanel';
import { MarsMap } from './components/MarsMap';
import { MarsGlobe } from './components/MarsGlobe';

import { HomeView } from './components/HomeView';
import { RoutePlannerView } from './components/RoutePlannerView';
import { TerrainView } from './components/TerrainView';
import { ScienceView } from './components/ScienceView';
import { MissionsView } from './components/MissionsView';
import { AboutView } from './components/AboutView';
import { MissionReportModal } from './components/MissionReportModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { Info } from 'lucide-react';

const DEFAULT_CONSTRAINTS: RouteConstraintsConfig = {
  maxSlopeDeg: 20,
  slopePenaltyWeight: 1.5,
  roughnessPenaltyWeight: 1.2,
  roverProfile: 'perseverance'
};

function buildInitialMissionRoute(): MissionRoutePlan {
  const startSite = MARS_SITES.find((s) => s.id === 'jezero-crater') ?? MARS_SITES[0];
  const destSite = MARS_SITES.find((s) => s.id === 'nili-fossae') ?? MARS_SITES[1];
  const candidates = calculateCandidateRoutes(
    startSite.lat,
    startSite.lng,
    destSite.lat,
    destSite.lng,
    DEFAULT_CONSTRAINTS,
    'Biosignature & clay-carbonate outcrop sampling'
  );
  const active = candidates[0];

  return {
    start: startSite,
    destination: destSite,
    startLabel: startSite.name,
    destinationLabel: destSite.name,
    distanceKm: active.distanceKm,
    estimatedSolDays: active.estimatedSolDays,
    difficultyScore: active.difficulty,
    status: 'Verified',
    activeCandidateRoute: active,
    alternativeRoutes: candidates,
    constraints: DEFAULT_CONSTRAINTS,
    scienceObjective: 'Biosignature & clay-carbonate outcrop sampling',
    missionProgressPct: 35
  };
}

export default function App() {
  const { currentPath, activeTab, navigate } = useAppRouter();

  // Default to GeoMars XR 3D Observatory while keeping 2D OpenLayers one toggle away
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [activeLayer, setActiveLayer] = useState<MapLayerConfig>(LAYER_CATALOG[0]);
  const [layerOpacity, setLayerOpacity] = useState<number>(88);

  // Modals (Mission Dossier & AI Science Assistant)
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Overlays Configuration
  const [overlays, setOverlays] = useState<MapOverlaysConfig>({
    roverLandingSites: true,
    missionLocations: true,
    pointsOfInterest: true,
    plannedRoute: true
  });

  // Selected Location / Site State (Default: Jezero Crater)
  const defaultSite = MARS_SITES[0];
  const [selectedSite, setSelectedSite] = useState<MarsSite | null>(defaultSite);
  const [selectedCoordinate, setSelectedCoordinate] = useState<MarsCoordinate | null>({
    lat: defaultSite.lat,
    lng: defaultSite.lng,
    elevationMeters: defaultSite.elevationMeters
  });

  // Panels visibility
  const [isLocationDetailsOpen, setIsLocationDetailsOpen] = useState<boolean>(true);

  // Connected Deterministic A* Mission Traverse State
  const initialRoute = useMemo(() => buildInitialMissionRoute(), []);
  const [missionRoute, setMissionRoute] = useState<MissionRoutePlan>(initialRoute);

  const handleTabChange = useCallback(
    (tab: TabType) => {
      navigate(tabToRoute(tab));
    },
    [navigate]
  );

  const handleSelectSite = useCallback((site: MarsSite | null) => {
    setSelectedSite(site);
    if (site) {
      setSelectedCoordinate({
        lat: site.lat,
        lng: site.lng,
        elevationMeters: site.elevationMeters
      });
      setIsLocationDetailsOpen(true);
    }
  }, []);

  const handleSelectSiteAndGoToMap = useCallback(
    (site: MarsSite, preferMode?: '2d' | '3d') => {
      handleSelectSite(site);
      if (preferMode) {
        setViewMode(preferMode);
      }
      navigate('/explore');
    },
    [handleSelectSite, navigate]
  );

  const handleSelectLayerAndGoToMap = useCallback(
    (layer: MapLayerConfig) => {
      setActiveLayer(layer);
      navigate('/explore');
    },
    [navigate]
  );

  const handleToggleOverlay = useCallback((key: keyof MapOverlaysConfig) => {
    setOverlays((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleToggleRouteOverlay = useCallback((visible: boolean) => {
    setOverlays((prev) => ({ ...prev, plannedRoute: visible }));
  }, []);

  const handleResetWorkspace = useCallback(() => {
    setActiveLayer(LAYER_CATALOG[0]);
    setLayerOpacity(88);
    setOverlays({
      roverLandingSites: true,
      missionLocations: true,
      pointsOfInterest: true,
      plannedRoute: true
    });
    const resetSite = MARS_SITES[0];
    setSelectedSite(resetSite);
    setSelectedCoordinate({
      lat: resetSite.lat,
      lng: resetSite.lng,
      elevationMeters: resetSite.elevationMeters
    });
    setMissionRoute(buildInitialMissionRoute());
  }, []);

  const handlePlanRouteFromSite = useCallback(
    (destSite: MarsSite) => {
      const currentStart =
        missionRoute.start && 'id' in missionRoute.start
          ? missionRoute.start
          : MARS_SITES[0];
      const safeStart =
        currentStart.id === destSite.id
          ? MARS_SITES.find((s) => s.id !== destSite.id) ?? MARS_SITES[0]
          : currentStart;

      const constraints = missionRoute.constraints ?? DEFAULT_CONSTRAINTS;
      const candidates = calculateCandidateRoutes(
        safeStart.lat,
        safeStart.lng,
        destSite.lat,
        destSite.lng,
        constraints,
        missionRoute.scienceObjective
      );
      const active = candidates[0];

      setMissionRoute({
        start: safeStart,
        destination: destSite,
        startLabel: safeStart.name,
        destinationLabel: destSite.name,
        distanceKm: active.distanceKm,
        estimatedSolDays: active.estimatedSolDays,
        difficultyScore: active.difficulty,
        status: 'Verified',
        activeCandidateRoute: active,
        alternativeRoutes: candidates,
        constraints,
        scienceObjective: missionRoute.scienceObjective,
        missionProgressPct: 0
      });
      setOverlays((prev) => ({ ...prev, plannedRoute: true }));
      navigate('/route-planner');
    },
    [missionRoute, navigate]
  );

  const handleLaunchXr = useCallback(() => {
    setViewMode('3d');
    navigate('/explore');
  }, [navigate]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#080B12] text-[#F5F7FA] overflow-hidden font-sans">
      {/* Persistent Top Header */}
      <GeoMarsHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSelectSite={(site) => handleSelectSiteAndGoToMap(site)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onLaunchXr={handleLaunchXr}
      />

      {/* Active Route View Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {currentPath === '/' && (
          <HomeView
            onNavigate={navigate}
            onSelectSiteAndGoToMap={(site) => handleSelectSiteAndGoToMap(site, '3d')}
            onSelectLayerAndGoToMap={handleSelectLayerAndGoToMap}
            onLaunchXrSimulator={handleLaunchXr}
          />
        )}

        {currentPath === '/explore' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-2.5 gap-2.5 bg-[#080B12]">
            {/* Top Main Workspace: Left Sidebar + Center 3D/XR/2D Viewport + Right Details */}
            <div className="flex-1 flex min-h-0 gap-2.5">
              {/* Left Map Layers & Overlays Sidebar */}
              <aside className="hidden lg:block w-72 shrink-0 h-full overflow-hidden">
                <MapLayersSidebar
                  activeLayer={activeLayer}
                  onSelectLayer={setActiveLayer}
                  overlays={overlays}
                  onToggleOverlay={handleToggleOverlay}
                  layerOpacity={layerOpacity}
                  onChangeOpacity={setLayerOpacity}
                  onReset={handleResetWorkspace}
                />
              </aside>

              {/* Center Interactive Observatory */}
              <section className="flex-1 min-w-0 h-full rounded-xl overflow-hidden border border-[#273244] relative bg-[#03060D] shadow-2xl">
                {viewMode === '3d' ? (
                  <MarsGlobe
                    activeLayer={activeLayer}
                    layerOpacity={layerOpacity}
                    selectedSite={selectedSite}
                    selectedCoordinate={selectedCoordinate}
                    onSelectSite={handleSelectSite}
                    onSelectCoordinate={setSelectedCoordinate}
                    onSelectLayer={setActiveLayer}
                    missionRoute={missionRoute}
                    showRouteOverlay={overlays.plannedRoute}
                    onToggleRouteOverlay={handleToggleRouteOverlay}
                    onUpdateMissionRoute={setMissionRoute}
                    onOpenAiModal={() => setIsAiModalOpen(true)}
                    onToggleViewMode={setViewMode}
                  />
                ) : (
                  <MarsMap
                    activeLayer={activeLayer}
                    layerOpacity={layerOpacity}
                    overlays={overlays}
                    selectedSite={selectedSite}
                    selectedCoordinate={selectedCoordinate}
                    onSelectSite={handleSelectSite}
                    onSelectCoordinate={setSelectedCoordinate}
                    viewMode={viewMode}
                    onChangeViewMode={setViewMode}
                    onLoadingChange={() => {}}
                    missionRoute={missionRoute}
                  />
                )}
              </section>

              {/* Right Location Details Panel */}
              {isLocationDetailsOpen && (
                <aside className="hidden xl:block w-80 shrink-0 h-full overflow-hidden">
                  <LocationDetailsPanel
                    selectedSite={selectedSite}
                    onClose={() => setIsLocationDetailsOpen(false)}
                    onViewIn3DTerrain={(site) => handleSelectSiteAndGoToMap(site, '3d')}
                    onAnalyzeTerrain={(site) => {
                      handleSelectSite(site);
                      navigate('/terrain-lab');
                    }}
                    onPlanRoute={handlePlanRouteFromSite}
                  />
                </aside>
              )}

              {!isLocationDetailsOpen && (
                <button
                  type="button"
                  onClick={() => setIsLocationDetailsOpen(true)}
                  className="hidden xl:flex items-center gap-1.5 px-2.5 py-2 self-start rounded-lg bg-[#111824] border border-[#273244] text-xs font-medium text-slate-300 hover:text-white hover:border-[#FF6B35]/50"
                >
                  <Info className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span>Details</span>
                </button>
              )}
            </div>

            {/* Bottom Telemetry Dock */}
            <div className="hidden md:grid grid-cols-12 gap-2.5 h-36 shrink-0">
              <div className="col-span-5 h-full min-h-0">
                <MarsOverviewPanel
                  selectedSite={selectedSite}
                  activeLayer={activeLayer}
                  selectedCoordinate={selectedCoordinate}
                />
              </div>
              <div className="col-span-7 h-full min-h-0">
                <ElevationProfilePanel
                  selectedSite={selectedSite}
                  onSelectSite={(site) => handleSelectSite(site)}
                  missionRoute={missionRoute}
                  isRouteActive={overlays.plannedRoute}
                />
              </div>
            </div>
          </div>
        )}

        {currentPath === '/route-planner' && (
          <RoutePlannerView
            missionRoute={missionRoute}
            onUpdateRoutePlan={(plan) => {
              setMissionRoute(plan);
              setOverlays((prev) => ({ ...prev, plannedRoute: true }));
            }}
            onSelectSiteAndGoToMap={(site) => handleSelectSiteAndGoToMap(site, '3d')}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            activeLayer={activeLayer}
          />
        )}

        {currentPath === '/terrain-lab' && (
          <TerrainView
            onSelectSiteAndGoToMap={(site) => handleSelectSiteAndGoToMap(site, '3d')}
          />
        )}

        {currentPath === '/mission-data' && (
          <ScienceView
            onSelectSiteAndGoToMap={(site) => handleSelectSiteAndGoToMap(site, '3d')}
            onSelectLayerAndGoToMap={handleSelectLayerAndGoToMap}
          />
        )}

        {currentPath === '/missions' && (
          <MissionsView
            onSelectSiteAndGoToMap={(site) => handleSelectSiteAndGoToMap(site, '3d')}
          />
        )}

        {currentPath === '/about' && <AboutView onNavigate={navigate} />}
      </main>

      {/* Modals */}
      <MissionReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedSite={selectedSite}
        selectedCoordinate={selectedCoordinate}
        activeLayer={activeLayer}
        missionRoute={missionRoute}
        activeRoute={missionRoute.activeCandidateRoute}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        selectedSite={selectedSite}
        selectedCoordinate={selectedCoordinate}
        activeLayer={activeLayer}
        missionRoute={missionRoute}
      />
    </div>
  );
}
