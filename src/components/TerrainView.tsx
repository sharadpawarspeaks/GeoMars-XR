<<<<<<< HEAD
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
  Target
} from 'lucide-react';
=======
import type { FC } from 'react';
import { Mountain, Compass, Layers, ArrowUpRight } from 'lucide-react';
import type { MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { formatElevation, formatMarsCoordinate } from '../utils/marsMath';
>>>>>>> origin/main

interface TerrainViewProps {
  onSelectSiteAndGoToMap: (site: MarsSite) => void;
}

export const TerrainView: FC<TerrainViewProps> = ({ onSelectSiteAndGoToMap }) => {
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<'altimetry' | 'landing-analyzer' | 'provinces'>('altimetry');

  // Interactive Topographic Probe State
  const [probeLat, setProbeLat] = useState<number>(18.38);
  const [probeLng, setProbeLng] = useState<number>(77.58);
  const [probeSiteId, setProbeSiteId] = useState<string>('jezero-crater');

  // Landing Site Weights State
  const [weights, setWeights] = useState<LandingWeightsConfig>(DEFAULT_LANDING_WEIGHTS);

  // Compute Landing Site Suitability Evaluations dynamically
  const landingEvaluations = useMemo(() => {
    return evaluateLandingCandidates(weights);
  }, [weights]);

  // Probe Altimetry Calculations
  const probedElevation = useMemo(() => {
    return estimateMolaElevation(probeLat, probeLng);
  }, [probeLat, probeLng]);

  const probedSlope = useMemo(() => {
    const neighborElev = estimateMolaElevation(probeLat + 0.015, probeLng);
    return calculateSlopeDeg(neighborElev - probedElevation, 1000);
  }, [probeLat, probeLng, probedElevation]);

  const probedRoughness = useMemo(() => {
    return Math.min(1.0, 0.15 + (probedSlope / 25) * 0.6 + Math.abs(probedElevation % 400) / 1000);
  }, [probedSlope, probedElevation]);

  const estimatedPressureMbar = useMemo(() => {
    // Standard barometric formula for Mars: P0 = 6.1 mbar at 0 km areoid datum, scale height H ~ 11.1 km
    return (6.1 * Math.exp(-probedElevation / 11100)).toFixed(2);
  }, [probedElevation]);

  const handleSelectProbeSite = (siteId: string) => {
    setProbeSiteId(siteId);
    const site = MARS_SITES.find((s) => s.id === siteId);
    if (site) {
      setProbeLat(site.lat);
      setProbeLng(site.lng);
    }
  };

=======
>>>>>>> origin/main
  const geologicalProvinces = [
    {
      name: 'Martian Crustal Dichotomy',
      elevation: '-4 km to +2 km',
      age: 'Early Noachian (>4.1 Ga)',
<<<<<<< HEAD
      summary:
        'The fundamental hemispheric asymmetry of Mars. The southern hemisphere is heavily cratered, ancient, and elevated by 1 to 3 km, while the northern lowlands are smooth, younger, and heavily resurfaced by volcanic and sedimentary deposits.',
      keyFeatures: [
        'Crustal thickness varies from ~32 km north to ~58 km south',
        'Dichotomy boundary marked by fretted terrain and knobby plains'
      ]
=======
      summary: 'The fundamental hemispheric asymmetry of Mars. The southern hemisphere is heavily cratered, ancient, and elevated by 1 to 3 km, while the northern lowlands are smooth, younger, and heavily resurfaced by volcanic and sedimentary deposits.',
      keyFeatures: ['Crustal thickness varies from ~32 km north to ~58 km south', 'Dichotomy boundary marked by fretted terrain and knobby plains']
>>>>>>> origin/main
    },
    {
      name: 'Tharsis Volcanic Plateau',
      elevation: '+5 km to +21 km',
      age: 'Noachian through Amazonian',
<<<<<<< HEAD
      summary:
        'A massive volcanic bulge roughly 5,000 km in diameter, holding enormous shield volcanoes (Olympus Mons, Ascraeus Mons, Pavonis Mons, Arsia Mons) and exerting tremendous regional extensional stresses that tore open Valles Marineris.',
      keyFeatures: [
        'Hosts the tallest volcano in the solar system (Olympus Mons, 21.3 km)',
        'Exerted true polar wander on Mars rotational axis'
      ]
=======
      summary: 'A massive volcanic bulge roughly 5,000 km in diameter, holding enormous shield volcanoes (Olympus Mons, Ascraeus Mons, Pavonis Mons, Arsia Mons) and exerting tremendous regional extensional stresses that tore open Valles Marineris.',
      keyFeatures: ['Hosts the tallest volcano in the solar system (Olympus Mons, 21.3 km)', 'Exerted true polar wander on Mars rotational axis']
    },
    {
      name: 'Elysium Volcanic Province',
      elevation: '+1 km to +12 km',
      age: 'Hesperian to late Amazonian',
      summary: 'The second largest volcanic region on Mars, centered on Elysium Mons. Features flood basalts in Cerberus Fossae that erupted as recently as 50,000 years ago, indicating ongoing geothermal vitality.',
      keyFeatures: ['Cerberus Fossae tectonic fissures', 'InSight detected active magma plume beneath the region']
>>>>>>> origin/main
    },
    {
      name: 'Hellas Impact Basin',
      elevation: '-7.15 km datum',
      age: 'Noachian (~3.9 Ga)',
<<<<<<< HEAD
      summary:
        'The deepest impact structure on Mars, with a diameter of roughly 2,300 km. Its floor sits 7 km below the datum and experiences the highest atmospheric pressure on Mars (~12.4 mbar), sufficient to allow transient liquid brine stability.',
      keyFeatures: [
        'Floor depth exceeds -7,150 m',
        'Subsurface glaciers detected under debris cover'
      ]
=======
      summary: 'The deepest impact structure on Mars, with a diameter of roughly 2,300 km. Its floor sits 7 km below the datum and experiences the highest atmospheric pressure on Mars (~12.4 mbar), sufficient to allow transient liquid brine stability.',
      keyFeatures: ['Floor depth exceeds -7,150 m', 'Subsurface glaciers detected under debris cover']
>>>>>>> origin/main
    }
  ];

  return (
<<<<<<< HEAD
    <div className="h-full overflow-y-auto p-6 bg-[#080B12] text-[#F5F7FA] select-none scrollbar-thin">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#273244] pb-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#FF6B35] font-semibold tracking-wider text-xs uppercase font-mono">
              <Mountain className="w-4 h-4" />
              <span>MOLA Laser Altimetry Lab</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Outfit',sans-serif]">
              Terrain Lab & Topographic Intelligence
            </h1>
            <p className="text-[#94A3B8] text-xs leading-relaxed max-w-2xl">
              Quantitative topography derived from the Mars Global Surveyor (MGS) Mars Orbiter Laser Altimeter (MOLA), measuring over 600 million surface pulses to establish the global 0-meter areoid datum.
            </p>
          </div>

          {/* Sub-Tabs */}
          <div className="flex bg-[#111824] border border-[#273244] p-1 rounded-xl gap-1 text-xs">
            <button
              onClick={() => setActiveTab('altimetry')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'altimetry'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Topographic Probe
            </button>
            <button
              onClick={() => setActiveTab('landing-analyzer')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'landing-analyzer'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Landing Site Suitability
            </button>
            <button
              onClick={() => setActiveTab('provinces')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'provinces'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Geological Provinces
            </button>
          </div>
        </div>

        {/* 1. TOPOGRAPHIC PROBE & ALTIMETRY TAB */}
        {activeTab === 'altimetry' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Probe Setup Card */}
              <div className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
                <span className="text-[13px] font-bold text-[#F5F7FA] flex items-center gap-2 border-b border-[#273244] pb-3">
                  <Target className="w-4 h-4 text-[#FF6B35]" />
                  <span>Surface Sampling Coordinates</span>
                </span>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[#94A3B8]">Preset Landmark Target:</label>
                    <select
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
                      <label className="text-[#A7B8C8]">Latitude (° N/S):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={probeLat}
                        onChange={(e) => setProbeLat(parseFloat(e.target.value) || 0)}
                        className="bg-[#081925] border border-[#19303E] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[#A7B8C8]">Longitude (° E/W):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={probeLng}
                        onChange={(e) => setProbeLng(parseFloat(e.target.value) || 0)}
                        className="bg-[#081925] border border-[#19303E] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                  </div>

                  <span className="text-[11px] text-[#71869A] font-mono">
                    Sample: {formatMarsCoordinate(probeLat, probeLng)}
                  </span>
                </div>
              </div>

              {/* Probe Altimetry Telemetry Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#04121B] border border-[#19303E] rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[11px] text-[#71869A] uppercase tracking-wider font-semibold">
                    MOLA Elevation
                  </span>
                  <span className="text-xl font-bold text-white font-mono my-2">
                    {formatElevation(probedElevation)}
                  </span>
                  <span className="text-[10px] text-[#A7B8C8]">Ref: 0m Areoid Datum</span>
                </div>

                <div className="bg-[#04121B] border border-[#19303E] rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[11px] text-[#71869A] uppercase tracking-wider font-semibold">
                    Regional Slope
                  </span>
                  <span className="text-xl font-bold text-[#FF6B35] font-mono my-2">
                    {probedSlope.toFixed(1)}°
                  </span>
                  <span className="text-[10px] text-[#A7B8C8]">1 km baseline gradient</span>
                </div>

                <div className="bg-[#04121B] border border-[#19303E] rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[11px] text-[#71869A] uppercase tracking-wider font-semibold">
                    Roughness Index
                  </span>
                  <span className="text-xl font-bold text-[#338BFF] font-mono my-2">
                    {probedRoughness.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#A7B8C8]">MOLA pulse spread</span>
                </div>

                <div className="bg-[#04121B] border border-[#19303E] rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                  <span className="text-[11px] text-[#71869A] uppercase tracking-wider font-semibold">
                    Atmospheric Baro
                  </span>
                  <span className="text-xl font-bold text-emerald-400 font-mono my-2">
                    ~{estimatedPressureMbar} mbar
                  </span>
                  <span className="text-[10px] text-[#A7B8C8]">CO₂ surface column</span>
                </div>
              </div>
            </div>

            {/* Hypsometric Baseline Reference Table */}
            <div className="bg-[#04121B] border border-[#19303E] rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
              <span className="text-[13px] font-bold text-white">
                Global Martian Hypsometric Benchmarks
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#081925] border border-[#19303E]">
                  <span className="text-[#71869A] text-[10px] block">Olympus Mons Summit</span>
                  <span className="font-bold text-white text-sm">+21,287 m</span>
                  <span className="text-[10px] text-[#A7B8C8] block">Peak relief</span>
                </div>
                <div className="p-3 rounded-xl bg-[#081925] border border-[#19303E]">
                  <span className="text-[#71869A] text-[10px] block">Mean Northern Lowlands</span>
                  <span className="font-bold text-white text-sm">-3,800 m</span>
                  <span className="text-[10px] text-[#A7B8C8] block">Sedimentary basin floor</span>
                </div>
                <div className="p-3 rounded-xl bg-[#081925] border border-[#19303E]">
                  <span className="text-[#71869A] text-[10px] block">Valles Marineris Floor</span>
                  <span className="font-bold text-white text-sm">-7,000 m</span>
                  <span className="text-[10px] text-[#A7B8C8] block">Deepest canyon chasma</span>
                </div>
                <div className="p-3 rounded-xl bg-[#081925] border border-[#19303E]">
                  <span className="text-[#71869A] text-[10px] block">Hellas Basin Datum</span>
                  <span className="font-bold text-white text-sm">-7,152 m</span>
                  <span className="text-[10px] text-[#A7B8C8] block">Max barometric pressure</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. LANDING SITE SUITABILITY ANALYZER TAB (Feature Six) */}
        {activeTab === 'landing-analyzer' && (
          <div className="flex flex-col gap-6">
            {/* Criteria Tuning Sliders */}
            <div className="bg-[#04121B] border border-[#19303E] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#19303E] pb-3">
                <span className="text-[13px] font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FF6B35]" />
                  <span>Multi-Criteria Decision Support Model (MCDM) Weights</span>
                </span>
                <span className="text-[11px] text-[#71869A]">
                  Adjust weights to evaluate landing risk tradeoffs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Slope Weight */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#A7B8C8]">Slope Safety (&lt; 5°):</span>
                    <span className="font-bold text-[#FF6B35] font-mono">
                      {Math.round(weights.slopeWeight * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={weights.slopeWeight}
                    onChange={(e) =>
                      setWeights({ ...weights, slopeWeight: parseFloat(e.target.value) })
                    }
                    className="accent-[#FF6B35] bg-[#081925] h-1.5 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-[#71869A]">Prevents vehicle tipover</span>
                </div>

                {/* Elevation Weight */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#A7B8C8]">EDL Air Column (&lt; -1.5 km):</span>
                    <span className="font-bold text-[#FF6B35] font-mono">
                      {Math.round(weights.elevationWeight * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={weights.elevationWeight}
                    onChange={(e) =>
                      setWeights({ ...weights, elevationWeight: parseFloat(e.target.value) })
                    }
                    className="accent-[#FF6B35] bg-[#081925] h-1.5 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-[#71869A]">Parachute deceleration</span>
                </div>

                {/* Roughness Weight */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#A7B8C8]">Low Rock Hazard:</span>
                    <span className="font-bold text-[#FF6B35] font-mono">
                      {Math.round(weights.roughnessWeight * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={weights.roughnessWeight}
                    onChange={(e) =>
                      setWeights({ ...weights, roughnessWeight: parseFloat(e.target.value) })
                    }
                    className="accent-[#FF6B35] bg-[#081925] h-1.5 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-[#71869A]">Avoids boulder strikes</span>
                </div>

                {/* Science Proximity Weight */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#A7B8C8]">Science Value (Delta/Clays):</span>
                    <span className="font-bold text-[#FF6B35] font-mono">
                      {Math.round(weights.scienceWeight * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={weights.scienceWeight}
                    onChange={(e) =>
                      setWeights({ ...weights, scienceWeight: parseFloat(e.target.value) })
                    }
                    className="accent-[#FF6B35] bg-[#081925] h-1.5 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-[#71869A]">Biosignature potential</span>
                </div>
              </div>
            </div>

            {/* Candidate Landing Sites Rankings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {landingEvaluations.map((evalSite, idx) => (
                <div
                  key={evalSite.id}
                  className="bg-[#04121B] border border-[#19303E] rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xl hover:border-[#FF6B35]/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#081925] border border-[#19303E] text-[11px] font-mono font-bold flex items-center justify-center text-[#A7B8C8]">
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

                    <p className="text-[11px] text-[#A7B8C8] leading-relaxed mb-3">
                      {evalSite.scientificJustification}
                    </p>

                    {/* Criteria Subscores Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono mb-3">
                      <div className="p-2 rounded-lg bg-[#081925] border border-[#19303E]/80">
                        <span className="text-[9px] text-[#71869A] block">Slope ({evalSite.slopeDeg}°)</span>
                        <span className="font-bold text-white">{evalSite.scores.slopeScore}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#081925] border border-[#19303E]/80">
                        <span className="text-[9px] text-[#71869A] block">Elevation</span>
                        <span className="font-bold text-white">{evalSite.scores.elevationScore}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#081925] border border-[#19303E]/80">
                        <span className="text-[9px] text-[#71869A] block">Terrain Smooth</span>
                        <span className="font-bold text-white">{evalSite.scores.roughnessScore}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#081925] border border-[#19303E]/80">
                        <span className="text-[9px] text-[#71869A] block">Science Value</span>
                        <span className="font-bold text-white">{evalSite.scores.scienceScore}%</span>
                      </div>
                    </div>

                    {/* Engineering Limitation Alert */}
                    <div className="p-2.5 rounded-xl bg-[#020A10] border border-[#19303E] flex items-start gap-2 text-[10px] text-[#A7B8C8]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{evalSite.engineeringLimitations}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#19303E] text-xs">
                    <span className="text-[#71869A] font-mono">
                      Coords: {formatMarsCoordinate(evalSite.lat, evalSite.lng)}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#FF6B35] font-mono text-sm">
                        {evalSite.overallSuitability} / 100
                      </span>
                      <button
                        onClick={() => {
                          const site = MARS_SITES.find((s) => s.id === evalSite.id) || MARS_SITES[0];
                          onSelectSiteAndGoToMap(site);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FF6B35]/20 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white font-semibold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Target className="w-3 h-3" />
                        <span>Map</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#04121B] border border-[#19303E] flex items-center gap-2.5 text-xs text-[#71869A]">
              <ShieldAlert className="w-4 h-4 text-[#FF6B35] shrink-0" />
              <span>
                Certification Disclosure: Landing site scoring is generated by a multi-criteria decision model based on public MOLA Megdr altimetry and CRISM orbital mineral maps. Does not replace NASA JPL landing site safety certification.
              </span>
            </div>
          </div>
        )}

        {/* 3. GEOLOGICAL PROVINCES TAB */}
        {activeTab === 'provinces' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {geologicalProvinces.map((prov, idx) => (
              <div
                key={idx}
                className="bg-[#04121B] border border-[#19303E] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#FF6B35] font-mono font-bold text-[10px] uppercase">
                      {prov.age}
                    </span>
                    <span className="text-[#71869A] font-mono">{prov.elevation}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{prov.name}</h3>
                  <p className="text-xs text-[#A7B8C8] leading-relaxed mb-4">{prov.summary}</p>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-[#71869A] uppercase font-bold tracking-wider">
                      Key Structural Features:
                    </span>
                    {prov.keyFeatures.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-[#F4F7FA]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] shrink-0 mt-1.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
=======
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
>>>>>>> origin/main
                </div>
              </div>
            ))}
          </div>
<<<<<<< HEAD
        )}
=======
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
>>>>>>> origin/main
      </div>
    </div>
  );
};
