import { useState, useMemo, useEffect } from 'react';
import type { FC } from 'react';
import type {
  MarsSite,
  RouteConstraintsConfig,
  MapLayerConfig,
  MissionRoutePlan
} from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { calculateCandidateRoutes, exportRouteToGeoJson } from '../utils/roverRouter';
import { calculateMarsDistanceKm, formatMarsCoordinate, formatElevation } from '../utils/marsMath';
import {
  Route as RouteIcon,
  Navigation,
  ArrowLeftRight,
  Sliders,
  CheckCircle2,
  Download,
  FileText,
  Mountain,
  Compass,
  Zap,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

interface RoutePlannerViewProps {
  missionRoute: MissionRoutePlan;
  onUpdateRoutePlan: (plan: MissionRoutePlan) => void;
  onSelectSiteAndGoToMap: (site: MarsSite) => void;
  onOpenReportModal: () => void;
  activeLayer: MapLayerConfig;
}

const SCIENCE_OBJECTIVES = [
  'Biosignature & clay-carbonate outcrop sampling',
  'MOLA crater rim stratigraphy & slope traverse benchmark',
  'Subsurface water-ice & hydrated sulfate survey',
  'Volcanic basalt & thermal inertia calibration drive'
];

export const RoutePlannerView: FC<RoutePlannerViewProps> = ({
  missionRoute,
  onUpdateRoutePlan,
  onSelectSiteAndGoToMap,
  onOpenReportModal
}) => {
  const initialStart =
    MARS_SITES.find((s) => s.name === missionRoute.startLabel) || MARS_SITES[0];
  const initialDest =
    MARS_SITES.find((s) => s.name === missionRoute.destinationLabel) || MARS_SITES[5]; // Nili Fossae nearby Jezero by default or Gale

  const [startSite, setStartSite] = useState<MarsSite>(initialStart);
  const [destSite, setDestSite] = useState<MarsSite>(initialDest);
  const [scienceObjective, setScienceObjective] = useState<string>(
    missionRoute.scienceObjective || SCIENCE_OBJECTIVES[0]
  );
  const [constraints, setConstraints] = useState<RouteConstraintsConfig>(
    missionRoute.constraints || {
      maxSlopeDeg: 20,
      slopePenaltyWeight: 1.5,
      roughnessPenaltyWeight: 1.2,
      roverProfile: 'perseverance'
    }
  );

  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    missionRoute.activeCandidateRoute?.id || 'topographic-astar'
  );
  const [isCopied, setIsCopied] = useState(false);

  const candidateRoutes = useMemo(() => {
    return calculateCandidateRoutes(
      startSite.lat,
      startSite.lng,
      destSite.lat,
      destSite.lng,
      constraints,
      scienceObjective
    );
  }, [startSite, destSite, constraints, scienceObjective]);

  const activeRoute =
    candidateRoutes.find((r) => r.id === selectedRouteId) || candidateRoutes[0];

  // Sync calculated A* plan back to global GeoMars XR state
  useEffect(() => {
    onUpdateRoutePlan({
      start: startSite,
      destination: destSite,
      startLabel: startSite.name,
      destinationLabel: destSite.name,
      distanceKm: activeRoute.distanceKm,
      estimatedSolDays: activeRoute.estimatedSolDays,
      difficultyScore: activeRoute.difficulty,
      status: 'Verified',
      activeCandidateRoute: activeRoute,
      alternativeRoutes: candidateRoutes,
      constraints,
      scienceObjective,
      missionProgressPct: missionRoute.missionProgressPct ?? 0
    });
  }, [startSite, destSite, activeRoute, candidateRoutes, constraints, scienceObjective]);

  const straightLineDistance = useMemo(
    () => calculateMarsDistanceKm(startSite.lat, startSite.lng, destSite.lat, destSite.lng),
    [startSite, destSite]
  );

  const handleSwap = () => {
    const temp = startSite;
    setStartSite(destSite);
    setDestSite(temp);
  };

  const handleExportGeoJson = () => {
    const geojson = exportRouteToGeoJson(activeRoute, startSite.name, destSite.name);
    const blob = new Blob([geojson], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GeoMarsXR-${activeRoute.id}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#080B12] text-[#F5F7FA] select-none scrollbar-thin">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#273244] pb-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#FF6B35] font-semibold tracking-wider text-xs uppercase font-mono">
              <RouteIcon className="w-4 h-4" />
              <span>Deterministic A* Rover Mobility Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Outfit',sans-serif]">
              Rover Mission Control & A* Route Planner
            </h1>
            <p className="text-[#94A3B8] text-xs leading-relaxed max-w-2xl">
              Computes deterministic A* traverse paths across MOLA altimetry, slope constraints, and
              simulated terrain hazard zones—synchronized live with the 3D/XR Mars globe and 2D
              cartography view.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onSelectSiteAndGoToMap(startSite)}
              className="px-3.5 py-2 rounded-xl bg-[#111824] hover:bg-[#0D121C] border border-[#273244] hover:border-[#FF6B35]/60 text-xs font-semibold text-[#F5F7FA] flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Navigation className="w-4 h-4 text-[#FF6B35]" />
              <span>View Route in 3D / XR</span>
            </button>

            <button
              type="button"
              onClick={handleExportGeoJson}
              className="px-3.5 py-2 rounded-xl bg-[#111824] hover:bg-[#0D121C] border border-[#273244] hover:border-[#FF6B35]/60 text-xs font-semibold text-[#F5F7FA] flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-[#338BFF]" />
              <span>{isCopied ? 'Downloaded!' : 'Export GeoJSON'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenReportModal}
              className="px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#F5A65B] text-xs font-bold text-white flex items-center gap-2 transition-all shadow-[0_0_14px_rgba(255,107,53,0.35)] cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Mission Dossier</span>
            </button>
          </div>
        </div>

        {/* Simulation Boundary Banner */}
        <div className="p-3.5 rounded-xl bg-[#111824] border border-amber-500/30 flex items-start gap-3 text-xs text-[#CBD5E1]">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-300">Simulation Boundary Notice:</strong> Landmark
            coordinates and MOLA benchmarks come from public NASA/USGS data, whereas terrain costs,
            hazard buffers, travel time, and route confidence ({activeRoute.routeConfidencePct}%)
            are <strong className="text-white">simulated deterministic estimates</strong>. No
            generated route is certified flight-safe.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#273244] pb-3">
              <span className="text-[13px] font-bold text-[#F5F7FA] flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#FF6B35]" />
                <span>Mission Waypoint Coordinates & Objective</span>
              </span>
              <button
                type="button"
                onClick={handleSwap}
                className="text-[11px] text-[#94A3B8] hover:text-[#FF6B35] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Invert Waypoints</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#0D121C] border border-[#273244]">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="route-start-select"
                    className="text-[#35C98A] font-bold uppercase tracking-wider text-[10px]"
                  >
                    Waypoint Alpha (Start)
                  </label>
                  <span className="font-mono text-[#94A3B8] text-[10px]">
                    {formatElevation(startSite.elevationMeters)}
                  </span>
                </div>
                <select
                  id="route-start-select"
                  value={startSite.id}
                  onChange={(e) => {
                    const s = MARS_SITES.find((site) => site.id === e.target.value);
                    if (s) setStartSite(s);
                  }}
                  className="bg-[#111824] border border-[#273244] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                >
                  {MARS_SITES.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} ({site.category})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[#94A3B8] font-mono">
                  {formatMarsCoordinate(startSite.lat, startSite.lng)}
                </span>
              </div>

              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#0D121C] border border-[#273244]">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="route-dest-select"
                    className="text-[#FF6B35] font-bold uppercase tracking-wider text-[10px]"
                  >
                    Waypoint Omega (Destination)
                  </label>
                  <span className="font-mono text-[#94A3B8] text-[10px]">
                    {formatElevation(destSite.elevationMeters)}
                  </span>
                </div>
                <select
                  id="route-dest-select"
                  value={destSite.id}
                  onChange={(e) => {
                    const s = MARS_SITES.find((site) => site.id === e.target.value);
                    if (s) setDestSite(s);
                  }}
                  className="bg-[#111824] border border-[#273244] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                >
                  {MARS_SITES.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} ({site.category})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[#94A3B8] font-mono">
                  {formatMarsCoordinate(destSite.lat, destSite.lng)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label htmlFor="science-objective" className="text-[#94A3B8] text-[11px]">
                Primary Science Objective:
              </label>
              <select
                id="science-objective"
                value={scienceObjective}
                onChange={(e) => setScienceObjective(e.target.value)}
                className="bg-[#0D121C] border border-[#273244] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
              >
                {SCIENCE_OBJECTIVES.map((obj) => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244]">
                <span className="text-[#94A3B8] text-[10px] block">Great-Circle Arc</span>
                <span className="font-bold text-[#F5F7FA] text-sm">
                  {straightLineDistance.toFixed(1)} km
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244]">
                <span className="text-[#94A3B8] text-[10px] block">Elevation Relief</span>
                <span className="font-bold text-[#F5F7FA] text-sm">
                  {Math.abs(destSite.elevationMeters - startSite.elevationMeters).toLocaleString()} m
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244]">
                <span className="text-[#94A3B8] text-[10px] block">Est. Travel Time</span>
                <span className="font-bold text-[#FF6B35] text-sm">
                  ~{activeRoute.estimatedTravelHours.toLocaleString()} hrs
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244]">
                <span className="text-[#94A3B8] text-[10px] block">Sim. Confidence</span>
                <span className="font-bold text-[#338BFF] text-sm">
                  {activeRoute.routeConfidencePct}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl">
            <span className="text-[13px] font-bold text-[#F5F7FA] flex items-center gap-2 border-b border-[#273244] pb-3">
              <Sliders className="w-4 h-4 text-[#FF6B35]" />
              <span>Mobility Constraints</span>
            </span>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="max-slope-range" className="text-[#94A3B8]">
                  Max Safe Incline:
                </label>
                <span className="font-bold text-[#FF6B35] font-mono">
                  {constraints.maxSlopeDeg}°
                </span>
              </div>
              <input
                id="max-slope-range"
                type="range"
                min="10"
                max="30"
                step="1"
                value={constraints.maxSlopeDeg}
                onChange={(e) =>
                  setConstraints({ ...constraints, maxSlopeDeg: parseInt(e.target.value, 10) })
                }
                className="w-full accent-orange-slider cursor-pointer"
              />
              <span className="text-[10px] text-[#94A3B8]">
                Perseverance rocker-bogie critical limit: 30°
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="slope-weight-range" className="text-[#94A3B8]">
                  Slope Avoidance Weight:
                </label>
                <span className="font-bold text-[#F5F7FA] font-mono">
                  {constraints.slopePenaltyWeight}x
                </span>
              </div>
              <input
                id="slope-weight-range"
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={constraints.slopePenaltyWeight}
                onChange={(e) =>
                  setConstraints({
                    ...constraints,
                    slopePenaltyWeight: parseFloat(e.target.value)
                  })
                }
                className="w-full accent-orange-slider cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label
                htmlFor="rover-profile-select"
                className="text-[#94A3B8] text-[10px] uppercase font-bold"
              >
                Rover Mobility Profile
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="rover-profile-select"
                  value={constraints.roverProfile}
                  onChange={(e) =>
                    setConstraints({
                      ...constraints,
                      roverProfile: e.target.value as RouteConstraintsConfig['roverProfile']
                    })
                  }
                  className="flex-1 bg-[#0D121C] border border-[#273244] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                >
                  <option value="perseverance">Perseverance / MMRTG (120 m/Sol)</option>
                  <option value="curiosity">Curiosity / MSL (100 m/Sol)</option>
                  <option value="exploration-drone">Scout Rotorcraft (650 m/Sol)</option>
                </select>
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#F5F7FA] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#338BFF]" />
              <span>Calculated Candidate Routes (Deterministic A* Comparison)</span>
            </h2>
            <span className="text-xs text-[#94A3B8] font-mono">
              20×13 Geodesic Terrain Grid • Simulated Hazard Buffers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {candidateRoutes.map((route) => {
              const isSelected = route.id === activeRoute.id;
              return (
                <button
                  type="button"
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-lg ${
                    isSelected
                      ? 'bg-[#111824] border-[#FF6B35] shadow-[0_0_16px_rgba(255,107,53,0.25)]'
                      : 'bg-[#0D121C] border-[#273244] hover:border-[#FF6B35]/40 hover:bg-[#111824]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-bold text-[#F5F7FA]">{route.name}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-[#273244]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-3">
                      {route.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-[#080B12] border border-[#273244]">
                        <span className="text-[9px] text-[#94A3B8] block">Route Length</span>
                        <span className="font-bold text-white text-[12px]">
                          {route.distanceKm.toFixed(1)} km
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#080B12] border border-[#273244]">
                        <span className="text-[9px] text-[#94A3B8] block">Transit Time</span>
                        <span className="font-bold text-[#FF6B35] text-[12px]">
                          ~{route.estimatedSolDays} Sols
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#080B12] border border-[#273244]">
                        <span className="text-[9px] text-[#94A3B8] block">Max Slope</span>
                        <span className="font-bold text-white text-[12px]">
                          {route.maxSlopeDeg}°
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#080B12] border border-[#273244]">
                        <span className="text-[9px] text-[#94A3B8] block">Confidence (Sim.)</span>
                        <span className="font-bold text-[#338BFF] text-[12px]">
                          {route.routeConfidencePct}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#273244] text-[11px]">
                    <span className="text-[#94A3B8]">
                      Hazards: {route.hazardsCrossed.length} crossed • {route.hazardsAvoided} avoided
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                        route.difficulty === 'Low'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : route.difficulty === 'Moderate'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {route.difficulty}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulated Hazard Zones Encountered */}
        {activeRoute.hazardsCrossed.length > 0 && (
          <div className="bg-[#111824] border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Simulated Hazard Zones Intersected Along Active Route</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              {activeRoute.hazardsCrossed.map((hz) => (
                <div
                  key={hz.id}
                  className="p-3 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{hz.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
                      {hz.severity} (Simulated)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">{hz.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#273244] pb-3">
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-[14px] font-bold text-[#F5F7FA]">
                Selected Route Altimetry & Slope Cross-Section: {activeRoute.name}
              </span>
            </div>
            <span className="text-xs text-[#94A3B8] font-mono">
              40 Geodesic Samples • Cost Score: {activeRoute.terrainCostScore}
            </span>
          </div>

          <div className="h-44 w-full relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 500 120"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="routeFillGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="20" x2="500" y2="20" stroke="#273244" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#273244" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#273244" strokeDasharray="3 3" />

              {(() => {
                const elevs = activeRoute.profile.map((p) => p.elevationMeters);
                const minE = Math.min(...elevs) - 200;
                const maxE = Math.max(...elevs) + 200;
                const range = maxE - minE || 1;

                const points = activeRoute.profile.map((p, i) => {
                  const x = (i / Math.max(1, activeRoute.profile.length - 1)) * 500;
                  const y = 110 - ((p.elevationMeters - minE) / range) * 90;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                });

                const areaD = `M 0,115 L ${points.join(' L ')} L 500,115 Z`;
                const lineD = `M ${points.join(' L ')}`;

                return (
                  <>
                    <path d={areaD} fill="url(#routeFillGradient)" />
                    <path d={lineD} fill="none" stroke="#FF6B35" strokeWidth="2.5" />
                  </>
                );
              })()}
            </svg>
          </div>

          <div className="flex justify-between items-center text-xs text-[#94A3B8] font-mono border-t border-[#273244] pt-2">
            <span>0 km ({startSite.name.split(' (')[0]})</span>
            <span>Mid-Traverse Terrain</span>
            <span>
              {activeRoute.distanceKm.toFixed(1)} km ({destSite.name.split(' (')[0]})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
