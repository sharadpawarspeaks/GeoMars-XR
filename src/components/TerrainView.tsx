import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import {
  evaluateLandingCandidates,
  DEFAULT_LANDING_WEIGHTS,
  type LandingWeightsConfig
} from '../utils/landingSiteAnalyzer';
import {
  estimateMolaElevation,
  calculateSlopeDeg,
  formatMarsCoordinate,
  formatElevation
} from '../utils/marsMath';
import {
  Mountain,
  Sliders,
  AlertTriangle,
  ShieldAlert,
  Target,
  Compass,
  ArrowUpRight
} from 'lucide-react';

interface TerrainViewProps {
  onSelectSiteAndGoToMap: (site: MarsSite) => void;
}

export const TerrainView: FC<TerrainViewProps> = ({ onSelectSiteAndGoToMap }) => {
  const [activeTab, setActiveTab] = useState<'altimetry' | 'landing-analyzer' | 'provinces'>(
    'altimetry'
  );

  const [probeLat, setProbeLat] = useState<number>(18.38);
  const [probeLng, setProbeLng] = useState<number>(77.58);
  const [probeSiteId, setProbeSiteId] = useState<string>('jezero-crater');
  const [weights, setWeights] = useState<LandingWeightsConfig>(DEFAULT_LANDING_WEIGHTS);

  const landingEvaluations = useMemo(() => evaluateLandingCandidates(weights), [weights]);

  const probedElevation = useMemo(
    () => estimateMolaElevation(probeLat, probeLng),
    [probeLat, probeLng]
  );

  const probedSlope = useMemo(() => {
    const neighborElev = estimateMolaElevation(probeLat + 0.015, probeLng);
    return calculateSlopeDeg(neighborElev - probedElevation, 1000);
  }, [probeLat, probeLng, probedElevation]);

  const probedRoughness = useMemo(
    () =>
      Math.min(
        1.0,
        0.15 + (probedSlope / 25) * 0.6 + Math.abs(probedElevation % 400) / 1000
      ),
    [probedSlope, probedElevation]
  );

  const estimatedPressureMbar = useMemo(
    () => (6.1 * Math.exp(-probedElevation / 11100)).toFixed(2),
    [probedElevation]
  );

  const handleSelectProbeSite = (siteId: string) => {
    setProbeSiteId(siteId);
    const site = MARS_SITES.find((s) => s.id === siteId);
    if (site) {
      setProbeLat(site.lat);
      setProbeLng(site.lng);
    }
  };

  const geologicalProvinces = [
    {
      name: 'Martian Crustal Dichotomy',
      elevation: '-4 km to +2 km',
      age: 'Early Noachian (>4.1 Ga)',
      summary:
        'The fundamental hemispheric asymmetry of Mars. The southern hemisphere is heavily cratered, ancient, and elevated by 1 to 3 km, while the northern lowlands are smooth, younger, and resurfaced by volcanic and sedimentary deposits.',
      keyFeatures: [
        'Crustal thickness varies from ~32 km north to ~58 km south',
        'Dichotomy boundary marked by fretted terrain and knobby plains'
      ]
    },
    {
      name: 'Tharsis Volcanic Plateau',
      elevation: '+5 km to +21 km',
      age: 'Noachian through Amazonian',
      summary:
        'A massive volcanic bulge roughly 5,000 km in diameter, holding enormous shield volcanoes (Olympus Mons, Ascraeus, Pavonis, Arsia) and exerting regional extensional stresses that tore open Valles Marineris.',
      keyFeatures: [
        'Hosts the tallest volcano in the Solar System (Olympus Mons, +21,287 m)',
        'Exerted true polar wander on Mars rotational axis'
      ]
    },
    {
      name: 'Elysium Volcanic Province',
      elevation: '+1 km to +12 km',
      age: 'Hesperian to late Amazonian',
      summary:
        'The second largest volcanic region on Mars, centered on Elysium Mons. Features flood basalts and Cerberus Fossae fissures showing geologically recent activity.',
      keyFeatures: [
        'Cerberus Fossae tectonic fissures & young volcanic mantles',
        'InSight recorded seismic events originating near Cerberus Fossae'
      ]
    },
    {
      name: 'Hellas Impact Basin',
      elevation: '-7.15 km datum',
      age: 'Noachian (~3.9 Ga)',
      summary:
        'The deepest impact structure on Mars, with a diameter of roughly 2,300 km. Its floor sits 7 km below the datum and experiences the highest atmospheric pressure on Mars (~12.4 mbar).',
      keyFeatures: [
        'Floor depth exceeds -7,150 m',
        'Buried water-ice glaciers detected under rocky debris aprons'
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#080B12] text-[#F5F7FA] select-none scrollbar-thin">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#273244] pb-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#FF6B35] font-semibold tracking-wider text-xs uppercase font-mono">
              <Mountain className="w-4 h-4" />
              <span>MOLA Laser Altimetry & Suitability Lab</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Outfit',sans-serif]">
              Terrain Lab & Topographic Intelligence
            </h1>
            <p className="text-[#94A3B8] text-xs leading-relaxed max-w-2xl">
              Quantitative topography anchored to NASA Mars Global Surveyor MOLA benchmarks, paired
              with multi-criteria landing site suitability modeling.
            </p>
          </div>

          <div className="flex bg-[#111824] border border-[#273244] p-1 rounded-xl gap-1 text-xs">
            {(
              [
                { id: 'altimetry', label: 'Topographic Probe' },
                { id: 'landing-analyzer', label: 'Landing Site Suitability' },
                { id: 'provinces', label: 'Geological Provinces' }
              ] as const
            ).map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'altimetry' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
                <span className="text-[13px] font-bold text-[#F5F7FA] flex items-center gap-2 border-b border-[#273244] pb-3">
                  <Target className="w-4 h-4 text-[#FF6B35]" />
                  <span>Surface Sampling Coordinates</span>
                </span>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1 text-xs">
                    <label htmlFor="probe-landmark" className="text-[#94A3B8]">
                      Preset Landmark Target:
                    </label>
                    <select
                      id="probe-landmark"
                      value={probeSiteId}
                      onChange={(e) => handleSelectProbeSite(e.target.value)}
                      className="bg-[#0D121C] border border-[#273244] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                    >
                      {MARS_SITES.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name} ({site.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="probe-lat" className="text-[#94A3B8]">
                        Latitude (° N/S):
                      </label>
                      <input
                        id="probe-lat"
                        type="number"
                        step="0.01"
                        value={probeLat}
                        onChange={(e) => setProbeLat(parseFloat(e.target.value) || 0)}
                        className="bg-[#0D121C] border border-[#273244] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="probe-lng" className="text-[#94A3B8]">
                        Longitude (° E/W):
                      </label>
                      <input
                        id="probe-lng"
                        type="number"
                        step="0.01"
                        value={probeLng}
                        onChange={(e) => setProbeLng(parseFloat(e.target.value) || 0)}
                        className="bg-[#0D121C] border border-[#273244] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                  </div>

                  <span className="text-[11px] text-[#94A3B8] font-mono">
                    Sample: {formatMarsCoordinate(probeLat, probeLng)}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#111824] border border-[#273244] rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-semibold">
                    Est. Elevation
                  </span>
                  <span className="text-lg font-bold text-white font-mono my-2">
                    {formatElevation(probedElevation)}
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">Analytical MOLA model</span>
                </div>

                <div className="bg-[#111824] border border-[#273244] rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-semibold">
                    Regional Slope
                  </span>
                  <span className="text-xl font-bold text-[#FF6B35] font-mono my-2">
                    {probedSlope.toFixed(1)}°
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">1 km baseline gradient</span>
                </div>

                <div className="bg-[#111824] border border-[#273244] rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-semibold">
                    Roughness Index
                  </span>
                  <span className="text-xl font-bold text-[#338BFF] font-mono my-2">
                    {probedRoughness.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">Simulated terrain variance</span>
                </div>

                <div className="bg-[#111824] border border-[#273244] rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-semibold">
                    Est. Barometric
                  </span>
                  <span className="text-xl font-bold text-emerald-400 font-mono my-2">
                    ~{estimatedPressureMbar} mbar
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">CO₂ scale-height model</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
              <span className="text-[13px] font-bold text-white">
                Global Martian Hypsometric Benchmarks (NASA MOLA)
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0D121C] border border-[#273244]">
                  <span className="text-[#94A3B8] text-[10px] block">Olympus Mons Summit</span>
                  <span className="font-bold text-white text-sm">+21,287 m</span>
                  <span className="text-[10px] text-[#94A3B8] block">Peak planetary relief</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0D121C] border border-[#273244]">
                  <span className="text-[#94A3B8] text-[10px] block">Mean Northern Lowlands</span>
                  <span className="font-bold text-white text-sm">-3,800 m</span>
                  <span className="text-[10px] text-[#94A3B8] block">Sedimentary basin floor</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0D121C] border border-[#273244]">
                  <span className="text-[#94A3B8] text-[10px] block">Valles Marineris Floor</span>
                  <span className="font-bold text-white text-sm">-7,000 m</span>
                  <span className="text-[10px] text-[#94A3B8] block">Deepest canyon chasma</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0D121C] border border-[#273244]">
                  <span className="text-[#94A3B8] text-[10px] block">Hellas Basin Datum</span>
                  <span className="font-bold text-white text-sm">-7,152 m</span>
                  <span className="text-[10px] text-[#94A3B8] block">Max air pressure (~12.4 mbar)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'landing-analyzer' && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#273244] pb-3">
                <span className="text-[13px] font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FF6B35]" />
                  <span>Multi-Criteria Decision Model (MCDM) Weights</span>
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  Adjust weights to simulate landing safety tradeoffs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    key: 'slopeWeight' as const,
                    label: 'Slope Safety (< 5°)',
                    note: 'Prevents vehicle tipover'
                  },
                  {
                    key: 'elevationWeight' as const,
                    label: 'EDL Air Column (< -1.5 km)',
                    note: 'Parachute deceleration'
                  },
                  {
                    key: 'roughnessWeight' as const,
                    label: 'Low Rock Hazard',
                    note: 'Avoids boulder strikes'
                  },
                  {
                    key: 'scienceWeight' as const,
                    label: 'Science Value (Clays)',
                    note: 'Biosignature potential'
                  }
                ].map((item) => (
                  <div key={item.key} className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">{item.label}:</span>
                      <span className="font-bold text-[#FF6B35] font-mono">
                        {Math.round(weights[item.key] * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      aria-label={item.label}
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={weights[item.key]}
                      onChange={(e) =>
                        setWeights({ ...weights, [item.key]: parseFloat(e.target.value) })
                      }
                      className="accent-orange-slider cursor-pointer"
                    />
                    <span className="text-[10px] text-[#94A3B8]">{item.note}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {landingEvaluations.map((evalSite, idx) => (
                <div
                  key={evalSite.id}
                  className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xl hover:border-[#FF6B35]/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#0D121C] border border-[#273244] text-[11px] font-mono font-bold flex items-center justify-center text-[#94A3B8]">
                          #{idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-white">{evalSite.name}</h3>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          evalSite.verdict === 'Recommended'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : evalSite.verdict === 'Conditional'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}
                      >
                        {evalSite.verdict}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-3">
                      {evalSite.scientificJustification}
                    </p>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono mb-3">
                      <div className="p-2 rounded-lg bg-[#0D121C] border border-[#273244]">
                        <span className="text-[9px] text-[#94A3B8] block">
                          Slope ({evalSite.slopeDeg}°)
                        </span>
                        <span className="font-bold text-white">{evalSite.scores.slopeScore}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0D121C] border border-[#273244]">
                        <span className="text-[9px] text-[#94A3B8] block">Elevation</span>
                        <span className="font-bold text-white">
                          {evalSite.scores.elevationScore}%
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0D121C] border border-[#273244]">
                        <span className="text-[9px] text-[#94A3B8] block">Smoothness</span>
                        <span className="font-bold text-white">
                          {evalSite.scores.roughnessScore}%
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0D121C] border border-[#273244]">
                        <span className="text-[9px] text-[#94A3B8] block">Science</span>
                        <span className="font-bold text-white">
                          {evalSite.scores.scienceScore}%
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#080B12] border border-[#273244] flex items-start gap-2 text-[10px] text-[#94A3B8]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{evalSite.engineeringLimitations}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#273244] text-xs">
                    <span className="text-[#94A3B8] font-mono">
                      Coords: {formatMarsCoordinate(evalSite.lat, evalSite.lng)}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#FF6B35] font-mono text-sm">
                        {evalSite.overallSuitability} / 100
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const site =
                            MARS_SITES.find((s) => s.id.startsWith(evalSite.id.split('-')[0])) ||
                            MARS_SITES[0];
                          onSelectSiteAndGoToMap(site);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FF6B35]/20 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white font-semibold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Target className="w-3 h-3" />
                        <span>Inspect XR</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#111824] border border-[#273244] flex items-center gap-2.5 text-xs text-[#94A3B8]">
              <ShieldAlert className="w-4 h-4 text-[#FF6B35] shrink-0" />
              <span>
                Simulation Disclosure: Landing site suitability scores are computed by an
                educational multi-criteria model and are NOT certified for real spacecraft landing
                operations.
              </span>
            </div>
          </div>
        )}

        {activeTab === 'provinces' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {geologicalProvinces.map((prov) => (
                <div
                  key={prov.name}
                  className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#FF6B35] font-mono font-bold text-[10px] uppercase">
                        {prov.age}
                      </span>
                      <span className="text-[#94A3B8] font-mono">{prov.elevation}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{prov.name}</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">{prov.summary}</p>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">
                        Key Structural Features:
                      </span>
                      {prov.keyFeatures.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-[#F5F7FA]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] shrink-0 mt-1.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#FF6B35]" />
                <span>Planetary Landmarks Elevation Roster</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {MARS_SITES.map((site) => (
                  <button
                    type="button"
                    key={site.id}
                    onClick={() => onSelectSiteAndGoToMap(site)}
                    className="text-left p-3.5 bg-[#111824] rounded-xl border border-[#273244] hover:border-[#FF6B35]/60 transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#FF6B35] uppercase font-mono font-semibold">
                          {site.category}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                      </div>
                      <div className="font-semibold text-white text-xs mt-1 truncate">
                        {site.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                        {formatMarsCoordinate(site.lat, site.lng)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#273244] text-[11px]">
                      <span className="text-[#94A3B8]">MOLA Datum:</span>
                      <span className="font-semibold text-[#FF6B35] font-mono">
                        {formatElevation(site.elevationMeters)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
