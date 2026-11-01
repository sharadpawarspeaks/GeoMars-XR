import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { MarsSite } from '../types/mars';
import { formatMarsCoordinate, formatElevation, calculateSlopeDeg } from '../utils/marsMath';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'terrain' | 'imagery' | 'missions'>('overview');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Fallback to Jezero Crater if none selected
  const site = selectedSite;

  // Calculable slope for the site
  const slopeDeg = useMemo(() => {
    if (!site) return 0;
    return calculateSlopeDeg(site.lat, site.lng);
  }, [site]);

  // Image representing the selected landmark
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
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#273244] flex items-center justify-between bg-[#0D121C]">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#FF6B35]" />
          <h2 className="text-[13px] font-bold text-[#F5F7FA] tracking-wide uppercase font-mono">
            Location Intelligence
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-[#94A3B8] hover:text-[#F5F7FA] p-1 rounded-md hover:bg-[#111824] transition-colors cursor-pointer"
          title="Close Location Intelligence"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* When no location is selected: Helpful Empty State */}
      {!site ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4 text-xs text-[#94A3B8]">
          <div className="w-14 h-14 rounded-2xl bg-[#0D121C] border border-[#273244] flex items-center justify-center shadow-lg">
            <MapPin className="w-7 h-7 text-[#FF6B35] animate-bounce" />
          </div>
          <div className="flex flex-col gap-1 max-w-xs">
            <span className="text-sm font-bold text-[#F5F7FA]">No Location Selected</span>
            <p className="leading-relaxed text-[11px] text-[#94A3B8]">
              Click any scientific marker, rover landing site, or coordinate on the Mars map to inspect planetary geology, MOLA altimetry, and mission records.
            </p>
          </div>
        </div>
      ) : (
        /* When a location is selected */
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scrollbar-thin text-xs">
          {/* Landscape Hero Image */}
          <div className="relative w-full h-38 rounded-xl overflow-hidden border border-[#273244] bg-[#0D121C] shadow-md group shrink-0">
            <img
              src={getLocationImage(site.id)}
              alt={site.name}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111824]/90 via-transparent to-transparent pointer-events-none" />

            {/* Region / Category Badge */}
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#080B12]/80 border border-[#273244] text-[10px] font-semibold text-[#FF6B35] backdrop-blur-md uppercase tracking-wider font-mono">
              {site.category}
            </div>

            {/* Data Source & Resolution Strip */}
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-[#94A3B8] font-mono">
              <span>NASA Mars Trek • PDS</span>
              <span className="text-[#35C98A]">VERIFIED</span>
            </div>
          </div>

          {/* Title, Bookmark & Coordinates */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h1 className="text-[19px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif] leading-tight">
                {site.name.split(' (')[0]}
              </h1>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'border-[#FF6B35] text-[#FF6B35] bg-[#FF6B35]/15'
                    : 'border-[#273244] text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#0D121C]'
                }`}
                title="Bookmark Location"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
              <span>{formatMarsCoordinate(site.lat, site.lng)}</span>
              <span className="text-[#338BFF]">{site.mission || 'Planetary Landmark'}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#273244] text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-1 mr-4 font-medium transition-colors relative cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-[#F5F7FA]'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA]'
              }`}
            >
              <span>Overview</span>
              {activeTab === 'overview' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('terrain')}
              className={`pb-2 px-1 mr-4 font-medium transition-colors relative cursor-pointer ${
                activeTab === 'terrain'
                  ? 'text-[#F5F7FA]'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA]'
              }`}
            >
              <span>Terrain</span>
              {activeTab === 'terrain' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('imagery')}
              className={`pb-2 px-1 mr-4 font-medium transition-colors relative cursor-pointer ${
                activeTab === 'imagery'
                  ? 'text-[#F5F7FA]'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA]'
              }`}
            >
              <span>Imagery</span>
              {activeTab === 'imagery' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('missions')}
              className={`pb-2 px-1 font-medium transition-colors relative cursor-pointer ${
                activeTab === 'missions'
                  ? 'text-[#F5F7FA]'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA]'
              }`}
            >
              <span>Missions</span>
              {activeTab === 'missions' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[64px]">
            {activeTab === 'overview' && (
              <p className="text-[12px] leading-relaxed text-[#94A3B8]">
                {site.description}
              </p>
            )}

            {activeTab === 'terrain' && (
              <div className="flex flex-col gap-2 text-[12px] text-[#94A3B8] leading-relaxed">
                <span className="font-semibold text-[#F5F7FA]">Geological Stratigraphy:</span>
                <span>{site.geology}</span>
              </div>
            )}

            {activeTab === 'imagery' && (
              <div className="flex flex-col gap-2 text-[12px] text-[#94A3B8]">
                <span>Calibrated orbital products available from Viking MDIM 2.1, CTX, and THEMIS instruments.</span>
                <span className="text-[10px] text-[#94A3B8] font-mono">Spatial coverage: Global • Resolution: 0.25m - 232m</span>
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
                  <span>Verified surface observation site documented by NASA MGS, MRO, and Odyssey orbiters.</span>
                )}
              </div>
            )}
          </div>

          {/* 4 Quantitative Scientific Telemetry Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Elevation */}
            <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-0.5">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide">
                Elevation (MOLA)
              </span>
              <span className="text-[13px] font-bold text-[#F5F7FA] font-mono">
                {formatElevation(site.elevationMeters)}
              </span>
            </div>

            {/* Terrain Slope */}
            <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-0.5">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide">
                Terrain Slope
              </span>
              <span className="text-[13px] font-bold text-[#FF6B35] font-mono">
                ~{slopeDeg.toFixed(1)}°
              </span>
            </div>

            {/* Feature Type */}
            <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-0.5">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide">
                Feature Type
              </span>
              <span className="text-[12px] font-semibold text-[#F5F7FA] truncate capitalize">
                {site.category}
              </span>
            </div>

            {/* Mission / Agency */}
            <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-0.5">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide">
                Mission Record
              </span>
              <span className="text-[12px] font-semibold text-[#F5F7FA] truncate">
                {site.mission || site.agency || 'Orbital Survey'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Analyze Terrain & Plan Route */}
          <div className="mt-auto pt-2 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Primary Action: Analyze Terrain */}
              <button
                onClick={() => onAnalyzeTerrain(site)}
                className="py-2.5 px-3 rounded-xl bg-[#FF6B35] hover:bg-[#F5A65B] text-white font-bold text-xs shadow-[0_0_12px_rgba(255,107,53,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                title="Launch Terrain Analysis Lab for this site"
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>Analyze Terrain</span>
              </button>

              {/* Secondary Action: Plan Route */}
              <button
                onClick={() => onPlanRoute(site)}
                className="py-2.5 px-3 rounded-xl bg-[#0D121C] hover:bg-[#111824] border border-[#273244] hover:border-[#FF6B35]/60 text-[#F5F7FA] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                title="Set as Waypoint in Rover Route Planner"
              >
                <Navigation className="w-3.5 h-3.5 text-[#338BFF]" />
                <span>Plan Route</span>
              </button>
            </div>

            {/* View in 3D Terrain */}
            <button
              onClick={() => onViewIn3DTerrain(site)}
              className="w-full py-2 px-3 rounded-xl bg-[#0D121C]/80 hover:bg-[#0D121C] border border-[#273244] text-[#94A3B8] hover:text-[#F5F7FA] font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Box className="w-3.5 h-3.5 text-[#35C98A]" />
              <span>Inspect in 3D Mars Globe</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
