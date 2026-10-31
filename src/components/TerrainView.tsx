import type { FC } from 'react';
import { Mountain, Compass, Layers, ArrowUpRight } from 'lucide-react';
import type { MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { formatElevation, formatMarsCoordinate } from '../utils/marsMath';

interface TerrainViewProps {
  onSelectSiteAndGoToMap: (site: MarsSite) => void;
}

export const TerrainView: FC<TerrainViewProps> = ({ onSelectSiteAndGoToMap }) => {
  const geologicalProvinces = [
    {
      name: 'Martian Crustal Dichotomy',
      elevation: '-4 km to +2 km',
      age: 'Early Noachian (>4.1 Ga)',
      summary: 'The fundamental hemispheric asymmetry of Mars. The southern hemisphere is heavily cratered, ancient, and elevated by 1 to 3 km, while the northern lowlands are smooth, younger, and heavily resurfaced by volcanic and sedimentary deposits.',
      keyFeatures: ['Crustal thickness varies from ~32 km north to ~58 km south', 'Dichotomy boundary marked by fretted terrain and knobby plains']
    },
    {
      name: 'Tharsis Volcanic Plateau',
      elevation: '+5 km to +21 km',
      age: 'Noachian through Amazonian',
      summary: 'A massive volcanic bulge roughly 5,000 km in diameter, holding enormous shield volcanoes (Olympus Mons, Ascraeus Mons, Pavonis Mons, Arsia Mons) and exerting tremendous regional extensional stresses that tore open Valles Marineris.',
      keyFeatures: ['Hosts the tallest volcano in the solar system (Olympus Mons, 21.3 km)', 'Exerted true polar wander on Mars rotational axis']
    },
    {
      name: 'Elysium Volcanic Province',
      elevation: '+1 km to +12 km',
      age: 'Hesperian to late Amazonian',
      summary: 'The second largest volcanic region on Mars, centered on Elysium Mons. Features flood basalts in Cerberus Fossae that erupted as recently as 50,000 years ago, indicating ongoing geothermal vitality.',
      keyFeatures: ['Cerberus Fossae tectonic fissures', 'InSight detected active magma plume beneath the region']
    },
    {
      name: 'Hellas Impact Basin',
      elevation: '-7.15 km datum',
      age: 'Noachian (~3.9 Ga)',
      summary: 'The deepest impact structure on Mars, with a diameter of roughly 2,300 km. Its floor sits 7 km below the datum and experiences the highest atmospheric pressure on Mars (~12.4 mbar), sufficient to allow transient liquid brine stability.',
      keyFeatures: ['Floor depth exceeds -7,150 m', 'Subsurface glaciers detected under debris cover']
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#08090d] text-zinc-200 select-none scrollbar-thin">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-2 text-red-400 font-semibold tracking-wider text-xs uppercase">
            <Mountain className="w-4 h-4" />
            <span>MOLA Topography & Stratigraphy</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Outfit',sans-serif]">
            Mars Hypsometric Curve & Planetary Elevation
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-3xl">
            Derived from the Mars Global Surveyor Mars Orbiter Laser Altimeter (MOLA), measuring over 600 million surface pulses with 30-centimeter vertical precision to define the global planetary datum (0-meter areoid reference).
          </p>
        </div>

        {/* Hypsometry & Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="bg-[#0c0e14]/80 p-4 rounded-xl border border-white/[0.06] flex flex-col justify-between shadow-sm">
            <span className="text-[11px] text-zinc-400 font-medium">Planetary Datum Range</span>
            <div className="text-xl font-bold text-white font-mono mt-1">
              -8.2 km to +21.3 km
            </div>
            <span className="text-[11px] text-zinc-400 mt-2">
              Total relief of 29.5 km (surpasses Earth&apos;s 19.8 km)
            </span>
          </div>

          <div className="bg-[#0c0e14]/80 p-4 rounded-xl border border-white/[0.06] flex flex-col justify-between shadow-sm">
            <span className="text-[11px] text-zinc-400 font-medium">Highest Peak</span>
            <div className="text-xl font-bold text-red-400 font-['Outfit',sans-serif] mt-1">
              Olympus Mons
            </div>
            <span className="text-[11px] font-mono text-zinc-400 mt-2">
              +21,287 m above MOLA datum
            </span>
          </div>

          <div className="bg-[#0c0e14]/80 p-4 rounded-xl border border-white/[0.06] flex flex-col justify-between shadow-sm">
            <span className="text-[11px] text-zinc-400 font-medium">Deepest Depression</span>
            <div className="text-xl font-bold text-cyan-400 font-['Outfit',sans-serif] mt-1">
              Hellas Planitia
            </div>
            <span className="text-[11px] font-mono text-zinc-400 mt-2">
              -7,152 m below MOLA datum
            </span>
          </div>

          <div className="bg-[#0c0e14]/80 p-4 rounded-xl border border-white/[0.06] flex flex-col justify-between shadow-sm">
            <span className="text-[11px] text-zinc-400 font-medium">Mean Radius & Gravity</span>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">
              3,389.5 km
            </div>
            <span className="text-[11px] text-zinc-400 mt-2">
              Surface gravity 3.72 m/s² (0.38 g)
            </span>
          </div>
        </div>

        {/* Major Geological Provinces */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            <span>Primary Planetary Provinces</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {geologicalProvinces.map((prov) => (
              <div
                key={prov.name}
                className="bg-[#0c0e14]/80 p-4 rounded-xl border border-white/[0.06] flex flex-col gap-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-white font-['Outfit',sans-serif]">
                    {prov.name}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-300 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/[0.08]">
                    {prov.elevation}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-400">
                  <span className="text-zinc-500">Period: </span>
                  {prov.age}
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed">
                  {prov.summary}
                </p>

                <div className="mt-auto pt-2.5 border-t border-white/[0.05] flex flex-col gap-1">
                  {prov.keyFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Sites Elevation Roster */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <Compass className="w-4 h-4 text-red-400" />
            <span>Planetary Landmarks Elevation Roster</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {MARS_SITES.map((site) => (
              <div
                key={site.id}
                onClick={() => onSelectSiteAndGoToMap(site)}
                className="p-3 bg-[#0c0e14]/80 rounded-xl border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 uppercase font-medium">
                      {site.category}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
                  </div>
                  <div className="font-semibold text-white text-xs mt-1 truncate">
                    {site.name}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                    {formatMarsCoordinate(site.lat, site.lng)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[11px]">
                  <span className="text-zinc-500">MOLA Datum:</span>
                  <span className="font-semibold text-amber-300 font-mono">
                    {formatElevation(site.elevationMeters)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
