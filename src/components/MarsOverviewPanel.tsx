import type { FC } from 'react';
import type { MarsSite, MapLayerConfig, MarsCoordinate } from '../types/mars';
import { formatMarsCoordinate, formatElevation } from '../utils/marsMath';
import { Globe2 } from 'lucide-react';

interface MarsOverviewPanelProps {
  selectedSite: MarsSite | null;
  activeLayer: MapLayerConfig;
  selectedCoordinate: MarsCoordinate | null;
}

export const MarsOverviewPanel: FC<MarsOverviewPanelProps> = ({
  selectedSite,
  activeLayer,
  selectedCoordinate
}) => {
  const activeLat = selectedCoordinate?.lat ?? (selectedSite ? selectedSite.lat : 18.44);
  const activeLng = selectedCoordinate?.lng ?? (selectedSite ? selectedSite.lng : 77.45);
  const activeElev = selectedCoordinate?.elevationMeters ?? (selectedSite ? selectedSite.elevationMeters : -2536);

  return (
    <div className="h-full bg-[#111824] border border-[#273244] rounded-xl p-3 flex flex-col justify-between select-none shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#273244] pb-1.5">
        <div className="flex items-center gap-1.5">
          <Globe2 className="w-3.5 h-3.5 text-[#FF6B35]" />
          <h3 className="text-[12px] font-bold text-[#F5F7FA] uppercase tracking-wider font-mono">
            Mars Overview
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#35C98A]" />
          <span className="text-[10px] text-[#35C98A] font-mono">IAU 2000 ONLINE</span>
        </div>
      </div>

      <div className="flex items-center gap-3 my-auto">
        {/* Photorealistic Mars Sphere Graphic */}
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#8E2805] via-[#C85A32] to-[#FFA06A] shrink-0 shadow-[0_0_14px_rgba(255,107,53,0.35)] overflow-hidden flex items-center justify-center border border-[#FF6B35]/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(255,170,120,0.5),transparent_60%)]" />
          <div className="absolute top-1 left-2 w-4 h-2 rounded-full bg-[#521F10]/50 blur-[0.5px]" />
          <div className="absolute bottom-2 left-3 w-8 h-3 rounded-full bg-[#3D1409]/60 blur-[0.5px] rotate-[-15deg]" />
          <div className="absolute top-0 left-5 w-5 h-1.5 rounded-full bg-white/80 blur-[0.5px]" />
        </div>

        {/* Selected Region & Dataset Telemetry */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 text-[11px]">
          <div className="flex justify-between items-baseline">
            <span className="text-[#94A3B8] text-[10px]">Region:</span>
            <span className="font-bold text-[#F5F7FA] truncate max-w-[140px]">
              {selectedSite ? selectedSite.name.split(' (')[0] : 'Jezero Quadrangle'}
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-[#94A3B8] text-[10px]">Active Layer:</span>
            <span className="font-semibold text-[#FF6B35] truncate max-w-[140px] text-[10px]">
              {activeLayer.name}
            </span>
          </div>

          <div className="flex justify-between items-baseline font-mono text-[10px]">
            <span className="text-[#94A3B8]">Coordinates:</span>
            <span className="text-[#F5F7FA]">
              {formatMarsCoordinate(activeLat, activeLng)}
            </span>
          </div>

          <div className="flex justify-between items-baseline font-mono text-[10px]">
            <span className="text-[#94A3B8]">Elevation:</span>
            <span className="text-[#338BFF] font-semibold">
              {formatElevation(activeElev)}
            </span>
          </div>
        </div>
      </div>

      {/* Planetary Benchmark Constants Footer */}
      <div className="flex justify-between items-center text-[9px] text-[#94A3B8] font-mono border-t border-[#273244] pt-1.5">
        <span>R: 3,389.5 km</span>
        <span>g: 3.71 m/s²</span>
        <span>Sol: 24h 39m</span>
        <span>PDS L3 Ver.</span>
      </div>
    </div>
  );
};
