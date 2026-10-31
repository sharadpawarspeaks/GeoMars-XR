import { useState } from 'react';
import type { FC } from 'react';
import type { MarsSite } from '../types/mars';
import { formatMarsCoordinate, formatElevation } from '../utils/marsMath';
import {
  X,
  Bookmark,
  Triangle
} from 'lucide-react';

interface LocationDetailsPanelProps {
  selectedSite: MarsSite | null;
  onClose: () => void;
  onViewIn3DTerrain: (site: MarsSite) => void;
}

export const LocationDetailsPanel: FC<LocationDetailsPanelProps> = ({
  selectedSite,
  onClose,
  onViewIn3DTerrain
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'terrain' | 'imagery' | 'missions'>('overview');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Default to Jezero Crater if none selected
  const site = selectedSite || {
    id: 'jezero-crater',
    name: 'Jezero Crater',
    category: 'rover' as const,
    lat: 18.44,
    lng: 77.45,
    elevationMeters: -2536,
    diameterKm: 45,
    description:
      'Jezero Crater is an ancient lake basin and the landing site of the Perseverance rover (2021). It is a key location for astrobiology research due to potential signs of past water.',
    mission: 'Perseverance (2021)',
    missionStatus: 'Active' as const,
    agency: 'NASA / JPL',
    geology: 'Fan-delta sediments, igneous floor rocks, phyllosilicates, and olivine-bearing carbonate units.',
    scienceHighlights: [
      'Discovered igneous bottom rocks of crater floor',
      'Collected core samples of ancient delta front sediments',
      'Ingenuity performed 72 flights exceeding operational bounds'
    ]
  };

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
        // NASA Perseverance Jezero Crater landing panorama
        return 'https://images-assets.nasa.gov/image/PIA24424/PIA24424~orig.jpg';
    }
  };

  return (
    <aside className="w-[350px] min-w-[350px] h-full bg-[#04121B] border border-[#19303E] rounded-xl flex flex-col z-20 select-none overflow-hidden shrink-0 shadow-lg">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#19303E] flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-[#F4F7FA] tracking-wide">
          Location Details
        </h2>
        <button
          onClick={onClose}
          className="text-[#71869A] hover:text-[#F4F7FA] p-1 rounded-md hover:bg-[#081925] transition-colors"
          title="Close Location Details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Container */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin text-xs">
        {/* Landscape Hero Image */}
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#19303E] bg-[#081925] shadow-md group shrink-0">
          <img
            src={getLocationImage(site.id)}
            alt={site.name}
            onError={(e) => {
              // Fallback to stylized Mars terrain gradient if external NASA asset blocks
              (e.target as HTMLElement).style.display = 'none';
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#04121B]/80 via-transparent to-transparent pointer-events-none" />

          {/* Fallback procedural landscape artwork if image loading */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#8C3415] via-[#BA4B22] to-[#3B150A] flex items-center justify-center">
            <span className="text-[#F4F7FA]/60 text-xs font-mono font-medium">NASA Mars Observation</span>
          </div>
        </div>

        {/* Title, Bookmark & Coordinates */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-bold text-[#F4F7FA] font-['Outfit',sans-serif] leading-tight">
              {site.name.split(' (')[0]}
            </h1>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'border-[#FF6B35] text-[#FF6B35] bg-[#FF6B35]/15'
                  : 'border-[#19303E] text-[#71869A] hover:text-[#F4F7FA] hover:bg-[#081925]'
              }`}
              title="Bookmark Location"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="text-[12px] text-[#A7B8C8] font-mono">
            {formatMarsCoordinate(site.lat, site.lng)}
          </div>
        </div>

        {/* Detail Tabs matching Reference Image */}
        <div className="flex border-b border-[#19303E] text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-1 mr-4 font-medium transition-colors relative ${
              activeTab === 'overview'
                ? 'text-[#F4F7FA]'
                : 'text-[#71869A] hover:text-[#A7B8C8]'
            }`}
          >
            <span>Overview</span>
            {activeTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('terrain')}
            className={`pb-2 px-1 mr-4 font-medium transition-colors relative ${
              activeTab === 'terrain'
                ? 'text-[#F4F7FA]'
                : 'text-[#71869A] hover:text-[#A7B8C8]'
            }`}
          >
            <span>Terrain</span>
            {activeTab === 'terrain' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('imagery')}
            className={`pb-2 px-1 mr-4 font-medium transition-colors relative ${
              activeTab === 'imagery'
                ? 'text-[#F4F7FA]'
                : 'text-[#71869A] hover:text-[#A7B8C8]'
            }`}
          >
            <span>Imagery</span>
            {activeTab === 'imagery' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('missions')}
            className={`pb-2 px-1 font-medium transition-colors relative ${
              activeTab === 'missions'
                ? 'text-[#F4F7FA]'
                : 'text-[#71869A] hover:text-[#A7B8C8]'
            }`}
          >
            <span>Missions</span>
            {activeTab === 'missions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <p className="text-[12px] leading-relaxed text-[#A7B8C8]">
            {site.description}
          </p>
        )}

        {activeTab === 'terrain' && (
          <div className="flex flex-col gap-2 text-[12px] text-[#A7B8C8] leading-relaxed">
            <span className="font-semibold text-[#F4F7FA]">Geological Stratigraphy:</span>
            <span>{site.geology}</span>
          </div>
        )}

        {activeTab === 'imagery' && (
          <div className="flex flex-col gap-2 text-[12px] text-[#A7B8C8]">
            <span>Calibrated orbital mosaics available from Viking MDIM 2.1, CTX, and THEMIS Infrared instruments.</span>
            <span className="text-[10px] text-[#71869A]">Resolution: 232 m/px (Viking) to 5.0 m/px (CTX)</span>
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="flex flex-col gap-2 text-[12px] text-[#A7B8C8]">
            {site.scienceHighlights ? (
              <ul className="flex flex-col gap-1.5">
                {site.scienceHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#FF6B35]">•</span>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span>Planetary observation site documented by NASA MGS and MRO orbiters.</span>
            )}
          </div>
        )}

        {/* 4 Compact Stat Cards (2x2 Grid matching reference image) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Elevation */}
          <div className="p-3 rounded-xl bg-[#0B1C29] border border-[#19303E] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#71869A] uppercase tracking-wide">
              Elevation
            </span>
            <span className="text-[14px] font-bold text-[#F4F7FA] font-mono">
              {formatElevation(site.elevationMeters)}
            </span>
          </div>

          {/* Card 2: Diameter */}
          <div className="p-3 rounded-xl bg-[#0B1C29] border border-[#19303E] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#71869A] uppercase tracking-wide">
              Diameter
            </span>
            <span className="text-[14px] font-bold text-[#F4F7FA] font-mono">
              {site.diameterKm ? `${site.diameterKm} km` : '45 km'}
            </span>
          </div>

          {/* Card 3: Type */}
          <div className="p-3 rounded-xl bg-[#0B1C29] border border-[#19303E] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#71869A] uppercase tracking-wide">
              Type
            </span>
            <span className="text-[13px] font-semibold text-[#F4F7FA] truncate">
              {site.category === 'rover'
                ? 'Impact Crater'
                : site.category === 'volcano'
                ? 'Shield Volcano'
                : site.category === 'canyon'
                ? 'Tectonic Chasma'
                : 'Planetary Basin'}
            </span>
          </div>

          {/* Card 4: Mission */}
          <div className="p-3 rounded-xl bg-[#0B1C29] border border-[#19303E] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#71869A] uppercase tracking-wide">
              Mission
            </span>
            <span className="text-[13px] font-semibold text-[#F4F7FA] truncate">
              {site.mission || (site.year ? `Mission (${site.year})` : 'Orbital Survey')}
            </span>
          </div>
        </div>

        {/* Primary Action Button: "View in 3D Terrain" */}
        <div className="mt-auto pt-2">
          <button
            onClick={() => onViewIn3DTerrain(site as MarsSite)}
            className="w-full py-3 px-4 rounded-xl bg-[#FF6B35] hover:bg-[#FF8A50] text-[#F4F7FA] font-bold text-[13px] shadow-[0_4px_16px_rgba(255,107,53,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Triangle className="w-3.5 h-3.5 fill-current rotate-90" />
            <span>View in 3D Terrain</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
