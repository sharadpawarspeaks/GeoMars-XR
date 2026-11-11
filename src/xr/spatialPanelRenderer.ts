import {
  BoxGeometry,
  CanvasTexture,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace
} from '@iwsdk/core';
import type {
  CandidateRoute,
  MapLayerConfig,
  MarsCoordinate,
  MarsSite,
  MissionRoutePlan
} from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { LAYER_CATALOG } from '../data/layerCatalog';
import { SCIENCE_LAB_TOPICS, SCIENCE_MODELS, type ScienceModelDescriptor } from '../data/scienceLabData';
import { formatElevation, formatMarsCoordinate } from '../utils/marsMath';

export type XRPanelMode = 'globe' | 'terrain' | 'rover' | 'science' | 'ai';

export interface SpatialHitButton {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SpatialPanelState {
  mode: XRPanelMode;
  selectedSite: MarsSite | null;
  selectedCoordinate: MarsCoordinate | null;
  activeLayer: MapLayerConfig;
  missionRoute: MissionRoutePlan;
  showRouteOverlay: boolean;
  isAutoRotating: boolean;
  isRoverAnimating: boolean;
  roverProgressPct: number;
  selectedScienceTopicId: string;
  selectedScienceModelId: ScienceModelDescriptor['id'];
  aiQuestion: string;
  aiResponse: string;
  aiCitations: string[];
  aiIsLoading: boolean;
  isListeningVoice: boolean;
  voiceOutEnabled: boolean;
  isInVR: boolean;
  isOfflineFallback: boolean;
  hoveredButtonId: string | null;
}

export interface SpatialPanelSurface {
  group: Group;
  hitMesh: Mesh;
  grabBarMesh: Mesh;
  canvas: HTMLCanvasElement;
  texture: CanvasTexture;
  buttons: SpatialHitButton[];
  pixelWidth: number;
  pixelHeight: number;
  worldWidth: number;
  worldHeight: number;
  defaultPos: [number, number, number];
  defaultRotY: number;
  defaultRotX: number;
}

const FEATURED_DEST_IDS = [
  'jezero-crater',
  'olympus-mons',
  'valles-marineris',
  'gale-crater',
  'elysium-planitia',
  'nili-fossae',
  'mawrth-vallis'
];

const QUICK_LAYER_IDS = [
  'visual-imagery',
  'elevation-mola',
  'themis-day',
  'themis-night',
  'false-color-mineral',
  'hirise-regional'
];

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawButton(
  ctx: CanvasRenderingContext2D,
  buttons: SpatialHitButton[],
  opts: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    active?: boolean;
    hovered?: boolean;
    accent?: 'orange' | 'blue' | 'green' | 'amber';
    fontSize?: number;
    align?: 'left' | 'center';
  }
) {
  const {
    id,
    x,
    y,
    w,
    h,
    label,
    active = false,
    hovered = false,
    accent = 'orange',
    fontSize = 18,
    align = 'center'
  } = opts;

  buttons.push({ id, x, y, w, h });

  const accentHex =
    accent === 'blue'
      ? '#338BFF'
      : accent === 'green'
      ? '#35C98A'
      : accent === 'amber'
      ? '#F5B942'
      : '#FF6B35';

  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  if (active) {
    ctx.fillStyle =
      accent === 'blue'
        ? 'rgba(51, 139, 255, 0.28)'
        : accent === 'green'
        ? 'rgba(53, 201, 138, 0.25)'
        : 'rgba(255, 107, 53, 0.28)';
    ctx.fill();
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = hovered ? 3 : 2;
    ctx.stroke();
  } else {
    ctx.fillStyle = hovered ? 'rgba(30, 44, 68, 0.96)' : 'rgba(15, 23, 38, 0.9)';
    ctx.fill();
    ctx.strokeStyle = hovered ? accentHex : 'rgba(56, 76, 108, 0.75)';
    ctx.lineWidth = hovered ? 2.5 : 1.25;
    ctx.stroke();
  }

  ctx.fillStyle = active || hovered ? '#FFFFFF' : '#CBD5E1';
  ctx.font = `${active ? '700' : '600'} ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = align;
  const textX = align === 'left' ? x + 14 : x + w / 2;
  ctx.fillText(label, textX, y + h / 2, w - 18);
  ctx.restore();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  let line = '';
  let y = startY;
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lineCount++;
      line = words[i];
      if (lineCount >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lineCount < maxLines) {
    ctx.fillText(line, x, y, maxWidth);
    y += lineHeight;
  }
  return y;
}

function drawPanelFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  badge: string
) {
  ctx.clearRect(0, 0, w, h);

  roundRect(ctx, 4, 4, w - 8, h - 8, 22);
  ctx.fillStyle = 'rgba(10, 16, 28, 0.94)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 78, 112, 0.85)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Header bar
  roundRect(ctx, 14, 14, w - 28, 56, 14);
  ctx.fillStyle = 'rgba(17, 25, 40, 0.96)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 107, 53, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#FF6B35';
  ctx.beginPath();
  ctx.arc(36, 42, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '700 22px Outfit, Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 54, 42);

  ctx.fillStyle = '#35C98A';
  ctx.font = '600 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(badge, w - 28, 42);
}

export function createSpatialPanelSurface(opts: {
  name: string;
  pixelWidth: number;
  pixelHeight: number;
  worldWidth: number;
  worldHeight: number;
  defaultPos: [number, number, number];
  defaultRotY?: number;
  defaultRotX?: number;
}): SpatialPanelSurface {
  const {
    name,
    pixelWidth,
    pixelHeight,
    worldWidth,
    worldHeight,
    defaultPos,
    defaultRotY = 0,
    defaultRotX = 0
  } = opts;

  const canvas = document.createElement('canvas');
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  const group = new Group();
  group.name = name;
  group.position.set(...defaultPos);
  group.rotation.set(defaultRotX, defaultRotY, 0);

  const hitMesh = new Mesh(
    new PlaneGeometry(worldWidth, worldHeight),
    new MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.98
    })
  );
  hitMesh.name = `${name}_Screen`;
  group.add(hitMesh);

  // Sleek top grab handle bar so seated users can grab & reposition any floating panel
  const grabBarMesh = new Mesh(
    new BoxGeometry(worldWidth * 0.42, 0.024, 0.018),
    new MeshStandardMaterial({
      color: 0x338bff,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.5
    })
  );
  grabBarMesh.name = `${name}_GrabBar`;
  grabBarMesh.position.set(0, worldHeight * 0.5 + 0.022, 0.005);
  group.add(grabBarMesh);

  return {
    group,
    hitMesh,
    grabBarMesh,
    canvas,
    texture,
    buttons: [],
    pixelWidth,
    pixelHeight,
    worldWidth,
    worldHeight,
    defaultPos,
    defaultRotY,
    defaultRotX
  };
}

export function renderNavPanel(surface: SpatialPanelSurface, state: SpatialPanelState): void {
  const ctx = surface.canvas.getContext('2d');
  if (!ctx) return;

  const w = surface.pixelWidth;
  const h = surface.pixelHeight;
  const buttons: SpatialHitButton[] = [];
  surface.buttons = buttons;

  drawPanelFrame(ctx, w, h, 'GEOMARS XR MISSION DOCK', state.isInVR ? 'VR HAND TRACKING' : '3D / XR READY');

  // Section 1: Workspace Mode Tabs
  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SIMULATOR MODE', 24, 96);

  const modes: { id: XRPanelMode; label: string }[] = [
    { id: 'globe', label: 'Globe' },
    { id: 'terrain', label: 'Terrain' },
    { id: 'rover', label: 'Rover Ops' },
    { id: 'science', label: 'Science Lab' },
    { id: 'ai', label: 'AI Assist' }
  ];
  const mGap = 8;
  const mW = (w - 48 - mGap * 2) / 3;
  modes.forEach((m, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    drawButton(ctx, buttons, {
      id: `mode:${m.id}`,
      x: 24 + col * (mW + mGap),
      y: 112 + row * 48,
      w: mW,
      h: 40,
      label: m.label,
      active: state.mode === m.id,
      hovered: state.hoveredButtonId === `mode:${m.id}`,
      accent: 'orange',
      fontSize: 16
    });
  });

  // Section 2: 7 Key Martian Landmarks
  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SCIENTIFIC DESTINATIONS (PINCH / TAP TO FLY)', 24, 232);

  const sites = FEATURED_DEST_IDS.map(
    (id) => MARS_SITES.find((s) => s.id === id) || MARS_SITES[0]
  );
  sites.forEach((site, idx) => {
    const btnId = `site:${site.id}`;
    const shortName = site.name.split(' (')[0];
    const elevLabel = `${site.elevationMeters > 0 ? '+' : ''}${site.elevationMeters}m`;
    drawButton(ctx, buttons, {
      id: btnId,
      x: 24,
      y: 250 + idx * 46,
      w: w - 48,
      h: 40,
      label: `${shortName}  •  ${elevLabel}`,
      active: state.selectedSite?.id === site.id,
      hovered: state.hoveredButtonId === btnId,
      accent: 'blue',
      fontSize: 16,
      align: 'left'
    });
  });

  // Section 3: Orbital Data Layers
  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ORBITAL DATA LAYER', 24, 598);

  const lGap = 8;
  const lW = (w - 48 - lGap * 2) / 3;
  QUICK_LAYER_IDS.forEach((layerId, idx) => {
    const layer = LAYER_CATALOG.find((l) => l.id === layerId) || LAYER_CATALOG[0];
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const short =
      layer.id === 'visual-imagery'
        ? 'Viking Visual'
        : layer.id === 'elevation-mola'
        ? 'MOLA Elev'
        : layer.id === 'themis-day'
        ? 'THEMIS Day'
        : layer.id === 'themis-night'
        ? 'THEMIS Night'
        : layer.id === 'false-color-mineral'
        ? 'Minerals'
        : 'HiRISE';
    const btnId = `layer:${layer.id}`;
    drawButton(ctx, buttons, {
      id: btnId,
      x: 24 + col * (lW + lGap),
      y: 616 + row * 46,
      w: lW,
      h: 38,
      label: short,
      active: state.activeLayer.id === layer.id,
      hovered: state.hoveredButtonId === btnId,
      accent: 'green',
      fontSize: 15
    });
  });

  // Footer Controls
  const fW = (w - 48 - 16) / 3;
  drawButton(ctx, buttons, {
    id: 'action:toggle-rotate',
    x: 24,
    y: h - 62,
    w: fW,
    h: 42,
    label: state.isAutoRotating ? 'Spin: ON' : 'Spin: OFF',
    active: state.isAutoRotating,
    hovered: state.hoveredButtonId === 'action:toggle-rotate',
    accent: 'blue',
    fontSize: 16
  });
  drawButton(ctx, buttons, {
    id: 'action:reset-cockpit',
    x: 24 + fW + 8,
    y: h - 62,
    w: fW,
    h: 42,
    label: 'Reset View',
    hovered: state.hoveredButtonId === 'action:reset-cockpit',
    accent: 'orange',
    fontSize: 16
  });
  drawButton(ctx, buttons, {
    id: 'action:toggle-vr',
    x: 24 + (fW + 8) * 2,
    y: h - 62,
    w: fW,
    h: 42,
    label: state.isInVR ? 'Exit VR' : 'Enter VR',
    active: state.isInVR,
    hovered: state.hoveredButtonId === 'action:toggle-vr',
    accent: 'orange',
    fontSize: 16
  });

  surface.texture.needsUpdate = true;
}

export function renderContextPanel(surface: SpatialPanelSurface, state: SpatialPanelState): void {
  const ctx = surface.canvas.getContext('2d');
  if (!ctx) return;

  const w = surface.pixelWidth;
  const h = surface.pixelHeight;
  const buttons: SpatialHitButton[] = [];
  surface.buttons = buttons;

  if (state.mode === 'rover') {
    drawPanelFrame(ctx, w, h, 'ROVER MISSION CONTROL', 'A* SIMULATED');

    const route = state.missionRoute.activeCandidateRoute;
    const routes = state.missionRoute.alternativeRoutes || [];

    // Simulation notice pill
    roundRect(ctx, 24, 86, w - 48, 42, 10);
    ctx.fillStyle = 'rgba(245, 185, 66, 0.14)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 185, 66, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#FCD34D';
    ctx.font = '600 15px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SIMULATED TERRAIN COST & HAZARDS — NOT CERTIFIED FLIGHT-SAFE', 38, 107);

    // Start & Destination box
    roundRect(ctx, 24, 140, w - 48, 86, 12);
    ctx.fillStyle = 'rgba(17, 25, 40, 0.9)';
    ctx.fill();
    ctx.fillStyle = '#35C98A';
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.fillText(`START: ${state.missionRoute.startLabel.split(' (')[0]}`, 38, 166);
    ctx.fillStyle = '#FF6B35';
    ctx.fillText(`DEST:  ${state.missionRoute.destinationLabel.split(' (')[0]}`, 38, 198);

    drawButton(ctx, buttons, {
      id: 'rover:swap',
      x: w - 150,
      y: 160,
      w: 112,
      h: 44,
      label: 'Swap A↔B',
      hovered: state.hoveredButtonId === 'rover:swap',
      accent: 'blue',
      fontSize: 16
    });

    // Candidate Route Selector
    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.fillText('A* ROUTE STRATEGY', 24, 252);

    const rGap = 10;
    const rW = (w - 48 - rGap * 2) / 3;
    const strategies: { id: CandidateRoute['id']; label: string }[] = [
      { id: 'topographic-astar', label: 'A* Optimal' },
      { id: 'direct-geodesic', label: 'Direct Arc' },
      { id: 'safe-contour', label: 'Safe Contour' }
    ];
    strategies.forEach((st, idx) => {
      const exists = routes.find((r) => r.id === st.id);
      const btnId = `rover:strategy:${st.id}`;
      drawButton(ctx, buttons, {
        id: btnId,
        x: 24 + idx * (rW + rGap),
        y: 268,
        w: rW,
        h: 44,
        label: exists ? st.label : st.label,
        active: route?.id === st.id,
        hovered: state.hoveredButtonId === btnId,
        accent: 'orange',
        fontSize: 16
      });
    });

    // Telemetry Grid (6 cards)
    const cards = [
      {
        label: 'DISTANCE',
        val: `${(route?.distanceKm ?? state.missionRoute.distanceKm).toFixed(1)} km`,
        color: '#F8FAFC'
      },
      {
        label: 'EST. TRANSIT',
        val: `~${route?.estimatedSolDays ?? state.missionRoute.estimatedSolDays} Sols`,
        color: '#FF6B35'
      },
      {
        label: 'MAX SLOPE',
        val: `${route?.maxSlopeDeg ?? 12.0}°`,
        color: '#F5B942'
      },
      {
        label: 'HAZARDS AVOIDED',
        val: `${route?.hazardsAvoided ?? 6} zones`,
        color: '#35C98A'
      },
      {
        label: 'SIM. CONFIDENCE',
        val: `${route?.routeConfidencePct ?? 82}%`,
        color: '#338BFF'
      },
      {
        label: 'DIFFICULTY',
        val: route?.difficulty ?? state.missionRoute.difficultyScore,
        color: '#F8FAFC'
      }
    ];
    const cW = (w - 48 - 16) / 3;
    cards.forEach((card, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const cx = 24 + col * (cW + 8);
      const cy = 332 + row * 82;
      roundRect(ctx, cx, cy, cW, 72, 12);
      ctx.fillStyle = 'rgba(17, 25, 40, 0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(42, 58, 84, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(card.label, cx + 14, cy + 24);

      ctx.fillStyle = card.color;
      ctx.font = '700 21px "JetBrains Mono", monospace';
      ctx.fillText(card.val, cx + 14, cy + 50);
    });

    // Science Objective & Progress Bar
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '500 16px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Objective: ${state.missionRoute.scienceObjective || 'Geological survey'}`,
      24,
      522,
      w - 48
    );

    // Progress Track
    roundRect(ctx, 24, 546, w - 48, 22, 11);
    ctx.fillStyle = 'rgba(17, 25, 40, 0.95)';
    ctx.fill();
    const fillW = Math.max(18, ((w - 48) * state.roverProgressPct) / 100);
    roundRect(ctx, 24, 546, fillW, 22, 11);
    ctx.fillStyle = '#35C98A';
    ctx.fill();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '600 15px "JetBrains Mono", monospace';
    ctx.fillText(`Mission Progress: ${Math.round(state.roverProgressPct)}%`, 24, 590);

    // Rover Drive Controls
    const bW = (w - 48 - 10) / 2;
    drawButton(ctx, buttons, {
      id: 'rover:toggle-drive',
      x: 24,
      y: h - 72,
      w: bW,
      h: 48,
      label: state.isRoverAnimating ? 'Pause Rover Traverse' : 'Simulate Rover Drive',
      active: state.isRoverAnimating,
      hovered: state.hoveredButtonId === 'rover:toggle-drive',
      accent: 'green',
      fontSize: 17
    });
    drawButton(ctx, buttons, {
      id: 'rover:reset-drive',
      x: 24 + bW + 10,
      y: h - 72,
      w: bW,
      h: 48,
      label: 'Reset Rover to Start',
      hovered: state.hoveredButtonId === 'rover:reset-drive',
      accent: 'orange',
      fontSize: 17
    });

    surface.texture.needsUpdate = true;
    return;
  }

  if (state.mode === 'science') {
    drawPanelFrame(ctx, w, h, 'MARTIAN SCIENCE LABORATORY', 'NASA / ESA / USGS');

    const topic =
      SCIENCE_LAB_TOPICS.find((t) => t.id === state.selectedScienceTopicId) ||
      SCIENCE_LAB_TOPICS[0];

    // 8 Topic Buttons (2 rows of 4)
    const tGap = 8;
    const tW = (w - 48 - tGap * 3) / 4;
    SCIENCE_LAB_TOPICS.forEach((t, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const btnId = `science:topic:${t.id}`;
      drawButton(ctx, buttons, {
        id: btnId,
        x: 24 + col * (tW + tGap),
        y: 86 + row * 46,
        w: tW,
        h: 38,
        label: t.shortTitle,
        active: t.id === topic.id,
        hovered: state.hoveredButtonId === btnId,
        accent: 'blue',
        fontSize: 15
      });
    });

    // Topic Card
    roundRect(ctx, 24, 188, w - 48, 370, 14);
    ctx.fillStyle = 'rgba(17, 25, 40, 0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(42, 58, 84, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FF6B35';
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(topic.headlineMetric, 40, 214);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 22px Outfit, Inter, sans-serif';
    ctx.fillText(topic.title, 40, 246, w - 80);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '400 16px Inter, sans-serif';
    let curY = drawWrappedText(ctx, topic.summary, 40, 280, w - 80, 22, 3);
    curY += 10;

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 15px Inter, sans-serif';
    for (const fact of topic.keyFacts.slice(0, 3)) {
      curY = drawWrappedText(ctx, `• ${fact}`, 40, curY, w - 80, 21, 2);
      curY += 4;
    }

    ctx.fillStyle = '#35C98A';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillText(`Attribution: ${topic.sourceAttribution}`, 40, 536, w - 80);

    // 3D Model Selector Row
    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.fillText('GRABBABLE 3D LAB MODEL (BESIDE GLOBE)', 24, 584);

    const mGap = 8;
    const mW = (w - 48 - mGap * 3) / 4;
    SCIENCE_MODELS.forEach((m, idx) => {
      const btnId = `science:model:${m.id}`;
      const label =
        m.id === 'mars-interior'
          ? 'Interior'
          : m.id === 'atmosphere-shell'
          ? 'Atmosphere'
          : m.id === 'perseverance-rover'
          ? 'Rover 3D'
          : 'Water Ice';
      drawButton(ctx, buttons, {
        id: btnId,
        x: 24 + idx * (mW + mGap),
        y: 604,
        w: mW,
        h: 44,
        label,
        active: state.selectedScienceModelId === m.id,
        hovered: state.hoveredButtonId === btnId,
        accent: 'orange',
        fontSize: 16
      });
    });

    surface.texture.needsUpdate = true;
    return;
  }

  if (state.mode === 'ai') {
    drawPanelFrame(ctx, w, h, 'AI MARS SCIENCE ASSISTANT', 'CONTEXT-AWARE');

    // Quick Questions (2 rows of 3)
    const qs = [
      { id: 'Why is Mars red?', label: 'Why is Mars red?' },
      { id: 'Could humans survive on Mars?', label: 'Human survival?' },
      { id: 'What did Perseverance discover?', label: 'Perseverance finds?' },
      { id: 'Where is the best location for scientific exploration?', label: 'Best site?' },
      { id: 'What makes Jezero Crater important?', label: 'Why Jezero?' },
      { id: 'Explain the selected Martian terrain', label: 'Explain terrain' }
    ];
    const qGap = 8;
    const qW = (w - 48 - qGap * 2) / 3;
    qs.forEach((q, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const btnId = `ai:ask:${q.id}`;
      drawButton(ctx, buttons, {
        id: btnId,
        x: 24 + col * (qW + qGap),
        y: 86 + row * 46,
        w: qW,
        h: 38,
        label: q.label,
        active: state.aiQuestion === q.id,
        hovered: state.hoveredButtonId === btnId,
        accent: 'blue',
        fontSize: 15
      });
    });

    // Response Card
    roundRect(ctx, 24, 188, w - 48, 396, 14);
    ctx.fillStyle = 'rgba(17, 25, 40, 0.94)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(51, 139, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FF6B35';
    ctx.font = '700 16px Outfit, Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      state.aiIsLoading ? 'Analyzing planetary telemetry...' : `Q: ${state.aiQuestion}`,
      40,
      216,
      w - 80
    );

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '400 16px Inter, sans-serif';
    const cleanText = state.aiResponse.replace(/[#*`]/g, '');
    drawWrappedText(ctx, cleanText, 40, 250, w - 80, 22, 12);

    ctx.fillStyle = '#35C98A';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText(
      `Sources: ${state.aiCitations.slice(0, 2).join(' • ') || 'NASA PDS / USGS'}`,
      40,
      562,
      w - 80
    );

    // Voice & Desktop Input Buttons
    const bW = (w - 48 - 10) / 2;
    drawButton(ctx, buttons, {
      id: 'ai:voice-mic',
      x: 24,
      y: h - 72,
      w: bW,
      h: 48,
      label: state.isListeningVoice ? 'Listening... (Tap Stop)' : 'Ask by Voice (Mic)',
      active: state.isListeningVoice,
      hovered: state.hoveredButtonId === 'ai:voice-mic',
      accent: 'orange',
      fontSize: 17
    });
    drawButton(ctx, buttons, {
      id: 'ai:toggle-tts',
      x: 24 + bW + 10,
      y: h - 72,
      w: bW,
      h: 48,
      label: state.voiceOutEnabled ? 'Voice Readout: ON' : 'Voice Readout: OFF',
      active: state.voiceOutEnabled,
      hovered: state.hoveredButtonId === 'ai:toggle-tts',
      accent: 'green',
      fontSize: 17
    });

    surface.texture.needsUpdate = true;
    return;
  }

  // GLOBE or TERRAIN MODE -> Location Intelligence Spatial Panel
  drawPanelFrame(
    ctx,
    w,
    h,
    state.mode === 'terrain' ? 'SURFACE TERRAIN DIORAMA' : 'LOCATION INTELLIGENCE',
    state.isOfflineFallback ? 'OFFLINE FALLBACK' : 'NASA / USGS'
  );

  const site = state.selectedSite;
  const coord = state.selectedCoordinate;
  const titleText = site ? site.name : 'Custom Surface Coordinate';
  const coordText = coord
    ? formatMarsCoordinate(coord.lat, coord.lng)
    : site
    ? formatMarsCoordinate(site.lat, site.lng)
    : '18.38° N, 77.58° E';
  const elevText = formatElevation(coord?.elevationMeters ?? site?.elevationMeters);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 24px Outfit, Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(titleText, 26, 102, w - 52);

  ctx.fillStyle = '#FF6B35';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillText(`${coordText}   •   ${elevText}`, 26, 134, w - 52);

  // Info Card
  roundRect(ctx, 24, 156, w - 48, 396, 14);
  ctx.fillStyle = 'rgba(17, 25, 40, 0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(42, 58, 84, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  let y = 186;
  ctx.fillStyle = '#338BFF';
  ctx.font = '700 14px "JetBrains Mono", monospace';
  ctx.fillText('SCIENTIFIC OVERVIEW & GEOLOGY', 40, y);
  y += 26;

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '400 16px Inter, sans-serif';
  const desc =
    site?.description ||
    'Selected coordinate on the Martian ellipsoid. Elevation and regional gradients are approximated from our MOLA-anchored analytical model.';
  y = drawWrappedText(ctx, desc, 40, y, w - 80, 22, 3);
  y += 10;

  if (site) {
    ctx.fillStyle = '#FF6B35';
    ctx.font = '700 14px "JetBrains Mono", monospace';
    ctx.fillText('STRATIGRAPHY & INTERESTING FACTS', 40, y);
    y += 24;

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '400 15px Inter, sans-serif';
    y = drawWrappedText(ctx, site.geology, 40, y, w - 80, 21, 3);
    y += 8;

    const fact = site.interestingFacts?.[0] || site.scienceHighlights[0];
    if (fact) {
      y = drawWrappedText(ctx, `★ ${fact}`, 40, y, w - 80, 21, 2);
      y += 8;
    }

    if (site.missionRelevance) {
      ctx.fillStyle = '#35C98A';
      ctx.font = '600 15px Inter, sans-serif';
      drawWrappedText(ctx, `Mission Relevance: ${site.missionRelevance}`, 40, y, w - 80, 20, 2);
    }
  }

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 13px "JetBrains Mono", monospace';
  ctx.fillText(
    `Source: ${site?.sourceAttribution || 'NASA Mars Trek / MGS MOLA / USGS Astrogeology'}`,
    40,
    534,
    w - 80
  );

  // Action Buttons Grid (2x2)
  const bW = (w - 48 - 10) / 2;
  drawButton(ctx, buttons, {
    id: 'loc:set-start',
    x: 24,
    y: h - 128,
    w: bW,
    h: 46,
    label: 'Set Rover Start',
    hovered: state.hoveredButtonId === 'loc:set-start',
    accent: 'green',
    fontSize: 16
  });
  drawButton(ctx, buttons, {
    id: 'loc:set-dest',
    x: 24 + bW + 10,
    y: h - 128,
    w: bW,
    h: 46,
    label: 'Set Rover Destination',
    hovered: state.hoveredButtonId === 'loc:set-dest',
    accent: 'orange',
    fontSize: 16
  });
  drawButton(ctx, buttons, {
    id: 'loc:toggle-terrain',
    x: 24,
    y: h - 72,
    w: bW,
    h: 46,
    label: state.mode === 'terrain' ? 'Return to 3D Globe' : 'Zoom to 3D Terrain',
    active: state.mode === 'terrain',
    hovered: state.hoveredButtonId === 'loc:toggle-terrain',
    accent: 'blue',
    fontSize: 16
  });
  drawButton(ctx, buttons, {
    id: 'loc:ask-ai',
    x: 24 + bW + 10,
    y: h - 72,
    w: bW,
    h: 46,
    label: 'Ask AI About Terrain',
    hovered: state.hoveredButtonId === 'loc:ask-ai',
    accent: 'blue',
    fontSize: 16
  });

  surface.texture.needsUpdate = true;
}

export function renderBottomBar(surface: SpatialPanelSurface, state: SpatialPanelState): void {
  const ctx = surface.canvas.getContext('2d');
  if (!ctx) return;

  const w = surface.pixelWidth;
  const h = surface.pixelHeight;
  const buttons: SpatialHitButton[] = [];
  surface.buttons = buttons;

  ctx.clearRect(0, 0, w, h);
  roundRect(ctx, 4, 4, w - 8, h - 8, 18);
  ctx.fillStyle = 'rgba(10, 16, 28, 0.94)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 78, 112, 0.85)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const items = [
    { id: 'bar:zoom-out', label: 'Zoom -', active: false, accent: 'blue' as const },
    { id: 'bar:zoom-in', label: 'Zoom +', active: false, accent: 'blue' as const },
    {
      id: 'bar:terrain',
      label: state.mode === 'terrain' ? '3D Globe' : 'Surface',
      active: state.mode === 'terrain',
      accent: 'orange' as const
    },
    {
      id: 'bar:route',
      label: state.showRouteOverlay ? 'Route: ON' : 'Route: OFF',
      active: state.showRouteOverlay,
      accent: 'green' as const
    },
    {
      id: 'bar:science',
      label: 'Science Lab',
      active: state.mode === 'science',
      accent: 'blue' as const
    },
    {
      id: 'bar:ai',
      label: 'AI Assist',
      active: state.mode === 'ai',
      accent: 'blue' as const
    },
    {
      id: 'bar:vr',
      label: state.isInVR ? 'Exit VR' : 'Enter VR',
      active: state.isInVR,
      accent: 'orange' as const
    }
  ];

  const gap = 10;
  const bW = (w - 32 - gap * (items.length - 1)) / items.length;
  items.forEach((item, idx) => {
    drawButton(ctx, buttons, {
      id: item.id,
      x: 16 + idx * (bW + gap),
      y: 20,
      w: bW,
      h: h - 40,
      label: item.label,
      active: item.active,
      hovered: state.hoveredButtonId === item.id,
      accent: item.accent,
      fontSize: 17
    });
  });

  surface.texture.needsUpdate = true;
}

export function resolveHitButton(
  surface: SpatialPanelSurface,
  uvX: number,
  uvY: number
): SpatialHitButton | null {
  const cx = uvX * surface.pixelWidth;
  const cy = (1 - uvY) * surface.pixelHeight;
  for (const btn of surface.buttons) {
    if (cx >= btn.x && cx <= btn.x + btn.w && cy >= btn.y && cy <= btn.y + btn.h) {
      return btn;
    }
  }
  return null;
}

