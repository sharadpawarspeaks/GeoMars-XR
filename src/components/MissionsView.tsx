import { useState } from 'react';
import type { FC } from 'react';
import type { MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { formatMarsCoordinate } from '../utils/marsMath';
import { Rocket, Calendar, ArrowRight } from 'lucide-react';

interface MissionsViewProps {
  onSelectSiteAndGoToMap: (site: MarsSite) => void;
}

interface MissionDossier {
  id: string;
  name: string;
  siteId: string;
  agency: string;
  landingDate: string;
  status: 'Active' | 'Completed' | 'Decommissioned';
  distanceTraversedKm: string;
  solsOperated: string;
  primaryGoal: string;
  keyInstruments: string[];
  scientificAchievements: string[];
}

export const MISSIONS_CATALOG: MissionDossier[] = [
  {
    id: 'perseverance',
    name: 'Mars 2020 Perseverance & Ingenuity',
    siteId: 'jezero-crater',
    agency: 'NASA / JPL-Caltech',
    landingDate: 'February 18, 2021',
    status: 'Active',
    distanceTraversedKm: '31.2+ km',
    solsOperated: '1,320+ Sols',
    primaryGoal:
      'Seek signs of ancient microbial life and collect hermetically sealed sample cores for Mars Sample Return.',
    keyInstruments: [
      'Mastcam-Z',
      'SuperCam',
      'PIXL (X-ray)',
      'SHERLOC (UV Raman)',
      'MOXIE (O₂ generation)',
      'RIMFAX (Radar)'
    ],
    scientificAchievements: [
      'Discovered igneous floor rocks beneath sedimentary delta units',
      'Ingenuity performed 72 powered flights logging over 128 flight minutes',
      'Hermetically cached 24+ rock & regolith cores across Jezero delta front'
    ]
  },
  {
    id: 'curiosity',
    name: 'Mars Science Laboratory (Curiosity)',
    siteId: 'gale-crater',
    agency: 'NASA / JPL-Caltech',
    landingDate: 'August 6, 2012',
    status: 'Active',
    distanceTraversedKm: '33.8+ km',
    solsOperated: '4,350+ Sols',
    primaryGoal:
      'Determine whether Mars ever had an environment able to support microbial life in ancient lake beds.',
    keyInstruments: [
      'SAM (Sample Analysis at Mars)',
      'ChemCam',
      'APXS',
      'CheMin (X-ray diffraction)',
      'REMS',
      'DAN (Neutron)'
    ],
    scientificAchievements: [
      'Confirmed Yellowknife Bay was an ancient freshwater lake with habitable neutral pH',
      'Detected indigenous organic macromolecules in 3.5 Ga mudstone',
      'Identified cyclic trace atmospheric methane variations'
    ]
  },
  {
    id: 'opportunity',
    name: 'Mars Exploration Rover (Opportunity)',
    siteId: 'meridiani-planum',
    agency: 'NASA / JPL',
    landingDate: 'January 25, 2004',
    status: 'Completed',
    distanceTraversedKm: '45.16 km (Record)',
    solsOperated: '5,352 Sols (Planned 90)',
    primaryGoal: 'Search for geological clues to past water activity on Meridiani Planum.',
    keyInstruments: [
      'Pancam',
      'Mini-TES',
      'Microscopic Imager',
      'Mössbauer Spectrometer',
      'Rock Abrasion Tool'
    ],
    scientificAchievements: [
      'Discovered hematite spherules ("blueberries") formed in liquid groundwater',
      'Explored Endurance, Victoria, and 22 km wide Endeavour crater',
      'Traversed marathon distance across Martian regolith'
    ]
  },
  {
    id: 'insight',
    name: 'InSight Geophysical Lander',
    siteId: 'elysium-planitia',
    agency: 'NASA / CNES / DLR',
    landingDate: 'November 26, 2018',
    status: 'Completed',
    distanceTraversedKm: 'Stationary Lander',
    solsOperated: '1,440 Sols',
    primaryGoal:
      'Probe the deep Martian interior: crust thickness, mantle composition, and core state.',
    keyInstruments: ['SEIS (Seismometer)', 'HP³ (Heat Flow Probe)', 'RISE (Rotation Doppler)'],
    scientificAchievements: [
      'Recorded over 1,300 marsquakes, confirming active internal seismicity',
      'Mapped crust thickness (24–72 km) and measured liquid core radius (~1,830 km)',
      'Detected active seismic activity near Cerberus Fossae'
    ]
  },
  {
    id: 'phoenix',
    name: 'Phoenix Mars Lander',
    siteId: 'phoenix-lander',
    agency: 'NASA / Univ. of Arizona',
    landingDate: 'May 25, 2008',
    status: 'Completed',
    distanceTraversedKm: 'Stationary Polar Lander',
    solsOperated: '161 Sols',
    primaryGoal:
      'Search for subsurface water ice and habitable niches in the northern polar plains.',
    keyInstruments: [
      'Robotic Arm',
      'TEGA (Thermal Analyzer)',
      'MECA (Wet Chemistry)',
      'SSI Imager'
    ],
    scientificAchievements: [
      'Dug trenches exposing pure subsurface water ice that sublimated in daylight',
      'Discovered perchlorate salts in northern regolith',
      'Detected snow falling from cirrus clouds in polar atmosphere'
    ]
  },
  {
    id: 'viking-1',
    name: 'Viking 1 Lander & Orbiter',
    siteId: 'chryse-planitia',
    agency: 'NASA / Langley / JPL',
    landingDate: 'July 20, 1976',
    status: 'Completed',
    distanceTraversedKm: 'Stationary Lander',
    solsOperated: '2,307 Sols',
    primaryGoal: 'First successful long-duration landing and biology search on Mars.',
    keyInstruments: [
      'Biology Experiments',
      'GCMS',
      'Seismometer',
      'Meteorology Sensors'
    ],
    scientificAchievements: [
      'Returned first color surface panoramas from Martian surface',
      'Analyzed soil chemistry revealing iron-rich basaltic weathering',
      'Characterized atmospheric composition and seasonal pressure cycle'
    ]
  }
];

export const MissionsView: FC<MissionsViewProps> = ({ onSelectSiteAndGoToMap }) => {
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');

  const filteredMissions = MISSIONS_CATALOG.filter(
    (m) => filter === 'All' || m.status === filter
  );

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#080B12] text-[#F5F7FA] select-none scrollbar-thin">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#273244] pb-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#FF6B35] font-semibold tracking-wider text-xs uppercase font-mono">
              <Rocket className="w-4 h-4" />
              <span>NASA & International Surface Fleet</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Outfit',sans-serif]">
              Mars Surface Mission Explorer
            </h1>
            <p className="text-[#94A3B8] text-xs leading-relaxed max-w-2xl">
              Chronicle of robotic landers and planetary rovers that have descended to the Martian
              regolith, from the 1976 Viking 1 touchdown to sample caching in Jezero Crater.
            </p>
          </div>

          <div className="flex bg-[#111824] border border-[#273244] p-1 rounded-xl gap-1 text-xs">
            {(['All', 'Active', 'Completed'] as const).map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filter === tab
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tab} Missions
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMissions.map((mission) => {
            const site = MARS_SITES.find((s) => s.id === mission.siteId) || MARS_SITES[0];

            return (
              <div
                key={mission.id}
                className="bg-[#111824] border border-[#273244] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl hover:border-[#FF6B35]/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-[#94A3B8] font-mono">{mission.agency}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        mission.status === 'Active'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {mission.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{mission.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#FF6B35] font-mono mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Touchdown: {mission.landingDate}</span>
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                    {mission.primaryGoal}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                    <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244]">
                      <span className="text-[10px] text-[#94A3B8] block">Total Odometer</span>
                      <span className="font-bold text-white text-[13px]">
                        {mission.distanceTraversedKm}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0D121C] border border-[#273244]">
                      <span className="text-[10px] text-[#94A3B8] block">Mission Lifespan</span>
                      <span className="font-bold text-white text-[13px]">
                        {mission.solsOperated}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-3">
                    <span className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">
                      Key Discoveries:
                    </span>
                    {mission.scientificAchievements.map((ach, aIdx) => (
                      <div key={aIdx} className="flex items-start gap-1.5 text-[11px] text-[#F5F7FA]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#338BFF] shrink-0 mt-1.5" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {mission.keyInstruments.map((inst, iIdx) => (
                      <span
                        key={iIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#080B12] border border-[#273244] text-[#94A3B8]"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#273244] flex items-center justify-between">
                  <span className="text-[11px] text-[#94A3B8] font-mono">
                    {formatMarsCoordinate(site.lat, site.lng)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectSiteAndGoToMap(site)}
                    className="px-3 py-1.5 rounded-lg bg-[#FF6B35]/15 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white border border-[#FF6B35]/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Explore in XR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
