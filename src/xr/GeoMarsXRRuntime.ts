import {
  AmbientLight,
  BackSide,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  DistanceGrabbable,
  DoubleSide,
  Euler,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MovementMode,
  OneHandGrabbable,
  Points,
  PointsMaterial,
  PokeInteractable,
  Quaternion,
  RayInteractable,
  ReferenceSpaceType,
  RingGeometry,
  SessionMode,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  TubeGeometry,
  TwoHandsGrabbable,
  Vector3,
  VisibilityState,
  World,
  type Entity
} from '@iwsdk/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type {
  MapLayerConfig,
  MarsCoordinate,
  MarsSite,
  MissionRoutePlan
} from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { LAYER_CATALOG } from '../data/layerCatalog';
import { SCIENCE_LAB_TOPICS, type ScienceModelDescriptor } from '../data/scienceLabData';
import { assetUrl } from '../utils/assetUrl';
import { estimateMolaElevation } from '../utils/marsMath';
import {
  MARS_HAZARD_ZONES,
  calculateCandidateRoutes
} from '../utils/roverRouter';
import { queryAiScienceAssistant } from '../utils/aiAssistantEngine';
import {
  AtmosphereShader,
  createLocalTerrainDiorama,
  createMiniRoverMesh,
  createProceduralMarsFallbackTexture,
  latLngToVector3,
  vector3ToLatLng
} from './marsGeo';
import { buildScienceLabModel, type ScienceModelId } from './scienceLabModels';
import {
  createSpatialPanelSurface,
  renderBottomBar,
  renderContextPanel,
  renderNavPanel,
  resolveHitButton,
  type SpatialPanelState,
  type SpatialPanelSurface,
  type XRPanelMode
} from './spatialPanelRenderer';

export type { XRPanelMode };

export interface GeoMarsXRCallbacks {
  onSelectSite: (site: MarsSite | null) => void;
  onSelectCoordinate: (coord: MarsCoordinate) => void;
  onSelectLayer: (layer: MapLayerConfig) => void;
  onToggleRouteOverlay: (visible: boolean) => void;
  onUpdateMissionRoute: (plan: MissionRoutePlan) => void;
  onOpenAiModal: () => void;
  onModeChange?: (mode: XRPanelMode) => void;
  onXrStateChange?: (state: {
    xrSupported: boolean;
    handTrackingLikely: boolean;
    isInVR: boolean;
    isOfflineFallback: boolean;
    xrStatusMessage: string;
    hoveredSite: MarsSite | null;
    hoveredCoord: MarsCoordinate | null;
    roverProgressPct: number;
  }) => void;
}

export interface GeoMarsXRProps {
  activeLayer: MapLayerConfig;
  selectedSite: MarsSite | null;
  selectedCoordinate: MarsCoordinate | null;
  missionRoute: MissionRoutePlan;
  showRouteOverlay: boolean;
  layerOpacity: number;
  mode?: XRPanelMode;
  showSpatialPanelsDesktop?: boolean;
}

const GLOBE_RADIUS = 0.42;
const OBSERVATORY_CENTER = new Vector3(0, 1.16, -1.08);
const DESKTOP_CAM_DEFAULT = new Vector3(0, 1.24, 0.04);

const FEATURED_DEST_IDS = new Set([
  'jezero-crater',
  'olympus-mons',
  'valles-marineris',
  'gale-crater',
  'elysium-planitia',
  'nili-fossae',
  'mawrth-vallis'
]);

const CATEGORY_COLORS: Record<string, number> = {
  crater: 0xf97316,
  rover: 0x35c98a,
  volcano: 0xef4444,
  canyon: 0x3b82f6,
  lander: 0xfacc15,
  polar: 0x38bdf8,
  delta: 0x34d399,
  plains: 0xf59e0b
};

interface XRPointerEventLike {
  uv?: { x: number; y: number };
  point?: Vector3;
  stopPropagation?: () => void;
}

interface CustomSpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface CustomSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: CustomSpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechCtor = new () => CustomSpeechRecognition;

function disposeObjectTree(root: Group) {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => {
          if ('map' in m && m.map instanceof Texture && !(m.map as Texture & { __cached?: boolean }).__cached) {
            m.map.dispose();
          }
          m.dispose();
        });
      } else {
        mesh.material.dispose();
      }
    }
  });
}

export class GeoMarsXRRuntime {
  private container: HTMLElement;
  private callbacks: GeoMarsXRCallbacks;
  private world: World | null = null;
  private orbitControls: OrbitControls | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;
  private xrFrameUnsub: (() => void) | null = null;
  private visibilityUnsub: (() => void) | null = null;
  private destroyed = false;

  // Stage Groups
  private observatoryRoot = new Group();
  private marsVisualRoot = new Group();
  private marsGrabProxyMesh!: Mesh;
  private marsGrabEntity: Entity | null = null;
  private marsSurfaceMesh!: Mesh;
  private marsAtmosphereMesh!: Mesh;
  private marsMarkersGroup = new Group();
  private routeOverlayGroup = new Group();
  private hazardsGroup = new Group();
  private reticleRing!: Mesh;

  private terrainShowcaseRoot = new Group();
  private scienceLabRoot = new Group();
  private scienceModelEntity: Entity | null = null;
  private spatialCockpitRoot = new Group();

  // Mini animated rover
  private roverMesh: Group;
  private roverCurve: CatmullRomCurve3 | null = null;
  private roverProgress = 0;

  // Marker handles for pulsing and scaling
  private beaconEntries: {
    site: MarsSite;
    hitMesh: Mesh;
    haloMesh: Mesh;
    coreMesh: Mesh;
  }[] = [];

  // Texture Cache
  private textureLoader = new TextureLoader();
  private textureCache = new Map<string, Texture>();
  private fallbackTexture: Texture | null = null;
  private currentTexture: Texture | null = null;

  // Spatial HUD panels
  private navPanel!: SpatialPanelSurface;
  private contextPanel!: SpatialPanelSurface;
  private bottomBar!: SpatialPanelSurface;
  private spatialPanelsDirty = true;
  private lastPanelHoverId: string | null = null;

  // Props & Runtime State
  private props: GeoMarsXRProps;
  private mode: XRPanelMode = 'globe';
  private showSpatialPanelsDesktop = false;
  private isAutoRotating = true;
  private isRoverAnimating = true;
  private isInVR = false;
  private xrSupported = false;
  private handTrackingLikely = false;
  private xrStatusMessage = 'Initializing GeoMars XR Engine...';
  private isOfflineFallback = false;
  private hoveredSite: MarsSite | null = null;
  private hoveredCoord: MarsCoordinate | null = null;

  // Science Lab + AI State
  private selectedScienceTopicId = SCIENCE_LAB_TOPICS[0]?.id ?? 'atmosphere';
  private selectedScienceModelId: ScienceModelDescriptor['id'] = 'mars-interior';
  private aiQuestion = 'Why is Mars red?';
  private aiResponse =
    'Tap any destination on Mars or ask a scientific question below to explore verified NASA/JPL facts.';
  private aiCitations: string[] = [
    'NASA Mars Exploration Program (science.nasa.gov/mars)',
    'NASA MOLA / USGS Astrogeology Science Center'
  ];
  private aiIsLoading = false;
  private isListeningVoice = false;
  private voiceOutEnabled = false;
  private speechRecognition: CustomSpeechRecognition | null = null;

  // Smooth quaternion flight target for globe focus
  private flyTargetQuat: Quaternion | null = null;
  private clockLastMs = performance.now();

  // XR Two-Hand & One-Hand Seated Pinch Gesture Tracking
  private leftPinching = false;
  private rightPinching = false;
  private prevDualPinchDist: number | null = null;
  private prevSinglePinchPos: Vector3 | null = null;
  private prevRightPinchPos: Vector3 | null = null;
  private spinVelocityX = 0;
  private spinVelocityY = 0;

  constructor(
    container: HTMLElement,
    initialProps: GeoMarsXRProps,
    callbacks: GeoMarsXRCallbacks
  ) {
    this.container = container;
    this.props = { ...initialProps };
    this.callbacks = callbacks;
    this.mode = initialProps.mode ?? 'globe';
    this.showSpatialPanelsDesktop = Boolean(initialProps.showSpatialPanelsDesktop);
    this.roverMesh = createMiniRoverMesh(0.28);

    void this.initWorld();
  }

  private async initWorld() {
    try {
      this.xrSupported =
        typeof navigator !== 'undefined' &&
        'xr' in navigator &&
        Boolean(navigator.xr) &&
        (await navigator.xr!.isSessionSupported('immersive-vr').catch(() => false));
    } catch {
      this.xrSupported = false;
    }

    if (this.destroyed) return;

    this.xrStatusMessage = this.xrSupported
      ? 'WebXR Ready — Hand Tracking Supported'
      : '3D Desktop Mode (Connect Meta Quest or IWER for WebXR)';

    try {
      const world = await World.create(this.container, {
        assets: {},
        xr: {
          sessionMode: SessionMode.ImmersiveVR,
          referenceSpace: ReferenceSpaceType.LocalFloor,
          features: {
            handTracking: true
          }
        },
        input: {
          canvasPointerEvents: true
        },
        features: {
          locomotion: false,
          grabbing: {
            useHandPinchForGrab: true
          },
          spatialUI: false,
          camera: false
        },
        render: {
          fov: 50,
          near: 0.02,
          far: 180
        }
      });

      if (this.destroyed) {
        (world as unknown as { destroy?: () => void; dispose?: () => void }).destroy?.();
        return;
      }

      this.world = world;
      this.setupRendererAndCamera(world);
      this.setupSceneGraph(world);
      this.setupSpatialPanels(world);
      this.setupInputHooks(world);
      this.loadLayerTexture(this.props.activeLayer);
      this.rebuildRouteAndHazards();
      this.syncShowcaseVisibility();
      this.spatialPanelsDirty = true;

      if (this.props.selectedSite) {
        this.flyToSite(this.props.selectedSite);
      }

      this.startLoop();
      this.emitXrState();
    } catch (err) {
      console.error('GeoMarsXRRuntime initialization failed:', err);
      this.xrStatusMessage = 'WebGL/XR fallback active';
      this.emitXrState();
    }
  }

  private setupRendererAndCamera(world: World) {
    const renderer = world.renderer;
    const camera = world.camera;
    const dom = renderer.domElement;

    dom.style.width = '100%';
    dom.style.height = '100%';
    dom.style.display = 'block';
    dom.style.touchAction = 'none';

    renderer.setClearColor(new Color(0x03060d), 1);

    // Prevent IWSDK's default window-resize size override when embedded in dashboard layout
    const syncContainerSize = () => {
      if (!this.world || this.destroyed) return;
      if (this.world.session || this.world.renderer.xr.isPresenting) return; // NEVER resize while XR session is presenting!
      const w = Math.max(320, this.container.clientWidth);
      const h = Math.max(240, this.container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    syncContainerSize();
    this.resizeObserver = new ResizeObserver(() => {
      syncContainerSize();
    });
    this.resizeObserver.observe(this.container);

    window.addEventListener('resize', this.handleWindowResizeOverride);

    camera.position.copy(DESKTOP_CAM_DEFAULT);
    const orbit = new OrbitControls(camera, dom);
    orbit.target.copy(OBSERVATORY_CENTER);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.07;
    orbit.enablePan = false;
    orbit.minDistance = 0.56;
    orbit.maxDistance = 2.9;
    orbit.rotateSpeed = 0.72;
    orbit.zoomSpeed = 0.85;
    orbit.update();
    this.orbitControls = orbit;
  }

  private handleWindowResizeOverride = () => {
    requestAnimationFrame(() => {
      if (!this.world || this.destroyed || this.world.session || this.world.renderer.xr.isPresenting) return;
      const w = Math.max(320, this.container.clientWidth);
      const h = Math.max(240, this.container.clientHeight);
      this.world.camera.aspect = w / h;
      this.world.camera.updateProjectionMatrix();
      this.world.renderer.setSize(w, h, false);
    });
  };

  private setupSceneGraph(world: World) {
    const scene = world.scene;

    // 1. Lighting optimized for Quest 3 (no shadow maps)
    const hemi = new HemisphereLight(0xbcd7ff, 0x3b1810, 0.78);
    scene.add(hemi);

    const sun = new DirectionalLight(0xfff1e0, 2.35);
    sun.position.set(5, 3.2, 4.5);
    scene.add(sun);

    const rim = new DirectionalLight(0x3b82f6, 0.68);
    rim.position.set(-4.5, -1.8, -3.5);
    scene.add(rim);

    const ambient = new AmbientLight(0xffffff, 0.24);
    scene.add(ambient);

    // 2. Deep-Space Starfield (1 draw call)
    scene.add(this.buildStarfield());

    // 3. Seated Observatory Root (moves to viewer comfort zone when XR session starts)
    this.observatoryRoot.name = 'GeoMarsObservatoryRoot';
    this.observatoryRoot.position.copy(OBSERVATORY_CENTER);
    scene.add(this.observatoryRoot);

    // Mars Visual & Grabbable Sibling Pattern (prevents GrabSystem deny:ray from blocking surface selection)
    this.marsVisualRoot.name = 'MarsVisualRoot';
    this.observatoryRoot.add(this.marsVisualRoot);

    const grabProxyGeom = new SphereGeometry(GLOBE_RADIUS * 1.03, 24, 18);
    const grabProxyMat = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    this.marsGrabProxyMesh = new Mesh(grabProxyGeom, grabProxyMat);
    this.marsGrabProxyMesh.name = 'MarsTwoHandGrabProxy';
    this.observatoryRoot.add(this.marsGrabProxyMesh);
    this.marsGrabEntity = world.createTransformEntity(this.marsGrabProxyMesh, {
      parent: world.sceneEntity
    });
    this.marsGrabEntity.addComponent(TwoHandsGrabbable, {
      rotate: true,
      translate: false,
      scale: true,
      scaleMin: [0.6, 0.6, 0.6],
      scaleMax: [2.5, 2.5, 2.5]
    });

    // Mars Surface Sphere Entity (Ray + Poke selectable)
    const marsGeom = new SphereGeometry(GLOBE_RADIUS, 72, 54);
    const marsMat = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.86,
      metalness: 0.04
    });
    this.marsSurfaceMesh = new Mesh(marsGeom, marsMat);
    this.marsSurfaceMesh.name = 'MarsSurfaceSphere';
    (this.marsSurfaceMesh as Mesh & { pointerEventsType?: string }).pointerEventsType = 'all';
    this.marsVisualRoot.add(this.marsSurfaceMesh);
    const marsSurfaceEntity = world.createTransformEntity(this.marsSurfaceMesh, {
      parent: world.sceneEntity
    });
    marsSurfaceEntity.addComponent(RayInteractable);
    marsSurfaceEntity.addComponent(PokeInteractable);

    this.marsSurfaceMesh.addEventListener('pointermove', (ev: unknown) => {
      const e = ev as XRPointerEventLike;
      if (e.point) {
        this.updateSurfaceHoverFromWorldPoint(e.point);
      }
    });
    this.marsSurfaceMesh.addEventListener('pointerleave', () => {
      this.reticleRing.visible = false;
      this.hoveredCoord = null;
      this.emitXrState();
    });
    this.marsSurfaceMesh.addEventListener('click', (ev: unknown) => {
      const e = ev as XRPointerEventLike;
      if (!e.point) return;
      const localPt = this.marsVisualRoot.worldToLocal(e.point.clone());
      const { lat, lng } = vector3ToLatLng(localPt);
      const elevationMeters = estimateMolaElevation(lat, lng);
      const coord: MarsCoordinate = { lat, lng, elevationMeters };
      this.callbacks.onSelectCoordinate(coord);
      this.spatialPanelsDirty = true;
    });

    // Atmospheric Fresnel Glow
    const atmoGeom = new SphereGeometry(GLOBE_RADIUS * 1.066, 48, 36);
    const atmoMat = new ShaderMaterial({
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      side: BackSide
    });
    this.marsAtmosphereMesh = new Mesh(atmoGeom, atmoMat);
    this.marsAtmosphereMesh.name = 'MarsAtmosphereHalo';
    this.marsVisualRoot.add(this.marsAtmosphereMesh);

    // Subtle Orbital Telemetry Reference Rings
    const eqGeom = new RingGeometry(GLOBE_RADIUS * 1.18, GLOBE_RADIUS * 1.186, 72);
    eqGeom.rotateX(-Math.PI / 2);
    const eqRing = new Mesh(
      eqGeom,
      new MeshBasicMaterial({
        color: 0x338bff,
        transparent: true,
        opacity: 0.22,
        side: DoubleSide
      })
    );
    this.marsVisualRoot.add(eqRing);

    // Surface Hover Reticle
    const retGeom = new RingGeometry(0.014, 0.022, 24);
    const retMat = new MeshBasicMaterial({
      color: 0xff6b35,
      transparent: true,
      opacity: 0.92,
      side: DoubleSide
    });
    this.reticleRing = new Mesh(retGeom, retMat);
    this.reticleRing.visible = false;
    this.marsVisualRoot.add(this.reticleRing);

    // Markers, Route, Hazards, Animated Rover
    this.marsVisualRoot.add(this.marsMarkersGroup);
    this.marsVisualRoot.add(this.routeOverlayGroup);
    this.marsVisualRoot.add(this.hazardsGroup);
    this.routeOverlayGroup.add(this.roverMesh);
    this.buildLandmarkBeacons(world);

    // Local Surface Diorama Root (Orbit-to-Surface zoom)
    this.terrainShowcaseRoot.name = 'TerrainShowcaseRoot';
    this.observatoryRoot.add(this.terrainShowcaseRoot);

    // Science Lab 3D Showcase Root
    this.scienceLabRoot.name = 'ScienceLabShowcaseRoot';
    this.observatoryRoot.add(this.scienceLabRoot);
    this.rebuildScienceLabModel();

    // Spatial UI Cockpit Root (curated curved seated arc)
    this.spatialCockpitRoot.name = 'SpatialCockpitRoot';
    scene.add(this.spatialCockpitRoot);
  }

  private buildStarfield(): Points {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c = new Color();

    for (let i = 0; i < count; i++) {
      // Deterministic spherical Fibonacci-like distribution at r=26..58m
      const theta = ((i * 137.508) % 360) * (Math.PI / 180);
      const zNorm = 1 - (2 * (i + 0.5)) / count;
      const rHoriz = Math.sqrt(Math.max(0, 1 - zNorm * zNorm));
      const radius = 26 + (i % 17) * 1.9;

      positions[i * 3] = Math.cos(theta) * rHoriz * radius;
      positions[i * 3 + 1] = zNorm * radius;
      positions[i * 3 + 2] = Math.sin(theta) * rHoriz * radius;

      if (i % 9 === 0) {
        c.setHex(0xffd2b3);
      } else if (i % 7 === 0) {
        c.setHex(0xbcd7ff);
      } else {
        c.setHex(0xe2e8f0);
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geom = new BufferGeometry();
    geom.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new Float32BufferAttribute(colors, 3));
    const mat = new PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true
    });
    return new Points(geom, mat);
  }

  private buildLandmarkBeacons(world: World) {
    this.beaconEntries = [];

    for (const site of MARS_SITES) {
      const isFeatured = FEATURED_DEST_IDS.has(site.id);
      const colorHex = CATEGORY_COLORS[site.category] ?? 0xf97316;
      const pos = latLngToVector3(site.lat, site.lng, GLOBE_RADIUS * 1.006);
      const normal = pos.clone().normalize();

      const anchor = new Group();
      anchor.position.copy(pos);
      anchor.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), normal);

      // Beacon stem
      const stemHeight = isFeatured ? 0.036 : 0.022;
      const stemGeom = new BufferGeometry().setFromPoints([
        new Vector3(0, 0, 0),
        new Vector3(0, stemHeight, 0)
      ]);
      const stemLine = new Line(
        stemGeom,
        new LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.85 })
      );
      anchor.add(stemLine);

      // Glowing beacon sphere core
      const coreMesh = new Mesh(
        new SphereGeometry(isFeatured ? 0.0115 : 0.0085, 14, 12),
        new MeshBasicMaterial({ color: colorHex })
      );
      coreMesh.position.set(0, stemHeight, 0);
      anchor.add(coreMesh);

      // Outer pulsing ring halo
      const haloGeom = new RingGeometry(0.015, 0.021, 20);
      haloGeom.rotateX(-Math.PI / 2);
      const haloMesh = new Mesh(
        haloGeom,
        new MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: isFeatured ? 0.72 : 0.38,
          side: DoubleSide
        })
      );
      haloMesh.position.set(0, 0.004, 0);
      anchor.add(haloMesh);

      // Generous invisible pinch/ray target sphere for easy hand-tracking selection
      const hitMesh = new Mesh(
        new SphereGeometry(isFeatured ? 0.028 : 0.022, 12, 10),
        new MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0,
          depthWrite: false
        })
      );
      hitMesh.name = `BeaconHit_${site.id}`;
      hitMesh.position.set(0, stemHeight, 0);
      (hitMesh as Mesh & { pointerEventsType?: string }).pointerEventsType = 'all';
      anchor.add(hitMesh);

      const entity = world.createTransformEntity(hitMesh, { parent: world.sceneEntity });
      entity.addComponent(RayInteractable);
      entity.addComponent(PokeInteractable);

      hitMesh.addEventListener('pointerenter', (ev: unknown) => {
        (ev as XRPointerEventLike)?.stopPropagation?.();
        this.hoveredSite = site;
        coreMesh.scale.setScalar(1.38);
        this.emitXrState();
      });
      hitMesh.addEventListener('pointerleave', () => {
        if (this.hoveredSite?.id === site.id) {
          this.hoveredSite = null;
        }
        coreMesh.scale.setScalar(1);
        this.emitXrState();
      });
      hitMesh.addEventListener('click', (ev: unknown) => {
        (ev as XRPointerEventLike)?.stopPropagation?.();
        this.callbacks.onSelectSite(site);
        this.callbacks.onSelectCoordinate({
          lat: site.lat,
          lng: site.lng,
          elevationMeters: site.elevationMeters
        });
        this.flyToSite(site);
        this.spatialPanelsDirty = true;
      });

      this.marsMarkersGroup.add(anchor);
      this.beaconEntries.push({ site, hitMesh, haloMesh, coreMesh });
    }
  }

  private setupSpatialPanels(world: World) {
    // 1. Left Navigation / Destinations / Layers Panel
    this.navPanel = createSpatialPanelSurface({
      name: 'XR_NavPanel',
      pixelWidth: 640,
      pixelHeight: 820,
      worldWidth: 0.56,
      worldHeight: 0.72,
      defaultPos: [-0.82, 1.15, -0.84],
      defaultRotY: 0.44,
      defaultRotX: -0.04
    });

    // 2. Right Context / Telemetry / Rover / Science / AI Panel
    this.contextPanel = createSpatialPanelSurface({
      name: 'XR_ContextPanel',
      pixelWidth: 720,
      pixelHeight: 820,
      worldWidth: 0.63,
      worldHeight: 0.72,
      defaultPos: [0.82, 1.15, -0.84],
      defaultRotY: -0.44,
      defaultRotX: -0.04
    });

    // 3. Bottom Quick Action Bar (lap/chest reachable)
    this.bottomBar = createSpatialPanelSurface({
      name: 'XR_BottomBar',
      pixelWidth: 960,
      pixelHeight: 132,
      worldWidth: 0.92,
      worldHeight: 0.13,
      defaultPos: [0, 0.71, -0.78],
      defaultRotY: 0,
      defaultRotX: -0.26
    });

    const panels = [this.navPanel, this.contextPanel, this.bottomBar];
    for (const panel of panels) {
      this.spatialCockpitRoot.add(panel.group);

      // Interactive UI Surface (Ray + Poke)
      (panel.hitMesh as Mesh & { pointerEventsType?: string }).pointerEventsType = 'all';
      const screenEntity = world.createTransformEntity(panel.hitMesh, {
        parent: world.sceneEntity
      });
      screenEntity.addComponent(RayInteractable);
      screenEntity.addComponent(PokeInteractable);

      panel.hitMesh.addEventListener('pointermove', (ev: unknown) => {
        const e = ev as XRPointerEventLike;
        if (!e.uv) return;
        const btn = resolveHitButton(panel, e.uv.x, e.uv.y);
        const nextId = btn?.id ?? null;
        if (nextId !== this.lastPanelHoverId) {
          this.lastPanelHoverId = nextId;
          this.spatialPanelsDirty = true;
        }
      });

      panel.hitMesh.addEventListener('pointerleave', () => {
        if (this.lastPanelHoverId !== null) {
          this.lastPanelHoverId = null;
          this.spatialPanelsDirty = true;
        }
      });

      panel.hitMesh.addEventListener('click', (ev: unknown) => {
        const e = ev as XRPointerEventLike;
        e.stopPropagation?.();
        if (!e.uv) return;
        const btn = resolveHitButton(panel, e.uv.x, e.uv.y);
        if (btn) {
          this.handleSpatialButtonAction(btn.id);
        }
      });

      // Top Grab Bar (allows seated user to pull or reposition each floating panel)
      const barEntity = world.createTransformEntity(panel.grabBarMesh, {
        parent: world.sceneEntity
      });
      barEntity.addComponent(DistanceGrabbable, {
        movementMode: MovementMode.MoveAtSource,
        rotate: true,
        translate: true,
        scale: false,
        returnToOrigin: false
      });
      // Allow nearby visual feedback when hovering handle bar
      panel.grabBarMesh.addEventListener('pointerenter', () => {
        const mat = panel.grabBarMesh.material as MeshStandardMaterial;
        mat.color.setHex(0xff6b35);
        mat.emissive.setHex(0xc2410c);
      });
      panel.grabBarMesh.addEventListener('pointerleave', () => {
        const mat = panel.grabBarMesh.material as MeshStandardMaterial;
        mat.color.setHex(0x338bff);
        mat.emissive.setHex(0x1d4ed8);
      });
    }
  }

  private setupInputHooks(world: World) {
    // Track IWSDK visibilityState changes (NonImmersive <-> Visible)
    this.visibilityUnsub = world.visibilityState.subscribe((vis) => {
      const enteringVR =
        vis === VisibilityState.Visible || vis === VisibilityState.VisibleBlurred;
      this.isInVR = enteringVR;
      if (this.orbitControls) {
        this.orbitControls.enabled = !enteringVR;
      }
      if (enteringVR) {
        this.xrStatusMessage = 'In WebXR Immersive Session (Hands & Gaze Ready)';
        this.recenterCockpit();
      } else {
        this.xrStatusMessage = this.xrSupported
          ? 'WebXR Ready — Hand Tracking Supported'
          : '3D Desktop Mode Active';
      }
      this.syncShowcaseVisibility();
      this.spatialPanelsDirty = true;
      this.emitXrState();
    });

    world.renderer.xr.addEventListener('sessionstart', this.onXrSessionStart);
    world.renderer.xr.addEventListener('sessionend', this.onXrSessionEnd);

    // XR Per-Frame Hand Tracking Pinch Gestures (1-hand drag-spin & 2-hand zoom anywhere comfortably)
    this.xrFrameUnsub = world.onXRFrame((frame: XRFrame, delta: number) => {
      this.processXRHandGestures(frame, delta);
    });
  }

  private onXrSessionStart = () => {
    this.isInVR = true;
    const session = this.world?.session;
    if (session) {
      for (const src of session.inputSources) {
        if (src.hand) {
          this.handTrackingLikely = true;
        }
      }
      session.addEventListener('inputsourceschange', () => {
        if (!this.world?.session) return;
        this.handTrackingLikely = Array.from(this.world.session.inputSources).some(
          (s) => Boolean(s.hand)
        );
        this.emitXrState();
      });
    }
    this.recenterCockpit();
    this.syncShowcaseVisibility();
    this.spatialPanelsDirty = true;
    this.emitXrState();
  };

  private onXrSessionEnd = () => {
    this.isInVR = false;
    this.leftPinching = false;
    this.rightPinching = false;
    this.prevDualPinchDist = null;
    this.prevSinglePinchPos = null;
    this.prevRightPinchPos = null;
    if (this.orbitControls) {
      this.orbitControls.enabled = true;
    }
    this.resetCockpitPositions();
    this.syncShowcaseVisibility();
    this.spatialPanelsDirty = true;
    this.emitXrState();
  };

  private processXRHandGestures(frame: XRFrame, delta: number) {
    if (!this.world || !this.world.xrReferenceSpace) return;
    const refSpace = this.world.xrReferenceSpace;

    let leftPos: Vector3 | null = null;
    let rightPos: Vector3 | null = null;
    let leftPinched = false;
    let rightPinched = false;
    let anyHandFound = false;

    for (const source of frame.session.inputSources) {
      if (!source.hand) continue;
      anyHandFound = true;
      const thumbJoint = source.hand.get('thumb-tip');
      const indexJoint = source.hand.get('index-finger-tip');
      if (!thumbJoint || !indexJoint || !frame.getJointPose) continue;

      const tPose = frame.getJointPose(thumbJoint, refSpace);
      const iPose = frame.getJointPose(indexJoint, refSpace);
      if (!tPose || !iPose) continue;

      const tPos = tPose.transform.position;
      const iPos = iPose.transform.position;
      const pinchDist = Math.hypot(
        tPos.x - iPos.x,
        tPos.y - iPos.y,
        tPos.z - iPos.z
      );

      const mid = new Vector3(
        (tPos.x + iPos.x) * 0.5,
        (tPos.y + iPos.y) * 0.5,
        (tPos.z + iPos.z) * 0.5
      );

      if (source.handedness === 'left') {
        leftPos = mid;
        leftPinched = this.leftPinching ? pinchDist < 0.038 : pinchDist < 0.026;
      } else if (source.handedness === 'right') {
        rightPos = mid;
        rightPinched = this.rightPinching ? pinchDist < 0.038 : pinchDist < 0.026;
      }
    }

    if (anyHandFound && !this.handTrackingLikely) {
      this.handTrackingLikely = true;
      this.emitXrState();
    }

    this.leftPinching = leftPinched;
    this.rightPinching = rightPinched;

    // Only apply relaxed cockpit-level Mars zoom/spin if user isn't aiming at a UI button
    if (this.lastPanelHoverId !== null) {
      this.prevDualPinchDist = null;
      this.prevSinglePinchPos = null;
      this.prevRightPinchPos = null;
      return;
    }

    if (leftPinched && rightPinched && leftPos && rightPos) {
      // Two-hand pinch gesture -> smooth zoom scale of Mars observatory
      const dist = leftPos.distanceTo(rightPos);
      if (this.prevDualPinchDist !== null) {
        const diff = dist - this.prevDualPinchDist;
        const currentScale = this.marsGrabProxyMesh.scale.x;
        const nextScale = Math.max(0.55, Math.min(2.6, currentScale * (1 + diff * 2.4)));
        this.marsGrabProxyMesh.scale.setScalar(nextScale);
        this.marsVisualRoot.scale.setScalar(nextScale);
      }
      this.prevDualPinchDist = dist;
      this.prevSinglePinchPos = null;
      this.prevRightPinchPos = null;
      this.flyTargetQuat = null;
      return;
    }

    this.prevDualPinchDist = null;

    const activePinchPos = rightPinched ? rightPos : leftPinched ? leftPos : null;
    const isRight = rightPinched;

    if (activePinchPos) {
      const prev = isRight ? this.prevRightPinchPos : this.prevSinglePinchPos;
      if (prev) {
        const dx = activePinchPos.x - prev.x;
        const dy = activePinchPos.y - prev.y;
        const sens = 3.2;
        const ry = dx * sens;
        const rx = -dy * sens;
        this.rotateTargetGroup(ry, rx);
        if (delta > 0.001) {
          this.spinVelocityY = ry / Math.min(0.05, delta);
          this.spinVelocityX = rx / Math.min(0.05, delta);
        }
        this.flyTargetQuat = null;
      }
      if (isRight) {
        this.prevRightPinchPos = activePinchPos.clone();
        this.prevSinglePinchPos = null;
      } else {
        this.prevSinglePinchPos = activePinchPos.clone();
        this.prevRightPinchPos = null;
      }
    } else {
      this.prevSinglePinchPos = null;
      this.prevRightPinchPos = null;
    }
  }

  private rotateTargetGroup(deltaYaw: number, deltaPitch: number) {
    const target =
      this.mode === 'terrain'
        ? this.terrainShowcaseRoot
        : this.mode === 'science'
          ? this.scienceLabRoot
          : this.marsGrabProxyMesh;
    const qYaw = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), deltaYaw);
    const qPitch = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), deltaPitch);
    target.quaternion.premultiply(qYaw).premultiply(qPitch);
    if (target === this.marsGrabProxyMesh) {
      this.marsVisualRoot.quaternion.copy(this.marsGrabProxyMesh.quaternion);
    }
  }

  private resetCockpitPositions() {
    this.observatoryRoot.position.copy(OBSERVATORY_CENTER);
    this.observatoryRoot.rotation.set(0, 0, 0);

    const applyPanelDefaults = (p: SpatialPanelSurface) => {
      p.group.position.set(...p.defaultPos);
      p.group.rotation.set(p.defaultRotX, p.defaultRotY, 0);
    };
    if (this.navPanel) applyPanelDefaults(this.navPanel);
    if (this.contextPanel) applyPanelDefaults(this.contextPanel);
    if (this.bottomBar) applyPanelDefaults(this.bottomBar);
  }

  public recenterCockpit() {
    if (!this.world) return;
    if (!this.isInVR) {
      this.resetCockpitPositions();
      this.orbitControls?.target.copy(OBSERVATORY_CENTER);
      this.world.camera.position.copy(DESKTOP_CAM_DEFAULT);
      this.orbitControls?.update();
      return;
    }

    // Align curved seated cockpit right in front of the user's current XR head pose
    const xrCam = this.world.renderer.xr.getCamera();
    const headPos = new Vector3();
    const headQuat = new Quaternion();
    xrCam.getWorldPosition(headPos);
    xrCam.getWorldQuaternion(headQuat);

    const euler = new Euler().setFromQuaternion(headQuat, 'YXZ');
    const yaw = euler.y;
    const baseY = Math.max(0.85, headPos.y - 0.14);

    const placeOffset = (offset: [number, number, number]) => {
      const v = new Vector3(offset[0], offset[1] - 1.16, offset[2]);
      v.applyAxisAngle(new Vector3(0, 1, 0), yaw);
      return new Vector3(headPos.x + v.x, baseY + v.y, headPos.z + v.z);
    };

    this.observatoryRoot.position.copy(placeOffset([0, 1.16, -1.08]));

    const panels = [this.navPanel, this.contextPanel, this.bottomBar];
    for (const p of panels) {
      if (!p) continue;
      p.group.position.copy(placeOffset(p.defaultPos));
      p.group.rotation.set(p.defaultRotX, yaw + p.defaultRotY, 0);
    }
  }

  private updateSurfaceHoverFromWorldPoint(worldPt: Vector3) {
    const localPt = this.marsVisualRoot.worldToLocal(worldPt.clone());
    const { lat, lng } = vector3ToLatLng(localPt);
    const elevationMeters = estimateMolaElevation(lat, lng);
    this.hoveredCoord = { lat, lng, elevationMeters };

    const normal = localPt.clone().normalize();
    this.reticleRing.position.copy(normal.clone().multiplyScalar(GLOBE_RADIUS * 1.005));
    this.reticleRing.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal);
    this.reticleRing.visible = true;
    this.emitXrState();
  }

  private handleSpatialButtonAction(btnId: string) {
    if (btnId.startsWith('mode:')) {
      const next = btnId.slice(5) as XRPanelMode;
      this.setMode(next);
    } else if (btnId.startsWith('site:')) {
      const siteId = btnId.slice(5);
      const site = MARS_SITES.find((s) => s.id === siteId);
      if (site) {
        this.callbacks.onSelectSite(site);
        this.callbacks.onSelectCoordinate({
          lat: site.lat,
          lng: site.lng,
          elevationMeters: site.elevationMeters
        });
        this.flyToSite(site);
      }
    } else if (btnId.startsWith('layer:')) {
      const layerId = btnId.slice(6);
      const layer = LAYER_CATALOG.find((l) => l.id === layerId);
      if (layer) {
        this.callbacks.onSelectLayer(layer);
      }
    } else if (btnId === 'action:toggle-rotate') {
      this.isAutoRotating = !this.isAutoRotating;
    } else if (btnId === 'action:reset-cockpit') {
      this.resetView();
    } else if (btnId === 'action:toggle-vr' || btnId === 'bar:vr') {
      if (this.isInVR) {
        void this.exitVR();
      } else {
        void this.launchVR();
      }
    } else if (btnId === 'bar:zoom-out') {
      this.zoomStep(0.84);
    } else if (btnId === 'bar:zoom-in') {
      this.zoomStep(1.18);
    } else if (btnId === 'bar:terrain' || btnId === 'loc:toggle-terrain') {
      this.setMode(this.mode === 'terrain' ? 'globe' : 'terrain');
    } else if (btnId === 'bar:route') {
      this.callbacks.onToggleRouteOverlay(!this.props.showRouteOverlay);
    } else if (btnId === 'bar:science') {
      this.setMode('science');
    } else if (btnId === 'bar:ai' || btnId === 'loc:ask-ai') {
      this.setMode('ai');
      if (btnId === 'loc:ask-ai') {
        void this.runSpatialAiPrompt('Explain the selected Martian terrain.');
      }
    } else if (btnId === 'loc:set-start' && this.props.selectedSite) {
      this.recomputeMissionPlan(this.props.selectedSite, this.props.missionRoute.destination);
      this.callbacks.onToggleRouteOverlay(true);
    } else if (btnId === 'loc:set-dest' && this.props.selectedSite) {
      this.recomputeMissionPlan(this.props.missionRoute.start, this.props.selectedSite);
      this.callbacks.onToggleRouteOverlay(true);
    } else if (btnId === 'rover:swap') {
      this.recomputeMissionPlan(
        this.props.missionRoute.destination,
        this.props.missionRoute.start
      );
      this.callbacks.onToggleRouteOverlay(true);
    } else if (btnId.startsWith('rover:strategy:')) {
      const stratId = btnId.slice(15);
      const match = this.props.missionRoute.alternativeRoutes?.find(
        (r) => r.id === stratId
      );
      if (match) {
        this.callbacks.onUpdateMissionRoute({
          ...this.props.missionRoute,
          activeCandidateRoute: match,
          distanceKm: match.distanceKm,
          estimatedSolDays: match.estimatedSolDays,
          difficultyScore: match.difficulty
        });
      }
    } else if (btnId === 'rover:toggle-drive') {
      this.isRoverAnimating = !this.isRoverAnimating;
    } else if (btnId === 'rover:reset-drive') {
      this.roverProgress = 0;
      this.isRoverAnimating = true;
    } else if (btnId.startsWith('science:topic:')) {
      this.selectedScienceTopicId = btnId.slice(14);
    } else if (btnId.startsWith('science:model:')) {
      this.selectedScienceModelId = btnId.slice(14) as ScienceModelId;
      this.rebuildScienceLabModel();
    } else if (btnId.startsWith('ai:ask:')) {
      const prompt = btnId.slice(7);
      if (prompt) {
        void this.runSpatialAiPrompt(prompt);
      }
    } else if (btnId === 'ai:voice-mic') {
      this.toggleSpatialVoiceInput();
    } else if (btnId === 'ai:toggle-tts') {
      this.voiceOutEnabled = !this.voiceOutEnabled;
      if (!this.voiceOutEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    this.spatialPanelsDirty = true;
  }

  private recomputeMissionPlan(
    start: MarsSite | MarsCoordinate | null,
    dest: MarsSite | MarsCoordinate | null
  ) {
    if (!start || !dest) return;
    if (Math.abs(start.lat - dest.lat) < 0.01 && Math.abs(start.lng - dest.lng) < 0.01) return;

    const routes = calculateCandidateRoutes(
      start.lat,
      start.lng,
      dest.lat,
      dest.lng,
      this.props.missionRoute.constraints,
      this.props.missionRoute.scienceObjective
    );
    const active = routes[0];
    const startLabel = 'name' in start ? start.name : `${start.lat.toFixed(2)}°, ${start.lng.toFixed(2)}°`;
    const destinationLabel = 'name' in dest ? dest.name : `${dest.lat.toFixed(2)}°, ${dest.lng.toFixed(2)}°`;

    this.callbacks.onUpdateMissionRoute({
      ...this.props.missionRoute,
      start,
      destination: dest,
      startLabel,
      destinationLabel,
      distanceKm: active?.distanceKm ?? 0,
      estimatedSolDays: active?.estimatedSolDays ?? 0,
      difficultyScore: active?.difficulty ?? 'Moderate',
      status: 'Verified',
      activeCandidateRoute: active,
      alternativeRoutes: routes
    });
    this.roverProgress = 0;
  }

  private async runSpatialAiPrompt(prompt: string) {
    this.aiQuestion = prompt;
    this.aiIsLoading = true;
    this.spatialPanelsDirty = true;

    const reply = await queryAiScienceAssistant(prompt, {
      selectedSite: this.props.selectedSite,
      selectedCoordinate: this.props.selectedCoordinate,
      activeLayer: this.props.activeLayer,
      missionRoute: this.props.missionRoute
    });

    this.aiIsLoading = false;
    this.aiResponse = reply.content;
    this.aiCitations = reply.citations ?? ['NASA PDS', 'USGS Astrogeology'];
    this.spatialPanelsDirty = true;

    if (
      this.voiceOutEnabled &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(
        reply.content.replace(/[#*`]/g, '')
      );
      utter.rate = 1.02;
      window.speechSynthesis.speak(utter);
    }
  }

  private toggleSpatialVoiceInput() {
    if (this.isListeningVoice && this.speechRecognition) {
      this.speechRecognition.stop();
      this.isListeningVoice = false;
      this.spatialPanelsDirty = true;
      return;
    }

    const w = window as unknown as {
      SpeechRecognition?: SpeechCtor;
      webkitSpeechRecognition?: SpeechCtor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      this.aiResponse =
        'Browser speech recognition unavailable here. Tap any quick scientific question below or use the AI Science Modal.';
      this.spatialPanelsDirty = true;
      return;
    }

    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    this.speechRecognition = rec;
    this.isListeningVoice = true;
    this.spatialPanelsDirty = true;

    rec.onresult = (ev) => {
      const transcript = ev.results[0]?.[0]?.transcript?.trim();
      this.isListeningVoice = false;
      if (transcript) {
        void this.runSpatialAiPrompt(transcript);
      } else {
        this.spatialPanelsDirty = true;
      }
    };
    rec.onerror = () => {
      this.isListeningVoice = false;
      this.spatialPanelsDirty = true;
    };
    rec.onend = () => {
      this.isListeningVoice = false;
      this.spatialPanelsDirty = true;
    };
    rec.start();
  }

  private loadLayerTexture(layer: MapLayerConfig) {
    const url = assetUrl(layer.texturePath.replace(/^\//, ''));
    const cached = this.textureCache.get(url);
    if (cached) {
      this.applySurfaceTexture(cached, false);
      return;
    }

    this.textureLoader.load(
      url,
      (tex) => {
        if (this.destroyed) {
          tex.dispose();
          return;
        }
        tex.colorSpace = SRGBColorSpace;
        (tex as Texture & { __cached?: boolean }).__cached = true;
        this.textureCache.set(url, tex);
        if (this.props.activeLayer.id === layer.id) {
          this.applySurfaceTexture(tex, false);
        }
      },
      undefined,
      () => {
        if (this.destroyed) return;
        if (!this.fallbackTexture) {
          this.fallbackTexture = createProceduralMarsFallbackTexture();
          (this.fallbackTexture as Texture & { __cached?: boolean }).__cached = true;
        }
        this.applySurfaceTexture(this.fallbackTexture, true);
      }
    );
  }

  private applySurfaceTexture(tex: Texture, offline: boolean) {
    this.currentTexture = tex;
    this.isOfflineFallback = offline;
    const mat = this.marsSurfaceMesh.material as MeshStandardMaterial;
    mat.map = tex;
    mat.opacity = Math.max(0.25, Math.min(1, this.props.layerOpacity / 100));
    mat.transparent = mat.opacity < 0.99;
    mat.needsUpdate = true;

    if (this.mode === 'terrain') {
      this.rebuildTerrainDiorama();
    }
    if (this.mode === 'science' && this.selectedScienceModelId === 'mars-interior') {
      this.rebuildScienceLabModel();
    }
    this.spatialPanelsDirty = true;
    this.emitXrState();
  }

  private rebuildRouteAndHazards() {
    // 1. Rebuild Hazard Warning Rings
    while (this.hazardsGroup.children.length > 0) {
      const child = this.hazardsGroup.children[0];
      this.hazardsGroup.remove(child);
      if (child instanceof Mesh) {
        child.geometry.dispose();
        (child.material as MeshBasicMaterial).dispose();
      }
    }

    for (const hz of MARS_HAZARD_ZONES) {
      const pos = latLngToVector3(hz.lat, hz.lng, GLOBE_RADIUS * 1.007);
      const normal = pos.clone().normalize();
      const angRad = Math.min(0.18, Math.max(0.032, hz.radiusKm / 3390));
      const outerR = Math.sin(angRad) * GLOBE_RADIUS;
      const innerR = outerR * 0.78;
      const ringGeom = new RingGeometry(innerR, outerR, 28);
      const ringColor = hz.severity === 'Severe' ? 0xef4444 : hz.severity === 'High' ? 0xf59e0b : 0xfbbf24;
      const ringMesh = new Mesh(
        ringGeom,
        new MeshBasicMaterial({
          color: ringColor,
          transparent: true,
          opacity: 0.56,
          side: DoubleSide
        })
      );
      ringMesh.position.copy(pos);
      ringMesh.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal);
      this.hazardsGroup.add(ringMesh);
    }

    // 2. Rebuild Route Tube (keep mini rover intact)
    for (let i = this.routeOverlayGroup.children.length - 1; i >= 0; i--) {
      const child = this.routeOverlayGroup.children[i];
      if (child !== this.roverMesh) {
        this.routeOverlayGroup.remove(child);
        if (child instanceof Mesh) {
          child.geometry.dispose();
          (child.material as MeshBasicMaterial).dispose();
        }
      }
    }

    const activeRoute =
      this.props.missionRoute.activeCandidateRoute ??
      this.props.missionRoute.alternativeRoutes?.[0];

    const showRoute = Boolean(this.props.showRouteOverlay && activeRoute && activeRoute.path.length >= 2);
    this.routeOverlayGroup.visible = showRoute;
    this.hazardsGroup.visible = showRoute || this.mode === 'rover';

    if (!activeRoute || activeRoute.path.length < 2) {
      this.roverCurve = null;
      this.roverMesh.visible = false;
      return;
    }

    const pts3D = activeRoute.path.map(([lng, lat]) =>
      latLngToVector3(lat, lng, GLOBE_RADIUS * 1.018)
    );
    const curve = new CatmullRomCurve3(pts3D);
    this.roverCurve = curve;

    const tubeGeom = new TubeGeometry(curve, Math.max(48, pts3D.length * 4), 0.0052, 8, false);
    const tubeColor =
      activeRoute.id === 'safe-contour'
        ? '#338BFF'
        : activeRoute.id === 'direct-geodesic'
          ? '#FF6B35'
          : '#35C98A';
    const tubeMat = new MeshBasicMaterial({
      color: new Color(tubeColor)
    });
    const routeTube = new Mesh(tubeGeom, tubeMat);
    this.routeOverlayGroup.add(routeTube);

    this.roverMesh.visible = true;
    this.updateRoverPoseOnCurve();
  }

  private updateRoverPoseOnCurve() {
    if (!this.roverCurve || !this.roverMesh.visible) return;
    const t = Math.max(0, Math.min(1, this.roverProgress));
    const pos = this.roverCurve.getPointAt(t);
    const tangent = this.roverCurve.getTangentAt(t).normalize();
    const up = pos.clone().normalize();
    const right = new Vector3().crossVectors(up, tangent).normalize();
    const forward = new Vector3().crossVectors(right, up).normalize();

    this.roverMesh.position.copy(pos.clone().multiplyScalar(1.008));
    const basis = new Matrix4().makeBasis(right, up, forward.negate());
    this.roverMesh.quaternion.setFromRotationMatrix(basis);
  }

  private rebuildTerrainDiorama() {
    while (this.terrainShowcaseRoot.children.length > 0) {
      const child = this.terrainShowcaseRoot.children[0];
      this.terrainShowcaseRoot.remove(child);
      if (child instanceof Group) {
        disposeObjectTree(child);
      }
    }

    const lat = this.props.selectedSite?.lat ?? this.props.selectedCoordinate?.lat ?? 18.38;
    const lng = this.props.selectedSite?.lng ?? this.props.selectedCoordinate?.lng ?? 77.58;
    const activeRoute =
      this.props.missionRoute.activeCandidateRoute ??
      this.props.missionRoute.alternativeRoutes?.[0];

    const diorama = createLocalTerrainDiorama(
      lat,
      lng,
      this.props.selectedSite,
      this.currentTexture,
      activeRoute?.path ?? []
    );
    this.terrainShowcaseRoot.add(diorama);
  }

  private rebuildScienceLabModel() {
    if (this.scienceModelEntity) {
      this.scienceModelEntity.destroy();
      this.scienceModelEntity = null;
    }
    while (this.scienceLabRoot.children.length > 0) {
      const child = this.scienceLabRoot.children[0];
      this.scienceLabRoot.remove(child);
      if (child instanceof Group) {
        disposeObjectTree(child);
      }
    }

    const modelGroup = buildScienceLabModel(
      this.selectedScienceModelId,
      this.currentTexture
    );
    modelGroup.scale.setScalar(1.55);
    this.scienceLabRoot.add(modelGroup);

    if (this.world) {
      const entity = this.world.createTransformEntity(modelGroup, {
        parent: this.world.sceneEntity
      });
      entity.addComponent(OneHandGrabbable, {
        rotate: true,
        translate: true,
        translateMin: [-0.45, -0.35, -0.45],
        translateMax: [0.45, 0.45, 0.45]
      });
      entity.addComponent(RayInteractable);
      this.scienceModelEntity = entity;
    }
  }

  private syncShowcaseVisibility() {
    const isTerrain = this.mode === 'terrain';
    const isScience = this.mode === 'science';

    this.marsVisualRoot.visible = !isTerrain && !isScience;
    this.marsGrabProxyMesh.visible = !isTerrain && !isScience;

    if (isTerrain) {
      this.rebuildTerrainDiorama();
      this.terrainShowcaseRoot.visible = true;
    } else {
      this.terrainShowcaseRoot.visible = false;
    }

    this.scienceLabRoot.visible = isScience;
    this.spatialCockpitRoot.visible = this.isInVR || this.showSpatialPanelsDesktop;
    this.rebuildRouteAndHazards();
  }

  private startLoop() {
    const tick = () => {
      if (this.destroyed || !this.world) return;
      this.rafId = requestAnimationFrame(tick);

      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - this.clockLastMs) / 1000));
      this.clockLastMs = now;

      // 1. Sync GrabProxy transforms -> MarsVisualRoot
      if (
        !this.flyTargetQuat &&
        (this.leftPinching ||
          this.rightPinching ||
          Math.abs(this.marsGrabProxyMesh.scale.x - this.marsVisualRoot.scale.x) > 0.0005 ||
          this.marsGrabProxyMesh.quaternion.angleTo(this.marsVisualRoot.quaternion) > 0.0005)
      ) {
        this.marsVisualRoot.quaternion.copy(this.marsGrabProxyMesh.quaternion);
        this.marsVisualRoot.scale.copy(this.marsGrabProxyMesh.scale);
      }

      // 2. Smooth inertial damping after hand pinch spin
      if (!this.leftPinching && !this.rightPinching && (Math.abs(this.spinVelocityY) > 0.01 || Math.abs(this.spinVelocityX) > 0.01)) {
        this.rotateTargetGroup(this.spinVelocityY * dt, this.spinVelocityX * dt);
        const damp = Math.pow(0.08, dt);
        this.spinVelocityY *= damp;
        this.spinVelocityX *= damp;
      }

      // 3. Smooth Fly-To Site Quaternion Slerp
      if (this.flyTargetQuat && !this.leftPinching && !this.rightPinching) {
        this.marsGrabProxyMesh.quaternion.slerp(this.flyTargetQuat, Math.min(1, dt * 4.5));
        this.marsVisualRoot.quaternion.copy(this.marsGrabProxyMesh.quaternion);
        if (this.marsGrabProxyMesh.quaternion.angleTo(this.flyTargetQuat) < 0.004) {
          this.marsGrabProxyMesh.quaternion.copy(this.flyTargetQuat);
          this.marsVisualRoot.quaternion.copy(this.flyTargetQuat);
          this.flyTargetQuat = null;
        }
      } else if (
        this.isAutoRotating &&
        this.marsVisualRoot.visible &&
        !this.leftPinching &&
        !this.rightPinching &&
        Math.abs(this.spinVelocityY) < 0.05
      ) {
        this.rotateTargetGroup(dt * 0.075, 0);
      }

      if (this.mode === 'science' && this.scienceLabRoot.visible) {
        this.scienceLabRoot.rotation.y += dt * 0.25;
      }

      // 4. Pulse landmark halos & animate rover along real A* geodesic path
      const pulse = 1 + Math.sin(now * 0.004) * 0.16;
      for (const entry of this.beaconEntries) {
        const isSelected = this.props.selectedSite?.id === entry.site.id;
        entry.haloMesh.scale.setScalar(isSelected ? pulse * 1.45 : pulse);
      }

      if (this.isRoverAnimating && this.roverCurve && this.routeOverlayGroup.visible) {
        this.roverProgress = (this.roverProgress + dt * 0.06) % 1;
        this.updateRoverPoseOnCurve();
      }

      // 4b. Keep spatial panel screen synced beneath its grab bar if repositioned
      for (const panel of [this.navPanel, this.contextPanel, this.bottomBar]) {
        if (!panel) continue;
        const bar = panel.grabBarMesh;
        const offset = new Vector3(0, -(panel.worldHeight * 0.5 + 0.022), -0.005).applyQuaternion(
          bar.quaternion
        );
        panel.hitMesh.position.copy(bar.position).add(offset);
        panel.hitMesh.quaternion.copy(bar.quaternion);
      }

      // 5. Redraw Spatial UI Canvases only when dirty
      if (this.spatialPanelsDirty) {
        this.redrawSpatialPanels();
        this.spatialPanelsDirty = false;
      }

      // 6. Desktop OrbitControls update (disabled in WebXR)
      if (!this.isInVR && this.orbitControls) {
        this.orbitControls.update();
      }

      // Note: World's internal engine runs WebGL animation loop, so avoid double rendering.
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private redrawSpatialPanels() {
    const state: SpatialPanelState = {
      mode: this.mode,
      selectedSite: this.props.selectedSite,
      selectedCoordinate: this.props.selectedCoordinate,
      activeLayer: this.props.activeLayer,
      missionRoute: this.props.missionRoute,
      showRouteOverlay: this.props.showRouteOverlay,
      isAutoRotating: this.isAutoRotating,
      isRoverAnimating: this.isRoverAnimating,
      roverProgressPct: this.roverProgress * 100,
      selectedScienceTopicId: this.selectedScienceTopicId,
      selectedScienceModelId: this.selectedScienceModelId,
      aiQuestion: this.aiQuestion,
      aiResponse: this.aiResponse,
      aiCitations: this.aiCitations,
      aiIsLoading: this.aiIsLoading,
      isListeningVoice: this.isListeningVoice,
      voiceOutEnabled: this.voiceOutEnabled,
      isInVR: this.isInVR,
      isOfflineFallback: this.isOfflineFallback,
      hoveredButtonId: this.lastPanelHoverId
    };

    renderNavPanel(this.navPanel, state);
    renderContextPanel(this.contextPanel, state);
    renderBottomBar(this.bottomBar, state);
  }

  private emitXrState() {
    this.callbacks.onXrStateChange?.({
      xrSupported: this.xrSupported,
      handTrackingLikely: this.handTrackingLikely,
      isInVR: this.isInVR,
      isOfflineFallback: this.isOfflineFallback,
      xrStatusMessage: this.xrStatusMessage,
      hoveredSite: this.hoveredSite,
      hoveredCoord: this.hoveredCoord,
      roverProgressPct: this.roverProgress * 100
    });
  }

  // ---------------- Public Control API ----------------

  public updateProps(nextProps: GeoMarsXRProps) {
    const prev = this.props;
    this.props = { ...nextProps };

    if (nextProps.mode && nextProps.mode !== this.mode) {
      this.mode = nextProps.mode;
      this.syncShowcaseVisibility();
    }
    if (
      nextProps.showSpatialPanelsDesktop !== undefined &&
      nextProps.showSpatialPanelsDesktop !== this.showSpatialPanelsDesktop
    ) {
      this.showSpatialPanelsDesktop = nextProps.showSpatialPanelsDesktop;
      this.syncShowcaseVisibility();
    }

    if (nextProps.activeLayer.id !== prev.activeLayer.id) {
      this.loadLayerTexture(nextProps.activeLayer);
    } else if (nextProps.layerOpacity !== prev.layerOpacity) {
      const mat = this.marsSurfaceMesh.material as MeshStandardMaterial;
      mat.opacity = Math.max(0.25, Math.min(1, nextProps.layerOpacity / 100));
      mat.transparent = mat.opacity < 0.99;
      mat.needsUpdate = true;
    }

    if (nextProps.selectedSite?.id !== prev.selectedSite?.id && nextProps.selectedSite) {
      this.flyToSite(nextProps.selectedSite);
      if (this.mode === 'terrain') {
        this.rebuildTerrainDiorama();
      }
    }

    if (
      nextProps.missionRoute.activeCandidateRoute?.id !== prev.missionRoute.activeCandidateRoute?.id ||
      nextProps.missionRoute.startLabel !== prev.missionRoute.startLabel ||
      nextProps.missionRoute.destinationLabel !== prev.missionRoute.destinationLabel ||
      nextProps.showRouteOverlay !== prev.showRouteOverlay
    ) {
      this.rebuildRouteAndHazards();
    }

    this.spatialPanelsDirty = true;
  }

  public setMode(nextMode: XRPanelMode) {
    if (this.mode === nextMode) return;
    this.mode = nextMode;
    this.syncShowcaseVisibility();
    this.spatialPanelsDirty = true;
    this.callbacks.onModeChange?.(nextMode);
  }

  public flyToSite(site: MarsSite) {
    // Orient local surface vector toward +Z (viewer direction) cleanly
    const dir = latLngToVector3(site.lat, site.lng, 1).normalize();
    const targetQ = new Quaternion().setFromUnitVectors(dir, new Vector3(0, 0.14, 1).normalize());
    this.flyTargetQuat = targetQ;
    this.isAutoRotating = false;
    this.spatialPanelsDirty = true;
  }

  public zoomStep(factor: number) {
    if (!this.isInVR && this.orbitControls && this.world) {
      const dir = new Vector3().subVectors(this.world.camera.position, this.orbitControls.target);
      const nextDist = Math.max(
        this.orbitControls.minDistance,
        Math.min(this.orbitControls.maxDistance, dir.length() / factor)
      );
      dir.setLength(nextDist);
      this.world.camera.position.copy(this.orbitControls.target).add(dir);
      this.orbitControls.update();
    } else {
      const nextScale = Math.max(0.55, Math.min(2.6, this.marsGrabProxyMesh.scale.x * factor));
      this.marsGrabProxyMesh.scale.setScalar(nextScale);
      this.marsVisualRoot.scale.setScalar(nextScale);
    }
  }

  public resetView() {
    this.flyTargetQuat = null;
    this.marsGrabProxyMesh.quaternion.identity();
    this.marsVisualRoot.quaternion.identity();
    this.marsGrabProxyMesh.scale.setScalar(1);
    this.marsVisualRoot.scale.setScalar(1);
    this.terrainShowcaseRoot.rotation.set(0, 0, 0);
    this.scienceLabRoot.rotation.set(0, 0, 0);
    this.spinVelocityX = 0;
    this.spinVelocityY = 0;
    this.isAutoRotating = true;
    this.recenterCockpit();
    this.spatialPanelsDirty = true;
  }

  public setAutoRotate(enabled: boolean) {
    this.isAutoRotating = enabled;
    this.spatialPanelsDirty = true;
  }

  public async launchVR() {
    if (!this.world) return;
    if (!this.xrSupported) {
      this.xrStatusMessage =
        'WebXR not detected — use Meta Quest Browser, HTTPS, or Meta IWER emulator.';
      this.emitXrState();
      return;
    }
    try {
      this.xrStatusMessage = 'Launching WebXR Session...';
      this.emitXrState();
      await this.world.launchXR();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to start WebXR session';
      this.xrStatusMessage = `XR Error: ${msg}`;
      this.emitXrState();
    }
  }

  public async exitVR() {
    if (!this.world) return;
    try {
      await this.world.exitXR();
    } catch {
      // Fallback: force session close if still active
      await this.world.session?.end().catch(() => {});
    }
  }

  public destroy() {
    this.destroyed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.xrFrameUnsub?.();
    this.visibilityUnsub?.();
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.handleWindowResizeOverride);
    if (this.world) {
      this.world.renderer.xr.removeEventListener('sessionstart', this.onXrSessionStart);
      this.world.renderer.xr.removeEventListener('sessionend', this.onXrSessionEnd);
      this.world.renderer.domElement.remove();
      (this.world as unknown as { destroy?: () => void }).destroy?.();
      this.world = null;
    }
    this.orbitControls?.dispose();
    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
    this.fallbackTexture?.dispose();
  }
}
