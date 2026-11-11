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
  Eye,
  Glasses,
  Hand
} from 'lucide-react';
import { MARS_SITES } from '../data/marsSites';
import { LAYER_CATALOG } from '../data/layerCatalog';
import type { MarsSite, MapLayerConfig } from '../types/mars';
import { assetUrl } from '../utils/assetUrl';

interface HomeViewProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
  onSelectSiteAndGoToMap: (site: MarsSite) => void;
  onSelectLayerAndGoToMap: (layer: MapLayerConfig) => void;
  onLaunchXrSimulator?: () => void;
}

export const HomeView: FC<HomeViewProps> = ({
  onNavigate,
  onSelectSiteAndGoToMap,
  onSelectLayerAndGoToMap,
  onLaunchXrSimulator
}) => {
  const featuredSites = MARS_SITES.filter(
    (s) =>
      s.featured ||
      ['jezero-crater', 'gale-crater', 'olympus-mons', 'valles-marineris'].includes(s.id)
  ).slice(0, 4);

  const handleLaunchLayer = (layerId: string) => {
    const layer = LAYER_CATALOG.find((l) => l.id === layerId) || LAYER_CATALOG[0];
    onSelectLayerAndGoToMap(layer);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto bg-[#080B12] text-[#F5F7FA] font-sans selection:bg-[#FF6B35]/30">
      <section className="relative min-h-[calc(100vh-72px)] flex flex-col justify-between overflow-hidden bg-[#080B12]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-100"
          style={{ backgroundImage: `url('${assetUrl('hero-mars-pristine.jpg')}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#080B12]/90 via-[#080B12]/45 to-black/25 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-transparent to-black/30 pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 pt-10 pb-6 flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111824]/90 border border-[#FF6B35]/40 text-[#FF6B35] text-xs font-mono w-fit">
                <Glasses className="w-3.5 h-3.5" />
                <span>Meta VR Start Competition 2026 • IWSDK WebXR</span>
              </div>

              <div className="flex flex-col gap-1">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F5F7FA] font-['Outfit',sans-serif] leading-[1.08] drop-shadow-md">
                  GeoMars XR
                </h1>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#FF6B35] font-['Outfit',sans-serif] leading-[1.15] drop-shadow-[0_0_24px_rgba(255,107,53,0.45)]">
                  Explore. Discover. Navigate Mars.
                </h2>
              </div>

              <p className="text-sm sm:text-base text-[#F5F7FA]/90 leading-relaxed font-normal max-w-lg drop-shadow">
                The immersive, hands-first Martian exploration simulator built with Meta’s Immersive
                Web SDK (IWSDK) and Three.js. Rotate the 3D Mars globe with your hands, zoom into
                craters and volcanoes, plan deterministic A* rover routes, and consult an AI
                planetary science specialist.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => (onLaunchXrSimulator ? onLaunchXrSimulator() : onNavigate('/explore'))}
                  className="px-6 sm:px-7 py-3 rounded-full bg-[#FF6B35] hover:bg-[#F5A65B] text-white font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-[0_0_20px_rgba(255,107,53,0.4)] hover:shadow-[0_0_28px_rgba(255,107,53,0.6)] cursor-pointer group"
                >
                  <Glasses className="w-5 h-5 text-white" />
                  <span>Enter XR Mars Simulator</span>
                  <ArrowRight className="w-4 h-4 ml-0.5 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/route-planner')}
                  className="px-6 sm:px-7 py-3 rounded-full bg-[#111824]/85 hover:bg-[#161F2C] border border-[#273244] hover:border-[#FF6B35]/70 text-[#F5F7FA] font-semibold text-sm sm:text-base flex items-center gap-2.5 transition-all backdrop-blur-md cursor-pointer"
                >
                  <RouteIcon className="w-5 h-5 text-[#FF6B35]" />
                  <span>Rover Route Planner</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#94A3B8] font-mono pt-1">
                <span className="flex items-center gap-1.5">
                  <Hand className="w-3.5 h-3.5 text-[#35C98A]" />
                  <span>Hands-First Quest 3 / 3S Ready</span>
                </span>
                <span>•</span>
                <span>Seated-First Ergonomics</span>
                <span>•</span>
                <span>Desktop & Mouse Fallback</span>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-1 pointer-events-none" />

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[440px] aspect-[380/245] rounded-2xl overflow-hidden drop-shadow-[0_0_35px_rgba(255,107,53,0.35)] transition-transform duration-300 hover:scale-[1.02]">
                <img
                  src={assetUrl('hologram-flashcard.png')}
                  alt="Scientific Layers Holographic Flashcard"
                  className="w-full h-full object-contain pointer-events-none"
                />

                <button
                  type="button"
                  onClick={() => handleLaunchLayer('visual-imagery')}
                  className="absolute right-[2.5%] top-[3.5%] w-[30%] h-[16%] rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-[#FF6B35] hover:bg-[#FF6B35]/15 active:scale-95"
                  title="Activate Visual Imagery (Viking Global Mosaic)"
                  aria-label="Imagery"
                />

                <button
                  type="button"
                  onClick={() => handleLaunchLayer('elevation-mola')}
                  className="absolute right-[2.5%] top-[22.5%] w-[30%] h-[16%] rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-[#35C98A] hover:bg-[#35C98A]/15 active:scale-95"
                  title="Activate Elevation (MOLA Laser Altimeter)"
                  aria-label="Elevation"
                />

                <button
                  type="button"
                  onClick={() => handleLaunchLayer('themis-day')}
                  className="absolute right-[2.5%] top-[41.5%] w-[30%] h-[16%] rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-[#FF6B35] hover:bg-[#FF6B35]/15 active:scale-95"
                  title="Activate Thermal Infrared (THEMIS)"
                  aria-label="Thermal"
                />

                <button
                  type="button"
                  onClick={() => handleLaunchLayer('slope-map')}
                  className="absolute right-[2.5%] top-[60.5%] w-[30%] h-[16%] rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-[#F5B942] hover:bg-[#F5B942]/15 active:scale-95"
                  title="Activate Slope Map"
                  aria-label="Slope"
                />

                <button
                  type="button"
                  onClick={() => handleLaunchLayer('terrain-roughness')}
                  className="absolute right-[2.5%] top-[79.5%] w-[30%] h-[16%] rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-[#338BFF] hover:bg-[#338BFF]/15 active:scale-95"
                  title="Activate Surface Roughness"
                  aria-label="Roughness"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-[#273244]/80">
            <button
              type="button"
              onClick={() => onNavigate('/explore')}
              className="text-left flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#0D121C]/80 hover:bg-[#111824] border border-[#273244]/80 hover:border-[#FF6B35]/60 transition-all cursor-pointer group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-xl bg-[#080B12] border border-[#273244] group-hover:border-[#FF6B35] flex items-center justify-center text-[#FF6B35] shrink-0 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif] group-hover:text-[#FF6B35] transition-colors">
                  3D & XR Martian Globe
                </span>
                <span className="text-xs text-[#94A3B8]">
                  Pinch, grab, zoom, and explore NASA/USGS layers
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/terrain-lab')}
              className="text-left flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#0D121C]/80 hover:bg-[#111824] border border-[#273244]/80 hover:border-[#FF6B35]/60 transition-all cursor-pointer group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-xl bg-[#080B12] border border-[#273244] group-hover:border-[#FF6B35] flex items-center justify-center text-[#FF6B35] shrink-0 transition-colors">
                <Mountain className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif] group-hover:text-[#FF6B35] transition-colors">
                  Terrain & Suitability Lab
                </span>
                <span className="text-xs text-[#94A3B8]">
                  Evaluate MOLA slopes, pressure & landing risk
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/route-planner')}
              className="text-left flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#0D121C]/80 hover:bg-[#111824] border border-[#273244]/80 hover:border-[#FF6B35]/60 transition-all cursor-pointer group backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-xl bg-[#080B12] border border-[#273244] group-hover:border-[#FF6B35] flex items-center justify-center text-[#FF6B35] shrink-0 transition-colors">
                <RouteIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif] group-hover:text-[#FF6B35] transition-colors">
                  A* Rover Mission Control
                </span>
                <span className="text-xs text-[#94A3B8]">
                  Plan traverses & simulate hazard avoidance on Mars
                </span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 sm:px-10 lg:px-12 border-t border-[#273244] bg-[#0D121C]">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF6B35]">
              Spatial Mission Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] font-['Outfit',sans-serif]">
              How GeoMars XR Brings Planetary Science to Life
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Built for seated-first hand-tracked exploration on Meta Quest 3/3S with seamless
              desktop and 2D cartography parity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'Hands-First IWSDK World',
                desc: 'Grab and spin Mars directly with one hand, two-hand pinch-to-zoom into craters, and poke floating spatial panels without controllers.'
              },
              {
                num: '02',
                title: 'Multi-Mission Datasets',
                desc: 'Switch between NASA Viking, MOLA elevation, THEMIS thermal IR, CTX, and HiRISE textures with offline-safe fallback.'
              },
              {
                num: '03',
                title: 'Deterministic A* Routing',
                desc: 'Compute energy-aware rover paths around steep slopes and simulated hazard zones, visualized directly on the 3D globe and terrain diorama.'
              },
              {
                num: '04',
                title: '3D Science Lab & AI',
                desc: 'Inspect 3D Mars interior, rover, and subsurface ice models while asking the voice-enabled Mars science assistant context-aware questions.'
              }
            ].map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-3 relative group hover:border-[#FF6B35]/50 transition-colors"
              >
                <span className="text-2xl font-black font-mono text-[#FF6B35]/40 group-hover:text-[#FF6B35] transition-colors">
                  {step.num}
                </span>
                <h3 className="font-bold text-[#F5F7FA] text-base font-['Outfit',sans-serif]">
                  {step.title}
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                Public orbital datasets from NASA MGS, 2001 Mars Odyssey, MRO, and Viking orbiters.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/mission-data')}
              className="px-4 py-2.5 rounded-xl bg-[#111824] hover:bg-[#161F2C] border border-[#273244] hover:border-[#FF6B35]/50 text-xs text-[#F5F7FA] font-medium flex items-center gap-2 self-start transition-colors cursor-pointer"
            >
              <span>Explore Science Lab & Catalogue</span>
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
                    <span className="text-[11px] font-mono text-[#94A3B8]">{layer.resolution}</span>
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
                    type="button"
                    onClick={() => onSelectLayerAndGoToMap(layer)}
                    className="p-1.5 rounded-lg bg-[#111824] group-hover:bg-[#FF6B35] text-[#94A3B8] group-hover:text-white transition-all cursor-pointer"
                    title="View Layer on XR Globe"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                Investigate landmark impact basins, landing sites of NASA rovers, and colossal
                volcanic structures in 3D & XR.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/explore')}
              className="px-4 py-2.5 rounded-xl bg-[#111824] hover:bg-[#161F2C] border border-[#273244] hover:border-[#FF6B35]/50 text-xs text-[#F5F7FA] font-medium flex items-center gap-2 self-start transition-colors cursor-pointer"
            >
              <span>Launch XR Explorer</span>
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
                      {site.elevationMeters > 0
                        ? `+${site.elevationMeters}m`
                        : `${site.elevationMeters}m`}
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
                    type="button"
                    onClick={() => onSelectSiteAndGoToMap(site)}
                    className="flex-1 py-1.5 rounded-lg bg-[#0D121C] hover:bg-[#FF6B35] text-[#F5F7FA] hover:text-white border border-[#273244] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Explore XR</span>
                  </button>
                  <button
                    type="button"
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

      <section className="py-20 px-6 sm:px-10 lg:px-12 border-t border-[#273244] bg-[#080B12]">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF6B35]">
              Martian Environment & Survival Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] font-['Outfit',sans-serif]">
              Scientific Foundations in GeoMars XR
            </h2>
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
                Martian temperatures plunge to -140°C during polar nights. THEMIS thermal inertia
                maps distinguish heat-retaining exposed bedrock from loose dust deposits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D121C] border border-[#273244] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111824] border border-[#273244] text-[#35C98A] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#F5F7FA] text-base font-['Outfit',sans-serif]">
                Radiation & Low Pressure
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                With ~6.1 mbar mean surface pressure and no global magnetosphere, deep canyon
                escarpments in Valles Marineris offer natural topographic shielding.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D121C] border border-[#273244] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111824] border border-[#273244] text-[#F5B942] flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#F5F7FA] text-base font-['Outfit',sans-serif]">
                Mobility & Rollover Limits
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Slopes beyond 20°–30° pose critical rollover hazards for wheeled rovers. GeoMars XR
                evaluates deterministic A* terrain paths around simulated hazards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#273244] bg-[#0D121C] py-10 px-6 sm:px-10 lg:px-12 text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#273244]">
            <div className="flex items-center gap-3">
              <img src={assetUrl('geomars-logo.png')} alt="GeoMars XR" className="w-8 h-8 object-contain" />
              <div>
                <span className="text-base font-bold text-[#F5F7FA] block font-['Outfit',sans-serif]">
                  GeoMars XR
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  The Immersive Martian Exploration Simulator
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-5 text-xs">
              <button type="button" onClick={() => onNavigate('/')} className="hover:text-[#FF6B35] cursor-pointer">
                Home
              </button>
              <button type="button" onClick={() => onNavigate('/explore')} className="hover:text-[#FF6B35] cursor-pointer">
                XR Explorer
              </button>
              <button type="button" onClick={() => onNavigate('/route-planner')} className="hover:text-[#FF6B35] cursor-pointer">
                Rover Control
              </button>
              <button type="button" onClick={() => onNavigate('/terrain-lab')} className="hover:text-[#FF6B35] cursor-pointer">
                Terrain Lab
              </button>
              <button type="button" onClick={() => onNavigate('/mission-data')} className="hover:text-[#FF6B35] cursor-pointer">
                Science Lab
              </button>
              <button type="button" onClick={() => onNavigate('/about')} className="hover:text-[#FF6B35] cursor-pointer">
                About
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#94A3B8]">
            <span>Meta VR Start Developer Competition 2026 • Built with IWSDK & Three.js</span>
            <span>Public Imagery Attribution: NASA/JPL-Caltech • PDS • USGS Astrogeology • ESA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
