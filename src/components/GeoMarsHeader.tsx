import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import {
  Compass,
  Mountain,
  Rocket,
  Atom,
  Route as RouteIcon,
  Search,
  Sun,
  X
} from 'lucide-react';
import type { TabType, MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { formatMarsCoordinate } from '../utils/marsMath';

interface GeoMarsHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSelectSite: (site: MarsSite) => void;
}

export const GeoMarsHeader: FC<GeoMarsHeaderProps> = ({
  activeTab,
  onTabChange,
  onSelectSite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  // Filtered sites for search auto-suggest
  const searchResults = MARS_SITES.filter((site) =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: TabType; label: string; icon: typeof Compass }[] = [
    { id: 'map', label: 'Explore', icon: Compass },
    { id: 'terrain', label: 'Terrain Analysis', icon: Mountain },
    { id: 'missions', label: 'Missions', icon: Rocket },
    { id: 'science', label: 'Science Data', icon: Atom },
    { id: 'route', label: 'Route Planner', icon: RouteIcon }
  ];

  return (
    <header className="h-[74px] border-b border-[#19303E] bg-[#04121B] px-6 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Logo & Tagline */}
      <div className="flex items-center gap-3.5">
        {/* GeoMars Planet Vector Logo */}
        <img
          src="/geomars-logo.png"
          alt="GeoMars Logo"
          className="h-14 w-auto max-h-[54px] object-contain drop-shadow-[0_0_16px_rgba(255,107,53,0.45)] shrink-0 transition-transform duration-300 hover:scale-105"
        />

        <div className="flex flex-col justify-center">
          <span className="text-[24px] font-bold tracking-tight text-[#F4F7FA] font-['Outfit',sans-serif] leading-tight">
            GeoMars
          </span>
          <span className="text-[11px] text-[#71869A] tracking-normal font-sans">
            Map the Red Planet. Navigate the Unknown.
          </span>
        </div>
      </div>

      {/* Center: Navigation Tabs */}
      <nav className="flex items-center gap-1.5 bg-[#020A10] p-1 rounded-xl border border-[#19303E]/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-[#FF6B35]/20 text-[#F4F7FA] border border-[#FF6B35]/50 shadow-[0_0_12px_rgba(255,107,53,0.2)]'
                  : 'text-[#A7B8C8] hover:text-[#F4F7FA] hover:bg-[#081925]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B35]' : 'text-[#71869A]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Search, Theme Toggle & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Search Bar with auto-suggest dropdown */}
        <div ref={searchRef} className="relative w-64 lg:w-72">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#71869A] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search location (e.g., Jezero Crater)"
              className="w-full h-9 bg-[#081925] border border-[#19303E] rounded-full pl-9 pr-8 text-[12px] text-[#F4F7FA] placeholder-[#71869A] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 text-[#71869A] hover:text-[#F4F7FA]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery && (
            <div className="absolute top-11 left-0 right-0 bg-[#04121B] border border-[#19303E] rounded-xl shadow-2xl p-1.5 z-50 max-h-60 overflow-y-auto scrollbar-thin">
              {searchResults.length === 0 ? (
                <div className="p-3 text-center text-[#71869A] text-xs">
                  No Martian locations found.
                </div>
              ) : (
                searchResults.map((site) => (
                  <div
                    key={site.id}
                    onClick={() => {
                      onSelectSite(site);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      if (activeTab !== 'map') onTabChange('map');
                    }}
                    className="p-2 rounded-lg hover:bg-[#0B1C29] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-[12px] font-medium text-[#F4F7FA]">{site.name}</div>
                      <div className="text-[10px] text-[#71869A] font-mono">
                        {formatMarsCoordinate(site.lat, site.lng)}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#FF6B35] font-medium capitalize px-1.5 py-0.5 rounded bg-[#FF6B35]/10 border border-[#FF6B35]/20">
                      {site.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Display / Theme Setting Button */}
        <button
          className="w-9 h-9 rounded-full bg-[#081925] border border-[#19303E] flex items-center justify-center text-[#A7B8C8] hover:text-[#F4F7FA] hover:border-[#FF6B35]/40 transition-colors"
          title="Display Settings"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* User / Avatar Icon */}
        <div
          className="w-9 h-9 rounded-full bg-[#338BFF] text-white font-bold flex items-center justify-center text-sm shadow-md cursor-pointer select-none"
          title="Planetary Researcher Profile"
        >
          S
        </div>
      </div>
    </header>
  );
};
