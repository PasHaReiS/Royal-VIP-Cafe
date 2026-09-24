import * as THREE from 'three';

// Generates real 3D cylindrical wooden checkers with physical thickness and chamfers
// Base is at Y = 0.

export function createCheckerGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  // Bottom face
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.37, 0));
  // Bottom bevel
  points.push(new THREE.Vector2(0.39, 0.03));
  // Vertical cylindrical side wall (thick som ahşap gövde)
  points.push(new THREE.Vector2(0.40, 0.10));
  points.push(new THREE.Vector2(0.40, 0.15));
  // Top chamfer (pah kırılmış üst köşe)
  points.push(new THREE.Vector2(0.37, 0.19));
  points.push(new THREE.Vector2(0.34, 0.21));
  // Concentric lathe groove 1
  points.push(new THREE.Vector2(0.28, 0.19));
  points.push(new THREE.Vector2(0.25, 0.21));
  // Concentric lathe groove 2
  points.push(new THREE.Vector2(0.18, 0.19));
  points.push(new THREE.Vector2(0.15, 0.21));
  // Center dimple
  points.push(new THREE.Vector2(0.06, 0.20));
  points.push(new THREE.Vector2(0, 0.21));

  const geom = new THREE.LatheGeometry(points, 40);
  geom.computeVertexNormals();
  return geom;
}

export function createKingCheckerGroup(goldCrownMaterial: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  // 1. Lower Disc (Alt Pul - Tier 1)
  const lowerGeom = createCheckerGeometry();
  const lowerMesh = new THREE.Mesh(lowerGeom);
  lowerMesh.castShadow = true;
  lowerMesh.receiveShadow = true;
  group.add(lowerMesh);

  // 2. Upper Disc (Üst Pul - Tier 2, Stacked on top)
  const upperGeom = createCheckerGeometry();
  const upperMesh = new THREE.Mesh(upperGeom);
  upperMesh.position.set(0, 0.19, 0); // Sits right on the lower disc
  upperMesh.castShadow = true;
  upperMesh.receiveShadow = true;
  group.add(upperMesh);

  // 3. Embossed 3D Golden Crown on top of upper disc
  const crownGroup = new THREE.Group();
  crownGroup.position.set(0, 0.40, 0);

  // Crown base ring
  const ringGeom = new THREE.TorusGeometry(0.14, 0.02, 12, 24);
  const ringMesh = new THREE.Mesh(ringGeom, goldCrownMaterial);
  ringMesh.rotation.x = Math.PI / 2;
  crownGroup.add(ringMesh);

  // 5 Crown Points/Spikes
  const spikeGeom = new THREE.ConeGeometry(0.025, 0.08, 12);
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const spike = new THREE.Mesh(spikeGeom, goldCrownMaterial);
    spike.position.set(Math.cos(angle) * 0.14, 0.04, Math.sin(angle) * 0.14);
    crownGroup.add(spike);

    // Mini gold pearl on each spike
    const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), goldCrownMaterial);
    pearl.position.set(Math.cos(angle) * 0.14, 0.08, Math.sin(angle) * 0.14);
    crownGroup.add(pearl);
  }

  // Center royal orb
  const centerOrb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), goldCrownMaterial);
  centerOrb.position.set(0, 0.04, 0);
  crownGroup.add(centerOrb);

  crownGroup.castShadow = true;
  group.add(crownGroup);

  return group;
}
