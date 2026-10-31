import type { FC } from 'react';
import type { MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { ArrowRight } from 'lucide-react';

interface PopularLocationsPanelProps {
  selectedSite: MarsSite | null;
  onSelectSite: (site: MarsSite) => void;
  onViewAll?: () => void;
}

export const PopularLocationsPanel: FC<PopularLocationsPanelProps> = ({
  selectedSite,
  onSelectSite,
  onViewAll
}) => {
  // 4 Popular Locations matching the reference image
  const popularLocations = [
    {
      id: 'jezero-crater',
      name: 'Jezero Crater',
      subtitle: 'Perseverance Rover',
      image: 'https://images-assets.nasa.gov/image/PIA24424/PIA24424~thumb.jpg',
      fallbackBg: 'from-[#8E2805] via-[#BA4B22] to-[#3B150A]'
    },
    {
      id: 'gale-crater',
      name: 'Gale Crater',
      subtitle: 'Curiosity Rover',
      image: 'https://images-assets.nasa.gov/image/PIA16098/PIA16098~thumb.jpg',
      fallbackBg: 'from-[#5C2B14] via-[#853D1C] to-[#2B140A]'
    },
    {
      id: 'olympus-mons',
      name: 'Olympus Mons',
      subtitle: 'Largest Volcano',
      image: 'https://images-assets.nasa.gov/image/PIA02817/PIA02817~thumb.jpg',
      fallbackBg: 'from-[#732608] via-[#A8380D] to-[#421503]'
    },
    {
      id: 'valles-marineris',
      name: 'Valles Marineris',
      subtitle: 'Giant Canyon',
      image: 'https://images-assets.nasa.gov/image/PIA04304/PIA04304~thumb.jpg',
      fallbackBg: 'from-[#3A1409] via-[#662310] to-[#1F0B05]'
    }
  ];

  return (
    <div className="h-full bg-[#04121B] border border-[#19303E] rounded-xl p-3.5 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-bold text-[#F4F7FA]">
          Popular Locations
        </h3>
        <button
          onClick={onViewAll}
          className="text-[11px] text-[#A7B8C8] hover:text-[#FF6B35] flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5 flex-1 items-stretch">
        {popularLocations.map((loc) => {
          const site = MARS_SITES.find((s) => s.id === loc.id) || MARS_SITES[0];
          const isSelected = selectedSite?.id === loc.id;

          return (
            <div
              key={loc.id}
              onClick={() => onSelectSite(site)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-1.5 group ${
                isSelected
                  ? 'bg-[#0B1C29] border-[#FF6B35] shadow-[0_0_12px_rgba(255,107,53,0.2)]'
                  : 'bg-[#081925] border-[#19303E] hover:border-[#FF6B35]/50 hover:bg-[#0B1C29]'
              }`}
            >
              {/* Landscape Thumbnail */}
              <div className="w-full h-16 rounded-md overflow-hidden relative border border-white/10 shrink-0">
                <img
                  src={loc.image}
                  alt={loc.name}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${loc.fallbackBg}`}
                />
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col min-w-0 px-0.5">
                <span className="text-[12px] font-bold text-[#F4F7FA] truncate">
                  {loc.name}
                </span>
                <span className="text-[10px] text-[#71869A] truncate">
                  {loc.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

