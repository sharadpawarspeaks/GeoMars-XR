import type { FC } from 'react';
import { Sparkles, Droplets, Wind, Orbit } from 'lucide-react';

export const ScienceView: FC = () => {
  const scienceThemes = [
    {
      title: 'Aqueous History & Mineral Signatures',
      icon: <Droplets className="w-5 h-5 text-cyan-400" />,
      summary: 'Orbital spectrometers (CRISM, OMEGA) and rovers have mapped extensive phyllosilicates (smectite, nontronite clays), sulfates (jarosite, gypsum), and carbonates that formed under diverse neutral to acidic aqueous environments across ancient Mars.',
      highlights: [
        'Noachian Era (>3.7 Ga): Neutral pH water allowed extensive clay formation (Jezero, Mawrth Vallis)',
        'Hesperian Era (3.7 - 3.0 Ga): Acidic conditions dominated, precipitating sulfate-rich beds',
        'Amazonian Era (<3.0 Ga to present): Extremely dry, hyper-arid cold desert with ferric oxide (rust) coating'
      ]
    },
    {
      title: 'Subsurface Water Ice Reservoirs',
      icon: <Sparkles className="w-5 h-5 text-blue-400" />,
      summary: 'Shallow subsurface radar sounders (MRO SHARAD, Mars Express MARSIS) have identified vast buried glaciers and massive sheets of water ice beneath thin protective regolith mantles in both mid-latitudes and polar regions.',
      highlights: [
        'Utopia Planitia: Radar confirmed an underground deposit of pure water ice holding as much volume as Lake Superior',
        'Lobate Debris Aprons: Viscous glaciers flowing around massifs in Deuteronilus and Protonilus Mensae',
        'Polar Layered Deposits (PLD): Multiple kilometers of interbedded dust and water ice preserving past orbital tilt cycles'
      ]
    },
    {
      title: 'Atmospheric Dynamics & Dust Cycles',
      icon: <Wind className="w-5 h-5 text-amber-400" />,
      summary: 'Mars possesses a thin carbon dioxide atmosphere (95.3% CO2, ~6.1 mbar mean datum pressure). Roughly 25% of the total atmospheric mass cycles annually between condensing onto and sublimating from the polar ice caps.',
      highlights: [
        'Global Dust Storms: Triggered near perihelion when solar heating drives fierce thermal winds that encircle the entire globe',
        'Dust Devils: Thousands of convective vortices scouring tracks visible from orbit',
        'Methane Variances: Episodic trace spikes detected by Curiosity at Gale Crater under ongoing investigation'
      ]
    },
    {
      title: 'Mars Sample Return (MSR) Science',
      icon: <Orbit className="w-5 h-5 text-emerald-400" />,
      summary: 'Perseverance has hermetically sealed over 20 core samples of Martian igneous and sedimentary delta rocks in ultra-clean titanium tubes, deposited at Three Forks and in the rover belly for future return to Earth.',
      highlights: [
        'First sedimentary cores from ancient delta front lake deposits capable of preserving microfossils',
        'Samples will undergo synchrotron and mass spectrometry analysis in Earth containment facilities',
        'Precision radiometric dating of crystallization ages to anchor planetary chronology'
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#08090d] text-zinc-200 select-none scrollbar-thin">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-2 text-red-400 font-semibold tracking-wider text-xs uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Planetary Astrobiology & Geophysics</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Outfit',sans-serif]">
            Scientific Discoveries & Planetary Evidence
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-3xl">
            Compiled findings from NASA JPL, USGS Astrogeology, ESA Mars Express, and international science teams investigating Martian habitability, past biosignature potential, and resource availability for future human exploration.
          </p>
        </div>

        {/* Science Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {scienceThemes.map((theme) => (
            <div
              key={theme.title}
              className="bg-[#0c0e14]/80 p-5 rounded-xl border border-white/[0.06] flex flex-col gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                  {theme.icon}
                </div>
                <h3 className="font-semibold text-base text-white font-['Outfit',sans-serif]">
                  {theme.title}
                </h3>
              </div>

              <p className="text-zinc-300 text-xs leading-relaxed">
                {theme.summary}
              </p>

              <div className="mt-auto pt-3 border-t border-white/[0.05] flex flex-col gap-1.5">
                <span className="text-[11px] text-zinc-400 font-medium">Key Highlights:</span>
                {theme.highlights.map((hl, i) => (
                  <div key={i} className="text-[11px] text-zinc-400 flex items-start gap-1.5 leading-normal">
                    <span className="text-red-400 shrink-0">•</span>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
