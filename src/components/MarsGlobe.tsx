import { useEffect, useRef, useState } from 'react';
import type {
  MapLayerConfig,
  MarsCoordinate,
  MarsSite,
  MissionRoutePlan
} from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { LAYER_CATALOG } from '../data/layerCatalog';
import { formatElevation, formatMarsCoordinate } from '../utils/marsMath';
import { GeoMarsXRRuntime, type XRPanelMode } from '../xr/GeoMarsXRRuntime';
import {
  Glasses,
  Hand,
  HelpCircle,
  Compass,
  Layers,
  Mountain,
  Navigation,
  FlaskConical,
  Sparkles,
  RotateCw,
  Pause,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  PanelLeft,
  AlertTriangle
} from 'lucide-react';

interface MarsGlobeProps {
  activeLayer: MapLayerConfig;
  layerOpacity: number;
  selectedSite: MarsSite | null;
  selectedCoordinate: MarsCoordinate | null;
  onSelectSite: (site: MarsSite | null) => void;
  onSelectCoordinate: (coord: MarsCoordinate) => void;
  onSelectLayer: (layer: MapLayerConfig) => void;
  missionRoute: MissionRoutePlan;
  showRouteOverlay: boolean;
  onToggleRouteOverlay: (visible: boolean) => void;
  onUpdateMissionRoute: (plan: MissionRoutePlan) => void;
  onOpenAiModal: () => void;
  onToggleViewMode: (mode: '2d' | '3d') => void;
}

const QUICK_KEY_SITE_IDS = [
  'jezero-crater',
  'olympus-mons',
  'valles-marineris',
  'gale-crater',
  'elysium-planitia',
  'nili-fossae',
  'mawrth-vallis'
];

export function MarsGlobe({
  activeLayer,
  layerOpacity,
  selectedSite,
  selectedCoordinate,
  onSelectSite,
  onSelectCoordinate,
  onSelectLayer,
  missionRoute,
  showRouteOverlay,
  onToggleRouteOverlay,
  onUpdateMissionRoute,
  onOpenAiModal,
  onToggleViewMode
}: MarsGlobeProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<GeoMarsXRRuntime | null>(null);

  const [xrMode, setXrMode] = useState<XRPanelMode>('globe');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [showSpatialPanelsDesktop, setShowSpatialPanelsDesktop] = useState(false);
  const [showControlsHelp, setShowControlsHelp] = useState(false);

  const [xrState, setXrState] = useState<{
    xrSupported: boolean;
    handTrackingLikely: boolean;
    isInVR: boolean;
    isOfflineFallback: boolean;
    xrStatusMessage: string;
    hoveredSite: MarsSite | null;
    hoveredCoord: MarsCoordinate | null;
    roverProgressPct: number;
  }>({
    xrSupported: false,
    handTrackingLikely: false,
    isInVR: false,
    isOfflineFallback: false,
    xrStatusMessage: 'Initializing GeoMars XR Engine...',
    hoveredSite: null,
    hoveredCoord: null,
    roverProgressPct: 0
  });

  // Latest callbacks ref to avoid recreating WebXR World on React re-renders
  const callbacksRef = useRef({
    onSelectSite,
    onSelectCoordinate,
    onSelectLayer,
    onToggleRouteOverlay,
    onUpdateMissionRoute,
    onOpenAiModal
  });
  callbacksRef.current = {
    onSelectSite,
    onSelectCoordinate,
    onSelectLayer,
    onToggleRouteOverlay,
    onUpdateMissionRoute,
    onOpenAiModal
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const runtime = new GeoMarsXRRuntime(
      container,
      {
        activeLayer,
        layerOpacity,
        selectedSite,
        selectedCoordinate,
        missionRoute,
        showRouteOverlay,
        mode: xrMode,
        showSpatialPanelsDesktop
      },
      {
        onSelectSite: (site) => callbacksRef.current.onSelectSite(site),
        onSelectCoordinate: (coord) => callbacksRef.current.onSelectCoordinate(coord),
        onSelectLayer: (layer) => callbacksRef.current.onSelectLayer(layer),
        onToggleRouteOverlay: (v) => callbacksRef.current.onToggleRouteOverlay(v),
        onUpdateMissionRoute: (plan) => callbacksRef.current.onUpdateMissionRoute(plan),
        onOpenAiModal: () => callbacksRef.current.onOpenAiModal(),
        onModeChange: (next) => setXrMode(next),
        onXrStateChange: (nextState) => setXrState(nextState)
      }
    );

    runtimeRef.current = runtime;

    return () => {
      runtime.destroy();
      runtimeRef.current = null;
    };
    // Mount once per lifetime of 3D observatory
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push prop updates into live IWSDK XR runtime
  useEffect(() => {
    runtimeRef.current?.updateProps({
      activeLayer,
      layerOpacity,
      selectedSite,
      selectedCoordinate,
      missionRoute,
      showRouteOverlay,
      mode: xrMode,
      showSpatialPanelsDesktop
    });
  }, [
    activeLayer,
    layerOpacity,
    selectedSite,
    selectedCoordinate,
    missionRoute,
    showRouteOverlay,
    xrMode,
    showSpatialPanelsDesktop
  ]);

  // Accessible desktop keyboard navigation (1-7 landmarks, T terrain, R reset, Space rotate, L cycle layer)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key >= '1' && e.key <= '7') {
        const idx = Number(e.key) - 1;
        const site = MARS_SITES.find((s) => s.id === QUICK_KEY_SITE_IDS[idx]);
        if (site) {
          callbacksRef.current.onSelectSite(site);
          callbacksRef.current.onSelectCoordinate({
            lat: site.lat,
            lng: site.lng,
            elevationMeters: site.elevationMeters
          });
          runtimeRef.current?.flyToSite(site);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        runtimeRef.current?.resetView();
        setIsAutoRotating(true);
      } else if (e.key === 't' || e.key === 'T') {
        setXrMode((prev) => (prev === 'terrain' ? 'globe' : 'terrain'));
      } else if (e.key === 'l' || e.key === 'L') {
        const curIdx = LAYER_CATALOG.findIndex((l) => l.id === activeLayer.id);
        const nextLayer = LAYER_CATALOG[(curIdx + 1) % LAYER_CATALOG.length];
        if (nextLayer) {
          callbacksRef.current.onSelectLayer(nextLayer);
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoRotating((prev) => {
          const next = !prev;
          runtimeRef.current?.setAutoRotate(next);
          return next;
        });
      } else if (e.key === '+' || e.key === '=') {
        runtimeRef.current?.zoomStep(1.18);
      } else if (e.key === '-') {
        runtimeRef.current?.zoomStep(0.84);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeLayer.id]);

  const handleModeSelect = (nextMode: XRPanelMode) => {
    setXrMode(nextMode);
    runtimeRef.current?.setMode(nextMode);
    if (nextMode === 'ai') {
      onOpenAiModal();
    }
  };

  const activeRoute =
    missionRoute.activeCandidateRoute ?? missionRoute.alternativeRoutes?.[0];

  const telemetryCoord = xrState.hoveredCoord ?? selectedCoordinate;

  return (
    <div className="relative w-full h-full bg-[#03060D] select-none overflow-hidden">
      {/* WebGL / IWSDK XR Viewport */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="GeoMars XR Interactive 3D Mars Viewport"
      />

      {/* Top Left Controls: Planet View Switcher & XR Mode Selector */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-24px)] pointer-events-none">
        <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 pointer-events-auto shadow-lg">
          <button
            type="button"
            onClick={() => onToggleViewMode('2d')}
            className="px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            2D Map
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('3d')}
            className="px-2.5 py-1 rounded text-xs font-semibold bg-[#FF6B35]/20 text-[#FF8A5C] border border-[#FF6B35]/40 flex items-center gap-1.5"
          >
            <Glasses className="w-3.5 h-3.5" />
            3D / XR
          </button>
        </div>

        {/* Observatory Mode Tabs (Seated 10-minute exploration flow) */}
        <div
          role="tablist"
          aria-label="XR Observatory Mode"
          className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 pointer-events-auto shadow-lg"
        >
          {(
            [
              { id: 'globe', label: 'Globe', icon: Compass },
              { id: 'terrain', label: 'Surface 3D', icon: Mountain },
              { id: 'rover', label: 'Rover Ops', icon: Navigation },
              { id: 'science', label: 'Science Lab', icon: FlaskConical },
              { id: 'ai', label: 'AI Assist', icon: Sparkles }
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const active = xrMode === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleModeSelect(id)}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  active
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Right: Enter WebXR Button + Quick Camera & Cockpit Tools */}
      <div className="absolute top-3 right-3 z-20 flex flex-wrap items-center justify-end gap-2 pointer-events-none">
        {/* Primary WebXR Entry Button */}
        <button
          type="button"
          onClick={() =>
            xrState.isInVR ? void runtimeRef.current?.exitVR() : void runtimeRef.current?.launchVR()
          }
          title={xrState.xrStatusMessage}
          className={`pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border shadow-lg transition-all ${
            xrState.isInVR
              ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/60 hover:bg-emerald-500/35'
              : xrState.xrSupported
                ? 'bg-gradient-to-r from-[#FF6B35] to-[#e05221] text-white border-[#FF8A5C]/70 hover:brightness-110'
                : 'bg-slate-900/90 text-slate-200 border-slate-600/80 hover:border-[#FF6B35]/60'
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
          <span>{xrState.isInVR ? 'Exit VR' : 'Enter VR (Hands-First)'}</span>
        </button>

        {/* Camera & Spatial Panel Toolbar */}
        <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 pointer-events-auto shadow-lg">
          <button
            type="button"
            onClick={() => runtimeRef.current?.zoomStep(1.18)}
            title="Zoom In (+)"
            aria-label="Zoom In"
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/80"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => runtimeRef.current?.zoomStep(0.84)}
            title="Zoom Out (-)"
            aria-label="Zoom Out"
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/80"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const next = !isAutoRotating;
              setIsAutoRotating(next);
              runtimeRef.current?.setAutoRotate(next);
            }}
            title={isAutoRotating ? 'Pause Orbital Spin (Space)' : 'Resume Orbital Spin (Space)'}
            aria-label="Toggle orbital rotation"
            className={`p-1.5 rounded transition-colors ${
              isAutoRotating
                ? 'text-[#FF8A5C] bg-[#FF6B35]/15'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <RotateCw className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              runtimeRef.current?.resetView();
              setIsAutoRotating(true);
            }}
            title="Recenter Seated Cockpit & Reset (R)"
            aria-label="Recenter seated cockpit"
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/80"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowSpatialPanelsDesktop((v) => !v)}
            title="Preview 3D Curved XR Spatial Cockpit Panels on Desktop"
            aria-pressed={showSpatialPanelsDesktop}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
              showSpatialPanelsDesktop
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <PanelLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">XR Panels</span>
          </button>
          <button
            type="button"
            onClick={() => setShowControlsHelp((v) => !v)}
            title="Hand Tracking & Desktop Controls Guide"
            aria-expanded={showControlsHelp}
            className={`p-1.5 rounded transition-colors ${
              showControlsHelp
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Controls & Hand Interaction Guide */}
      {showControlsHelp && (
        <div className="absolute top-14 right-3 z-30 w-80 bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl text-xs text-slate-200 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-[#FF6B35]" />
              Hands-First XR &amp; Desktop Guide
            </span>
            <button
              type="button"
              onClick={() => setShowControlsHelp(false)}
              className="text-slate-400 hover:text-white text-[11px]"
            >
              Close
            </button>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <p>
              <strong className="text-sky-300">WebXR Hand Tracking:</strong> Point ray &amp; pinch
              thumb+index to select beacons/buttons. Pinch with 1 hand to spin Mars; pinch both
              hands to zoom scale. Grab top blue bars to move floating panels.
            </p>
            <p>
              <strong className="text-[#FF8A5C]">Desktop Mouse / Touch:</strong> Drag to orbit Mars,
              scroll to zoom, click any beacon or terrain coordinate to inspect.
            </p>
            <p>
              <strong className="text-emerald-300">Keyboard Shortcuts:</strong>{' '}
              <code>1–7</code> fly to flagship sites, <code>T</code> surface 3D diorama,{' '}
              <code>L</code> cycle NASA layer, <code>Space</code> pause spin, <code>R</code> recenter.
            </p>
          </div>
        </div>
      )}

      {/* Hover Tooltip Banner when inspecting beacons in 3D */}
      {xrState.hoveredSite && (
        <div className="absolute top-14 left-3 z-20 bg-slate-950/90 backdrop-blur-md border border-[#FF6B35]/50 rounded-lg px-3 py-1.5 pointer-events-none shadow-lg">
          <div className="text-xs font-semibold text-white">{xrState.hoveredSite.name}</div>
          <div className="text-[11px] text-slate-300 font-mono">
            {formatMarsCoordinate(xrState.hoveredSite.lat, xrState.hoveredSite.lng)} ·{' '}
            {formatElevation(xrState.hoveredSite.elevationMeters)}
          </div>
        </div>
      )}

      {/* Active Route Simulation Mini Pill when Route is ON */}
      {showRouteOverlay && activeRoute && (
        <div className="hidden sm:flex items-center gap-2.5 absolute bottom-14 left-3 z-20 bg-slate-950/88 backdrop-blur-md border border-emerald-500/40 rounded-lg px-3 py-1.5 text-[11px] text-slate-200 pointer-events-none shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            <strong className="text-emerald-300">Simulated A* Rover:</strong>{' '}
            {missionRoute.startLabel} → {missionRoute.destinationLabel} ({activeRoute.distanceKm.toFixed(0)} km,{' '}
            {activeRoute.routeConfidencePct}% simulated confidence — not certified safe)
          </span>
        </div>
      )}

      {/* Bottom Left: Scientific Provenance / Offline Fallback Status */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        {xrState.isOfflineFallback ? (
          <div className="flex items-center gap-1.5 bg-amber-950/90 border border-amber-500/60 text-amber-200 px-2.5 py-1 rounded-md text-[11px] font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Offline Procedural Fallback Active (Not Verified NASA Imagery)</span>
          </div>
        ) : (
          <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-md text-[11px] text-slate-300">
            <span className="text-sky-400 font-semibold">{activeLayer.name}</span>
            <span className="text-slate-500 mx-1.5">·</span>
            <span className="text-slate-400">{activeLayer.provider} ({activeLayer.resolution})</span>
          </div>
        )}
      </div>

      {/* Bottom Right: Coordinate Probe Readout */}
      <div className="absolute bottom-3 right-3 z-20 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-md px-3 py-1.5 text-[11px] font-mono text-slate-200 pointer-events-none shadow-lg">
        {telemetryCoord ? (
          <span>
            {xrState.hoveredCoord ? 'PROBE ' : 'TARGET '}
            <span className="text-[#FF8A5C]">
              {formatMarsCoordinate(telemetryCoord.lat, telemetryCoord.lng)}
            </span>
            <span className="text-slate-500 mx-1.5">|</span>
            <span className="text-sky-300">{formatElevation(telemetryCoord.elevationMeters)}</span>
          </span>
        ) : (
          <span className="text-slate-400">{xrState.xrStatusMessage}</span>
        )}
      </div>
    </div>
  );
}
