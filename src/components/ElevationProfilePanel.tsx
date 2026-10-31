import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { MarsSite } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { ChevronDown } from 'lucide-react';

interface ElevationProfilePanelProps {
  selectedSite: MarsSite | null;
  onSelectSite: (site: MarsSite) => void;
}

export const ElevationProfilePanel: FC<ElevationProfilePanelProps> = ({
  selectedSite,
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
          points: [
            { km: 0, elev: 2000 },
            { km: 25, elev: 8500 },
            { km: 50, elev: 21287 },
            { km: 75, elev: 12000 },
            { km: 100, elev: 3000 }
          ],
          peakVal: '21,287 m',
          yLabels: ['24 km', '16 km', '8 km', '0 km'],
          yMin: 0,
          yMax: 24000
        };
      case 'valles-marineris':
        // Deep rift canyon
        return {
          points: [
            { km: 0, elev: 1200 },
            { km: 25, elev: -2500 },
            { km: 50, elev: -7000 },
            { km: 75, elev: -3100 },
            { km: 100, elev: 800 }
          ],
          peakVal: '-7,000 m',
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
  const paddingBottom = 16;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
      </div>
    </div>
  );
};

