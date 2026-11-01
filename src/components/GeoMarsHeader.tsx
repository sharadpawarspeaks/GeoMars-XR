import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import {
<<<<<<< HEAD
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
  Menu
=======
  Compass,
  Mountain,
  Rocket,
  Atom,
  Route as RouteIcon,
  Search,
  Sun,
  X
>>>>>>> origin/main
} from 'lucide-react';
import type { TabType, MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { formatMarsCoordinate } from '../utils/marsMath';

interface GeoMarsHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSelectSite: (site: MarsSite) => void;
<<<<<<< HEAD
  onOpenReportModal?: () => void;
=======
>>>>>>> origin/main
}

export const GeoMarsHeader: FC<GeoMarsHeaderProps> = ({
  activeTab,
  onTabChange,
<<<<<<< HEAD
  onSelectSite,
  onOpenReportModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
=======
  onSelectSite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
>>>>>>> origin/main
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

<<<<<<< HEAD
  const navItems: { id: TabType; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'Explore Map', icon: Compass },
    { id: 'route', label: 'Route Planner', icon: RouteIcon },
    { id: 'terrain', label: 'Terrain Lab', icon: Layers },
    { id: 'science', label: 'Mission Data', icon: Radio },
    { id: 'about', label: 'About', icon: Info }
  ];

  return (
    <header className="h-[72px] border-b border-[#273244] bg-[#0D121C] px-4 sm:px-6 flex items-center justify-between select-none z-40 shrink-0 relative">
      {/* Left: Logo & Subtitle */}
      <div 
        onClick={() => onTabChange('home')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <img
          src="/geomars-logo.png"
          alt="GeoMars Logo"
          className="h-11 sm:h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(255,107,53,0.45)] shrink-0 transition-transform group-hover:scale-105"
        />

        <div className="flex flex-col justify-center">
          <span className="text-[20px] sm:text-[22px] font-bold tracking-tight text-[#F5F7FA] font-['Outfit',sans-serif] leading-tight group-hover:text-[#FF6B35] transition-colors">
            GeoMars
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#94A3B8] tracking-normal font-sans">
            Interplanetary Survival Guide
=======
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
>>>>>>> origin/main
          </span>
        </div>
      </div>

<<<<<<< HEAD
      {/* Center: Desktop Navigation Bar (Exact layout from reference image) */}
      <nav className="hidden xl:flex items-center gap-1 bg-[#080B12] p-1 rounded-2xl border border-[#273244]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            activeTab === item.id || 
            (item.id === 'science' && (activeTab === 'discover' || activeTab === 'missions'));
          
=======
      {/* Center: Navigation Tabs */}
      <nav className="flex items-center gap-1.5 bg-[#020A10] p-1 rounded-xl border border-[#19303E]/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
>>>>>>> origin/main
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
<<<<<<< HEAD
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#111824] text-[#F5F7FA] border border-[#FF6B35]/50 shadow-[0_0_12px_rgba(255,107,53,0.2)] font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#111824]/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B35]' : 'text-[#94A3B8]'}`} />
=======
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-[#FF6B35]/20 text-[#F4F7FA] border border-[#FF6B35]/50 shadow-[0_0_12px_rgba(255,107,53,0.2)]'
                  : 'text-[#A7B8C8] hover:text-[#F4F7FA] hover:bg-[#081925]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B35]' : 'text-[#71869A]'}`} />
>>>>>>> origin/main
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

<<<<<<< HEAD
      {/* Right: Search, Tools, "Launch App" Action Button */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Search Bar with auto-suggest dropdown */}
        <div ref={searchRef} className="relative hidden md:block w-48 lg:w-56">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 pointer-events-none" />
=======
      {/* Right: Search, Theme Toggle & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Search Bar with auto-suggest dropdown */}
        <div ref={searchRef} className="relative w-64 lg:w-72">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#71869A] absolute left-3 pointer-events-none" />
>>>>>>> origin/main
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
<<<<<<< HEAD
              placeholder="Search Mars..."
              className="w-full h-9 pl-9 pr-7 rounded-xl bg-[#080B12] border border-[#273244] text-xs text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-[#94A3B8] hover:text-[#F5F7FA]"
=======
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
>>>>>>> origin/main
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

<<<<<<< HEAD
          {/* Search Dropdown Results */}
          {isSearchOpen && (
            <div className="absolute top-11 left-0 right-0 max-h-80 overflow-y-auto rounded-xl bg-[#111824] border border-[#273244] shadow-2xl p-1.5 z-50 flex flex-col gap-1 backdrop-blur-md">
              {searchResults.length > 0 ? (
                searchResults.map((site) => (
                  <button
=======
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
>>>>>>> origin/main
                    key={site.id}
                    onClick={() => {
                      onSelectSite(site);
                      setIsSearchOpen(false);
                      setSearchQuery('');
<<<<<<< HEAD
                      onTabChange('map');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#080B12] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#F5F7FA] group-hover:text-[#FF6B35]">
                        {site.name}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] font-mono">
                        {formatMarsCoordinate(site.lat, site.lng)}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#0D121C] text-[#FF6B35] border border-[#273244]">
                      {site.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-[#94A3B8]">
                  No locations found
                </div>
=======
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
>>>>>>> origin/main
              )}
            </div>
          )}
        </div>

<<<<<<< HEAD
        {/* Mission Dossier Export Modal Button */}
        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="p-2 rounded-xl bg-[#080B12] border border-[#273244] hover:border-[#FF6B35]/60 text-[#94A3B8] hover:text-[#F5F7FA] transition-all cursor-pointer hidden sm:flex items-center gap-1.5"
            title="Export Mission Report & GeoJSON"
          >
            <FileText className="w-4 h-4 text-[#35C98A]" />
            <span className="text-xs font-medium hidden lg:inline">Dossier</span>
          </button>
        )}

        {/* PROMINENT "Launch App" PRIMARY BUTTON (Exact button from reference image) */}
        <button
          onClick={() => onTabChange('map')}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#F5A65B] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(255,107,53,0.35)] cursor-pointer"
        >
          <Rocket className="w-4 h-4" />
          <span>Launch App</span>
        </button>

        {/* Mobile / Tablet Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="xl:hidden p-2 rounded-xl bg-[#080B12] border border-[#273244] text-[#94A3B8] hover:text-[#F5F7FA]"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-[72px] left-0 right-0 bg-[#0D121C] border-b border-[#273244] p-4 flex flex-col gap-2 z-50 xl:hidden animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
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
=======
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
>>>>>>> origin/main
    </header>
  );
};
