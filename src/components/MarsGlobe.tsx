import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { FC } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import type { MapLayerConfig, MarsCoordinate, MarsSite, MissionRoutePlan, MapOverlaysConfig } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { formatElevation } from '../utils/marsMath';
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Layers,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface MarsGlobeProps {
  activeLayer: MapLayerConfig;
  selectedCoordinate: MarsCoordinate | null;
  selectedSite: MarsSite | null;
  missionRoute: MissionRoutePlan;
  overlays: MapOverlaysConfig;
  layerOpacity: number;
  viewMode: '2d' | '3d';
  onChangeViewMode: (mode: '2d' | '3d') => void;
  onSelectCoordinate: (coord: MarsCoordinate) => void;
  onSelectSite: (site: MarsSite | null) => void;
  onLoadingChange: (loading: boolean) => void;
}

// Convert Martian Latitude & Longitude to 3D Cartesian coordinates on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (lat * Math.PI) / 180;
  const theta = (lng * Math.PI) / 180;

  const x = radius * Math.cos(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi);
  const z = -radius * Math.cos(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

// Convert 3D Cartesian coordinate on sphere back to Martian Latitude & Longitude
function vector3ToLatLng(v: THREE.Vector3): { lat: number; lng: number } {
  const norm = v.clone().normalize();
  const lat = Math.asin(Math.max(-1, Math.min(1, norm.y))) * (180 / Math.PI);
  const lng = Math.atan2(-norm.z, norm.x) * (180 / Math.PI);
  return { lat, lng };
}

// Custom Atmosphere Rim Glow Shader
const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 2.8);
      vec3 atmosphereColor = vec3(1.0, 0.42, 0.18); // Martian amber/orange glow
      gl_FragColor = vec4(atmosphereColor, fresnel * 0.9);
    }
  `
};

export const MarsGlobe: FC<MarsGlobeProps> = ({
  activeLayer,
  selectedCoordinate,
  selectedSite,
  missionRoute,
  overlays,
  layerOpacity,
  viewMode,
  onChangeViewMode,
  onSelectCoordinate,
  onSelectSite,
  onLoadingChange
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const marsMeshRef = useRef<THREE.Mesh | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const routeLineRef = useRef<THREE.Line | null>(null);
  const targetRingRef = useRef<THREE.Mesh | null>(null);

  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [hoveredCoordinate, setHoveredCoordinate] = useState<MarsCoordinate | null>(null);
  const [isMarsDropdownOpen, setIsMarsDropdownOpen] = useState(false);
  const [labels, setLabels] = useState<
    { site: MarsSite; screenX: number; screenY: number; visible: boolean; isSelected: boolean }[]
  >([]);

  const GLOBE_RADIUS = 2.5;

  const currentTexturePath = useMemo(() => {
    switch (activeLayer.id) {
      case 'elevation-mola':
        return '/textures/mars_mola_color.jpg';
      case 'hillshade-mola':
        return '/textures/mars_hillshade.jpg';
      case 'themis-day':
        return '/textures/mars_themis_day.jpg';
      case 'themis-night':
        return '/textures/mars_themis_night.jpg';
      case 'false-color-mineral':
        return '/textures/mars_false_color.jpg';
      case 'terrain-roughness':
        return '/textures/mars_roughness.jpg';
      case 'ctx-mosaic':
        return '/textures/mars_ctx.jpg';
      case 'hirise-regional':
        return '/textures/mars_hirise.jpg';
      case 'visual-imagery':
      default:
        return '/textures/mars_surface_2k.jpg';
    }
  }, [activeLayer.id]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020a10);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Position to frame Mars matching the reference perspective
    camera.position.set(-0.8, 0.9, 5.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.8;
    controls.maxDistance = 14.0;
    controls.rotateSpeed = 0.6;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    sunLight.position.set(6, 3, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xe06030, 0.45);
    rimLight.position.set(-6, -2, -5);
    scene.add(rimLight);

    // Deep Space Starfield
    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 250 + Math.random() * 200;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const colorVariance = 0.8 + Math.random() * 0.2;
      const tint = Math.random();
      if (tint > 0.8) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 0.75;
      } else {
        starColors[i * 3] = colorVariance;
        starColors[i * 3 + 1] = colorVariance;
        starColors[i * 3 + 2] = 1.0;
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const starfield = new THREE.Points(starGeometry, starMaterial);
    scene.add(starfield);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const sphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    onLoadingChange(true);

    const marsTexture = textureLoader.load(
      currentTexturePath,
      () => {
        onLoadingChange(false);
      },
      undefined,
      () => onLoadingChange(false)
    );

    const marsMaterial = new THREE.MeshStandardMaterial({
      map: marsTexture,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: layerOpacity
    });

    const marsMesh = new THREE.Mesh(sphereGeometry, marsMaterial);
    globeGroup.add(marsMesh);
    marsMeshRef.current = marsMesh;

    // Atmospheric Glow Halo (Fresnel Corona)
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.025, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: AtmosphereShader.vertexShader,
      fragmentShader: AtmosphereShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // Selected Target Ring Marker
    const ringGeometry = new THREE.RingGeometry(0.04, 0.07, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x338bff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const targetRing = new THREE.Mesh(ringGeometry, ringMaterial);
    targetRing.visible = false;
    globeGroup.add(targetRing);
    targetRingRef.current = targetRing;

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      atmosphereMesh.position.copy(globeGroup.position);

      renderer.render(scene, camera);

      if (cameraRef.current && containerRef.current) {
        const cam = cameraRef.current;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;

        const updatedLabels = MARS_SITES.map((site) => {
          // Check overlay visibility filter
          if (site.category === 'rover' && !overlays.roverLandingSites) return null;
          if (site.category === 'lander' && !overlays.missionLocations) return null;
          if ((site.category === 'volcano' || site.category === 'canyon' || site.category === 'basin') && !overlays.pointsOfInterest) {
            if (site.id !== 'olympus-mons' && site.id !== 'valles-marineris') return null;
          }

          const worldPos = latLngToVector3(site.lat, site.lng, GLOBE_RADIUS);
          worldPos.applyMatrix4(globeGroup.matrixWorld);

          const surfaceNormal = worldPos.clone().normalize();
          const camToPoint = cam.position.clone().sub(worldPos).normalize();
          const isFacingCamera = surfaceNormal.dot(camToPoint) > 0.08;

          const screenPos = worldPos.clone().project(cam);
          const screenX = ((screenPos.x + 1) * w) / 2;
          const screenY = ((-screenPos.y + 1) * h) / 2;

          return {
            site,
            screenX,
            screenY,
            visible: isFacingCamera && screenPos.z < 1,
            isSelected: selectedSite?.id === site.id
          };
        }).filter(Boolean) as { site: MarsSite; screenX: number; screenY: number; visible: boolean; isSelected: boolean }[];

        setLabels(updatedLabels);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update texture & opacity dynamically
  useEffect(() => {
    if (!marsMeshRef.current) return;
    const mat = marsMeshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = layerOpacity;

    const loader = new THREE.TextureLoader();
    onLoadingChange(true);

    loader.load(
      currentTexturePath,
      (newTexture) => {
        if (marsMeshRef.current) {
          mat.map = newTexture;
          mat.needsUpdate = true;
        }
        onLoadingChange(false);
      },
      undefined,
      () => onLoadingChange(false)
    );
  }, [currentTexturePath, layerOpacity, onLoadingChange]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  // Fly to coordinate
  const flyToCoordinate = useCallback((lat: number, lng: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    const targetPos = latLngToVector3(lat, lng, GLOBE_RADIUS);
    const targetCamDist = Math.max(3.6, Math.min(camera.position.length(), 5.5));
    const targetCamPos = targetPos.clone().normalize().multiplyScalar(targetCamDist);

    const startPos = camera.position.clone();
    let progress = 0;

    setIsAutoRotating(false);

    const step = () => {
      progress += 0.045;
      if (progress < 1) {
        camera.position.lerpVectors(startPos, targetCamPos, progress);
        controls.target.set(0, 0, 0);
        controls.update();
        requestAnimationFrame(step);
      } else {
        camera.position.copy(targetCamPos);
        controls.target.set(0, 0, 0);
        controls.update();
      }
    };
    requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (selectedSite) {
      flyToCoordinate(selectedSite.lat, selectedSite.lng);
    }
  }, [selectedSite, flyToCoordinate]);

  // Update Target Ring
  useEffect(() => {
    if (!targetRingRef.current) return;
    const ring = targetRingRef.current;

    const activePoint = selectedCoordinate || (selectedSite ? { lat: selectedSite.lat, lng: selectedSite.lng } : null);

    if (activePoint) {
      const pos = latLngToVector3(activePoint.lat, activePoint.lng, GLOBE_RADIUS * 1.002);
      ring.position.copy(pos);
      ring.lookAt(pos.clone().multiplyScalar(2));
      ring.visible = true;
    } else {
      ring.visible = false;
    }
  }, [selectedCoordinate, selectedSite]);

  // Geodesic Trajectory Arc
  useEffect(() => {
    if (!globeGroupRef.current || !sceneRef.current) return;
    const globe = globeGroupRef.current;

    if (routeLineRef.current) {
      globe.remove(routeLineRef.current);
      routeLineRef.current.geometry.dispose();
      (routeLineRef.current.material as THREE.Material).dispose();
      routeLineRef.current = null;
    }

    if (overlays.plannedRoute && missionRoute.start && missionRoute.destination) {
      const startLat = 'lat' in missionRoute.start ? missionRoute.start.lat : 0;
      const startLng = 'lng' in missionRoute.start ? missionRoute.start.lng : 0;
      const destLat = 'lat' in missionRoute.destination ? missionRoute.destination.lat : 0;
      const destLng = 'lng' in missionRoute.destination ? missionRoute.destination.lng : 0;

      const pA = latLngToVector3(startLat, startLng, GLOBE_RADIUS).normalize();
      const pB = latLngToVector3(destLat, destLng, GLOBE_RADIUS).normalize();

      const numPoints = 64;
      const arcPoints: THREE.Vector3[] = [];

      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const pt = new THREE.Vector3();
        pt.copy(pA).lerp(pB, t).normalize();

        const elevation = GLOBE_RADIUS * (1.008 + 0.045 * Math.sin(t * Math.PI));
        pt.multiplyScalar(elevation);
        arcPoints.push(pt);
      }

      const curveGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
      const curveMaterial = new THREE.LineBasicMaterial({
        color: 0xff6b35,
        linewidth: 3,
        transparent: true,
        opacity: 0.95
      });

      const line = new THREE.Line(curveGeometry, curveMaterial);
      globe.add(line);
      routeLineRef.current = line;
    }
  }, [overlays.plannedRoute, missionRoute]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const container = containerRef.current;
    const camera = cameraRef.current;
    const marsMesh = marsMeshRef.current;
    if (!container || !camera || !marsMesh) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(marsMesh);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      const localPoint = hitPoint.clone();
      if (globeGroupRef.current) {
        localPoint.applyMatrix4(globeGroupRef.current.matrixWorld.clone().invert());
      }
      const coords = vector3ToLatLng(localPoint);
      setHoveredCoordinate(coords);

      let nearestSite: MarsSite | null = null;
      let minDistance = 0.35;

      MARS_SITES.forEach((site) => {
        const sitePos = latLngToVector3(site.lat, site.lng, GLOBE_RADIUS);
        const dist = sitePos.distanceTo(localPoint);
        if (dist < minDistance) {
          minDistance = dist;
          nearestSite = site;
        }
      });

      if (nearestSite) {
        onSelectSite(nearestSite);
        onSelectCoordinate({
          lat: (nearestSite as MarsSite).lat,
          lng: (nearestSite as MarsSite).lng,
          elevationMeters: (nearestSite as MarsSite).elevationMeters
        });
      } else {
        onSelectSite(null);
        onSelectCoordinate({
          lat: parseFloat(coords.lat.toFixed(2)),
          lng: parseFloat(coords.lng.toFixed(2))
        });
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const marsMesh = marsMeshRef.current;
    if (!container || !camera || !marsMesh) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(marsMesh);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      const localPoint = hitPoint.clone();
      if (globeGroupRef.current) {
        localPoint.applyMatrix4(globeGroupRef.current.matrixWorld.clone().invert());
      }
      const coords = vector3ToLatLng(localPoint);
      setHoveredCoordinate(coords);
    }
  };

  const activeLat = hoveredCoordinate?.lat ?? selectedCoordinate?.lat ?? (selectedSite ? selectedSite.lat : 18.44);
  const activeLng = hoveredCoordinate?.lng ?? selectedCoordinate?.lng ?? (selectedSite ? selectedSite.lng : 77.45);
  const activeElev = selectedCoordinate?.elevationMeters ?? (selectedSite ? selectedSite.elevationMeters : -2536);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      className="relative w-full h-full bg-[#020A10] overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      {/* 1. Upper-Left: Compact Planet Selector (Mars ▾) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-auto">
        <div className="relative">
          <button
            onClick={() => setIsMarsDropdownOpen(!isMarsDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#04121B]/90 border border-[#19303E] hover:border-[#FF6B35]/50 shadow-xl backdrop-blur-md transition-all text-xs"
          >
            <img src="/geomars-logo.png" alt="Mars" className="w-4 h-4 object-contain shrink-0" />
            <span className="font-bold text-[#F4F7FA]">Mars</span>
            <ChevronDown className="w-3 h-3 text-[#71869A]" />
          </button>

          {isMarsDropdownOpen && (
            <div className="absolute top-9 left-0 bg-[#04121B] border border-[#19303E] rounded-xl shadow-2xl p-1 z-30 min-w-[130px] text-xs">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#FF6B35] bg-[#0B1C29] rounded-lg">
                Mars (Selected)
              </div>
              <div className="px-2.5 py-1.5 text-[11px] text-[#71869A] cursor-not-allowed">
                Phobos (Planned)
              </div>
              <div className="px-2.5 py-1.5 text-[11px] text-[#71869A] cursor-not-allowed">
                Deimos (Planned)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Upper-Right: Segmented View Selector [ 2D | 3D ] */}
      <div className="absolute top-4 right-4 z-10 pointer-events-auto">
        <div className="flex items-center gap-1 bg-[#04121B]/90 border border-[#19303E] p-1 rounded-xl shadow-xl backdrop-blur-md">
          <button
            onClick={() => onChangeViewMode('2d')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === '2d'
                ? 'bg-[#FF6B35] text-white shadow-md'
                : 'text-[#A7B8C8] hover:text-white'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => onChangeViewMode('3d')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === '3d'
                ? 'bg-[#FF6B35] text-white shadow-md'
                : 'text-[#A7B8C8] hover:text-white'
            }`}
          >
            3D
          </button>
        </div>
      </div>

      {/* 3. Surface Labels Overlay matching reference image */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {labels.map(({ site, screenX, screenY, visible, isSelected }) => {
          if (!visible) return null;

          return (
            <div
              key={site.id}
              style={{
                transform: `translate3d(${screenX}px, ${screenY}px, 0)`,
                transformOrigin: '0 0'
              }}
              className="absolute left-0 top-0 pointer-events-auto -translate-x-1/2 -translate-y-1/2 group"
            >
              {/* Target Marker Pin */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSite(site);
                  onSelectCoordinate({
                    lat: site.lat,
                    lng: site.lng,
                    elevationMeters: site.elevationMeters
                  });
                }}
                className={`relative flex items-center justify-center cursor-pointer transition-transform ${
                  isSelected ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                {/* Pin Circle */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-[#338BFF] bg-[#338BFF]/30 shadow-[0_0_12px_rgba(51,139,255,0.8)]'
                      : 'border-white/60 bg-black/40 hover:border-white hover:bg-white/20'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      site.category === 'rover'
                        ? 'bg-[#338BFF]'
                        : site.category === 'volcano'
                        ? 'bg-white'
                        : site.category === 'canyon'
                        ? 'bg-[#A7B8C8]'
                        : 'bg-[#FF6B35]'
                    }`}
                  />
                </div>

                {/* Callout Label or Selected Card */}
                {isSelected ? (
                  <div className="absolute left-7 top-1/2 -translate-y-1/2 bg-[#04121B]/95 border border-[#19303E] rounded-xl px-3 py-1.5 shadow-2xl backdrop-blur-md flex items-center gap-2.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-[#F4F7FA] leading-tight">
                        {site.name.split(' (')[0]}
                      </span>
                      <span className="text-[10px] text-[#A7B8C8]">
                        {site.mission || (site.category === 'rover' ? 'Perseverance Rover' : 'Landmark')}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#71869A]" />
                  </div>
                ) : (
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap text-[#F4F7FA] text-shadow drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {site.name.split(' (')[0]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Right Vertical Map Controls Toolbar */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="flex flex-col bg-[#04121B]/90 border border-[#19303E] rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
          {/* North Indicator */}
          <button
            onClick={() => {
              if (controlsRef.current && cameraRef.current) {
                cameraRef.current.position.set(-0.8, 0.9, 5.8);
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
                setIsAutoRotating(true);
              }
            }}
            title="Reset North Orientation"
            className="p-2.5 text-[#F4F7FA] hover:bg-[#081925] border-b border-[#19303E] flex items-center justify-center transition-colors"
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#FF6B35] leading-none mb-0.5">N</span>
              <div className="w-0 h-0 border-x-4 border-x-transparent border-b-6 border-b-[#FF6B35]" />
            </div>
          </button>

          {/* Zoom In */}
          <button
            onClick={() => {
              if (cameraRef.current && controlsRef.current) {
                cameraRef.current.position.multiplyScalar(0.85);
                controlsRef.current.update();
              }
            }}
            title="Zoom In"
            className="p-2.5 text-[#F4F7FA] hover:bg-[#081925] border-b border-[#19303E] transition-colors flex items-center justify-center"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => {
              if (cameraRef.current && controlsRef.current) {
                cameraRef.current.position.multiplyScalar(1.15);
                controlsRef.current.update();
              }
            }}
            title="Zoom Out"
            className="p-2.5 text-[#F4F7FA] hover:bg-[#081925] border-b border-[#19303E] transition-colors flex items-center justify-center"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Recenter */}
          <button
            onClick={() => {
              if (controlsRef.current && cameraRef.current) {
                cameraRef.current.position.set(-0.8, 0.9, 5.8);
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
              }
            }}
            title="Recenter Globe"
            className="p-2.5 text-[#F4F7FA] hover:bg-[#081925] border-b border-[#19303E] transition-colors flex items-center justify-center"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Auto-Rotation Toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title={isAutoRotating ? 'Pause Rotation' : 'Auto-Rotate'}
            className="p-2.5 text-[#F4F7FA] hover:bg-[#081925] transition-colors flex items-center justify-center"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Lower-Left: Geographic Scale Bar matching reference */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="bg-[#04121B]/85 border border-[#19303E] px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-md flex flex-col gap-0.5">
          <div className="flex justify-between text-[9px] text-[#A7B8C8] font-mono w-40">
            <span>0</span>
            <span>500</span>
            <span>1,000 km</span>
          </div>
          <div className="w-40 h-1.5 border-b-2 border-l-2 border-r-2 border-[#FF6B35] relative">
            <div className="absolute left-1/2 top-0 w-0.5 h-1.5 bg-[#FF6B35]" />
          </div>
        </div>
      </div>

      {/* 6. Lower-Right: Coordinates Readout Pill matching reference */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
        <div className="bg-[#04121B]/90 border border-[#19303E] rounded-lg px-3 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-3 font-mono text-[11px] text-[#A7B8C8]">
          <span>Lat: <strong className="text-[#F4F7FA]">{activeLat.toFixed(2)}° {activeLat >= 0 ? 'N' : 'S'}</strong></span>
          <span className="text-[#19303E]">|</span>
          <span>Lon: <strong className="text-[#F4F7FA]">{activeLng.toFixed(2)}° {activeLng >= 0 ? 'E' : 'W'}</strong></span>
          <span className="text-[#19303E]">|</span>
          <span>Elev: <strong className="text-[#F4F7FA]">{formatElevation(activeElev)}</strong></span>
        </div>
      </div>
    </div>
  );
};
