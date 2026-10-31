import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Map as MapIcon, Mountain, Rocket, Sparkles, Orbit } from 'lucide-react';
import type { TabType } from '../types/mars';
import { getMarsMissionTelemetry } from '../utils/marsMath';

interface TopNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeLayerName: string;
  isMapLoading: boolean;
}

export const TopNav: FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  activeLayerName,
  isMapLoading
}) => {
  const [telemetry, setTelemetry] = useState(getMarsMissionTelemetry());

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(getMarsMissionTelemetry());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const navItems: { id: TabType; label: string; icon: typeof MapIcon }[] = [
    { id: 'map', label: 'Interactive Map', icon: MapIcon },
    { id: 'terrain', label: 'Terrain & MOLA', icon: Mountain },
    { id: 'missions', label: 'Missions', icon: Rocket },
    { id: 'science', label: 'Astrobiology', icon: Sparkles }
  ];

  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#090b10]/95 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none text-zinc-200">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-600/10 border border-red-500/30 text-red-400">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="font-bold text-lg tracking-tight text-white font-['Outfit',sans-serif]">
            Geo<span className="text-red-500">Mars</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-wider bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
            NASA PDS
          </span>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-lg border border-white/[0.06]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white/[0.1] text-white shadow-sm border border-white/[0.12]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-400' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Telemetry / Status Indicator */}
      <div className="flex items-center gap-3 text-xs">
        {/* Active Layer Readout */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-300">
          <span className={`w-1.5 h-1.5 rounded-full ${isMapLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="text-zinc-400 text-[11px]">Layer:</span>
          <span className="font-medium max-w-[150px] truncate text-white text-[11px]">
            {activeLayerName}
          </span>
        </div>

        {/* Mars Sol & Clock */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] font-mono text-[11px] text-zinc-300">
          <Orbit className="w-3.5 h-3.5 text-red-400" />
          <span className="text-white font-semibold">Sol {telemetry.currentSol}</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400">L_s {telemetry.solarLongLs}°</span>
        </div>

        {/* System Status Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Online</span>
        </div>
      </div>
    </header>
  );
};
