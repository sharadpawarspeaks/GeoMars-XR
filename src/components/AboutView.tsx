import type { FC } from 'react';
import {
  Compass,
  Mountain,
  Route as RouteIcon,
  Atom,
  ShieldCheck,
  AlertTriangle,
  Database,
  ExternalLink,
  Code2,
  Cpu,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface AboutViewProps {
  onNavigate: (route: string) => void;
}

export const AboutView: FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="w-full flex-1 overflow-y-auto bg-[#080B12] text-[#F5F7FA] font-sans selection:bg-[#FF6B35]/30">
      {/* Hero Header */}
      <div className="relative border-b border-[#273244] bg-[#0D121C] py-14 px-6 sm:px-12 lg:px-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,107,53,0.12),transparent_60%)] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/40 font-mono">
              Meta VR Start Developer Competition 2026
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">
              Immersive Web SDK (IWSDK) · Seated Hands-First WebXR Simulator
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F5F7FA] font-['Outfit',sans-serif]">
            About <span className="text-[#FF6B35]">GeoMars XR</span>
          </h1>

          <p className="text-base sm:text-lg text-[#94A3B8] max-w-3xl leading-relaxed">
            GeoMars XR transforms multi-mission NASA/USGS/ESA planetary datasets into a seated, hands-first
            3D WebXR and desktop exploration simulator—combining an interactive Martian globe, orbit-to-surface
            terrain dioramas, deterministic A* rover route planning, an interactive science lab, and a grounded
            scientific assistant.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('/explore')}
              className="px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#F5A65B] text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(255,107,53,0.35)] cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Explore Map</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
            <button
              onClick={() => onNavigate('/route-planner')}
              className="px-5 py-2.5 rounded-xl bg-[#111824] hover:bg-[#161F2C] border border-[#273244] hover:border-[#FF6B35]/50 text-[#F5F7FA] text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
            >
              <RouteIcon className="w-4 h-4 text-[#FF6B35]" />
              <span>Plan a Marswalk</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 py-12 flex flex-col gap-12">
        {/* 1. Problem Statement & Mission Objective */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B35] uppercase tracking-wider font-mono">
            <BookOpen className="w-4 h-4" />
            <span>Problem Statement & Mission Objective</span>
          </div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] font-['Outfit',sans-serif]">
            The Challenge: Navigating the Martian Frontier
          </h2>
          <div className="p-6 rounded-2xl bg-[#111824] border border-[#273244] text-sm leading-relaxed text-[#94A3B8] flex flex-col gap-3">
            <p>
              Navigating Mars is among the most hazardous endeavors in interplanetary exploration. Without a global GPS constellation, 
              astronauts and autonomous rovers rely exclusively on orbital remote sensing data, inertial dead reckoning, and visual odometry. 
              The surface presents severe topographic impediments: 20-kilometer high shield volcanoes, chasms 7 kilometers deep, 
              impenetrable sand dune fields (ripples and transverse aeolian ridges), and loose regolith that can trap wheeled mobility systems.
            </p>
            <p>
              GeoMars solves this by unifying disparate scientific datasets—visual orbital mosaics, laser altimetry, thermal inertia, 
              and sub-meter orbital imagery—into an integrated spatial decision-support system. Future explorers can evaluate slopes, 
              inspect regional elevation profiles, calculate geodesic travel distances, and assess landing site safety in real time.
            </p>
          </div>
        </section>

        {/* 2. Scientific Data Ingestion & Integration */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B35] uppercase tracking-wider font-mono">
            <Database className="w-4 h-4" />
            <span>Scientific Data Integration</span>
          </div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] font-['Outfit',sans-serif]">
            Verified Mission Data Sources & Datums
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F5F7FA] text-base">MOLA Laser Altimetry</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#0D121C] text-[#35C98A] border border-[#273244]">463 m/px</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Mars Global Surveyor Mars Orbiter Laser Altimeter (MOLA) MEGDR dataset. Provides the definitive topographic 
                areoid datum (equipotential gravitational surface) with zero elevation calibrated to Mars's 3,396.0 km mean radius.
              </p>
              <div className="mt-auto text-[11px] font-mono text-[#94A3B8]">
                Provider: NASA Goddard Space Flight Center / PDS Geosciences
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F5F7FA] text-base">THEMIS Thermal Infrared</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#0D121C] text-[#35C98A] border border-[#273244]">100 m/px</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                2001 Mars Odyssey Thermal Emission Imaging System (THEMIS). Multi-band daytime and nighttime infrared mosaics 
                measuring thermal inertia to detect fine dust versus rocky bedforms essential for trafficability.
              </p>
              <div className="mt-auto text-[11px] font-mono text-[#94A3B8]">
                Provider: Arizona State University / USGS Astrogeology
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F5F7FA] text-base">Viking MDIM 2.1 Mosaic</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#0D121C] text-[#35C98A] border border-[#273244]">232 m/px</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Mars Digital Image Model (MDIM 2.1) synthesized from Viking Orbiter cameras. Radiometrically calibrated, 
                orthorectified panchromatic surface basemap covering 100% of the Martian sphere.
              </p>
              <div className="mt-auto text-[11px] font-mono text-[#94A3B8]">
                Provider: USGS Astrogeology Science Center / NASA PDS
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F5F7FA] text-base">CTX & HiRISE High-Resolution</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#0D121C] text-[#35C98A] border border-[#273244]">6.0m – 0.25m/px</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Mars Reconnaissance Orbiter (MRO) Context Camera (CTX) regional mosaics and High Resolution Imaging Science 
                Experiment (HiRISE) targeted strips. Critical for meter-scale boulder hazard certification and rover drive planning.
              </p>
              <div className="mt-auto text-[11px] font-mono text-[#94A3B8]">
                Provider: MSSS / University of Arizona / NASA JPL
              </div>
            </div>
          </div>
        </section>

        {/* 3. Mathematical & Algorithmic Methodologies */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B35] uppercase tracking-wider font-mono">
            <Cpu className="w-4 h-4" />
            <span>Mathematical & Geospatial Models</span>
          </div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] font-['Outfit',sans-serif]">
            Analytical Formulations & Geodesic Solvers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Geodesic Distance */}
            <div className="p-5 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-2">
              <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#FF6B35]" />
                <span>Great-Circle Haversine Formulation</span>
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Geodesic surface distances between coordinates (&phi;₁, &lambda;₁) and (&phi;₂, &lambda;₂) are 
                computed over the Mars mean volumetric sphere (R_Mars = 3,389.5 km):
              </p>
              <div className="p-3 rounded-xl bg-[#080B12] border border-[#273244] font-mono text-xs text-[#FF6B35] overflow-x-auto my-1">
                d = 2 · R · arcsin(√(sin²(Δφ/2) + cos(φ₁)·cos(φ₂)·sin²(Δλ/2)))
              </div>
              <span className="text-[11px] text-[#94A3B8]">
                Enables sub-kilometer accuracy along great-circle arcs across Martian quadrants.
              </span>
            </div>

            {/* Slope & Tip-Over Risk */}
            <div className="p-5 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-2">
              <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                <Mountain className="w-4 h-4 text-[#FF6B35]" />
                <span>Slope Gradient & Rollover Safety Thresholds</span>
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Topographic inclination &theta; is computed from differential MOLA elevations over horizontal run:
              </p>
              <div className="p-3 rounded-xl bg-[#080B12] border border-[#273244] font-mono text-xs text-[#FF6B35] overflow-x-auto my-1">
                θ = arctan(|Δz| / d) · (180° / π)
              </div>
              <span className="text-[11px] text-[#94A3B8]">
                Safety ratings: &lt;5° Nominal Safe; 5°–15° Caution; &gt;15° Extreme Rollover Hazard (Perseverance 30° tip limit).
              </span>
            </div>

            {/* A* Traverse Optimization */}
            <div className="p-5 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-2">
              <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                <RouteIcon className="w-4 h-4 text-[#FF6B35]" />
                <span>A* Multi-Criteria Pathfinding Cost Function</span>
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Traverse candidate routes optimize total energetic expenditure by penalizing slope and roughness:
              </p>
              <div className="p-3 rounded-xl bg-[#080B12] border border-[#273244] font-mono text-xs text-[#FF6B35] overflow-x-auto my-1">
                Cost = Σ [ Δd_i · (1.0 + w_slope · θ_i² + w_roughness · R_i) ]
              </div>
              <span className="text-[11px] text-[#94A3B8]">
                Allows users to dynamically weight slope penalties according to rover mobility specifications.
              </span>
            </div>

            {/* Barometric Scale Height */}
            <div className="p-5 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-2">
              <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                <Atom className="w-4 h-4 text-[#FF6B35]" />
                <span>Atmospheric Barometric Pressure Estimator</span>
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Surface atmospheric pressure P is modeled as a function of MOLA elevation z with an 11.1 km scale height:
              </p>
              <div className="p-3 rounded-xl bg-[#080B12] border border-[#273244] font-mono text-xs text-[#FF6B35] overflow-x-auto my-1">
                P(z) = 610 · exp(-z / 11,100) Pascals
              </div>
              <span className="text-[11px] text-[#94A3B8]">
                Provides aerodynamic drag and entry-descent-landing (EDL) parachute inflation density estimates.
              </span>
            </div>
          </div>
        </section>

        {/* 4. Technical Architecture */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B35] uppercase tracking-wider font-mono">
            <Code2 className="w-4 h-4" />
            <span>Software Architecture</span>
          </div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] font-['Outfit',sans-serif]">
            Modern Geospatial Web Stack
          </h2>
          <div className="p-6 rounded-2xl bg-[#111824] border border-[#273244] flex flex-col gap-4 text-xs text-[#94A3B8]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-1">
                <span className="text-[#FF6B35] font-bold font-mono">Frontend</span>
                <span className="text-[#F5F7FA] font-semibold">React 19 + TypeScript</span>
                <span className="text-[11px]">Strict types, reactive hooks</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-1">
                <span className="text-[#FF6B35] font-bold font-mono">2D Mapping</span>
                <span className="text-[#F5F7FA] font-semibold">OpenLayers 10.11</span>
                <span className="text-[11px]">WMTS/WMS tile streaming</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-1">
                <span className="text-[#FF6B35] font-bold font-mono">3D Globe</span>
                <span className="text-[#F5F7FA] font-semibold">Three.js WebGL</span>
                <span className="text-[11px]">Planetary textures, orbits</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D121C] border border-[#273244] flex flex-col gap-1">
                <span className="text-[#FF6B35] font-bold font-mono">Deployment</span>
                <span className="text-[#F5F7FA] font-semibold">Docker + Nginx Alpine</span>
                <span className="text-[11px]">Gzip compression, port 5173</span>
              </div>
            </div>
            <p className="leading-relaxed">
              GeoMars uses a dual-engine architecture: an OpenLayers canvas optimized for high-precision cartographic measurements, 
              geodesic route overlays, and multi-layer raster blending; and a hardware-accelerated Three.js WebGL globe providing 
              synoptic orbital visualization with interactive coordinates and surface points of interest.
            </p>
          </div>
        </section>

        {/* 5. Scientific Limitations & Responsible Interpretation */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5B942] uppercase tracking-wider font-mono">
            <AlertTriangle className="w-4 h-4" />
            <span>Scientific Notice & Limitations</span>
          </div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] font-['Outfit',sans-serif]">
            Responsible Use & Mission Notice
          </h2>
          <div className="p-6 rounded-2xl bg-[#111824] border border-[#F5B942]/30 flex items-start gap-4 text-xs text-[#94A3B8] leading-relaxed">
            <ShieldCheck className="w-6 h-6 text-[#F5B942] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <span className="font-bold text-[#F5F7FA] text-sm">
                Decision-Support Tooling, Not Certified Mission Flight Hardware
              </span>
              <p>
                All route calculations, slope metrics, travel-time estimates, and landing site suitability indices provided by 
                GeoMars are algorithmic decision-support estimates derived from orbital public datasets (NASA PDS, USGS). 
                They do not replace certified high-resolution HiRISE stereo-derived DEMs, localized hazard avoidance systems, 
                or real-time ground-in-the-loop engineering by NASA JPL mission planning teams.
              </p>
              <p>
                GeoMars does not fabricate observations, live telemetry, or rover status. Historical mission paths are grounded 
                in published mission dossiers.
              </p>
            </div>
          </div>
        </section>

        {/* 6. External Links & References */}
        <section className="p-6 rounded-2xl bg-[#0D121C] border border-[#273244] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-[#F5F7FA] text-sm">Explore Official NASA Data Gateways</h4>
            <span className="text-xs text-[#94A3B8]">Access raw PDS archives and Trek tile endpoints</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://trek.nasa.gov/mars/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#111824] hover:bg-[#161F2C] border border-[#273244] hover:border-[#FF6B35]/50 text-xs text-[#F5F7FA] font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>NASA Mars Trek</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#FF6B35]" />
            </a>
            <a
              href="https://pds-geosciences.wustl.edu/missions/mgs/megdr.html"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#111824] hover:bg-[#161F2C] border border-[#273244] hover:border-[#FF6B35]/50 text-xs text-[#F5F7FA] font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>PDS MOLA MEGDR</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#FF6B35]" />
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#273244] bg-[#0D121C] py-8 px-6 text-center text-xs text-[#94A3B8]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/geomars-logo.png" alt="GeoMars" className="w-5 h-5 object-contain" />
            <span className="font-bold text-[#F5F7FA]">GeoMars</span>
            <span>• Interplanetary Survival Guide</span>
          </div>
          <span>NASA Space Apps Challenge 2026 • IAU 2000 Areoid Coordinate System</span>
        </div>
      </footer>
    </div>
  );
};
