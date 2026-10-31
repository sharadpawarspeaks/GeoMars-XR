import type { FC } from 'react';
import type { MapLayerConfig, MapOverlaysConfig } from '../types/mars';
import { LAYER_CATALOG } from '../data/layerCatalog';
import {
  Menu,
  Check,
  MapPin,
  Flag,
  Crosshair,
  Compass
} from 'lucide-react';

interface MapLayersSidebarProps {
  activeLayer: MapLayerConfig;
  onSelectLayer: (layer: MapLayerConfig) => void;
  overlays: MapOverlaysConfig;
  onToggleOverlay: (key: keyof MapOverlaysConfig) => void;
  layerOpacity: number;
  onChangeOpacity: (val: number) => void;
  onReset: () => void;
}

// Visual thumbnail component representing each raster layer preview
const LayerThumbnail: FC<{ layerId: string }> = ({ layerId }) => {
  switch (layerId) {
    case 'visual-imagery':
      return (
        <div className="w-8 h-8 rounded-md overflow-hidden bg-gradient-to-br from-[#A64B2A] via-[#C85A32] to-[#6E2E18] border border-white/20 shrink-0 relative shadow-inner">
          <div className="absolute top-1 left-2 w-2 h-1.5 rounded-full bg-[#521F10]/40" />
          <div className="absolute bottom-1 right-1 w-3 h-2 rounded-full bg-[#3D1409]/30" />
        </div>
      );
    case 'elevation-mola':
      return (
        <div className="w-8 h-8 rounded-md overflow-hidden bg-gradient-to-r from-[#2050E0] via-[#20D080] via-[#E8D020] to-[#E02020] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'hillshade-mola':
      return (
        <div className="w-8 h-8 rounded-md overflow-hidden bg-gradient-to-br from-[#E0E0E0] via-[#757575] to-[#212121] border border-white/20 shrink-0 relative shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_60%)]" />
        </div>
      );
    case 'themis-day':
      return (
        <div className="w-8 h-8 rounded-md overflow-hidden bg-gradient-to-tr from-[#6B21A8] via-[#06B6D4] to-[#EC4899] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'themis-night':
      return (
        <div className="w-8 h-8 rounded-md overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#38BDF8] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'false-color-mineral':
      return (
        <div className="w-8 h-8 rounded-md overflow-hidden bg-gradient-to-br from-[#F59E0B] via-[#EF4444] to-[#8B5CF6] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'terrain-roughness':
      return (
        <div className="w-8 h-8 rounded-md overflow-hidden bg-gradient-to-tr from-[#78350F] via-[#B45309] to-[#D97706] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'ctx-mosaic':
      return (
        <div className="w-8 h-8 rounded-md overflow-hidden bg-gradient-to-b from-[#64748B] via-[#334155] to-[#0F172A] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'hirise-regional':
    default:
      return (
        <div className="w-8 h-8 rounded-md overflow-hidden bg-gradient-to-tr from-[#475569] via-[#94A3B8] to-[#1E293B] border border-white/20 shrink-0 shadow-inner" />
      );
  }
};

export const MapLayersSidebar: FC<MapLayersSidebarProps> = ({
  activeLayer,
  onSelectLayer,
  overlays,
  onToggleOverlay,
  layerOpacity,
  onChangeOpacity,
  onReset
}) => {
  const baseLayers = LAYER_CATALOG.filter((l) => l.group === 'base');
  const scientificLayers = LAYER_CATALOG.filter((l) => l.group === 'scientific');
  const highResLayers = LAYER_CATALOG.filter((l) => l.group === 'highres');

  return (
    <aside className="w-[280px] min-w-[280px] h-full bg-[#04121B] border border-[#19303E] rounded-xl flex flex-col z-20 select-none overflow-hidden shrink-0 shadow-lg">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#19303E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Menu className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-[13px] font-bold text-[#F4F7FA] tracking-wide">
            Map Layers
          </h2>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] font-medium text-[#71869A] hover:text-[#FF6B35] transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Layer Groups Container */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-4 scrollbar-thin text-xs">
        {/* A. BASE MAPS */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#71869A] px-1">
            BASE MAPS
          </span>

          <div className="flex flex-col gap-1">
            {baseLayers.map((layer) => {
              const isSelected = activeLayer.id === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => onSelectLayer(layer)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-[#0B1C29] border-[#FF6B35] shadow-[0_0_12px_rgba(255,107,53,0.15)]'
                      : 'bg-[#04121B] border-transparent hover:bg-[#081925] hover:border-[#19303E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Selected Check Circle */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-[#FF6B35] bg-[#FF6B35] text-white'
                          : 'border-[#19303E] bg-[#081925]'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>

                    <LayerThumbnail layerId={layer.id} />

                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-medium text-[#F4F7FA] truncate">
                        {layer.name}
                      </span>
                      <span className="text-[10px] text-[#71869A] truncate">
                        {layer.subtitle}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* B. SCIENTIFIC MAPS */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#71869A] px-1">
            SCIENTIFIC MAPS
          </span>

          <div className="flex flex-col gap-1">
            {scientificLayers.map((layer) => {
              const isSelected = activeLayer.id === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => onSelectLayer(layer)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-[#0B1C29] border-[#FF6B35] shadow-[0_0_12px_rgba(255,107,53,0.15)]'
                      : 'bg-[#04121B] border-transparent hover:bg-[#081925] hover:border-[#19303E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-[#FF6B35] bg-[#FF6B35] text-white'
                          : 'border-[#19303E] bg-[#081925]'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>

                    <LayerThumbnail layerId={layer.id} />

                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-medium text-[#F4F7FA] truncate">
                        {layer.name}
                      </span>
                      <span className="text-[10px] text-[#71869A] truncate">
                        {layer.subtitle}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* C. HIGH-RES IMAGERY */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#71869A] px-1">
            HIGH-RES IMAGERY
          </span>

          <div className="flex flex-col gap-1">
            {highResLayers.map((layer) => {
              const isSelected = activeLayer.id === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => onSelectLayer(layer)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-[#0B1C29] border-[#FF6B35] shadow-[0_0_12px_rgba(255,107,53,0.15)]'
                      : 'bg-[#04121B] border-transparent hover:bg-[#081925] hover:border-[#19303E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-[#FF6B35] bg-[#FF6B35] text-white'
                          : 'border-[#19303E] bg-[#081925]'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>

                    <LayerThumbnail layerId={layer.id} />

                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-medium text-[#F4F7FA] truncate">
                        {layer.name}
                      </span>
                      <span className="text-[10px] text-[#71869A] truncate">
                        {layer.subtitle}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* D. OVERLAYS */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#19303E]/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#71869A] px-1">
            OVERLAYS
          </span>

          <div className="flex flex-col gap-2">
            {/* Rover Landing Sites */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs text-[#F4F7FA]">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span className="text-[12px]">Rover Landing Sites</span>
              </div>
              <button
                onClick={() => onToggleOverlay('roverLandingSites')}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  overlays.roverLandingSites ? 'bg-[#FF6B35]' : 'bg-[#19303E]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    overlays.roverLandingSites ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Mission Locations */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs text-[#F4F7FA]">
                <Flag className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span className="text-[12px]">Mission Locations</span>
              </div>
              <button
                onClick={() => onToggleOverlay('missionLocations')}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  overlays.missionLocations ? 'bg-[#FF6B35]' : 'bg-[#19303E]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    overlays.missionLocations ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Points of Interest */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs text-[#F4F7FA]">
                <Crosshair className="w-3.5 h-3.5 text-[#71869A]" />
                <span className="text-[12px]">Points of Interest</span>
              </div>
              <button
                onClick={() => onToggleOverlay('pointsOfInterest')}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  overlays.pointsOfInterest ? 'bg-[#FF6B35]' : 'bg-[#19303E]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    overlays.pointsOfInterest ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Planned Route */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs text-[#F4F7FA]">
                <Compass className="w-3.5 h-3.5 text-[#71869A]" />
                <span className="text-[12px]">Planned Route</span>
              </div>
              <button
                onClick={() => onToggleOverlay('plannedRoute')}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  overlays.plannedRoute ? 'bg-[#FF6B35]' : 'bg-[#19303E]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    overlays.plannedRoute ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* E. LAYER OPACITY (Footer) */}
      <div className="p-3.5 border-t border-[#19303E] bg-[#04121B] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-medium">
          <span className="text-[#A7B8C8]">Layer Opacity</span>
          <span className="font-mono text-[#F4F7FA]">{Math.round(layerOpacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.01"
          value={layerOpacity}
          onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
          className="w-full accent-orange-slider cursor-pointer"
        />
      </div>
    </aside>
  );
};
