import {
  BoxGeometry,
  CircleGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RingGeometry,
  SphereGeometry,
  Texture,
  TorusGeometry
} from '@iwsdk/core';
import { createMiniRoverMesh } from './marsGeo';
import type { ScienceModelDescriptor } from '../data/scienceLabData';

export type ScienceModelId = ScienceModelDescriptor['id'];

/**
 * Builds an interactive 3D educational model for the GeoMars XR Science Lab.
 * Lightweight draw-call footprint tuned for Meta Quest 3 / 3S.
 */
export function buildScienceLabModel(
  modelId: ScienceModelId,
  marsTexture: Texture | null
): Group {
  const root = new Group();
  root.name = `ScienceModel_${modelId}`;

  // Subtle holographic plinth disc below every lab model
  const plinth = new Mesh(
    new RingGeometry(0.14, 0.17, 48),
    new MeshBasicMaterial({
      color: 0x338bff,
      transparent: true,
      opacity: 0.45,
      side: DoubleSide
    })
  );
  plinth.rotation.x = -Math.PI / 2;
  plinth.position.y = -0.18;
  root.add(plinth);

  if (modelId === 'mars-interior') {
    // 3/4 outer crust hemisphere shell
    const crustGeom = new SphereGeometry(0.16, 40, 32, 0, Math.PI * 1.5, 0, Math.PI);
    const crustMat = new MeshStandardMaterial({
      map: marsTexture ?? null,
      color: marsTexture ? 0xffffff : 0xb84a27,
      roughness: 0.85,
      side: DoubleSide
    });
    const crust = new Mesh(crustGeom, crustMat);
    root.add(crust);

    // Silicate mantle layer (middle)
    const mantleGeom = new SphereGeometry(0.132, 32, 24, 0, Math.PI * 1.68, 0, Math.PI);
    const mantleMat = new MeshStandardMaterial({
      color: 0xd96b27,
      roughness: 0.65,
      side: DoubleSide
    });
    const mantle = new Mesh(mantleGeom, mantleMat);
    root.add(mantle);

    // Liquid iron-nickel-sulfur core (~1,830 km radius = ~54% of Mars radius)
    const coreGeom = new SphereGeometry(0.086, 28, 22);
    const coreMat = new MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xff6b35,
      emissiveIntensity: 0.75,
      roughness: 0.3,
      metalness: 0.5
    });
    const core = new Mesh(coreGeom, coreMat);
    root.add(core);

    // Cutaway cross-section face caps
    const capMat = new MeshStandardMaterial({
      color: 0x8f3418,
      roughness: 0.8,
      side: DoubleSide
    });
    const cap1 = new Mesh(new CircleGeometry(0.16, 32, -Math.PI / 2, Math.PI), capMat);
    cap1.rotation.y = Math.PI / 2;
    root.add(cap1);

    const cap2 = new Mesh(new CircleGeometry(0.16, 32, -Math.PI / 2, Math.PI), capMat);
    cap2.rotation.y = Math.PI;
    root.add(cap2);

    return root;
  }

  if (modelId === 'atmosphere-shell') {
    const core = new Mesh(
      new SphereGeometry(0.125, 36, 28),
      new MeshStandardMaterial({
        map: marsTexture || undefined,
        color: marsTexture ? 0xffffff : 0xc0522b,
        roughness: 0.88
      })
    );
    root.add(core);

    // Lower dusty CO2 troposphere
    const dustShell = new Mesh(
      new SphereGeometry(0.145, 32, 24),
      new MeshBasicMaterial({
        color: 0xff7b47,
        transparent: true,
        opacity: 0.24,
        depthWrite: false
      })
    );
    root.add(dustShell);

    // Upper tenuous exosphere / solar wind boundary
    const upperShell = new Mesh(
      new SphereGeometry(0.172, 32, 24),
      new MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.16,
        depthWrite: false
      })
    );
    root.add(upperShell);

    // Orbital circulation belt ring
    const ring = new Mesh(
      new TorusGeometry(0.195, 0.0025, 8, 64),
      new MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
    );
    ring.rotation.x = Math.PI * 0.42;
    root.add(ring);

    return root;
  }

  if (modelId === 'perseverance-rover') {
    const rover = createMiniRoverMesh(1.9);
    rover.position.y = -0.11;
    root.add(rover);

    // Sample core titanium tube accent beside rover
    const sampleTube = new Mesh(
      new BoxGeometry(0.025, 0.025, 0.09),
      new MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.25 })
    );
    sampleTube.position.set(0.11, -0.13, 0.06);
    root.add(sampleTube);

    return root;
  }

  // 'subsurface-ice': Stratified Martian Cryosphere Block
  const regolithTop = new Mesh(
    new BoxGeometry(0.28, 0.045, 0.28),
    new MeshStandardMaterial({ color: 0xb44c29, roughness: 0.92 })
  );
  regolithTop.position.y = 0.045;
  root.add(regolithTop);

  const iceLayer = new Mesh(
    new BoxGeometry(0.278, 0.085, 0.278),
    new MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.86
    })
  );
  iceLayer.position.y = -0.02;
  root.add(iceLayer);

  const bedrockBase = new Mesh(
    new BoxGeometry(0.282, 0.055, 0.282),
    new MeshStandardMaterial({ color: 0x334155, roughness: 0.88 })
  );
  bedrockBase.position.y = -0.09;
  root.add(bedrockBase);

  return root;
}

