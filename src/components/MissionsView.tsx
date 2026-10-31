import type { FC } from 'react';
import { Rocket, Calendar, ArrowUpRight } from 'lucide-react';
import type { MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { formatMarsCoordinate, formatElevation } from '../utils/marsMath';

interface MissionsViewProps {
  onSelectSiteAndGoToMap: (site: MarsSite) => void;
}

export const MissionsView: FC<MissionsViewProps> = ({ onSelectSiteAndGoToMap }) => {
  const missionSites = MARS_SITES.filter(
    (s) => s.category === 'rover' || s.category === 'lander'
  );

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#08090d] text-zinc-200 select-none scrollbar-thin">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-2 text-red-400 font-semibold tracking-wider text-xs uppercase">
            <Rocket className="w-4 h-4" />
            <span>Mars Surface Exploration Fleet</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Outfit',sans-serif]">
            Robotic Landers & Planetary Rovers
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-3xl">
            Chronicle of robotic explorers that have landed on the Martian regolith, from the Viking 1 touchdown in 1976 through active sample-caching operations by Perseverance in Jezero Crater.
          </p>
        </div>

        {/* Mission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {missionSites.map((site) => (
            <div
              key={site.id}
              className="bg-[#0c0e14]/80 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.15] transition-all flex flex-col justify-between gap-3 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {site.agency || 'NASA / JPL'}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      site.missionStatus === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {site.missionStatus}
                  </span>
                </div>

                <h3 className="font-semibold text-base text-white font-['Outfit',sans-serif] mt-1.5">
                  {site.name}
                </h3>

                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Landed {site.year}</span>
                </div>

                <div className="text-[11px] font-mono text-zinc-400 mt-2.5 bg-zinc-950/60 p-2.5 rounded-lg border border-white/[0.04] flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-sans">Coords:</span>
                    <span className="text-zinc-200">
                      {formatMarsCoordinate(site.lat, site.lng)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-sans">Elevation:</span>
                    <span className="text-amber-300">
                      {formatElevation(site.elevationMeters)}
                    </span>
                  </div>
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed mt-3">
                  {site.description}
                </p>

                <div className="mt-3 flex flex-col gap-1.5 border-t border-white/[0.05] pt-2.5">
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Key Science Returns:
                  </span>
                  {site.scienceHighlights.map((hl, i) => (
                    <div key={i} className="text-[11px] text-zinc-400 flex items-start gap-1.5 leading-normal">
                      <span className="text-red-400 shrink-0">•</span>
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectSiteAndGoToMap(site)}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-200 text-xs font-medium border border-white/[0.06] hover:border-white/[0.12] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Locate on Mars Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
