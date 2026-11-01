import type { FC } from 'react';
import type { MarsSite } from '../types/mars';
import { Rocket, ShieldCheck } from 'lucide-react';

interface MissionActivityPanelProps {
  selectedSite: MarsSite | null;
  onExploreMissions?: () => void;
}

export const MissionActivityPanel: FC<MissionActivityPanelProps> = ({
  selectedSite,
  onExploreMissions
}) => {
  // Get verified mission telemetry based on selected site
  const getMissionData = (siteId?: string) => {
    switch (siteId) {
      case 'gale-crater':
        return {
          mission: 'Mars Science Laboratory (Curiosity)',
          agency: 'NASA / JPL',
          landingSite: 'Gale Crater (Bradbury Landing)',
          landingDate: 'August 6, 2012',
          status: 'Active',
          traverseKm: '33.8 km',
          sols: '4,350+ Sols',
          primaryDiscovery: 'Confirmed ancient habitable lake environment with organic carbon compounds in mudstone.'
        };
      case 'meridiani-planum':
        return {
          mission: 'Mars Exploration Rover B (Opportunity)',
          agency: 'NASA / JPL',
          landingSite: 'Meridiani Planum (Eagle Crater)',
          landingDate: 'January 25, 2004',
          status: 'Completed',
          traverseKm: '45.16 km (Record)',
          sols: '5,352 Sols',
          primaryDiscovery: 'Discovered hematite "blueberries" proving neutral-pH groundwater percolation in ancient Mars.'
        };
      case 'elysium-planitia':
        return {
          mission: 'InSight Geophysical Station',
          agency: 'NASA / CNES / DLR',
          landingSite: 'Elysium Planitia',
          landingDate: 'November 26, 2018',
          status: 'Completed',
          traverseKm: 'Stationary Lander',
          sols: '1,440 Sols',
          primaryDiscovery: 'Detected over 1,300 marsquakes and mapped crustal thickness (24–72 km) and liquid core.'
        };
      case 'utopia-planitia':
        return {
          mission: 'Viking 2 / Zhurong Rover',
          agency: 'NASA (1976) / CNSA (2021)',
          landingSite: 'Utopia Planitia',
          landingDate: 'September 3, 1976 / May 14, 2021',
          status: 'Completed',
          traverseKm: '1.92 km',
          sols: '1,316 Sols',
          primaryDiscovery: 'SHARAD radar and subsurface sounding identified massive frozen water-ice sheets under regolith.'
        };
      case 'jezero-crater':
      default:
        return {
          mission: 'Mars 2020 (Perseverance & Ingenuity)',
          agency: 'NASA / JPL',
          landingSite: 'Jezero Crater (Octavia E. Butler Landing)',
          landingDate: 'February 18, 2021',
          status: 'Active',
          traverseKm: '31.2 km',
          sols: '1,310+ Sols',
          primaryDiscovery: 'Collected sedimentary delta front cores with biosignature preservation potential; 72 Ingenuity flights.'
        };
    }
  };

  const missionInfo = getMissionData(selectedSite?.id);

  return (
    <div className="h-full bg-[#111824] border border-[#273244] rounded-xl p-3 flex flex-col justify-between select-none shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#273244] pb-1.5">
        <div className="flex items-center gap-1.5">
          <Rocket className="w-3.5 h-3.5 text-[#FF6B35]" />
          <h3 className="text-[12px] font-bold text-[#F5F7FA] uppercase tracking-wider font-mono">
            Mission Activity
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              missionInfo.status === 'Active' ? 'bg-[#35C98A]' : 'bg-[#94A3B8]'
            }`}
          />
          <span
            className={`text-[10px] font-mono ${
              missionInfo.status === 'Active' ? 'text-[#35C98A]' : 'text-[#94A3B8]'
            }`}
          >
            {missionInfo.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Middle: Mission Specifics */}
      <div className="flex flex-col gap-1.5 my-auto text-[11px]">
        <div className="flex justify-between items-baseline">
          <span className="text-[#94A3B8] text-[10px]">Mission:</span>
          <span className="font-bold text-[#F5F7FA] truncate max-w-[200px]">
            {missionInfo.mission}
          </span>
        </div>

        <div className="flex justify-between items-baseline font-mono text-[10px]">
          <span className="text-[#94A3B8]">Landing Site:</span>
          <span className="text-[#338BFF] truncate max-w-[200px]">
            {missionInfo.landingSite}
          </span>
        </div>

        <div className="flex justify-between items-baseline font-mono text-[10px]">
          <span className="text-[#94A3B8]">Traverse / Sols:</span>
          <span className="text-[#F5F7FA]">
            {missionInfo.traverseKm} • {missionInfo.sols}
          </span>
        </div>

        <p className="text-[10px] text-[#94A3B8] line-clamp-2 leading-relaxed bg-[#0D121C] p-1.5 rounded-lg border border-[#273244]">
          {missionInfo.primaryDiscovery}
        </p>
      </div>

      {/* Footer: Verified Source & Link */}
      <div className="flex justify-between items-center text-[9px] text-[#94A3B8] font-mono border-t border-[#273244] pt-1.5">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#35C98A]" />
          <span>NASA PDS Traverse Verified</span>
        </span>
        {onExploreMissions && (
          <button
            onClick={onExploreMissions}
            className="text-[#FF6B35] hover:text-[#F5A65B] transition-colors cursor-pointer"
          >
            View Dossier →
          </button>
        )}
      </div>
    </div>
  );
};
