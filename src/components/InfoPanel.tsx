import type { FC } from 'react';
import type {
  MarsCoordinate,
  MarsSite,
  MapLayerConfig,
  MissionRoutePlan
} from '../types/mars';
import {
  formatMarsCoordinate,
  formatPlanetocentricLon,
  formatElevation
} from '../utils/marsMath';
import {
  Compass,
  Mountain,
  Layers,
  Flag,
  Navigation,
  Sparkles,
  Database
} from 'lucide-react';

interface InfoPanelProps {
  selectedCoordinate: MarsCoordinate | null;
  selectedSite: MarsSite | null;
  activeLayer: MapLayerConfig;
  missionRoute?: MissionRoutePlan;
  onSetRouteStart: (point: MarsSite | MarsCoordinate) => void;
  onSetRouteDestination: (point: MarsSite | MarsCoordinate) => void;
}

export const InfoPanel: FC<InfoPanelProps> = ({
  selectedCoordinate,
  selectedSite,
  activeLayer,
  missionRoute,
  onSetRouteStart,
  onSetRouteDestination
}) => {
  const lat = selectedCoordinate?.lat ?? (selectedSite ? selectedSite.lat : 18.38);
  const lng = selectedCoordinate?.lng ?? (selectedSite ? selectedSite.lng : 77.58);
  const elevation = selectedSite?.elevationMeters ?? selectedCoordinate?.elevationMeters;

  return (
    <div className="flex flex-col h-full bg-[#0a0c12]/95 border-l border-white/[0.08] p-4 overflow-y-auto scrollbar-thin text-zinc-300 text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-xs tracking-wide">
            Planetary Dossier
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] font-mono">
          IAU 2000 Mars
        </span>
      </div>

      {/* Target Title & Badge Card */}
      <div className="bg-zinc-900/40 border border-white/[0.06] rounded-xl p-3.5 mb-3.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-semibold text-red-400 tracking-wider">
            {selectedSite ? selectedSite.category : 'Surface Target'}
          </span>
          {selectedSite?.missionStatus && (
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                selectedSite.missionStatus === 'Active'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {selectedSite.missionStatus}
            </span>
          )}
        </div>

        <h2 className="text-base font-bold text-white font-['Outfit',sans-serif]">
          {selectedSite ? selectedSite.name : 'Selected Coordinate'}
        </h2>

        {selectedSite?.mission && (
          <div className="text-[11px] text-zinc-400">
            <span>Mission: </span>
            <span className="text-zinc-200 font-medium">
              {selectedSite.mission} ({selectedSite.agency})
            </span>
          </div>
        )}
      </div>

      {/* Section 1: Surface Geolocation */}
      <div className="flex flex-col gap-2 mb-3.5 bg-zinc-900/30 p-3 rounded-xl border border-white/[0.05]">
        <div className="flex items-center gap-1.5 text-zinc-300 font-medium text-xs">
          <Compass className="w-3.5 h-3.5 text-red-400" />
          <span>Surface Geolocation</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-0.5">
          <div className="flex flex-col bg-zinc-950/60 p-2 rounded-lg border border-white/[0.04]">
            <span className="text-[10px] text-zinc-500">LAT / LON</span>
            <span className="font-mono font-medium text-white text-xs mt-0.5">
              {formatMarsCoordinate(lat, lng)}
            </span>
          </div>

          <div className="flex flex-col bg-zinc-950/60 p-2 rounded-lg border border-white/[0.04]">
            <span className="text-[10px] text-zinc-500">PLANETOCENTRIC</span>
            <span className="font-mono font-medium text-white text-xs mt-0.5">
              {formatPlanetocentricLon(lng)}
            </span>
          </div>
        </div>

        {/* Elevation Readout */}
        <div className="flex items-center justify-between bg-zinc-950/60 p-2 rounded-lg border border-white/[0.04] mt-0.5">
          <div className="flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-zinc-400">MOLA ELEVATION</span>
          </div>
          <span className="font-mono font-medium text-amber-300 text-xs">
            {elevation !== undefined ? (
              formatElevation(elevation)
            ) : (
              <span className="text-zinc-500 font-normal">
                Querying areoid...
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Section 2: Geology & Stratigraphy */}
      <div className="flex flex-col gap-2 mb-3.5 bg-zinc-900/30 p-3 rounded-xl border border-white/[0.05]">
        <div className="flex items-center gap-1.5 text-zinc-300 font-medium text-xs">
          <Layers className="w-3.5 h-3.5 text-red-400" />
          <span>Geological Stratigraphy</span>
        </div>

        <p className="text-[11px] leading-relaxed text-zinc-300">
          {selectedSite?.geology ??
            'Regional basaltic regolith mixed with aeolian dust deposits. Smooth plain with dispersed secondary impact craters.'}
        </p>

        {selectedSite?.description && (
          <div className="mt-1 text-[11px] text-zinc-400 border-t border-white/[0.05] pt-2 leading-relaxed">
            {selectedSite.description}
          </div>
        )}
      </div>

      {/* Section 3: Scientific Observations */}
      {selectedSite?.scienceHighlights && (
        <div className="flex flex-col gap-2 mb-3.5 bg-zinc-900/30 p-3 rounded-xl border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-zinc-300 font-medium text-xs">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Mission Science Findings</span>
          </div>

          <ul className="flex flex-col gap-1.5 mt-0.5">
            {selectedSite.scienceHighlights.map((highlight, idx) => (
              <li
                key={idx}
                className="text-[11px] leading-relaxed text-zinc-300 flex items-start gap-1.5"
              >
                <span className="text-red-400 mt-0.5 shrink-0">•</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 4: Data Source & Resolution Ledger */}
      <div className="flex flex-col gap-2 mb-3.5 bg-zinc-900/30 p-3 rounded-xl border border-white/[0.05]">
        <div className="flex items-center gap-1.5 text-zinc-300 font-medium text-xs">
          <Database className="w-3.5 h-3.5 text-zinc-400" />
          <span>Active Dataset Source</span>
        </div>

        <div className="flex flex-col gap-1 text-[11px] text-zinc-400 mt-0.5 font-mono">
          <div className="flex justify-between py-0.5 border-b border-white/[0.04]">
            <span className="text-zinc-500 font-sans">Layer:</span>
            <span className="text-zinc-200">{activeLayer.name}</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-white/[0.04]">
            <span className="text-zinc-500 font-sans">Provider:</span>
            <span className="text-zinc-200">{activeLayer.provider}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-zinc-500 font-sans">Resolution:</span>
            <span className="text-zinc-200">{activeLayer.resolution}</span>
          </div>
        </div>
      </div>

      {/* Section 5: Expedition Waypoint Actions */}
      <div className="mt-auto pt-3 border-t border-white/[0.08] flex flex-col gap-2">
        {missionRoute && missionRoute.distanceKm > 0 && (
          <div className="flex items-center justify-between bg-zinc-900/60 px-2.5 py-1.5 rounded-lg border border-white/[0.05] text-[11px]">
            <span className="text-zinc-400">Active Vector:</span>
            <span className="text-zinc-200 font-mono font-medium">
              {missionRoute.distanceKm.toFixed(1)} km (~{missionRoute.estimatedSolDays} Sols)
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const point = selectedSite || {
                lat,
                lng,
                elevationMeters: elevation
              };
              onSetRouteStart(point);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-white text-xs font-medium border border-white/[0.08] transition-colors"
          >
            <Flag className="w-3 h-3 text-emerald-400" />
            <span>Set as Start</span>
          </button>

          <button
            onClick={() => {
              const point = selectedSite || {
                lat,
                lng,
                elevationMeters: elevation
              };
              onSetRouteDestination(point);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-200 text-xs font-medium border border-red-500/30 transition-colors shadow-sm"
          >
            <Navigation className="w-3 h-3 text-red-400" />
            <span>Set as Dest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
