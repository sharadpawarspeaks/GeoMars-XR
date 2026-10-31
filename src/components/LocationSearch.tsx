import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Search, X } from 'lucide-react';
import type { MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { formatMarsCoordinate, formatElevation } from '../utils/marsMath';

interface LocationSearchProps {
  selectedSite: MarsSite | null;
  onSelectSite: (site: MarsSite) => void;
}

export const LocationSearch: FC<LocationSearchProps> = ({
  selectedSite,
  onSelectSite
}) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredSites = useMemo(() => {
    return MARS_SITES.filter((site) => {
      const matchesText =
        site.name.toLowerCase().includes(query.toLowerCase()) ||
        site.geology.toLowerCase().includes(query.toLowerCase()) ||
        site.description.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || site.category === categoryFilter;

      return matchesText && matchesCategory;
    });
  }, [query, categoryFilter]);

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'rover', label: 'Rovers' },
    { key: 'lander', label: 'Landers' },
    { key: 'volcano', label: 'Volcanoes' },
    { key: 'canyon', label: 'Canyons' },
    { key: 'crater', label: 'Basins' }
  ];

  return (
    <div className="flex flex-col gap-3 text-xs select-none">
      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Jezero, Olympus Mons..."
          className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-lg pl-9 pr-8 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 text-xs transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide whitespace-nowrap transition-colors ${
              categoryFilter === cat.key
                ? 'bg-white/[0.12] text-white border border-white/[0.15]'
                : 'bg-zinc-900/40 text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 border border-white/[0.04]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sites List */}
      <div className="flex flex-col gap-1.5 max-h-[calc(100vh-260px)] overflow-y-auto pr-1 scrollbar-thin">
        {filteredSites.length === 0 ? (
          <div className="p-4 text-center text-zinc-500 text-xs">
            No Martian locations match "{query}".
          </div>
        ) : (
          filteredSites.map((site) => {
            const isSelected = selectedSite?.id === site.id;

            return (
              <div
                key={site.id}
                onClick={() => onSelectSite(site)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-white/[0.08] border-red-500/50 text-white shadow-sm'
                    : 'bg-zinc-900/40 border-white/[0.05] text-zinc-300 hover:bg-white/[0.04] hover:border-white/[0.1]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white text-xs truncate">
                    {site.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 capitalize px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                    {site.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-0.5">
                  <span>{formatMarsCoordinate(site.lat, site.lng)}</span>
                  <span className="text-zinc-300">{formatElevation(site.elevationMeters)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
