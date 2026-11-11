import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { MapLayerConfig, MapOverlaysConfig } from '../types/mars';
import { LAYER_CATALOG } from '../data/layerCatalog';
import {
  Layers,
  Check,
  Search,
  ChevronDown,
  ChevronRight,
  Info,
  MapPin,
  Flag,
  Crosshair,
  Compass,
  Sliders,
  RotateCcw
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

const LayerThumbnail: FC<{ layerId: string }> = ({ layerId }) => {
  switch (layerId) {
    case 'visual-imagery':
      return (
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-br from-[#A64B2A] via-[#C85A32] to-[#6E2E18] border border-white/20 shrink-0 relative shadow-inner">
          <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-[#521F10]/50" />
          <div className="absolute bottom-1 right-1 w-2.5 h-1.5 rounded-full bg-[#3D1409]/40" />
        </div>
      );
    case 'regional-imagery':
      return (
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-b from-[#64748B] via-[#475569] to-[#1E293B] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'elevation-mola':
      return (
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-r from-[#2050E0] via-[#20D080] via-[#E8D020] to-[#E02020] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'hillshade-mola':
      return (
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-br from-[#E0E0E0] via-[#757575] to-[#212121] border border-white/20 shrink-0 relative shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_60%)]" />
        </div>
      );
    case 'slope-map':
      return (
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-tr from-[#16A34A] via-[#EAB308] to-[#DC2626] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'terrain-roughness':
      return (
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-tr from-[#78350F] via-[#B45309] to-[#D97706] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'themis-day':
      return (
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-tr from-[#6B21A8] via-[#06B6D4] to-[#EC4899] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'themis-night':
      return (
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#38BDF8] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'false-color-mineral':
      return (
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-br from-[#F59E0B] via-[#EF4444] to-[#8B5CF6] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'ctx-mosaic':
      return (
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-b from-[#64748B] via-[#334155] to-[#0F172A] border border-white/20 shrink-0 shadow-inner" />
      );
    case 'hirise-regional':
    default:
      return (
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-tr from-[#475569] via-[#94A3B8] to-[#1E293B] border border-white/20 shrink-0 shadow-inner" />
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
  const [searchFilter, setSearchFilter] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    imagery: false,
    topography: false,
    thermal: false,
    highres: false,
    overlays: false
  });
  const [showActiveLayerDetails, setShowActiveLayerDetails] = useState(false);

  const toggleCategory = (catKey: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey]
    }));
  };

  const filteredLayers = useMemo(() => {
    if (!searchFilter.trim()) return LAYER_CATALOG;
    const q = searchFilter.toLowerCase();
    return LAYER_CATALOG.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.subtitle && l.subtitle.toLowerCase().includes(q)) ||
        l.provider.toLowerCase().includes(q) ||
        l.group?.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  const layerSections: { key: string; title: string; layers: MapLayerConfig[] }[] = [
    { key: 'imagery', title: 'Imagery', layers: filteredLayers.filter((l) => l.group === 'imagery') },
    {
      key: 'topography',
      title: 'Topography',
      layers: filteredLayers.filter((l) => l.group === 'topography')
    },
    {
      key: 'thermal',
      title: 'Thermal & Mineral',
      layers: filteredLayers.filter((l) => l.group === 'thermal' || l.group === 'scientific')
    },
    {
      key: 'highres',
      title: 'High-Resolution Data',
      layers: filteredLayers.filter((l) => l.group === 'highres')
    }
  ];

  const overlayRows: {
    key: keyof MapOverlaysConfig;
    label: string;
    icon: typeof MapPin;
    accent: boolean;
  }[] = [
    { key: 'roverLandingSites', label: 'Rover Landing Sites', icon: MapPin, accent: true },
    { key: 'missionLocations', label: 'Lander Missions', icon: Flag, accent: true },
    { key: 'pointsOfInterest', label: 'Scientific Landmarks', icon: Crosshair, accent: false },
    { key: 'plannedRoute', label: 'Planned Rover Route', icon: Compass, accent: true }
  ];

  return (
    <aside className="w-[280px] min-w-[280px] h-full bg-[#111824] border border-[#273244] rounded-xl flex flex-col z-20 select-none overflow-hidden shrink-0 shadow-2xl">
      <div className="px-4 py-3 border-b border-[#273244] flex items-center justify-between bg-[#0D121C]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-[13px] font-bold text-[#F5F7FA] tracking-wide uppercase font-mono">
            Map Layers
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-medium text-[#94A3B8] hover:text-[#FF6B35] flex items-center gap-1 transition-colors cursor-pointer"
          title="Reset to default Viking visual mosaic"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-2.5 border-b border-[#273244] bg-[#0D121C]/60">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            aria-label="Filter map layers"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter map layers..."
            className="w-full h-7.5 bg-[#080B12] border border-[#273244] rounded-lg pl-8 pr-3 text-[11px] text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF6B35] transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5 scrollbar-thin text-xs">
        {layerSections.map(
          (section) =>
            section.layers.length > 0 && (
              <div key={section.key} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleCategory(section.key)}
                  className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  <span>{section.title}</span>
                  {collapsedCategories[section.key] ? (
                    <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                  )}
                </button>

                {!collapsedCategories[section.key] && (
                  <div className="flex flex-col gap-1">
                    {section.layers.map((layer) => {
                      const isSelected = activeLayer.id === layer.id;
                      return (
                        <button
                          type="button"
                          key={layer.id}
                          onClick={() => onSelectLayer(layer)}
                          className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                            isSelected
                              ? 'bg-[#0D121C] border-[#FF6B35] shadow-[0_0_12px_rgba(255,107,53,0.15)]'
                              : 'bg-[#111824] border-transparent hover:bg-[#0D121C] hover:border-[#273244]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-[#FF6B35] bg-[#FF6B35] text-white'
                                  : 'border-[#273244] bg-[#080B12]'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>

                            <LayerThumbnail layerId={layer.id} />

                            <div className="flex flex-col min-w-0">
                              <span className="text-[12px] font-medium text-[#F5F7FA] truncate">
                                {layer.name}
                              </span>
                              <span className="text-[10px] text-[#94A3B8] truncate">
                                {layer.subtitle}
                              </span>
                            </div>
                          </div>

                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#35C98A] shrink-0"
                            title="Dataset Ready"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )
        )}

        <div className="flex flex-col gap-2 pt-2 border-t border-[#273244]">
          <button
            type="button"
            onClick={() => toggleCategory('overlays')}
            className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] hover:text-[#F5F7FA] transition-colors cursor-pointer"
          >
            <span>Overlays</span>
            {collapsedCategories.overlays ? (
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
          </button>

          {!collapsedCategories.overlays && (
            <div className="flex flex-col gap-2 px-1">
              {overlayRows.map((row) => {
                const Icon = row.icon;
                const enabled = overlays[row.key];
                return (
                  <div key={row.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[#F5F7FA]">
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          row.accent ? 'text-[#FF6B35]' : 'text-[#94A3B8]'
                        }`}
                      />
                      <span className="text-[12px]">{row.label}</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={`Toggle ${row.label}`}
                      onClick={() => onToggleOverlay(row.key)}
                      className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        enabled ? 'bg-[#FF6B35]' : 'bg-[#273244]'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-3.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-3.5 py-2 border-t border-[#273244] bg-[#0D121C] flex items-center justify-between text-[11px]">
        <button
          type="button"
          onClick={() => setShowActiveLayerDetails(!showActiveLayerDetails)}
          className="flex items-center gap-1.5 text-[#94A3B8] hover:text-[#F5F7FA] transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-[#338BFF]" />
          <span>Layer Metadata & Legend</span>
        </button>
        <span className="text-[#35C98A] font-mono text-[10px]">VERIFIED</span>
      </div>

      {showActiveLayerDetails && (
        <div className="p-3 bg-[#080B12] border-t border-[#273244] flex flex-col gap-2 text-[11px]">
          <div className="flex justify-between text-[#94A3B8]">
            <span>Provider:</span>
            <span className="text-[#F5F7FA] font-medium">{activeLayer.provider}</span>
          </div>
          <div className="flex justify-between text-[#94A3B8]">
            <span>Resolution:</span>
            <span className="text-[#F5F7FA] font-mono">{activeLayer.resolution}</span>
          </div>
          {activeLayer.legendNotes && (
            <div className="p-2 rounded bg-[#111824] border border-[#273244] text-[10px] text-[#94A3B8]">
              <span className="text-[#FF6B35] font-semibold block mb-0.5">Legend:</span>
              <span>{activeLayer.legendNotes}</span>
            </div>
          )}
        </div>
      )}

      <div className="p-3.5 border-t border-[#273244] bg-[#0D121C] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-medium">
          <span className="text-[#94A3B8] flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-[#FF6B35]" />
            <span>Layer Opacity</span>
          </span>
          <span className="font-mono text-[#F5F7FA]">{layerOpacity}%</span>
        </div>
        <input
          type="range"
          aria-label="Layer opacity"
          min="10"
          max="100"
          step="1"
          value={layerOpacity}
          onChange={(e) => onChangeOpacity(parseInt(e.target.value, 10))}
          className="w-full accent-orange-slider cursor-pointer"
        />
      </div>
    </aside>
  );
};
