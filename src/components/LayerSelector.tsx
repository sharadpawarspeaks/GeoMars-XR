import type { FC } from 'react';
import type { MapLayerConfig } from '../types/mars';
import { LAYER_CATALOG } from '../data/layerCatalog';
import { Layers, Info } from 'lucide-react';

interface LayerSelectorProps {
  activeLayer: MapLayerConfig;
  onSelectLayer: (layer: MapLayerConfig) => void;
}

export const LayerSelector: FC<LayerSelectorProps> = ({
  activeLayer,
  onSelectLayer
}) => {
  const categories = [
    { key: 'imagery', title: 'Global Imagery' },
    { key: 'elevation', title: 'Elevation & Topography' },
    { key: 'roughness', title: 'Surface Roughness' },
    { key: 'scientific', title: 'Scientific Matrices' }
  ] as const;

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      <div className="flex items-center justify-between text-zinc-400 border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-red-400" />
          <span className="font-semibold text-zinc-200 text-xs tracking-wide">
            Planetary Layers
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">WMTS / WMS</span>
      </div>

      <div className="flex flex-col gap-4">
        {categories.map((category) => {
          const layersInCategory = LAYER_CATALOG.filter(
            (l) => l.category === category.key
          );

          return (
            <div key={category.key} className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-zinc-400 px-0.5">
                {category.title}
              </span>

              <div className="flex flex-col gap-1">
                {layersInCategory.map((layer) => {
                  const isSelected = activeLayer.id === layer.id;
                  const isConnected = layer.status === 'connected';
                  const isCalibrating = layer.status === 'calibrating';

                  return (
                    <div
                      key={layer.id}
                      onClick={() => {
                        if (isConnected) {
                          onSelectLayer(layer);
                        }
                      }}
                      className={`group relative p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-white/[0.08] border-red-500/50 text-white shadow-sm'
                          : isConnected
                          ? 'bg-zinc-900/40 border-white/[0.06] text-zinc-300 hover:bg-white/[0.04] hover:border-white/[0.1] cursor-pointer'
                          : 'bg-zinc-950/40 border-white/[0.03] text-zinc-500 cursor-not-allowed opacity-65'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          {/* Radio / Selection Indicator */}
                          <div
                            className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'border-red-500 bg-red-500/20'
                                : 'border-zinc-600 bg-transparent'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            )}
                          </div>

                          <div className="flex flex-col">
                            <span
                              className={`font-medium leading-tight ${
                                isSelected ? 'text-white' : 'text-zinc-200'
                              }`}
                            >
                              {layer.name}
                            </span>
                            <span className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                              {layer.provider} • {layer.resolution}
                            </span>
                          </div>
                        </div>

                        {/* Status Dot */}
                        <div className="shrink-0 mt-0.5 flex items-center gap-1.5">
                          {isConnected ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="hidden sm:inline">Active</span>
                            </span>
                          ) : isCalibrating ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span className="hidden sm:inline">Calibrating</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                              <span className="hidden sm:inline">Offline</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unavailable Reason Banner */}
                      {layer.unavailableReason && (
                        <div className="mt-2 pt-2 border-t border-white/[0.04] text-[10px] text-zinc-400 flex items-start gap-1.5">
                          <Info className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{layer.unavailableReason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
