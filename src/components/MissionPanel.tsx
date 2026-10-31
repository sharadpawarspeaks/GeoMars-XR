import { useState } from 'react';
import type { FC } from 'react';
import type { MissionRoutePlan } from '../types/mars';
import {
  Navigation,
  ArrowRight,
  ArrowLeftRight,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Clock
} from 'lucide-react';
import { formatMarsCoordinate } from '../utils/marsMath';

interface MissionPanelProps {
  missionRoute: MissionRoutePlan;
  onClearRoute: () => void;
  onSwapRoute: () => void;
}

export const MissionPanel: FC<MissionPanelProps> = ({
  missionRoute,
  onClearRoute,
  onSwapRoute
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const hasRoute = missionRoute.distanceKm > 0;

  return (
    <div className="w-full bg-[#0a0c12]/95 border-t border-white/[0.08] text-xs select-none backdrop-blur-md shadow-2xl z-20">
      {/* Sleek Dock Summary Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-300 font-medium text-xs">
            <Navigation className="w-3.5 h-3.5 text-red-400" />
            <span>Traverse Route:</span>
          </div>

          {hasRoute ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-white max-w-[130px] sm:max-w-[180px] truncate">
                {missionRoute.startLabel}
              </span>
              <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0" />
              <span className="font-medium text-white max-w-[130px] sm:max-w-[180px] truncate">
                {missionRoute.destinationLabel}
              </span>
              <span className="text-zinc-600 hidden sm:inline">|</span>
              <span className="font-mono text-zinc-300 font-semibold hidden sm:inline">
                {missionRoute.distanceKm.toFixed(1)} km
              </span>
              <span className="text-zinc-400 text-[11px] hidden md:inline">
                (~{missionRoute.estimatedSolDays} Sols)
              </span>
            </div>
          ) : (
            <span className="text-zinc-500 text-[11px]">
              Select start & destination on map to plan rover traverse
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasRoute && (
            <>
              <button
                onClick={onSwapRoute}
                className="text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-white/[0.06] text-[11px] flex items-center gap-1 transition-colors"
                title="Reverse Waypoint Direction"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span className="hidden sm:inline">Swap</span>
              </button>
              <button
                onClick={onClearRoute}
                className="text-zinc-400 hover:text-red-400 px-2 py-1 rounded hover:bg-white/[0.06] text-[11px] flex items-center gap-1 transition-colors"
                title="Reset Route"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white text-[11px] transition-colors border border-white/[0.08]"
          >
            <span>{isExpanded ? 'Hide Details' : 'Route Details'}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Metrics Content */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-white/[0.06] bg-[#090b10]/95">
          {/* Waypoint A */}
          <div className="flex flex-col bg-zinc-900/40 p-3 rounded-lg border border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span className="text-emerald-400 font-medium">Waypoint A (Origin)</span>
              <span className="text-[10px] text-zinc-500">START</span>
            </div>
            <div className="font-semibold text-white text-sm truncate">
              {missionRoute.startLabel}
            </div>
            <div className="font-mono text-[11px] text-zinc-400 mt-1">
              {missionRoute.start && 'lat' in missionRoute.start
                ? formatMarsCoordinate(missionRoute.start.lat, missionRoute.start.lng)
                : 'Click map or site to assign'}
            </div>
          </div>

          {/* Waypoint B */}
          <div className="flex flex-col bg-zinc-900/40 p-3 rounded-lg border border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span className="text-red-400 font-medium">Waypoint B (Target)</span>
              <span className="text-[10px] text-zinc-500">DESTINATION</span>
            </div>
            <div className="font-semibold text-white text-sm truncate">
              {missionRoute.destinationLabel}
            </div>
            <div className="font-mono text-[11px] text-zinc-400 mt-1">
              {missionRoute.destination && 'lat' in missionRoute.destination
                ? formatMarsCoordinate(missionRoute.destination.lat, missionRoute.destination.lng)
                : 'Click map or site to assign'}
            </div>
          </div>

          {/* Metrics */}
          <div className="flex flex-col bg-zinc-900/40 p-3 rounded-lg border border-white/[0.06] justify-between">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span className="text-zinc-300 font-medium">Geodesic Trajectory</span>
              <span className="text-[10px] text-zinc-500">R = 3,389.5 km</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white font-mono">
                {hasRoute ? `${missionRoute.distanceKm.toFixed(1)} km` : '0.0 km'}
              </span>
              {hasRoute && (
                <span className="text-[11px] text-zinc-400 font-mono">
                  ({(missionRoute.distanceKm * 0.621371).toFixed(1)} mi)
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>Transit: ~{hasRoute ? missionRoute.estimatedSolDays : 0} Sols</span>
              </span>
              <span className="text-zinc-300 font-medium">
                Slope: {hasRoute ? missionRoute.difficultyScore : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
