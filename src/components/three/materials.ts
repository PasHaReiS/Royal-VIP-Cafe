import * as THREE from 'three';

// Procedural Canvas Texture Generators for Wood Grain, Mother of Pearl, and Marble
function createWoodTexture(color1: string, color2: string, rings = 20): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle concentric wood grain rings
  ctx.strokeStyle = color2;
  ctx.lineWidth = 1.8;
  for (let i = 0; i < rings; i++) {
    ctx.beginPath();
    const r = i * (512 / rings) + Math.random() * 8;
    ctx.arc(256, 120, r, 0, Math.PI * 2);
    ctx.globalAlpha = 0.25 + Math.random() * 0.2;
    ctx.stroke();
  }

  // Fine longitudinal fibers
  ctx.globalAlpha = 0.12;
  for (let x = 0; x < 512; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(x * 0.05) * 5, 0);
    ctx.lineTo(x + Math.cos(x * 0.05) * 5, 512);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export interface BoardMaterials {
  lightSquare: THREE.MeshStandardMaterial;
  darkSquare: THREE.MeshStandardMaterial;
  borderWood: THREE.MeshStandardMaterial;
  cornerBrass: THREE.MeshStandardMaterial;
  whitePiece: THREE.MeshStandardMaterial;
  blackPiece: THREE.MeshStandardMaterial;
  goldCrown: THREE.MeshStandardMaterial;
  hoverHighlight: THREE.MeshBasicMaterial;
  legalTargetPad: THREE.MeshBasicMaterial;
  captureTargetPad: THREE.MeshBasicMaterial;
  selectedRing: THREE.MeshBasicMaterial;
}

export function createThemeMaterials(theme: 'masif-ceviz' | 'osmanli-sedef' | 'mermer-oniks'): BoardMaterials {
  const goldCrown = new THREE.MeshStandardMaterial({
    color: '#eab308',
    metalness: 0.85,
    roughness: 0.2,
    envMapIntensity: 1.2,
  });

  const cornerBrass = new THREE.MeshStandardMaterial({
    color: '#d97706',
    metalness: 0.8,
    roughness: 0.3,
  });

  const hoverHighlight = new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });

  const legalTargetPad = new THREE.MeshBasicMaterial({
    color: '#f59e0b',
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });

  const captureTargetPad = new THREE.MeshBasicMaterial({
    color: '#ef4444',
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });

  const selectedRing = new THREE.MeshBasicMaterial({
    color: '#eab308',
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });

  if (theme === 'osmanli-sedef') {
    // Mother of Pearl (White) vs Imperial Ebony (Black)
    const whitePiece = new THREE.MeshStandardMaterial({
      color: '#fdfbf7',
      roughness: 0.25,
      metalness: 0.15,
    });
    const blackPiece = new THREE.MeshStandardMaterial({
      color: '#1a1412',
      roughness: 0.35,
      metalness: 0.2,
    });
    const lightSquare = new THREE.MeshStandardMaterial({
      color: '#ede3d1',
      roughness: 0.3,
      metalness: 0.1,
    });
    const darkSquare = new THREE.MeshStandardMaterial({
      color: '#281c15',
      roughness: 0.4,
      metalness: 0.1,
    });
    const borderWood = new THREE.MeshStandardMaterial({
      color: '#180f0a',
      roughness: 0.45,
      metalness: 0.15,
    });
    return {
      lightSquare,
      darkSquare,
      borderWood,
      cornerBrass,
      whitePiece,
      blackPiece,
      goldCrown,
      hoverHighlight,
      legalTargetPad,
      captureTargetPad,
      selectedRing,
    };
  }

  if (theme === 'mermer-oniks') {
    // Polished Carrara Marble vs Deep Onyx
    const whitePiece = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.18,
      metalness: 0.1,
    });
    const blackPiece = new THREE.MeshStandardMaterial({
      color: '#090d16',
      roughness: 0.2,
      metalness: 0.15,
    });
    const lightSquare = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.2,
      metalness: 0.05,
    });
    const darkSquare = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.25,
      metalness: 0.05,
    });
    const borderWood = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.3,
      metalness: 0.2,
    });
    return {
      lightSquare,
      darkSquare,
      borderWood,
      cornerBrass,
      whitePiece,
      blackPiece,
      goldCrown,
      hoverHighlight,
      legalTargetPad,
      captureTargetPad,
      selectedRing,
    };
  }

  // Default: Masif Ceviz & Fildişi Şimşir (Turned Anatolian Walnut & Boxwood)
  const lightWoodTex = createWoodTexture('#f6ecd5', '#dfc499');
  const darkWoodTex = createWoodTexture('#452312', '#220e06');
  const borderTex = createWoodTexture('#2e150b', '#130602');

  const whitePiece = new THREE.MeshStandardMaterial({
    map: lightWoodTex,
    color: '#fffef5',
    roughness: 0.35,
    metalness: 0.08,
  });

  const blackPiece = new THREE.MeshStandardMaterial({
    map: darkWoodTex,
    color: '#4e2814',
    roughness: 0.4,
    metalness: 0.08,
  });

  const lightSquare = new THREE.MeshStandardMaterial({
    map: lightWoodTex,
    color: '#edd8b4',
    roughness: 0.45,
  });

  const darkSquare = new THREE.MeshStandardMaterial({
    map: darkWoodTex,
    color: '#5c321b',
    roughness: 0.5,
  });

  const borderWood = new THREE.MeshStandardMaterial({
    map: borderTex,
    color: '#2a140b',
    roughness: 0.55,
  });

  return {
    lightSquare,
    darkSquare,
    borderWood,
    cornerBrass,
    whitePiece,
    blackPiece,
    goldCrown,
    hoverHighlight,
    legalTargetPad,
    captureTargetPad,
    selectedRing,
  };
}
