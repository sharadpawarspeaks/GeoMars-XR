import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { MarsSite } from '../types/mars';
import { formatMarsCoordinate, formatElevation, estimateLocalSlopeDeg } from '../utils/marsMath';
import {
  X,
  Bookmark,
  Mountain,
  Navigation,
  Box,
  Compass,
  MapPin
} from 'lucide-react';

interface LocationDetailsPanelProps {
  selectedSite: MarsSite | null;
  onClose: () => void;
  onViewIn3DTerrain: (site: MarsSite) => void;
  onAnalyzeTerrain: (site: MarsSite) => void;
  onPlanRoute: (site: MarsSite) => void;
}

export const LocationDetailsPanel: FC<LocationDetailsPanelProps> = ({
  selectedSite,
  onClose,
  onViewIn3DTerrain,
  onAnalyzeTerrain,
  onPlanRoute
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'terrain' | 'imagery' | 'missions'>(
    'overview'
  );
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const site = selectedSite;

  const slopeDeg = useMemo(() => {
    if (!site) return 0;
    return estimateLocalSlopeDeg(site.lat, site.lng);
  }, [site]);

  const getLocationImage = (id: string) => {
    switch (id) {
      case 'olympus-mons':
        return 'https://images-assets.nasa.gov/image/PIA02817/PIA02817~orig.jpg';
      case 'valles-marineris':
        return 'https://images-assets.nasa.gov/image/PIA04304/PIA04304~orig.jpg';
      case 'gale-crater':
        return 'https://images-assets.nasa.gov/image/PIA16098/PIA16098~orig.jpg';
      case 'jezero-crater':
      default:
        return 'https://images-assets.nasa.gov/image/PIA24424/PIA24424~orig.jpg';
    }
  };

  return (
    <aside className="w-[350px] min-w-[350px] h-full bg-[#111824] border border-[#273244] rounded-xl flex flex-col z-20 select-none overflow-hidden shrink-0 shadow-2xl">
      <div className="px-5 py-3 border-b border-[#273244] flex items-center justify-between bg-[#0D121C]">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-[13px] font-bold text-[#F5F7FA] tracking-wide uppercase font-mono">
            Location Intelligence
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#94A3B8] hover:text-[#F5F7FA] p-1 rounded-md hover:bg-[#111824] transition-colors cursor-pointer"
          aria-label="Close Location Intelligence"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!site ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4 text-xs text-[#94A3B8]">
          <div className="w-14 h-14 rounded-2xl bg-[#0D121C] border border-[#273244] flex items-center justify-center shadow-lg">
            <MapPin className="w-7 h-7 text-[#FF6B35] animate-bounce" />
          </div>
          <div className="flex flex-col gap-1 max-w-xs">
            <span className="text-sm font-bold text-[#F5F7FA]">No Location Selected</span>
            <p className="leading-relaxed text-[11px] text-[#94A3B8]">
              Select any scientific marker, rover landing site, or coordinate on the 3D Mars globe
              or 2D map to inspect planetary geology, MOLA altimetry, and mission relevance.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-thin text-xs">
          <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#273244] bg-[#0D121C] shadow-md group shrink-0">
            <img
              src={getLocationImage(site.id)}
              alt={site.name}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111824]/90 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#8C3415] via-[#BA4B22] to-[#3B150A]" />

            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#080B12]/80 border border-[#273244] text-[10px] font-semibold text-[#FF6B35] backdrop-blur-md uppercase tracking-wider font-mono">
              {site.category}
            </div>

            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-[#94A3B8] font-mono">
              <span className="truncate max-w-[200px]">
                {site.sourceAttribution || 'NASA / JPL / USGS PDS'}
              </span>
              <span className="text-[#35C98A]">PUBLIC DATA</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h1 className="text-[19px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif] leading-tight">
                {site.name.split(' (')[0]}
              </h1>
              <button
                type="button"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'border-[#FF6B35] text-[#FF6B35] bg-[#FF6B35]/15'
                    : 'border-[#273244] text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#0D121C]'
                }`}
                aria-label="Bookmark Location"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
              <span>{formatMarsCoordinate(site.lat, site.lng)}</span>
              <span className="text-[#338BFF] truncate max-w-[140px]">
                {site.mission || 'Planetary Landmark'}
              </span>
            </div>
          </div>

          <div className="flex border-b border-[#273244] text-xs">
            {(['overview', 'terrain', 'imagery', 'missions'] as const).map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 mr-4 font-medium transition-colors relative cursor-pointer capitalize ${
                  activeTab === tab
                    ? 'text-[#F5F7FA]'
                    : 'text-[#94A3B8] hover:text-[#F5F7FA]'
                }`}
              >
                <span>{tab}</span>
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[72px]">
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-2">
                <p className="text-[12px] leading-relaxed text-[#94A3B8]">{site.description}</p>
                {site.missionRelevance && (
                  <div className="p-2 rounded-lg bg-[#0D121C] border border-[#273244] text-[11px] text-[#CBD5E1]">
                    <span className="text-[#FF6B35] font-semibold block mb-0.5">
                      Mission Relevance:
                    </span>
                    {site.missionRelevance}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'terrain' && (
              <div className="flex flex-col gap-2 text-[12px] text-[#94A3B8] leading-relaxed">
                <span className="font-semibold text-[#F5F7FA]">Geological Stratigraphy:</span>
                <span>{site.geology}</span>
                {site.interestingFacts && site.interestingFacts.length > 0 && (
                  <div className="mt-1 flex flex-col gap-1">
                    <span className="font-semibold text-[#FF6B35] text-[11px]">
                      Notable Planetary Facts:
                    </span>
                    {site.interestingFacts.map((fact, idx) => (
                      <span key={idx} className="text-[11px] text-[#CBD5E1]">
                        • {fact}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'imagery' && (
              <div className="flex flex-col gap-2 text-[12px] text-[#94A3B8]">
                <span>
                  Calibrated orbital products available from Viking MDIM 2.1, CTX, MOLA, and THEMIS
                  Infrared instruments.
                </span>
                <span className="text-[10px] text-[#94A3B8] font-mono">
                  Spatial coverage: Global • Resolution: 0.25m – 463m
                </span>
              </div>
            )}

            {activeTab === 'missions' && (
              <div className="flex flex-col gap-2 text-[12px] text-[#94A3B8]">
                {site.scienceHighlights && site.scienceHighlights.length > 0 ? (
                  <ul className="flex flex-col gap-1.5">
                    {site.scienceHighlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#FF6B35]">•</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>
                    Verified surface observation site documented by NASA MGS, MRO, and Odyssey
                    orbiters.
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-0.5">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide">
                Elevation (MOLA)
              </span>
              <span className="text-[13px] font-bold text-[#F5F7FA] font-mono">
                {formatElevation(site.elevationMeters)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-0.5">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide">
                Est. Regional Slope
              </span>
              <span className="text-[13px] font-bold text-[#FF6B35] font-mono">
                ~{slopeDeg.toFixed(1)}°
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-0.5">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide">
                Diameter / Span
              </span>
              <span className="text-[12px] font-semibold text-[#F5F7FA] font-mono">
                {site.diameterKm ? `${site.diameterKm} km` : 'Regional'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-0.5">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide">
                Mission Record
              </span>
              <span className="text-[12px] font-semibold text-[#F5F7FA] truncate">
                {site.mission || site.agency || 'Orbital Survey'}
              </span>
            </div>
          </div>

          <div className="mt-auto pt-2 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onAnalyzeTerrain(site)}
                className="py-2.5 px-3 rounded-xl bg-[#FF6B35] hover:bg-[#F5A65B] text-white font-bold text-xs shadow-[0_0_12px_rgba(255,107,53,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>Analyze Terrain</span>
              </button>

              <button
                type="button"
                onClick={() => onPlanRoute(site)}
                className="py-2.5 px-3 rounded-xl bg-[#0D121C] hover:bg-[#111824] border border-[#273244] hover:border-[#FF6B35]/60 text-[#F5F7FA] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <Navigation className="w-3.5 h-3.5 text-[#338BFF]" />
                <span>Plan Route</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onViewIn3DTerrain(site)}
              className="w-full py-2 px-3 rounded-xl bg-[#0D121C]/80 hover:bg-[#0D121C] border border-[#273244] text-[#94A3B8] hover:text-[#F5F7FA] font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Box className="w-3.5 h-3.5 text-[#35C98A]" />
              <span>Inspect in 3D / XR Simulator</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
