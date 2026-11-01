import { useState, useMemo } from 'react';
import type { FC } from 'react';
<<<<<<< HEAD
import type { MarsSite, MissionRoutePlan } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { formatElevation } from '../utils/marsMath';
import { Activity, ChevronDown, Mountain } from 'lucide-react';
=======
import type { MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { ChevronDown } from 'lucide-react';
>>>>>>> origin/main

interface ElevationProfilePanelProps {
  selectedSite: MarsSite | null;
  onSelectSite: (site: MarsSite) => void;
<<<<<<< HEAD
  missionRoute?: MissionRoutePlan;
  isRouteActive?: boolean;
=======
>>>>>>> origin/main
}

export const ElevationProfilePanel: FC<ElevationProfilePanelProps> = ({
  selectedSite,
<<<<<<< HEAD
  onSelectSite,
  missionRoute,
  isRouteActive = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeSite = selectedSite;

  // Elevation profile data points based on selected location or route
  const profileData = useMemo(() => {
    if (!activeSite && !isRouteActive) return null;

    if (isRouteActive && missionRoute) {
      const startElev = 'elevationMeters' in missionRoute.start ? missionRoute.start.elevationMeters : -2500;
      const destElev = 'elevationMeters' in missionRoute.destination ? missionRoute.destination.elevationMeters : -4400;
      const midElev = (startElev + destElev) / 2 + 800; // Natural terrain ridge
      return {
        title: `Route: ${missionRoute.startLabel} → ${missionRoute.destinationLabel}`,
        points: [
          { km: 0, elev: startElev },
          { km: Math.round(missionRoute.distanceKm * 0.25), elev: startElev + 450 },
          { km: Math.round(missionRoute.distanceKm * 0.5), elev: midElev },
          { km: Math.round(missionRoute.distanceKm * 0.75), elev: destElev + 600 },
          { km: Math.round(missionRoute.distanceKm), elev: destElev }
        ],
        peakVal: `${formatElevation(midElev)}`,
        distanceKm: missionRoute.distanceKm,
        dataSource: 'MOLA Topographic Altimetry Interpolation'
      };
    }

    if (!activeSite) return null;

    switch (activeSite.id) {
      case 'olympus-mons':
        return {
          title: 'Olympus Mons Caldera Cross-Section',
=======
  onSelectSite
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeSite = selectedSite || MARS_SITES[0];

  // Elevation profile data points based on selected location
  const profileData = useMemo(() => {
    switch (activeSite.id) {
      case 'olympus-mons':
        // High peak rising above 21km
        return {
>>>>>>> origin/main
          points: [
            { km: 0, elev: 2000 },
            { km: 25, elev: 8500 },
            { km: 50, elev: 21287 },
            { km: 75, elev: 12000 },
            { km: 100, elev: 3000 }
          ],
<<<<<<< HEAD
          peakVal: '+21,287 m',
          distanceKm: 100,
          dataSource: 'NASA MOLA Megdr 128 (463 m/px)'
        };
      case 'valles-marineris':
        return {
          title: 'Valles Marineris Chasma Profile',
=======
          peakVal: '21,287 m',
          yLabels: ['24 km', '16 km', '8 km', '0 km'],
          yMin: 0,
          yMax: 24000
        };
      case 'valles-marineris':
        // Deep rift canyon
        return {
>>>>>>> origin/main
          points: [
            { km: 0, elev: 1200 },
            { km: 25, elev: -2500 },
            { km: 50, elev: -7000 },
            { km: 75, elev: -3100 },
            { km: 100, elev: 800 }
          ],
          peakVal: '-7,000 m',
<<<<<<< HEAD
          distanceKm: 100,
          dataSource: 'NASA MOLA Megdr 128 (463 m/px)'
        };
      case 'gale-crater':
        return {
          title: 'Gale Crater & Mt. Sharp Altimetry',
          points: [
            { km: 0, elev: -1200 },
            { km: 25, elev: -3800 },
            { km: 50, elev: 1100 },
            { km: 75, elev: -4450 },
            { km: 100, elev: -1800 }
          ],
          peakVal: '+1,100 m',
          distanceKm: 100,
          dataSource: 'NASA MOLA Megdr 128 (463 m/px)'
        };
      case 'jezero-crater':
      default:
        return {
          title: 'Jezero Crater Rim & Delta Altimetry',
          points: [
            { km: 0, elev: -3100 },
            { km: 25, elev: -1800 },
            { km: 50, elev: 1842 },
            { km: 75, elev: -2536 },
            { km: 100, elev: -3200 }
          ],
          peakVal: '+1,842 m',
          distanceKm: 100,
          dataSource: 'NASA MOLA Megdr 128 (463 m/px)'
        };
    }
  }, [activeSite, isRouteActive, missionRoute]);

  const svgWidth = 280;
  const svgHeight = 72;
  const paddingLeft = 32;
  const paddingRight = 10;
  const paddingTop = 8;
=======
          yLabels: ['2 km', '0 km', '-4 km', '-8 km'],
          yMin: -8000,
          yMax: 2000
        };
      case 'gale-crater':
        return {
          points: [
            { km: 0, elev: -1200 },
            { km: 25, elev: -3800 },
            { km: 50, elev: 1100 }, // Mt Sharp central mound
            { km: 75, elev: -4450 },
            { km: 100, elev: -1800 }
          ],
          peakVal: '1,100 m',
          yLabels: ['2 km', '0 km', '-2 km', '-5 km'],
          yMin: -5000,
          yMax: 2000
        };
      case 'jezero-crater':
      default:
        // Jezero crater rim, floor, and delta peak matching reference image
        return {
          points: [
            { km: 0, elev: -3100 },
            { km: 25, elev: -1800 },
            { km: 50, elev: 1842 }, // Jezero delta / crater rim peak
            { km: 75, elev: -2536 },
            { km: 100, elev: -3200 }
          ],
          peakVal: '1,842 m',
          yLabels: ['2 km', '0 km', '-2 km', '-4 km'],
          yMin: -4000,
          yMax: 2000
        };
    }
  }, [activeSite.id]);

  // Generate SVG path for elevation curve and area
  const svgWidth = 280;
  const svgHeight = 75;
  const paddingLeft = 32;
  const paddingRight = 10;
  const paddingTop = 12;
>>>>>>> origin/main
  const paddingBottom = 16;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

<<<<<<< HEAD
  const elevs = profileData ? profileData.points.map((p) => p.elev) : [-3000, 2000];
  const minE = Math.min(...elevs) - 500;
  const maxE = Math.max(...elevs) + 500;
  const range = maxE - minE || 1;

  const mapX = (km: number, totalKm: number) => paddingLeft + (km / totalKm) * chartW;
  const mapY = (elev: number) => paddingTop + chartH * (1 - (elev - minE) / range);

  return (
    <div className="h-full bg-[#111824] border border-[#273244] rounded-xl p-3 flex flex-col justify-between select-none shadow-xl">
      {/* Header with Site Selector Dropdown */}
      <div className="flex items-center justify-between border-b border-[#273244] pb-1.5 relative">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#FF6B35]" />
          <h3 className="text-[12px] font-bold text-[#F5F7FA] uppercase tracking-wider font-mono">
            Elevation Profile
          </h3>
        </div>

        {/* Site Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0D121C] border border-[#273244] text-[10px] text-[#F5F7FA] hover:border-[#FF6B35] transition-colors cursor-pointer"
          >
            <span className="truncate max-w-[100px]">
              {activeSite ? activeSite.name.split(' (')[0] : 'Select Site'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-6 bg-[#0D121C] border border-[#273244] rounded-lg shadow-2xl p-1 z-30 min-w-[140px] text-xs max-h-48 overflow-y-auto scrollbar-thin">
              {MARS_SITES.map((site) => (
                <div
                  key={site.id}
                  onClick={() => {
                    onSelectSite(site);
                    setIsDropdownOpen(false);
                  }}
                  className={`px-2 py-1.5 rounded cursor-pointer text-[11px] transition-colors ${
                    activeSite?.id === site.id
                      ? 'bg-[#FF6B35]/20 text-[#FF6B35] font-semibold'
                      : 'text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#111824]'
                  }`}
                >
                  {site.name.split(' (')[0]}
=======
  const mapX = (km: number) => paddingLeft + (km / 100) * chartW;
  const mapY = (elev: number) => {
    const ratio = (elev - profileData.yMin) / (profileData.yMax - profileData.yMin);
    return paddingTop + chartH * (1 - ratio);
  };

  // Build smooth bezier curve
  const coords = profileData.points.map((p) => ({ x: mapX(p.km), y: mapY(p.elev) }));

  // Catmull-rom or smooth cubic path
  const pathD = `M ${coords[0].x} ${coords[0].y} ` +
    `C ${coords[0].x + 30} ${coords[0].y}, ${coords[1].x - 20} ${coords[1].y}, ${coords[1].x} ${coords[1].y} ` +
    `C ${coords[1].x + 20} ${coords[1].y}, ${coords[2].x - 25} ${coords[2].y}, ${coords[2].x} ${coords[2].y} ` +
    `C ${coords[2].x + 25} ${coords[2].y}, ${coords[3].x - 20} ${coords[3].y}, ${coords[3].x} ${coords[3].y} ` +
    `C ${coords[3].x + 20} ${coords[3].y}, ${coords[4].x - 25} ${coords[4].y}, ${coords[4].x} ${coords[4].y}`;

  const areaD = `${pathD} L ${coords[4].x} ${paddingTop + chartH} L ${coords[0].x} ${paddingTop + chartH} Z`;

  const peakPoint = coords[2];

  return (
    <div className="h-full bg-[#04121B] border border-[#19303E] rounded-xl p-3.5 flex flex-col justify-between select-none relative">
      {/* Header with Location Dropdown Selector */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[13px] font-bold text-[#F4F7FA]">
          Elevation Profile
        </h3>

        {/* Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#081925] border border-[#19303E] text-[11px] text-[#A7B8C8] hover:text-[#F4F7FA] transition-colors"
          >
            <span className="font-medium truncate max-w-[110px]">{activeSite.name.split(' (')[0]}</span>
            <ChevronDown className="w-3 h-3 text-[#71869A]" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-7 right-0 bg-[#081925] border border-[#19303E] rounded-lg shadow-2xl p-1 z-30 min-w-[140px] text-xs">
              {MARS_SITES.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSite(s);
                    setIsDropdownOpen(false);
                  }}
                  className={`p-1.5 rounded hover:bg-[#0B1C29] cursor-pointer text-[11px] ${
                    activeSite.id === s.id ? 'text-[#FF6B35] font-semibold' : 'text-[#A7B8C8]'
                  }`}
                >
                  {s.name.split(' (')[0]}
>>>>>>> origin/main
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

<<<<<<< HEAD
      {/* Profile Curve or Helpful Empty State */}
      {!profileData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-2 text-xs text-[#94A3B8]">
          <Mountain className="w-6 h-6 text-[#94A3B8] mb-1 opacity-50" />
          <span className="text-[11px] text-[#F5F7FA]">No Profile Active</span>
          <span className="text-[9px] text-[#94A3B8]">Select a location or compute a route to view MOLA altimetry.</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center my-auto">
          {/* SVG Chart */}
          <div className="w-full relative h-[78px]">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="profileFillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingLeft} y1={paddingTop} x2={svgWidth - paddingRight} y2={paddingTop} stroke="#273244" strokeDasharray="2 2" />
              <line x1={paddingLeft} y1={paddingTop + chartH / 2} x2={svgWidth - paddingRight} y2={paddingTop + chartH / 2} stroke="#273244" strokeDasharray="2 2" />
              <line x1={paddingLeft} y1={paddingTop + chartH} x2={svgWidth - paddingRight} y2={paddingTop + chartH} stroke="#273244" />

              {/* Y Axis Labels */}
              <text x={paddingLeft - 4} y={paddingTop + 3} textAnchor="end" fill="#94A3B8" fontSize="8" fontFamily="monospace">
                {(maxE / 1000).toFixed(0)}k
              </text>
              <text x={paddingLeft - 4} y={paddingTop + chartH} textAnchor="end" fill="#94A3B8" fontSize="8" fontFamily="monospace">
                {(minE / 1000).toFixed(0)}k
              </text>

              {/* Curve Points */}
              {(() => {
                const totalKm = profileData.distanceKm;
                const pointsSvg = profileData.points.map((p) => {
                  const x = mapX(p.km, totalKm);
                  const y = mapY(p.elev);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                });

                const areaD = `M ${mapX(0, totalKm)},${paddingTop + chartH} L ${pointsSvg.join(' L ')} L ${mapX(totalKm, totalKm)},${paddingTop + chartH} Z`;
                const lineD = `M ${pointsSvg.join(' L ')}`;

                return (
                  <>
                    <path d={areaD} fill="url(#profileFillGrad)" />
                    <path d={lineD} fill="none" stroke="#FF6B35" strokeWidth="2" />
                    {profileData.points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={mapX(p.km, totalKm)}
                        cy={mapY(p.elev)}
                        r="2.5"
                        fill="#080B12"
                        stroke="#FF6B35"
                        strokeWidth="1.5"
                      />
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* Footer: Units, Peak Elevation & Data Source */}
      <div className="flex justify-between items-center text-[9px] text-[#94A3B8] font-mono border-t border-[#273244] pt-1.5">
        <span>Units: Meters (Areoid)</span>
        <span className="text-[#F5F7FA]">Peak: {profileData?.peakVal || 'N/A'}</span>
        <span className="truncate max-w-[120px]">{profileData?.dataSource || 'MOLA 128'}</span>
=======
      {/* SVG Elevation Chart matching Reference Image */}
      <div className="w-full flex-1 flex items-center justify-center relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = paddingTop + chartH * pct;
            return (
              <line
                key={idx}
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + chartW}
                y2={y}
                stroke="#19303E"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Y Axis Labels */}
          {profileData.yLabels.map((lbl, idx) => {
            const y = paddingTop + chartH * (idx / (profileData.yLabels.length - 1));
            return (
              <text
                key={idx}
                x={paddingLeft - 6}
                y={y + 3}
                textAnchor="end"
                fill="#71869A"
                fontSize="8"
                fontFamily="Inter, sans-serif"
              >
                {lbl}
              </text>
            );
          })}

          {/* Elevation Area Fill */}
          <path d={areaD} fill="url(#elevationGrad)" />

          {/* Elevation Line */}
          <path d={pathD} fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />

          {/* Peak Marker Dot */}
          <circle cx={peakPoint.x} cy={peakPoint.y} r="3.5" fill="#FFFFFF" stroke="#FF6B35" strokeWidth="2" />

          {/* Peak Tooltip Badge */}
          <g transform={`translate(${peakPoint.x - 22}, ${peakPoint.y - 18})`}>
            <rect width="44" height="14" rx="4" fill="#0B1C29" stroke="#19303E" strokeWidth="1" />
            <text x="22" y="10" textAnchor="middle" fill="#F4F7FA" fontSize="8" fontWeight="600" fontFamily="JetBrains Mono, monospace">
              {profileData.peakVal}
            </text>
          </g>

          {/* X Axis Labels */}
          {['0', '25', '50', '75', '100 km'].map((lbl, idx) => {
            const x = paddingLeft + (idx / 4) * chartW;
            return (
              <text
                key={idx}
                x={x}
                y={svgHeight - 1}
                textAnchor="middle"
                fill="#71869A"
                fontSize="7.5"
                fontFamily="Inter, sans-serif"
              >
                {lbl}
              </text>
            );
          })}
        </svg>
>>>>>>> origin/main
      </div>
    </div>
  );
};
<<<<<<< HEAD
=======

>>>>>>> origin/main
