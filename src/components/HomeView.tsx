import type { FC } from 'react';
import {
  Compass,
  Route as RouteIcon,
  Layers,
  Mountain,
  Thermometer,
  Activity,
  ArrowRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { MARS_SITES } from '../data/marsSites';
import { LAYER_CATALOG } from '../data/layerCatalog';
import type { MarsSite, MapLayerConfig } from '../types/mars';

interface HomeViewProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
  onSelectSiteAndGoToMap: (site: MarsSite) => void;
  onSelectLayerAndGoToMap: (layer: MapLayerConfig) => void;
}

export const HomeView: FC<HomeViewProps> = ({
  onNavigate,
  onSelectSiteAndGoToMap,
  onSelectLayerAndGoToMap
}) => {
  // Featured sites to showcase on landing page
  const featuredSites = MARS_SITES.filter((s) => s.featured || ['jezero-crater', 'gale-crater', 'olympus-mons', 'valles-marineris'].includes(s.id)).slice(0, 4);

  const handleLaunchLayer = (layerId: string) => {
    const layer = LAYER_CATALOG.find((l) => l.id === layerId) || LAYER_CATALOG[0];
    onSelectLayerAndGoToMap(layer);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto bg-[#080B12] text-[#F5F7FA] font-sans selection:bg-[#FF6B35]/30">
      {/* =========================================================================
          HERO SECTION — USING PRISTINE CLEAN MARTIAN LANDSCAPE & EXACT FLASHCARD
          ========================================================================= */}
      <section className="relative min-h-[calc(100vh-72px)] flex flex-col justify-between overflow-hidden bg-[#080B12]">
        {/* Background Image: Clean High-Resolution Martian Landscape with Astronaut centered & Mars */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-100"
          style={{ backgroundImage: `url('/hero-mars-pristine.jpg')` }}
        >
          {/* Subtle gradient overlay to guarantee text legibility on left while keeping astronaut and landscape pristine */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080B12]/85 via-transparent to-black/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Hero Content Grid */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 pt-10 pb-6 flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Bold Typography & Action Controls */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6 max-w-xl">
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F5F7FA] font-['Outfit',sans-serif] leading-[1.08] drop-shadow-md">
                  Interplanetary
                </h1>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F5F7FA] font-['Outfit',sans-serif] leading-[1.08] drop-shadow-md">
                  Survival Guide:
                </h1>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#FF6B35] font-['Outfit',sans-serif] leading-[1.08] drop-shadow-[0_0_24px_rgba(255,107,53,0.5)]">
                  Martian Map
                </h1>
              </div>

              <p className="text-sm sm:text-base text-[#F5F7FA]/90 leading-relaxed font-normal max-w-lg drop-shadow">
                A layered, integrated exploration platform for human missions to Mars — combining 
                multi-mission data to plan safe routes, assess environmental conditions, and conduct 
                scientific exploration with confidence.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {/* Primary Button: Explore Mars */}
                <button
                  onClick={() => onNavigate('/explore')}
                  className="px-6 sm:px-7 py-3 rounded-full bg-[#FF6B35] hover:bg-[#F5A65B] text-white font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-[0_0_20px_rgba(255,107,53,0.4)] hover:shadow-[0_0_28px_rgba(255,107,53,0.6)] cursor-pointer group"
                >
                  <Compass className="w-5 h-5 text-white transition-transform group-hover:rotate-45" />
                  <span>Explore Mars</span>
                  <ArrowRight className="w-4 h-4 ml-0.5 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Secondary Button: Plan a Marswalk */}
                <button
                  onClick={() => onNavigate('/route-planner')}
                  className="px-6 sm:px-7 py-3 rounded-full bg-[#111824]/80 hover:bg-[#161F2C] border border-[#273244] hover:border-[#FF6B35]/70 text-[#F5F7FA] font-semibold text-sm sm:text-base flex items-center gap-2.5 transition-all backdrop-blur-md cursor-pointer"
                >
                  <RouteIcon className="w-5 h-5 text-[#FF6B35]" />
                  <span>Plan a Marswalk</span>
                </button>
              </div>
            </div>

            {/* Middle Spacer to let the astronaut stand unobstructed in center */}
            <div className="hidden lg:block lg:col-span-1 pointer-events-none" />

            {/* Right Column: The Same Holographic Flashcard from Reference Image */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[440px] aspect-[380/245] rounded-2xl overflow-hidden drop-shadow-[0_0_35px_rgba(255,107,53,0.35)] transition-transform duration-300 hover:scale-[1.02]">
                {/* Reference Flashcard Rendered With Exact Layers & Buttons */}
                <img
                  src="/hologram-flashcard.png"
                  alt="Scientific Layers Holographic Flashcard"
                  className="w-full h-full object-contain pointer-events-none"
                />

                {/* Interactive Hotspot Buttons on the right of the Flashcard */}
                {/* 1. Imagery */}
                <button
                  onClick={() => handleLaunchLayer('viking-mosaic')}
                  className="absolute right-[2.5%] top-[3.5%] w-[30%] h-[16%] rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-[#FF6B35] hover:bg-[#FF6B35]/15 active:scale-95"
                  title="Activate Visual Imagery (Viking Global Mosaic)"
                  aria-label="Imagery"
                />

                {/* 2. Elevation */}
                <button
                  onClick={() => handleLaunchLayer('mola-color')}
                  className="absolute right-[2.5%] top-[22.5%] w-[30%] h-[16%] rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-[#35C98A] hover:bg-[#35C98A]/15 active:scale-95"
                  title="Activate Elevation (MOLA Laser Altimeter)"
                  aria-label="Elevation"
                />

                {/* 3. Thermal */}
                <button
                  onClick={() => handleLaunchLayer('themis-day')}
                  className="absolute right-[2.5%] top-[41.5%] w-[30%] h-[16%] rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-[#FF6B35] hover:bg-[#FF6B35]/15 active:scale-95"
                  title="Activate Thermal Infrared (THEMIS)"
                  aria-label="Thermal"
                />

                {/* 4. Slope */}
                <button
                  onClick={() => handleLaunchLayer('slope-map')}
                  className="absolute right-[2.5%] top-[60.5%] w-[30%] h-[16%] rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-[#F5B942] hover:bg-[#F5B942]/15 active:scale-95"
                  title="Activate Slope Map (<15° threshold)"
                  aria-label="Slope"
                />

                {/* 5. Roughness */}
                <button
                  onClick={() => handleLaunchLayer('roughness-rms')}
                  className="absolute right-[2.5%] top-[79.5%] w-[30%] h-[16%] rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-[#338BFF] hover:bg-[#338BFF]/15 active:scale-95"
                  title="Activate Surface Roughness (RMS)"
                  aria-label="Roughness"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Feature Highlights (Bottom of Hero) */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-[#273244]/80">
            {/* Feature 1: Layered Mars Map */}
            <div 
              onClick={() => onNavigate('/explore')}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#0D121C]/80 hover:bg-[#111824] border border-[#273244]/80 hover:border-[#FF6B35]/60 transition-all cursor-pointer group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-xl bg-[#080B12] border border-[#273244] group-hover:border-[#FF6B35] flex items-center justify-center text-[#FF6B35] shrink-0 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif] group-hover:text-[#FF6B35] transition-colors">
                  Layered Mars Map
                </span>
                <span className="text-xs text-[#94A3B8]">
                  Explore multi-mission data
                </span>
              </div>
            </div>

            {/* Feature 2: Terrain Analysis */}
            <div 
              onClick={() => onNavigate('/terrain-lab')}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#0D121C]/80 hover:bg-[#111824] border border-[#273244]/80 hover:border-[#FF6B35]/60 transition-all cursor-pointer group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-xl bg-[#080B12] border border-[#273244] group-hover:border-[#FF6B35] flex items-center justify-center text-[#FF6B35] shrink-0 transition-colors">
                <Mountain className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif] group-hover:text-[#FF6B35] transition-colors">
                  Terrain Analysis
                </span>
                <span className="text-xs text-[#94A3B8]">
                  Evaluate landscape & risks
                </span>
              </div>
            </div>

            {/* Feature 3: Mission Planning */}
            <div 
              onClick={() => onNavigate('/route-planner')}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#0D121C]/80 hover:bg-[#111824] border border-[#273244]/80 hover:border-[#FF6B35]/60 transition-all cursor-pointer group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-xl bg-[#080B12] border border-[#273244] group-hover:border-[#FF6B35] flex items-center justify-center text-[#FF6B35] shrink-0 transition-colors">
                <RouteIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif] group-hover:text-[#FF6B35] transition-colors">
                  Mission Planning
                </span>
                <span className="text-xs text-[#94A3B8]">
                  Design safe & efficient routes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BELOW-THE-FOLD SECTION 1: HOW GEOMARS WORKS (SURVIVAL PIPELINE)
          ========================================================================= */}
      <section className="py-20 px-6 sm:px-10 lg:px-12 border-t border-[#273244] bg-[#0D121C]">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF6B35]">
              System Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] font-['Outfit',sans-serif]">
              How GeoMars Guides Planetary Explorers
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Synthesizing raw orbital telemetry into actionable surface intelligence through a four-stage 
              scientific pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-3 relative group hover:border-[#FF6B35]/50 transition-colors">
              <span className="text-2xl font-black font-mono text-[#FF6B35]/40 group-hover:text-[#FF6B35] transition-colors">01</span>
              <h3 className="font-bold text-[#F5F7FA] text-base font-['Outfit',sans-serif]">
                Orbital Data Ingestion
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Connects to NASA Mars Trek and PDS endpoints to stream georeferenced Viking, MOLA, and THEMIS raster layers directly onto an IAU 2000 Areoid projection.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-3 relative group hover:border-[#FF6B35]/50 transition-colors">
              <span className="text-2xl font-black font-mono text-[#FF6B35]/40 group-hover:text-[#FF6B35] transition-colors">02</span>
              <h3 className="font-bold text-[#F5F7FA] text-base font-['Outfit',sans-serif]">
                Topographic Synthesis
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Calculates slope angles, detects escarpments, and measures altimetry relative to the MOLA areoid datum, identifying safe slopes (&lt;15°) for mobility.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-3 relative group hover:border-[#FF6B35]/50 transition-colors">
              <span className="text-2xl font-black font-mono text-[#FF6B35]/40 group-hover:text-[#FF6B35] transition-colors">03</span>
              <h3 className="font-bold text-[#F5F7FA] text-base font-['Outfit',sans-serif]">
                Geodesic Route Solving
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Executes an A* geodesic pathfinding algorithm balancing distance against steep slope penalties to produce candidate traverse corridors with Sol transit estimates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-3 relative group hover:border-[#FF6B35]/50 transition-colors">
              <span className="text-2xl font-black font-mono text-[#FF6B35]/40 group-hover:text-[#FF6B35] transition-colors">04</span>
              <h3 className="font-bold text-[#F5F7FA] text-base font-['Outfit',sans-serif]">
                Mission Decision Support
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Generates exportable GeoJSON navigation tracks, altimetry cross-section curves, and comprehensive Markdown dossiers for scientific surface ops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BELOW-THE-FOLD SECTION 2: SCIENTIFIC DATASETS INTEGRATED
          ========================================================================= */}
      <section className="py-20 px-6 sm:px-10 lg:px-12 border-t border-[#273244] bg-[#080B12]">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF6B35]">
                Verified Scientific Layers
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] font-['Outfit',sans-serif]">
                Multi-Mission Planetary Remote Sensing
              </h2>
              <p className="text-sm text-[#94A3B8]">
                Real orbital datasets from NASA MGS, 2001 Mars Odyssey, MRO, and Viking orbiters.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/mission-data')}
              className="px-4 py-2.5 rounded-xl bg-[#111824] hover:bg-[#161F2C] border border-[#273244] hover:border-[#FF6B35]/50 text-xs text-[#F5F7FA] font-medium flex items-center gap-2 self-start transition-colors cursor-pointer"
            >
              <span>Explore Data Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF6B35]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LAYER_CATALOG.slice(0, 4).map((layer) => (
              <div
                key={layer.id}
                className="p-5 rounded-2xl bg-[#0D121C] border border-[#273244] hover:border-[#FF6B35]/50 flex flex-col justify-between transition-all group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#111824] text-[#35C98A] border border-[#273244]">
                      {layer.status}
                    </span>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      {layer.resolution}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F5F7FA] font-['Outfit',sans-serif] group-hover:text-[#FF6B35] transition-colors">
                    {layer.name}
                  </h3>

                  <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3">
                    {layer.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#273244] flex items-center justify-between mt-4">
                  <span className="text-[10px] text-[#94A3B8] font-mono">{layer.provider}</span>
                  <button
                    onClick={() => onSelectLayerAndGoToMap(layer)}
                    className="p-1.5 rounded-lg bg-[#111824] group-hover:bg-[#FF6B35] text-[#94A3B8] group-hover:text-white transition-all cursor-pointer"
                    title="View Layer on Map"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          BELOW-THE-FOLD SECTION 3: FEATURED MARTIAN EXPLORATION LOCATIONS
          ========================================================================= */}
      <section className="py-20 px-6 sm:px-10 lg:px-12 border-t border-[#273244] bg-[#0D121C]">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF6B35]">
                Planetary Landmarks
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] font-['Outfit',sans-serif]">
                Featured Exploration Sites
              </h2>
              <p className="text-sm text-[#94A3B8]">
                Investigate landmark impact basins, landing sites of NASA rovers, and colossal volcanic structures.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/explore')}
              className="px-4 py-2.5 rounded-xl bg-[#111824] hover:bg-[#161F2C] border border-[#273244] hover:border-[#FF6B35]/50 text-xs text-[#F5F7FA] font-medium flex items-center gap-2 self-start transition-colors cursor-pointer"
            >
              <span>View All on Map</span>
              <Compass className="w-3.5 h-3.5 text-[#FF6B35]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSites.map((site) => (
              <div
                key={site.id}
                className="p-5 rounded-2xl bg-[#111824] border border-[#273244] hover:border-[#FF6B35]/50 flex flex-col justify-between transition-all group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#0D121C] text-[#FF6B35] border border-[#273244]">
                      {site.category}
                    </span>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      {site.elevationMeters > 0 ? `+${site.elevationMeters}m` : `${site.elevationMeters}m`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F5F7FA] font-['Outfit',sans-serif] group-hover:text-[#FF6B35] transition-colors">
                    {site.name}
                  </h3>

                  <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3">
                    {site.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#273244] flex items-center gap-2 mt-4">
                  <button
                    onClick={() => onSelectSiteAndGoToMap(site)}
                    className="flex-1 py-1.5 rounded-lg bg-[#0D121C] hover:bg-[#FF6B35] text-[#F5F7FA] hover:text-white border border-[#273244] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Explore</span>
                  </button>
                  <button
                    onClick={() => onNavigate('/route-planner', { dest: site.id })}
                    className="p-1.5 rounded-lg bg-[#0D121C] hover:bg-[#161F2C] text-[#94A3B8] hover:text-[#FF6B35] border border-[#273244] transition-colors cursor-pointer"
                    title="Plan Traverse Here"
                  >
                    <RouteIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          BELOW-THE-FOLD SECTION 4: INTERPLANETARY SURVIVAL GUIDE BRIEFING
          ========================================================================= */}
      <section className="py-20 px-6 sm:px-10 lg:px-12 border-t border-[#273244] bg-[#080B12]">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF6B35]">
              NASA Space Apps Challenge 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] font-['Outfit',sans-serif]">
              Interplanetary Survival Guide: Scientific Principles
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Critical factors for human and robotic safety in extreme Martian environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0D121C] border border-[#273244] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111824] border border-[#273244] text-[#FF6B35] flex items-center justify-center">
                <Thermometer className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#F5F7FA] text-base font-['Outfit',sans-serif]">
                Cryogenic Diurnal Swings
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Martian temperatures plunge to -140°C during polar winter nights. GeoMars uses THEMIS thermal inertia maps to identify bedrock formations that hold solar heat longer than loose dust deposits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D121C] border border-[#273244] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111824] border border-[#273244] text-[#35C98A] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#F5F7FA] text-base font-['Outfit',sans-serif]">
                Radiation Shelter Corridors
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                With no global magnetosphere and a surface air pressure under 1% of Earth's, deep canyon walls in Valles Marineris and crater escarpments provide natural overhead shielding against Solar Particle Events (SPE).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D121C] border border-[#273244] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111824] border border-[#273244] text-[#F5B942] flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#F5F7FA] text-base font-['Outfit',sans-serif]">
                Mobility & Tip-Over Risk
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Slopes beyond 15° pose catastrophic rollover hazards for crewed pressurized rovers. GeoMars calculates gradient profiles along the entire traverse to enforce safe traverse limits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          GLOBAL FOOTER
          ========================================================================= */}
      <footer className="border-t border-[#273244] bg-[#0D121C] py-12 px-6 sm:px-10 lg:px-12 text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#273244]">
            <div className="flex items-center gap-3">
              <img src="/geomars-logo.png" alt="GeoMars" className="w-8 h-8 object-contain" />
              <div>
                <span className="text-base font-bold text-[#F5F7FA] block font-['Outfit',sans-serif]">GeoMars</span>
                <span className="text-[11px] text-[#94A3B8]">Interplanetary Survival Guide</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-5 text-xs">
              <button onClick={() => onNavigate('/')} className="hover:text-[#FF6B35] transition-colors cursor-pointer">Home</button>
              <button onClick={() => onNavigate('/explore')} className="hover:text-[#FF6B35] transition-colors cursor-pointer">Explore Map</button>
              <button onClick={() => onNavigate('/route-planner')} className="hover:text-[#FF6B35] transition-colors cursor-pointer">Route Planner</button>
              <button onClick={() => onNavigate('/terrain-lab')} className="hover:text-[#FF6B35] transition-colors cursor-pointer">Terrain Lab</button>
              <button onClick={() => onNavigate('/mission-data')} className="hover:text-[#FF6B35] transition-colors cursor-pointer">Mission Data</button>
              <button onClick={() => onNavigate('/about')} className="hover:text-[#FF6B35] transition-colors cursor-pointer">About</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#94A3B8]">
            <span>Developed for the NASA Space Apps Challenge 2026 • Problem Statement: Interplanetary Survival Guide</span>
            <span>Data Courtesy: NASA Mars Trek • PDS Geosciences • USGS Astrogeology Science Center</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
