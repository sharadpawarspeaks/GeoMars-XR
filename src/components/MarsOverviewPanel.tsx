import type { FC } from 'react';

export const MarsOverviewPanel: FC = () => {
  return (
    <div className="h-full bg-[#04121B] border border-[#19303E] rounded-xl p-3.5 flex flex-col justify-between select-none">
      <h3 className="text-[13px] font-bold text-[#F4F7FA]">
        Mars Overview
      </h3>

      <div className="flex items-center gap-3.5 my-auto">
        {/* Photorealistic 3D Mars Globe Sphere Graphic */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#8E2805] via-[#C85A32] to-[#FFA06A] shrink-0 shadow-[0_0_16px_rgba(255,107,53,0.3)] overflow-hidden flex items-center justify-center">
          {/* Surface topography textures */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(255,170,120,0.5),transparent_60%)]" />
          <div className="absolute top-2 left-3 w-5 h-3 rounded-full bg-[#521F10]/50 blur-[0.5px]" />
          <div className="absolute bottom-3 left-4 w-10 h-4 rounded-full bg-[#3D1409]/60 blur-[0.5px] rotate-[-15deg]" />
          <div className="absolute top-7 right-3 w-4 h-2.5 rounded-full bg-[#521F10]/40 blur-[0.5px]" />
          {/* North polar ice cap */}
          <div className="absolute top-0 left-6 w-7 h-2 rounded-full bg-white/75 blur-[0.5px]" />
          {/* Atmospheric limb glow rim */}
          <div className="absolute inset-0 rounded-full border border-[#FFA06A]/40" />
        </div>

        {/* Key Planetary Statistics */}
        <div className="flex flex-col gap-1.5 min-w-0 text-[11px]">
          <div className="flex flex-col leading-tight">
            <span className="text-[#71869A] text-[10px]">Mean Radius</span>
            <span className="font-semibold text-[#F4F7FA] font-mono">3,389.5 km</span>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-[#71869A] text-[10px]">Surface Gravity</span>
            <span className="font-semibold text-[#F4F7FA] font-mono">3.71 m/s²</span>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-[#71869A] text-[10px]">Length of Day (Sol)</span>
            <span className="font-semibold text-[#F4F7FA] font-mono">24h 39m</span>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-[#71869A] text-[10px]">Average Temperature</span>
            <span className="font-semibold text-[#F4F7FA] font-mono">-63 °C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

