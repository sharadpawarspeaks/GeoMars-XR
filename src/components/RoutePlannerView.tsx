import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { MarsSite, RouteConstraintsConfig, MapLayerConfig } from '../types/mars';
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
  Zap
} from 'lucide-react';

interface RoutePlannerViewProps {
  onSelectSiteAndGoToMap: (site: MarsSite) => void;
  onOpenReportModal: () => void;
  activeLayer: MapLayerConfig;
}

export const RoutePlannerView: FC<RoutePlannerViewProps> = ({
  onSelectSiteAndGoToMap,
  onOpenReportModal
}) => {
  const [startSite, setStartSite] = useState<MarsSite>(MARS_SITES[0]); // Jezero Crater
  const [destSite, setDestSite] = useState<MarsSite>(MARS_SITES[1]); // Gale Crater
  const [constraints, setConstraints] = useState<RouteConstraintsConfig>({
    maxSlopeDeg: 20,
    slopePenaltyWeight: 1.5,
    roughnessPenaltyWeight: 1.2,
    roverProfile: 'perseverance'
  });

  const [selectedRouteId, setSelectedRouteId] = useState<string>('topographic-astar');
  const [isCopied, setIsCopied] = useState(false);

  // Compute 3 candidate routes dynamically
  const candidateRoutes = useMemo(() => {
    return calculateCandidateRoutes(
      startSite.lat,
      startSite.lng,
      destSite.lat,
      destSite.lng,
      constraints
    );
  }, [startSite, destSite, constraints]);

  const activeRoute =
    candidateRoutes.find((r) => r.id === selectedRouteId) || candidateRoutes[0];

  const straightLineDistance = useMemo(() => {
    return calculateMarsDistanceKm(startSite.lat, startSite.lng, destSite.lat, destSite.lng);
  }, [startSite, destSite]);

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
    a.download = `GeoMars-${activeRoute.id}.geojson`;
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
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#273244] pb-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#FF6B35] font-semibold tracking-wider text-xs uppercase font-mono">
              <RouteIcon className="w-4 h-4" />
              <span>Autonomous Rover Mobility Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Outfit',sans-serif]">
              Mission Planner & Route Analyzer
            </h1>
            <p className="text-[#94A3B8] text-xs leading-relaxed max-w-2xl">
              Calculates energy-efficient geodesic paths across the Martian areoid using MOLA altimetry, slope angle penalties, and vehicle mobility constraints.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onSelectSiteAndGoToMap(startSite)}
              className="px-3.5 py-2 rounded-xl bg-[#111824] hover:bg-[#0D121C] border border-[#273244] hover:border-[#FF6B35]/60 text-xs font-semibold text-[#F5F7FA] flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Navigation className="w-4 h-4 text-[#FF6B35]" />
              <span>View on Map</span>
            </button>

            <button
              onClick={handleExportGeoJson}
              className="px-3.5 py-2 rounded-xl bg-[#111824] hover:bg-[#0D121C] border border-[#273244] hover:border-[#FF6B35]/60 text-xs font-semibold text-[#F5F7FA] flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-[#338BFF]" />
              <span>{isCopied ? 'Downloaded!' : 'Export GeoJSON'}</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#F5A65B] text-xs font-bold text-white flex items-center gap-2 transition-all shadow-[0_0_14px_rgba(255,107,53,0.35)] cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Mission Dossier</span>
            </button>
          </div>
        </div>

        {/* Waypoints Selection & Constraints Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Waypoints Card */}
          <div className="lg:col-span-2 bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#273244] pb-3">
              <span className="text-[13px] font-bold text-[#F5F7FA] flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#FF6B35]" />
                <span>Mission Waypoint Coordinates</span>
              </span>
              <button
                onClick={handleSwap}
                className="text-[11px] text-[#94A3B8] hover:text-[#FF6B35] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Invert Start and Destination"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Invert Waypoints</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Point */}
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#0D121C] border border-[#273244]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#338BFF] font-bold uppercase tracking-wider text-[10px]">
                    Waypoint Alpha (Start)
                  </span>
                  <span className="font-mono text-[#94A3B8] text-[10px]">
                    {formatElevation(startSite.elevationMeters)}
                  </span>
                </div>
                <select
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

              {/* Destination Point */}
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#0D121C] border border-[#273244]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#FF6B35] font-bold uppercase tracking-wider text-[10px]">
                    Waypoint Omega (Destination)
                  </span>
                  <span className="font-mono text-[#94A3B8] text-[10px]">
                    {formatElevation(destSite.elevationMeters)}
                  </span>
                </div>
                <select
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

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-mono">
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
                <span className="text-[#94A3B8] text-[10px] block">Nominal Speed</span>
                <span className="font-bold text-[#338BFF] text-sm">~120 m/Sol</span>
              </div>
            </div>
          </div>

          {/* Constraints & Vehicle Tuning */}
          <div className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl">
            <span className="text-[13px] font-bold text-[#F5F7FA] flex items-center gap-2 border-b border-[#273244] pb-3">
              <Sliders className="w-4 h-4 text-[#FF6B35]" />
              <span>Mobility Constraints</span>
            </span>

            {/* Max Slope Incline */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Max Safe Incline:</span>
                <span className="font-bold text-[#FF6B35] font-mono">{constraints.maxSlopeDeg}°</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                step="1"
                value={constraints.maxSlopeDeg}
                onChange={(e) =>
                  setConstraints({ ...constraints, maxSlopeDeg: parseInt(e.target.value) })
                }
                className="w-full accent-[#FF6B35] bg-[#0D121C] h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-[#94A3B8]">
                Perseverance rocker-bogie limit: 30° critical tip angle
              </span>
            </div>

            {/* Slope Penalty Weight */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Slope Avoidance Weight:</span>
                <span className="font-bold text-[#F5F7FA] font-mono">
                  {constraints.slopePenaltyWeight}x
                </span>
              </div>
              <input
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
                className="w-full accent-[#FF6B35] bg-[#0D121C] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Vehicle Profile */}
            <div className="flex flex-col gap-1 text-xs">
              <span className="text-[#94A3B8] text-[10px] uppercase font-bold">Rover Mobility Profile</span>
              <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#F5F7FA] block">Perseverance / MMRTG</span>
                  <span className="text-[10px] text-[#94A3B8]">AutoNav visual odometry</span>
                </div>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Routes Comparison */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#F5F7FA] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#338BFF]" />
              <span>Calculated Candidate Routes Comparison</span>
            </h2>
            <span className="text-xs text-[#94A3B8]">A* Geodesic Multi-Criteria Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {candidateRoutes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-lg ${
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
                        <span className="text-[9px] text-[#94A3B8] block">Terrain Cost</span>
                        <span className="font-bold text-[#338BFF] text-[12px]">
                          {route.terrainCostScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#273244] text-[11px]">
                    <span className="text-[#94A3B8]">Difficulty Rating:</span>
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Route Elevation Cross-Section Chart */}
        <div className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#273244] pb-3">
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-[14px] font-bold text-[#F5F7FA]">
                Selected Route Altimetry & Slope Cross-Section: {activeRoute.name}
              </span>
            </div>
            <span className="text-xs text-[#94A3B8] font-mono">
              Resolution: 40 Interpolated Geodesic Samples
            </span>
          </div>

          {/* SVG Elevation Profile Curve */}
          <div className="h-44 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="routeFillGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#273244" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#273244" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#273244" strokeDasharray="3 3" />

              {/* Area Path */}
              {(() => {
                const elevs = activeRoute.profile.map((p) => p.elevationMeters);
                const minE = Math.min(...elevs) - 200;
                const maxE = Math.max(...elevs) + 200;
                const range = maxE - minE || 1;

                const points = activeRoute.profile.map((p, i) => {
                  const x = (i / (activeRoute.profile.length - 1)) * 500;
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
            <span>Mid-Traverse Ridge</span>
            <span>{activeRoute.distanceKm.toFixed(1)} km ({destSite.name.split(' (')[0]})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
