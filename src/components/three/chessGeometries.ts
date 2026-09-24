import * as THREE from 'three';

// Generates true 3D Lathe geometries for Staunton chess pieces
// All pieces stand vertically along the Y axis with their base at Y = 0.

export function createPawnGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  // Base rim
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.34, 0));
  points.push(new THREE.Vector2(0.34, 0.04));
  points.push(new THREE.Vector2(0.31, 0.08));
  points.push(new THREE.Vector2(0.26, 0.12));
  // Lower pedestal ring
  points.push(new THREE.Vector2(0.24, 0.16));
  points.push(new THREE.Vector2(0.20, 0.20));
  // Slender waist
  points.push(new THREE.Vector2(0.14, 0.38));
  points.push(new THREE.Vector2(0.12, 0.46));
  // Neck collar
  points.push(new THREE.Vector2(0.18, 0.50));
  points.push(new THREE.Vector2(0.20, 0.54));
  points.push(new THREE.Vector2(0.13, 0.56));
  // Spherical head
  const headCenterY = 0.70;
  const headRadius = 0.16;
  for (let a = -Math.PI / 2; a <= Math.PI / 2; a += Math.PI / 10) {
    const x = Math.max(0, Math.cos(a) * headRadius);
    const y = headCenterY + Math.sin(a) * headRadius;
    points.push(new THREE.Vector2(x, y));
  }
  // Finial pip
  points.push(new THREE.Vector2(0.04, 0.88));
  points.push(new THREE.Vector2(0, 0.90));

  const geom = new THREE.LatheGeometry(points, 32);
  geom.computeVertexNormals();
  return geom;
}

export function createRookGeometry(): THREE.Group {
  const group = new THREE.Group();

  // Lathe body
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.38, 0));
  points.push(new THREE.Vector2(0.38, 0.06));
  points.push(new THREE.Vector2(0.33, 0.12));
  points.push(new THREE.Vector2(0.28, 0.18));
  // Tower shaft
  points.push(new THREE.Vector2(0.24, 0.30));
  points.push(new THREE.Vector2(0.22, 0.65));
  // Flared Cornice
  points.push(new THREE.Vector2(0.32, 0.74));
  points.push(new THREE.Vector2(0.34, 0.82));
  points.push(new THREE.Vector2(0.34, 0.96));
  // Inner hollow cavity
  points.push(new THREE.Vector2(0.24, 0.96));
  points.push(new THREE.Vector2(0.24, 0.82));
  points.push(new THREE.Vector2(0, 0.82));

  const baseGeom = new THREE.LatheGeometry(points, 32);
  baseGeom.computeVertexNormals();
  const bodyMesh = new THREE.Mesh(baseGeom);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 4 Crenellations (Burç mazgalları) on top rim
  const merlonGeom = new THREE.BoxGeometry(0.12, 0.14, 0.14);
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const merlon = new THREE.Mesh(merlonGeom);
    merlon.position.set(Math.cos(angle) * 0.28, 1.02, Math.sin(angle) * 0.28);
    merlon.rotation.y = -angle;
    merlon.castShadow = true;
    merlon.receiveShadow = true;
    group.add(merlon);
  }

  return group;
}

export function createBishopGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  // Base
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.36, 0));
  points.push(new THREE.Vector2(0.36, 0.05));
  points.push(new THREE.Vector2(0.32, 0.10));
  points.push(new THREE.Vector2(0.26, 0.16));
  // Slender column
  points.push(new THREE.Vector2(0.20, 0.24));
  points.push(new THREE.Vector2(0.14, 0.52));
  points.push(new THREE.Vector2(0.13, 0.62));
  // Collar
  points.push(new THREE.Vector2(0.22, 0.66));
  points.push(new THREE.Vector2(0.24, 0.70));
  points.push(new THREE.Vector2(0.14, 0.72));
  // Mitre oval head
  const headCenterY = 0.94;
  for (let a = -Math.PI / 2; a <= Math.PI / 2; a += Math.PI / 12) {
    const rx = 0.18 * Math.cos(a);
    const ry = 0.26 * Math.sin(a);
    points.push(new THREE.Vector2(Math.max(0, rx), headCenterY + ry));
  }
  // Finial golden bead
  points.push(new THREE.Vector2(0.06, 1.22));
  points.push(new THREE.Vector2(0.08, 1.25));
  points.push(new THREE.Vector2(0, 1.28));

  const geom = new THREE.LatheGeometry(points, 32);
  geom.computeVertexNormals();
  return geom;
}

export function createKnightGeometry(): THREE.Group {
  const group = new THREE.Group();

  // Turned base
  const basePoints: THREE.Vector2[] = [];
  basePoints.push(new THREE.Vector2(0, 0));
  basePoints.push(new THREE.Vector2(0.37, 0));
  basePoints.push(new THREE.Vector2(0.37, 0.06));
  basePoints.push(new THREE.Vector2(0.32, 0.12));
  basePoints.push(new THREE.Vector2(0.28, 0.18));
  basePoints.push(new THREE.Vector2(0.24, 0.26));
  basePoints.push(new THREE.Vector2(0.20, 0.32));
  basePoints.push(new THREE.Vector2(0, 0.32));
  const baseGeom = new THREE.LatheGeometry(basePoints, 32);
  baseGeom.computeVertexNormals();
  const baseMesh = new THREE.Mesh(baseGeom);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Sculpted Stallion Head (Extruded 3D Profile)
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.30);
  shape.lineTo(0.18, 0.30);
  shape.bezierCurveTo(0.24, 0.45, 0.25, 0.60, 0.22, 0.75); // Arching back neck
  shape.lineTo(0.20, 0.88); // Ear base
  shape.lineTo(0.22, 0.98); // Ear tip
  shape.lineTo(0.15, 0.94); // Forehead
  shape.bezierCurveTo(0.08, 0.90, -0.05, 0.80, -0.16, 0.72); // Nose bridge
  shape.bezierCurveTo(-0.25, 0.68, -0.26, 0.58, -0.22, 0.54); // Muzzle tip
  shape.bezierCurveTo(-0.16, 0.50, -0.08, 0.55, -0.04, 0.58); // Jaw curve
  shape.bezierCurveTo(-0.02, 0.48, -0.04, 0.38, -0.06, 0.30); // Chest throat
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 4,
  };

  const headGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  headGeom.computeVertexNormals();
  headGeom.center();
  const headMesh = new THREE.Mesh(headGeom);
  headMesh.position.set(0, 0.68, 0);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  group.add(headMesh);

  return group;
}

export function createQueenGeometry(): THREE.Group {
  const group = new THREE.Group();

  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.39, 0));
  points.push(new THREE.Vector2(0.39, 0.06));
  points.push(new THREE.Vector2(0.34, 0.12));
  points.push(new THREE.Vector2(0.28, 0.20));
  // Flowing gown
  points.push(new THREE.Vector2(0.21, 0.35));
  points.push(new THREE.Vector2(0.16, 0.62));
  points.push(new THREE.Vector2(0.15, 0.75));
  // Royal collar
  points.push(new THREE.Vector2(0.24, 0.80));
  points.push(new THREE.Vector2(0.25, 0.84));
  points.push(new THREE.Vector2(0.16, 0.87));
  // Flared Coronet Cup
  points.push(new THREE.Vector2(0.26, 1.05));
  points.push(new THREE.Vector2(0.32, 1.22));
  points.push(new THREE.Vector2(0.24, 1.18));
  points.push(new THREE.Vector2(0.10, 1.15));
  points.push(new THREE.Vector2(0, 1.15));

  const bodyGeom = new THREE.LatheGeometry(points, 32);
  bodyGeom.computeVertexNormals();
  const bodyMesh = new THREE.Mesh(bodyGeom);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 8 Crown Pearls on the rim
  const pearlGeom = new THREE.SphereGeometry(0.038, 12, 12);
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const pearl = new THREE.Mesh(pearlGeom);
    pearl.position.set(Math.cos(angle) * 0.31, 1.23, Math.sin(angle) * 0.31);
    pearl.castShadow = true;
    group.add(pearl);
  }

  // Center pinnacle pearl
  const centerPearl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16));
  centerPearl.position.set(0, 1.26, 0);
  centerPearl.castShadow = true;
  group.add(centerPearl);

  return group;
}

export function createKingGeometry(): THREE.Group {
  const group = new THREE.Group();

  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.41, 0));
  points.push(new THREE.Vector2(0.41, 0.07));
  points.push(new THREE.Vector2(0.36, 0.14));
  points.push(new THREE.Vector2(0.29, 0.22));
  // Heavy imperial column
  points.push(new THREE.Vector2(0.22, 0.40));
  points.push(new THREE.Vector2(0.18, 0.68));
  points.push(new THREE.Vector2(0.17, 0.82));
  // Collar
  points.push(new THREE.Vector2(0.26, 0.88));
  points.push(new THREE.Vector2(0.27, 0.93));
  points.push(new THREE.Vector2(0.18, 0.95));
  // Arched Crown Dome
  points.push(new THREE.Vector2(0.29, 1.12));
  points.push(new THREE.Vector2(0.30, 1.26));
  points.push(new THREE.Vector2(0.22, 1.34));
  points.push(new THREE.Vector2(0.12, 1.36));
  points.push(new THREE.Vector2(0, 1.36));

  const bodyGeom = new THREE.LatheGeometry(points, 32);
  bodyGeom.computeVertexNormals();
  const bodyMesh = new THREE.Mesh(bodyGeom);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 3D Imperial Finial Cross on King's crown
  const crossGroup = new THREE.Group();
  const verticalBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.06));
  verticalBar.position.set(0, 1.48, 0);
  verticalBar.castShadow = true;
  crossGroup.add(verticalBar);

  const horizontalBar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.06));
  horizontalBar.position.set(0, 1.51, 0);
  horizontalBar.castShadow = true;
  crossGroup.add(horizontalBar);

  group.add(crossGroup);

  return group;
}
