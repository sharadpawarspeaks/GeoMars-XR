import {
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  Vector3,
  BoxGeometry
} from '@iwsdk/core';
import type { MarsSite } from '../types/mars';
import { estimateMolaElevation } from '../utils/marsMath';

export function latLngToVector3(lat: number, lng: number, radius: number): Vector3 {
  const phi = (lat * Math.PI) / 180;
  const theta = (lng * Math.PI) / 180;

  const x = radius * Math.cos(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi);
  const z = -radius * Math.cos(phi) * Math.sin(theta);

  return new Vector3(x, y, z);
}

export function vector3ToLatLng(v: Vector3): { lat: number; lng: number } {
  const norm = v.clone().normalize();
  const lat = Math.asin(Math.max(-1, Math.min(1, norm.y))) * (180 / Math.PI);
  const lng = Math.atan2(-norm.z, norm.x) * (180 / Math.PI);
  return { lat, lng };
}

export const AtmosphereShader = {
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
      float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 2.9);
      vec3 atmosphereColor = mix(vec3(1.0, 0.44, 0.2), vec3(0.35, 0.65, 1.0), 0.16);
      gl_FragColor = vec4(atmosphereColor, fresnel * 0.85);
    }
  `
};

/**
 * Generates an offline-safe procedural Mars equirectangular fallback texture
 * used only if local/remote NASA imagery fails to load.
 */
export function createProceduralMarsFallbackTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#e8e2dc');
    grad.addColorStop(0.12, '#a64d2b');
    grad.addColorStop(0.5, '#c45b33');
    grad.addColorStop(0.88, '#913c20');
    grad.addColorStop(1, '#e8e2dc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle albedo bands & craters
    ctx.fillStyle = 'rgba(72, 26, 14, 0.28)';
    for (let i = 0; i < 45; i++) {
      const x = ((i * 97) % 512);
      const y = 35 + ((i * 53) % 186);
      const r = 6 + (i % 18);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/**
 * Creates a sculpted 3D local Martian terrain mesh centered on a site or coordinate.
 * Uses deterministic MOLA-anchored elevation + local geomorphological relief so users
 * can zoom from planetary orbit down to a 3D surface diorama.
 */
export function createLocalTerrainDiorama(
  centerLat: number,
  centerLng: number,
  site: MarsSite | null,
  layerTexture: Texture | null,
  routeWaypoints: [number, number][] = []
): Group {
  const group = new Group();
  group.name = 'LocalTerrainDiorama';

  const size = 0.88;
  const segments = 56;
  const spanDeg = 7.5; // ~440 km local planetary swath

  const geom = new PlaneGeometry(size, size, segments, segments);
  geom.rotateX(-Math.PI / 2);

  const pos = geom.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const uvAttr = geom.attributes.uv;

  // Sample elevations to normalize vertical relief nicely for 3D inspection
  const elevSamples: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const localLng = centerLng + (x / size) * spanDeg;
    const localLat = centerLat - (z / size) * spanDeg;

    let elev = estimateMolaElevation(localLat, localLng);
    // Add crisp deterministic local crater / canyon micro-relief
    const distFromCenter = Math.hypot(x, z) / (size * 0.5);
    if (site?.category === 'volcano') {
      elev += Math.max(0, 1 - distFromCenter) * 2800;
    } else if (site?.category === 'canyon' || site?.category === 'delta') {
      const valley = Math.exp(-Math.pow(z * 5.2, 2)) * 1800;
      elev -= valley;
    } else if (site?.category === 'crater' || site?.category === 'rover') {
      // Crater bowl + rim ring
      const rim = Math.exp(-Math.pow((distFromCenter - 0.52) * 5.5, 2)) * 950;
      const bowl = Math.max(0, 1 - Math.pow(distFromCenter / 0.48, 2)) * -700;
      elev += rim + bowl;
    }

    const micro =
      Math.sin(localLat * 2.7 + localLng * 1.9) * 140 +
      Math.cos(localLat * 5.1 - localLng * 4.2) * 75;
    elevSamples.push(elev + micro);
  }

  const minE = Math.min(...elevSamples);
  const maxE = Math.max(...elevSamples);
  const range = Math.max(400, maxE - minE);

  const cLow = new Color(0x6e2b18);
  const cMid = new Color(0xc75c32);
  const cHigh = new Color(0xf0a875);
  const tmpColor = new Color();

  for (let i = 0; i < pos.count; i++) {
    const normH = (elevSamples[i] - minE) / range;
    const y = normH * 0.14;
    pos.setY(i, y);

    // Map UV around target region of planetary equirectangular texture
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const localLng = centerLng + (x / size) * spanDeg;
    const localLat = centerLat - (z / size) * spanDeg;
    const u = ((localLng + 180) % 360) / 360;
    const v = (localLat + 90) / 180;
    uvAttr.setXY(i, Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)));

    if (normH < 0.5) {
      tmpColor.lerpColors(cLow, cMid, normH * 2);
    } else {
      tmpColor.lerpColors(cMid, cHigh, (normH - 0.5) * 2);
    }
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  geom.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geom.computeVertexNormals();

  const terrainMat = new MeshStandardMaterial({
    map: layerTexture ?? null,
    vertexColors: !layerTexture,
    roughness: 0.88,
    metalness: 0.05
  });
  const terrainMesh = new Mesh(geom, terrainMat);
  terrainMesh.name = 'LocalTerrainSurface';
  group.add(terrainMesh);

  // Holographic survey frame pedestal under the terrain slab
  const baseRingGeom = new RingGeometry(0.49, 0.515, 64);
  baseRingGeom.rotateX(-Math.PI / 2);
  const baseRingMat = new MeshBasicMaterial({
    color: 0xff6b35,
    transparent: true,
    opacity: 0.55,
    side: DoubleSide
  });
  const baseRing = new Mesh(baseRingGeom, baseRingMat);
  baseRing.position.y = -0.025;
  group.add(baseRing);

  // If active route waypoints fall near this region, draw local ribbon markers
  if (routeWaypoints.length > 1) {
    const localPts: Vector3[] = [];
    for (const [wLng, wLat] of routeWaypoints) {
      const dx = ((wLng - centerLng) / spanDeg) * size;
      const dz = -((wLat - centerLat) / spanDeg) * size;
      if (Math.abs(dx) <= size * 0.48 && Math.abs(dz) <= size * 0.48) {
        localPts.push(new Vector3(dx, 0.085, dz));
      }
    }
    if (localPts.length >= 2) {
      const lineGeom = new BufferGeometry().setFromPoints(localPts);
      const lineMat = new MeshBasicMaterial({ color: 0x35c98a });
      // Represent route segments via thin dots/beacons for crisp WebGL visibility
      for (const p of localPts) {
        const dot = new Mesh(
          new SphereGeometry(0.008, 8, 8),
          new MeshBasicMaterial({ color: 0x35c98a })
        );
        dot.position.copy(p);
        group.add(dot);
      }
      lineGeom.dispose();
      lineMat.dispose();
    }
  }

  return group;
}

/**
 * Lightweight 3D Mars Perseverance-class Rover model (~14 meshes, Quest 3 friendly).
 */
export function createMiniRoverMesh(scale = 1): Group {
  const rover = new Group();
  rover.name = 'MarsRoverModel';

  const bodyMat = new MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45, metalness: 0.4 });
  const darkMat = new MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.5 });
  const goldMat = new MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.7 });
  const accentMat = new MeshStandardMaterial({ color: 0xff6b35, roughness: 0.5, metalness: 0.3 });

  // Main warm electronics box (chassis)
  const body = new Mesh(new BoxGeometry(0.11, 0.045, 0.15), bodyMat);
  body.position.y = 0.05;
  rover.add(body);

  // MMRTG rear power fin cylinder
  const rtg = new Mesh(new CylinderGeometry(0.018, 0.022, 0.06, 12), accentMat);
  rtg.rotation.x = Math.PI / 3;
  rtg.position.set(0, 0.06, 0.085);
  rover.add(rtg);

  // Remote sensing mast + Mastcam-Z head
  const mast = new Mesh(new CylinderGeometry(0.007, 0.009, 0.085, 8), goldMat);
  mast.position.set(0.022, 0.105, -0.04);
  rover.add(mast);

  const head = new Mesh(new BoxGeometry(0.042, 0.022, 0.028), bodyMat);
  head.position.set(0.022, 0.15, -0.045);
  rover.add(head);

  const lens = new Mesh(
    new CylinderGeometry(0.007, 0.007, 0.008, 10),
    new MeshBasicMaterial({ color: 0x338bff })
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0.022, 0.15, -0.06);
  rover.add(lens);

  // 6 Rocker-Bogie Wheels
  const wheelGeom = new CylinderGeometry(0.019, 0.019, 0.016, 14);
  wheelGeom.rotateZ(Math.PI / 2);
  const wheelPositions: [number, number, number][] = [
    [-0.072, 0.02, -0.058],
    [0.072, 0.02, -0.058],
    [-0.072, 0.02, 0.0],
    [0.072, 0.02, 0.0],
    [-0.072, 0.02, 0.058],
    [0.072, 0.02, 0.058]
  ];
  for (const [wx, wy, wz] of wheelPositions) {
    const wheel = new Mesh(wheelGeom, darkMat);
    wheel.position.set(wx, wy, wz);
    rover.add(wheel);
  }

  rover.scale.setScalar(scale);
  return rover;
}
