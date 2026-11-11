import { useState } from 'react';
import type { FC } from 'react';
import type { MarsSite, MapLayerConfig } from '../types/mars';
import { LAYER_CATALOG } from '../data/layerCatalog';
import { MARS_SITES } from '../data/marsSites';
import { SCIENCE_LAB_TOPICS } from '../data/scienceLabData';
import { formatMarsCoordinate, formatElevation } from '../utils/marsMath';
import { assetUrl } from '../utils/assetUrl';
import {
  ArrowRight,
  Sliders,
  FileCheck2,
  Database,
  ShieldCheck,
  FlaskConical
} from 'lucide-react';

interface ScienceViewProps {
  onSelectSiteAndGoToMap?: (site: MarsSite) => void;
  onSelectLayerAndGoToMap?: (layer: MapLayerConfig) => void;
}

interface ComparisonConfig {
  id: string;
  title: string;
  subtitle: string;
  leftLayer: {
    name: string;
    instrument: string;
    resolution: string;
    texturePath: string;
    description: string;
  };
  rightLayer: {
    name: string;
    instrument: string;
    resolution: string;
    texturePath: string;
    description: string;
  };
  scientificSignificance: string;
}

const COMPARISON_PAIRS: ComparisonConfig[] = [
  {
    id: 'visual-vs-elevation',
    title: 'Optical Surface Albedo vs MOLA Topography',
    subtitle: 'Viking Color Mosaic vs MOLA Laser Altimetry',
    leftLayer: {
      name: 'Viking MDIM 2.1 Visual Color',
      instrument: 'Viking Orbiter Cameras (232 m/px)',
      resolution: '232 m/pixel',
      texturePath: 'textures/mars_surface_2k.jpg',
      description:
        'True-color surface albedo showing oxidized iron dust, bright deserts, and dark basaltic sand sheets.'
    },
    rightLayer: {
      name: 'MOLA Topographic Relief',
      instrument: 'MGS Laser Altimeter DEM (463 m/px)',
      resolution: '463 m/pixel',
      texturePath: 'textures/mars_mola_color.jpg',
      description:
        'Color-coded hypsometric altimetry mapping heights from -8,200 m (Hellas) to +21,287 m (Olympus Mons).'
    },
    scientificSignificance:
      'Comparing surface albedo with elevation reveals that dark albedo features do not always coincide with low elevations, indicating wind-driven eolian saltation rather than static topography.'
  },
  {
    id: 'themis-day-vs-night',
    title: 'THEMIS Thermal Infrared Day vs Night',
    subtitle: 'Thermal Inertia & Bedrock vs Regolith Mapping',
    leftLayer: {
      name: 'THEMIS Daytime IR (100 m/px)',
      instrument: 'Mars Odyssey 9-Band IR Radiometer',
      resolution: '100 m/pixel',
      texturePath: 'textures/mars_themis_day.jpg',
      description:
        'Daytime surface radiance driven by solar insolation and terrain slope orientation.'
    },
    rightLayer: {
      name: 'THEMIS Nighttime IR (100 m/px)',
      instrument: 'Mars Odyssey Night Radiometer',
      resolution: '100 m/pixel',
      texturePath: 'textures/mars_themis_night.jpg',
      description:
        'Nighttime heat retention: high thermal inertia rock outcrops stay warm (bright), while loose dust cools rapidly (dark).'
    },
    scientificSignificance:
      'Thermal inertia differentiation allows planetary geologists to identify exposed bedrock outcrops versus loose sand mantles without physical excavation—critical for rover mobility safety.'
  },
  {
    id: 'hillshade-vs-mineral',
    title: 'Structural Shaded Relief vs Mineral Composition',
    subtitle: 'MOLA Hillshade vs Multispectral Mineral Ratio Blend',
    leftLayer: {
      name: 'MOLA Shaded Relief (Hillshade)',
      instrument: 'MOLA MEGDR 128 px/deg Monochromatic DEM',
      resolution: '463 m/pixel',
      texturePath: 'textures/mars_hillshade.jpg',
      description:
        'Synthetic solar illumination at 45° elevation emphasizing crater scarps, canyon walls, and volcanic calderas.'
    },
    rightLayer: {
      name: 'MOLA / THEMIS Mineral & False Color Blend',
      instrument: 'Multispectral Thermal & Spectral Band Ratios',
      resolution: '100–463 m/pixel',
      texturePath: 'textures/mars_false_color.jpg',
      description:
        'Color enhancement mapping phyllosilicates (smectite clays), hydrated sulfates, and hematite deposits.'
    },
    scientificSignificance:
      'Correlating structural scarps with spectral mineral signatures shows hydrated clay minerals concentrated in stratified canyon walls and ancient delta terraces formed by past aqueous activity.'
  }
];

export const ScienceView: FC<ScienceViewProps> = ({
  onSelectSiteAndGoToMap,
  onSelectLayerAndGoToMap
}) => {
  const [subTab, setSubTab] = useState<'lab' | 'catalogue' | 'comparison' | 'discovery'>('lab');
  const [activePairId, setActivePairId] = useState<string>('visual-vs-elevation');
  const [sliderPos, setSliderPos] = useState<number>(50);

  const activePair = COMPARISON_PAIRS.find((p) => p.id === activePairId) || COMPARISON_PAIRS[0];

  const discoverySites = MARS_SITES.filter(
    (s) =>
      s.category === 'volcano' ||
      s.category === 'canyon' ||
      s.category === 'crater' ||
      s.category === 'basin' ||
      s.category === 'delta'
  );

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#080B12] text-[#F5F7FA] select-none scrollbar-thin">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#273244] pb-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#FF6B35] font-semibold tracking-wider text-xs uppercase font-mono">
              <Database className="w-4 h-4" />
              <span>NASA Planetary Data System (PDS) & Science Lab</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Outfit',sans-serif]">
              Science Lab & Planetary Cartography
            </h1>
            <p className="text-[#94A3B8] text-xs leading-relaxed max-w-2xl">
              Martian atmospheric, geophysical, and astrobiological modules alongside verified orbital
              datasets and side-by-side multispectral comparison.
            </p>
          </div>

          <div className="flex flex-wrap bg-[#111824] border border-[#273244] p-1 rounded-xl gap-1 text-xs">
            {(
              [
                { id: 'lab', label: 'Science Lab' },
                { id: 'catalogue', label: 'Dataset Catalogue' },
                { id: 'comparison', label: 'Dataset Comparison' },
                { id: 'discovery', label: 'Geological Provinces' }
              ] as const
            ).map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  subTab === tab.id
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. IMMERSIVE SCIENCE LAB KNOWLEDGE MODULES */}
        {subTab === 'lab' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-[#FF6B35]" />
                <span>
                  8 Martian Science Modules (Also inspectable as 3D models inside GeoMars XR)
                </span>
              </span>
              <span className="font-mono text-[#35C98A]">NASA / JPL / USGS / ESA ATTRIBUTED</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCIENCE_LAB_TOPICS.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xl hover:border-[#FF6B35]/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#FF6B35]">
                        {topic.shortTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#0D121C] border border-[#273244] text-[10px] font-mono text-[#338BFF]">
                        {topic.headlineMetric}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{topic.title}</h3>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed mb-3">{topic.summary}</p>
                    <ul className="flex flex-col gap-1.5 text-[11px] text-[#94A3B8]">
                      {topic.keyFacts.map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] shrink-0 mt-1.5" />
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-[#273244] flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                    <span>Source: {topic.sourceAttribution}</span>
                    {onSelectSiteAndGoToMap && (
                      <button
                        type="button"
                        onClick={() => onSelectSiteAndGoToMap(MARS_SITES[0])}
                        className="text-[#FF6B35] hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect in 3D/XR</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. DATASET CATALOGUE */}
        {subTab === 'catalogue' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>
                Official NASA & USGS Cartographic Products ({LAYER_CATALOG.length} Datasets)
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[#35C98A]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PDS Standard Formats + Local Offline Fallback</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {LAYER_CATALOG.map((layer) => (
                <div
                  key={layer.id}
                  className="bg-[#111824] border border-[#273244] rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xl hover:border-[#FF6B35]/40 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-[#FF6B35] uppercase font-bold tracking-wider">
                          {layer.group}
                        </span>
                        <h3 className="text-[14px] font-bold text-[#F5F7FA] leading-tight">
                          {layer.name}
                        </h3>
                        <span className="text-[11px] text-[#94A3B8]">{layer.subtitle}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#35C98A]/15 text-[#35C98A] border border-[#35C98A]/30 text-[10px] font-mono shrink-0">
                        READY
                      </span>
                    </div>

                    <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                      {layer.description}
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                      <div className="p-2 rounded-lg bg-[#0D121C] border border-[#273244]">
                        <span className="text-[9px] text-[#94A3B8] block">Provider</span>
                        <span className="font-semibold text-white text-[11px] truncate block">
                          {layer.provider.split(' ')[0]}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0D121C] border border-[#273244]">
                        <span className="text-[9px] text-[#94A3B8] block">Resolution</span>
                        <span className="font-semibold text-[#FF6B35] text-[11px] truncate block">
                          {layer.resolution}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0D121C] border border-[#273244]">
                        <span className="text-[9px] text-[#94A3B8] block">Coverage</span>
                        <span className="font-semibold text-[#338BFF] text-[11px] truncate block">
                          Global
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#273244]">
                    <span className="text-[10px] text-[#94A3B8] font-mono">
                      Service: {layer.serviceType.toUpperCase()}
                    </span>
                    {onSelectLayerAndGoToMap && (
                      <button
                        type="button"
                        onClick={() => onSelectLayerAndGoToMap(layer)}
                        className="px-3 py-1.5 rounded-lg bg-[#FF6B35]/20 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>View in XR Globe</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. DATASET COMPARISON */}
        {subTab === 'comparison' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2.5">
              {COMPARISON_PAIRS.map((pair) => (
                <button
                  type="button"
                  key={pair.id}
                  onClick={() => setActivePairId(pair.id)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    activePairId === pair.id
                      ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-[0_0_14px_rgba(255,107,53,0.35)]'
                      : 'bg-[#111824] border-[#273244] text-[#94A3B8] hover:text-white hover:border-[#FF6B35]/50'
                  }`}
                >
                  {pair.title}
                </button>
              ))}
            </div>

            <div className="bg-[#111824] border border-[#273244] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="px-5 py-3 border-b border-[#273244] flex items-center justify-between bg-[#0D121C]">
                <div>
                  <h2 className="text-sm font-bold text-white">{activePair.title}</h2>
                  <span className="text-xs text-[#94A3B8]">{activePair.subtitle}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#FF6B35]">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Split: {sliderPos}%</span>
                </div>
              </div>

              <div className="relative w-full h-[360px] bg-[#080B12] overflow-hidden select-none">
                <img
                  src={assetUrl(activePair.rightLayer.texturePath)}
                  alt={activePair.rightLayer.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-[#080B12]/80 border border-[#273244] text-xs font-mono text-white backdrop-blur-md">
                  {activePair.rightLayer.name}
                </div>

                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={assetUrl(activePair.leftLayer.texturePath)}
                    alt={activePair.leftLayer.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: '100%', maxWidth: 'none' }}
                  />
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-[#080B12]/80 border border-[#273244] text-xs font-mono text-[#FF6B35] backdrop-blur-md">
                    {activePair.leftLayer.name}
                  </div>
                </div>

                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FF6B35] border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-xl">
                    ⇄
                  </div>
                </div>

                <input
                  type="range"
                  aria-label="Compare planetary datasets"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(parseInt(e.target.value, 10))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />
              </div>

              <div className="p-5 border-t border-[#273244] bg-[#0D121C] flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#FF6B35] font-bold uppercase tracking-wider text-[11px]">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Comparative Scientific Insight</span>
                </div>
                <p className="text-[#F5F7FA] leading-relaxed">
                  {activePair.scientificSignificance}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-[#94A3B8]">
                  <div className="p-3 rounded-xl bg-[#111824] border border-[#273244]">
                    <span className="font-bold text-white block mb-1">
                      {activePair.leftLayer.name} ({activePair.leftLayer.resolution})
                    </span>
                    <span>{activePair.leftLayer.description}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111824] border border-[#273244]">
                    <span className="font-bold text-white block mb-1">
                      {activePair.rightLayer.name} ({activePair.rightLayer.resolution})
                    </span>
                    <span>{activePair.rightLayer.description}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. GEOLOGICAL DISCOVERIES */}
        {subTab === 'discovery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoverySites.map((site) => (
              <div
                key={site.id}
                className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl hover:border-[#FF6B35]/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#FF6B35] font-mono font-bold uppercase text-[10px]">
                      {site.category}
                    </span>
                    <span className="font-mono text-[#94A3B8]">
                      {formatElevation(site.elevationMeters)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{site.name}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-3">{site.description}</p>

                  <div className="p-3 rounded-xl bg-[#0D121C] border border-[#273244] text-xs mb-3">
                    <span className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">
                      Geological Stratigraphy:
                    </span>
                    <span className="text-[#F5F7FA]">{site.geology}</span>
                  </div>

                  <div className="flex flex-col gap-1 text-[11px] text-[#94A3B8]">
                    <span className="text-[10px] text-[#94A3B8] uppercase font-bold">
                      Science Highlights:
                    </span>
                    {site.scienceHighlights.map((hl, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-1.5 text-[#F5F7FA]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] shrink-0 mt-1.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#273244]">
                  <span className="text-xs text-[#94A3B8] font-mono">
                    {formatMarsCoordinate(site.lat, site.lng)}
                  </span>
                  {onSelectSiteAndGoToMap && (
                    <button
                      type="button"
                      onClick={() => onSelectSiteAndGoToMap(site)}
                      className="px-3 py-1.5 rounded-lg bg-[#FF6B35] hover:bg-[#F5A65B] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Explore in XR</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
