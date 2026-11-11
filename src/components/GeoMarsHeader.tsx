import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import {
  Home,
  Compass,
  Route as RouteIcon,
  Layers,
  Radio,
  Info,
  Rocket,
  Search,
  X,
  FileText,
  Menu,
  Sparkles,
  Glasses
} from 'lucide-react';
import type { TabType, MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { formatMarsCoordinate } from '../utils/marsMath';
import { assetUrl } from '../utils/assetUrl';

interface GeoMarsHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSelectSite: (site: MarsSite) => void;
  onOpenReportModal?: () => void;
  onOpenAiAssistant?: () => void;
  onLaunchXr?: () => void;
}

export const GeoMarsHeader: FC<GeoMarsHeaderProps> = ({
  activeTab,
  onTabChange,
  onSelectSite,
  onOpenReportModal,
  onOpenAiAssistant,
  onLaunchXr
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const searchResults = MARS_SITES.filter(
    (site) =>
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: TabType; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'XR Explorer', icon: Compass },
    { id: 'route', label: 'Rover Control', icon: RouteIcon },
    { id: 'terrain', label: 'Terrain Lab', icon: Layers },
    { id: 'science', label: 'Science Lab', icon: Radio },
    { id: 'missions', label: 'Missions', icon: Rocket },
    { id: 'about', label: 'About', icon: Info }
  ];

  return (
    <header className="h-[72px] border-b border-[#273244] bg-[#0D121C] px-4 sm:px-6 flex items-center justify-between select-none z-40 shrink-0 relative">
      <button
        type="button"
        onClick={() => onTabChange('home')}
        className="flex items-center gap-3 cursor-pointer group text-left"
      >
        <img
          src={assetUrl('geomars-logo.png')}
          alt="GeoMars XR Logo"
          className="h-10 sm:h-11 w-auto object-contain drop-shadow-[0_0_12px_rgba(255,107,53,0.45)] shrink-0 transition-transform group-hover:scale-105"
        />

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[19px] sm:text-[21px] font-bold tracking-tight text-[#F5F7FA] font-['Outfit',sans-serif] leading-tight group-hover:text-[#FF6B35] transition-colors">
              GeoMars
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF6B35] text-[10px] font-mono font-bold">
              XR
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-[#94A3B8] tracking-normal font-sans">
            Explore. Discover. Navigate Mars.
          </span>
        </div>
      </button>

      <nav
        aria-label="Primary"
        className="hidden xl:flex items-center gap-1 bg-[#080B12] p-1 rounded-2xl border border-[#273244]"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id || (item.id === 'science' && activeTab === 'discover');
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#111824] text-[#F5F7FA] border border-[#FF6B35]/50 shadow-[0_0_12px_rgba(255,107,53,0.2)] font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#111824]/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF6B35]' : 'text-[#94A3B8]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <div ref={searchRef} className="relative hidden md:block w-44 lg:w-52">
          <search>
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 pointer-events-none" />
              <input
                type="search"
                aria-label="Search Martian locations"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search Mars..."
                className="w-full h-9 pl-9 pr-7 rounded-xl bg-[#080B12] border border-[#273244] text-xs text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#94A3B8] hover:text-[#F5F7FA]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </search>

          {isSearchOpen && (
            <div className="absolute top-11 left-0 right-0 max-h-80 overflow-y-auto rounded-xl bg-[#111824] border border-[#273244] shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-md">
              {searchResults.length > 0 ? (
                searchResults.map((site) => (
                  <button
                    type="button"
                    key={site.id}
                    onClick={() => {
                      onSelectSite(site);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      onTabChange('map');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#080B12] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#F5F7FA] group-hover:text-[#FF6B35] truncate">
                        {site.name}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] font-mono">
                        {formatMarsCoordinate(site.lat, site.lng)}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#0D121C] text-[#FF6B35] border border-[#273244] shrink-0">
                      {site.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-[#94A3B8]">No locations found</div>
              )}
            </div>
          )}
        </div>

        {onOpenAiAssistant && (
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="px-2.5 py-2 rounded-xl bg-[#080B12] border border-[#273244] hover:border-[#338BFF]/70 text-[#F5F7FA] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Open AI Mars Science Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#338BFF]" />
            <span className="hidden lg:inline">Science AI</span>
          </button>
        )}

        {onOpenReportModal && (
          <button
            type="button"
            onClick={onOpenReportModal}
            className="p-2 rounded-xl bg-[#080B12] border border-[#273244] hover:border-[#FF6B35]/60 text-[#94A3B8] hover:text-[#F5F7FA] transition-all cursor-pointer hidden sm:flex items-center gap-1.5"
            title="Export Mission Report & GeoJSON"
          >
            <FileText className="w-4 h-4 text-[#35C98A]" />
            <span className="text-xs font-medium hidden 2xl:inline">Dossier</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => (onLaunchXr ? onLaunchXr() : onTabChange('map'))}
          className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-[#FF6B35] hover:bg-[#F5A65B] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(255,107,53,0.35)] cursor-pointer"
        >
          <Glasses className="w-4 h-4" />
          <span>Launch XR</span>
        </button>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="xl:hidden p-2 rounded-xl bg-[#080B12] border border-[#273244] text-[#94A3B8] hover:text-[#F5F7FA]"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-[72px] left-0 right-0 bg-[#0D121C] border-b border-[#273244] p-4 flex flex-col gap-2 z-50 xl:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#111824] text-[#FF6B35] border border-[#FF6B35]/40 font-bold'
                    : 'text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#111824]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
