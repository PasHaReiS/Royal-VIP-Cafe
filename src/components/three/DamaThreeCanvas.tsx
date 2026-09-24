import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DamaPiece, DamaMove, DamaBoardTheme, DamaViewMode, DamaColor } from '../../types/dama';
import { createCheckerGeometry, createKingCheckerGroup } from './damaGeometries';
import { createThemeMaterials, BoardMaterials } from './materials';

interface DamaThreeCanvasProps {
  board: (DamaPiece | null)[][];
  selectedPiece: DamaPiece | null;
  legalMoves: DamaMove[];
  mandatoryCaptures: { row: number; col: number }[];
  lastMove: { fromRow: number; fromCol: number; toRow: number; toCol: number } | null;
  theme: DamaBoardTheme;
  viewMode: DamaViewMode;
  currentTurn: DamaColor;
  isPlayerTurn: boolean;
  onSquareClick: (r: number, c: number) => void;
}

export const DamaThreeCanvas: React.FC<DamaThreeCanvasProps> = ({
  board,
  selectedPiece,
  legalMoves,
  mandatoryCaptures,
  lastMove,
  theme,
  viewMode,
  currentTurn,
  isPlayerTurn,
  onSquareClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cursorStyle, setCursorStyle] = useState<'default' | 'grab' | 'grabbing' | 'pointer'>('default');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const boardGroupRef = useRef<THREE.Group | null>(null);
  const piecesGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<BoardMaterials | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(-100, -100));
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const hoveredTileRef = useRef<{ row: number; col: number } | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const viewModeRef = useRef<DamaViewMode>(viewMode);
  viewModeRef.current = viewMode;
  const zoomFactorRef = useRef<number>(1.0);
  const [zoomDisplay, setZoomDisplay] = useState<number>(100);

  // Target camera positions for each view mode with generous framing so the entire dama board is 100% visible
  const getCameraTarget = (mode: DamaViewMode) => {
    switch (mode) {
      case '3d-isometric':
        // High angle isometric with generous margin, sees all 4 wooden borders
        return { pos: new THREE.Vector3(0, 14.5, 8.5), look: new THREE.Vector3(0, 0, 0), fov: 42 };
      case '3d-cinematic':
        // Cinematic eye-level showing thick checkers while fully keeping back row in view
        return { pos: new THREE.Vector3(0, 8.0, 11.2), look: new THREE.Vector3(0, 0.6, 0.3), fov: 48 };
      case '2d-top':
        // Completely flat top-down tactical view showing all 64 squares & board frame
        return { pos: new THREE.Vector3(0, 15.5, 0.001), look: new THREE.Vector3(0, 0, 0), fov: 44 };
      case '3d-perspective':
      default:
        // Standard Turkish coffeehouse table perspective: fully shows Rank 1 to Rank 8 and board edges
        return { pos: new THREE.Vector3(0, 11.6, 10.2), look: new THREE.Vector3(0, 0.2, 0.1), fov: 46 };
    }
  };

  const coordsToPos = (r: number, c: number) => {
    return {
      x: c - 3.5,
      y: 0.25,
      z: r - 3.5,
    };
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camTarget = getCameraTarget(viewMode);
    const camera = new THREE.PerspectiveCamera(camTarget.fov, width / height, 0.1, 100);
    camera.position.copy(camTarget.pos);
    camera.lookAt(camTarget.look);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff6ea, 1.8);
    dirLight.position.set(6, 14, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xb0c4de, 0.6);
    fillLight.position.set(-6, 8, -5);
    scene.add(fillLight);

    const mats = createThemeMaterials(theme);
    materialsRef.current = mats;

    const boardGroup = new THREE.Group();
    scene.add(boardGroup);
    boardGroupRef.current = boardGroup;

    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const piecesGroup = new THREE.Group();
    scene.add(piecesGroup);
    piecesGroupRef.current = piecesGroup;

    // 3D Wooden Slab Base
    const slabGeom = new THREE.BoxGeometry(9.6, 0.5, 9.6);
    const slabMesh = new THREE.Mesh(slabGeom, mats.borderWood);
    slabMesh.position.set(0, 0, 0);
    slabMesh.receiveShadow = true;
    slabMesh.castShadow = true;
    boardGroup.add(slabMesh);

    // Beveled Lip
    const borderGeom = new THREE.BoxGeometry(9.8, 0.54, 9.8);
    const borderMesh = new THREE.Mesh(borderGeom, mats.borderWood);
    borderMesh.position.set(0, -0.04, 0);
    boardGroup.add(borderMesh);

    // Brass Corners
    const cornerGeom = new THREE.BoxGeometry(0.8, 0.56, 0.8);
    [
      [-4.5, -4.5],
      [4.5, -4.5],
      [-4.5, 4.5],
      [4.5, 4.5],
    ].forEach(([cx, cz]) => {
      const corner = new THREE.Mesh(cornerGeom, mats.cornerBrass);
      corner.position.set(cx, 0.01, cz);
      boardGroup.add(corner);
    });

    // 64 Inlaid Tiles
    const tileGeom = new THREE.BoxGeometry(1.0, 0.05, 1.0);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isDark = (r + c) % 2 === 1;
        const tile = new THREE.Mesh(tileGeom, isDark ? mats.darkSquare : mats.lightSquare);
        const { x, z } = coordsToPos(r, c);
        tile.position.set(x, 0.25, z);
        tile.receiveShadow = true;
        tile.userData = { type: 'tile', row: r, col: c };
        boardGroup.add(tile);
      }
    }

    // Animation Loop
    let currentPos = camera.position.clone();
    let currentLook = camTarget.look.clone();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (cameraRef.current) {
        const target = getCameraTarget(viewModeRef.current);
        const adjustedPos = target.pos.clone().multiplyScalar(zoomFactorRef.current);
        currentPos.lerp(adjustedPos, 0.08);
        currentLook.lerp(target.look, 0.08);
        cameraRef.current.position.copy(currentPos);
        cameraRef.current.lookAt(currentLook);

        if (Math.abs(cameraRef.current.fov - target.fov) > 0.05) {
          cameraRef.current.fov += (target.fov - cameraRef.current.fov) * 0.08;
          cameraRef.current.updateProjectionMatrix();
        }
      }

      // Smooth float animation for selected piece (comfortable tactile height)
      if (piecesGroupRef.current) {
        piecesGroupRef.current.children.forEach((child) => {
          if (child.userData?.isSelected) {
            child.position.y = 0.25 + 0.28 + Math.sin(Date.now() * 0.005) * 0.02;
          } else if (child.userData?.isHovered) {
            child.position.y = 0.25 + 0.06;
          } else {
            child.position.y = 0.25;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Wheel Zoom Handling (Passive false to prevent scroll chaining)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.001;
      const nextZoom = THREE.MathUtils.clamp(zoomFactorRef.current + delta, 0.70, 1.45);
      zoomFactorRef.current = nextZoom;
      setZoomDisplay(Math.round((1 / nextZoom) * 100));
    };
    container.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    materialsRef.current = createThemeMaterials(theme);
  }, [theme]);

  // Re-render Checkers and Markers
  useEffect(() => {
    const piecesGroup = piecesGroupRef.current;
    const markersGroup = markersGroupRef.current;
    const mats = materialsRef.current;
    if (!piecesGroup || !markersGroup || !mats) return;

    while (piecesGroup.children.length > 0) {
      piecesGroup.remove(piecesGroup.children[0]);
    }
    while (markersGroup.children.length > 0) {
      markersGroup.remove(markersGroup.children[0]);
    }

    const buildCheckerMesh = (isWhite: boolean, isKing: boolean): THREE.Object3D => {
      const mat = isWhite ? mats.whitePiece : mats.blackPiece;
      if (isKing) {
        const kingGroup = createKingCheckerGroup(mats.goldCrown);
        kingGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            // Keep gold crown material on crown parts
            if ((child as THREE.Mesh).material !== mats.goldCrown) {
              (child as THREE.Mesh).material = mat;
            }
          }
        });
        return kingGroup;
      } else {
        const geom = createCheckerGeometry();
        const mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
      }
    };

    // Render Checkers
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        const { x, z } = coordsToPos(r, c);

        if (piece) {
          const isSelected = selectedPiece?.row === r && selectedPiece?.col === c;
          const isKing = piece.type === 'king';
          const checkerMesh = buildCheckerMesh(piece.color === 'white', isKing);

          checkerMesh.position.set(x, isSelected ? 0.25 + 0.28 : 0.25, z);
          checkerMesh.userData = {
            type: 'piece',
            row: r,
            col: c,
            color: piece.color,
            isKing,
            isSelected,
            isHovered: false,
          };
          piecesGroup.add(checkerMesh);

          // Selected Piece: Ground Ring and Soft Shadow Pad
          if (isSelected) {
            const ringGeom = new THREE.RingGeometry(0.34, 0.44, 32);
            const ringMesh = new THREE.Mesh(ringGeom, mats.selectedRing);
            ringMesh.rotation.x = -Math.PI / 2;
            ringMesh.position.set(x, 0.28, z);
            ringMesh.userData = { type: 'marker', row: r, col: c };
            markersGroup.add(ringMesh);

            const shadowGeom = new THREE.CircleGeometry(0.42, 32);
            const shadowMat = new THREE.MeshBasicMaterial({
              color: 0x000000,
              transparent: true,
              opacity: 0.45,
            });
            const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
            shadowMesh.rotation.x = -Math.PI / 2;
            shadowMesh.position.set(x, 0.275, z);
            shadowMesh.userData = { type: 'marker', row: r, col: c };
            markersGroup.add(shadowMesh);
          }

          // Mandatory Capture Warning Aura
          const isMandatory = mandatoryCaptures.some((mc) => mc.row === r && mc.col === c);
          if (isMandatory && !isSelected) {
            const mandRingGeom = new THREE.RingGeometry(0.32, 0.46, 32);
            const mandRingMesh = new THREE.Mesh(mandRingGeom, mats.captureTargetPad);
            mandRingMesh.rotation.x = -Math.PI / 2;
            mandRingMesh.position.set(x, 0.28, z);
            mandRingMesh.userData = { type: 'marker', row: r, col: c };
            markersGroup.add(mandRingMesh);
          }
        }

        // Legal Target Indicators for selected piece
        if (selectedPiece) {
          const validMovesToSquare = legalMoves.filter(
            (m) =>
              m.fromRow === selectedPiece.row &&
              m.fromCol === selectedPiece.col &&
              m.toRow === r &&
              m.toCol === c
          );

          if (validMovesToSquare.length > 0) {
            const isCapture = validMovesToSquare.some(
              (m) => (m.capturedPieces?.length || 0) > 0
            );

            const markerGeom = isCapture
              ? new THREE.RingGeometry(0.30, 0.46, 32)
              : new THREE.CylinderGeometry(0.20, 0.20, 0.08, 24);

            const markerMat = isCapture ? mats.captureTargetPad : mats.legalTargetPad;
            const markerMesh = new THREE.Mesh(markerGeom, markerMat);

            if (isCapture) {
              markerMesh.rotation.x = -Math.PI / 2;
              markerMesh.position.set(x, 0.285, z);
            } else {
              markerMesh.position.set(x, 0.30, z);
            }
            markerMesh.userData = { type: 'legalTarget', row: r, col: c };
            markersGroup.add(markerMesh);
          }
        }

        // Last Move Highlight
        if (
          lastMove &&
          ((lastMove.fromRow === r && lastMove.fromCol === c) ||
            (lastMove.toRow === r && lastMove.toCol === c))
        ) {
          const lastGeom = new THREE.RingGeometry(0.40, 0.46, 4);
          const lastMat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
          });
          const lastMesh = new THREE.Mesh(lastGeom, lastMat);
          lastMesh.rotation.x = -Math.PI / 2;
          lastMesh.rotation.z = Math.PI / 4;
          lastMesh.position.set(x, 0.28, z);
          lastMesh.userData = { type: 'marker', row: r, col: c };
          markersGroup.add(lastMesh);
        }
      }
    }
  }, [board, selectedPiece, legalMoves, mandatoryCaptures, lastMove, theme]);

  // Pointer Interaction
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    const piecesGroup = piecesGroupRef.current;
    if (!container || !camera || !piecesGroup) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseRef.current.set(x, y);

    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const targets = [
      piecesGroupRef.current,
      markersGroupRef.current,
      boardGroupRef.current,
    ].filter(Boolean) as THREE.Object3D[];
    const intersects = raycasterRef.current.intersectObjects(targets, true);

    let foundCoords: { row: number; col: number } | null = null;
    let isOverOwnPiece = false;
    let isOverLegalMove = false;

    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj && obj.userData?.row === undefined) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.row !== undefined) {
        foundCoords = { row: obj.userData.row, col: obj.userData.col };
        if (obj.userData.type === 'piece' && obj.userData.color === currentTurn && isPlayerTurn) {
          isOverOwnPiece = true;
        }
        if (selectedPiece) {
          const isLegal = legalMoves.some(
            (m) =>
              m.fromRow === selectedPiece.row &&
              m.fromCol === selectedPiece.col &&
              m.toRow === foundCoords?.row &&
              m.toCol === foundCoords?.col
          );
          if (isLegal) isOverLegalMove = true;
        }
        break;
      }
    }

    hoveredTileRef.current = foundCoords;

    piecesGroup.children.forEach((p) => {
      if (
        foundCoords &&
        p.userData?.row === foundCoords.row &&
        p.userData?.col === foundCoords.col &&
        isOverOwnPiece &&
        !p.userData.isSelected
      ) {
        p.userData.isHovered = true;
      } else {
        p.userData.isHovered = false;
      }
    });

    if (selectedPiece) {
      if (isOverLegalMove) {
        setCursorStyle('pointer');
      } else if (isOverOwnPiece) {
        setCursorStyle('grab');
      } else {
        setCursorStyle('default');
      }
    } else {
      if (isOverOwnPiece) {
        setCursorStyle('grab');
      } else {
        setCursorStyle('default');
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    if (selectedPiece && hoveredTileRef.current) {
      if (
        hoveredTileRef.current.row === selectedPiece.row &&
        hoveredTileRef.current.col === selectedPiece.col
      ) {
        setCursorStyle('grabbing');
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    const piecesGroup = piecesGroupRef.current;
    if (!container || !camera || !piecesGroup) return;

    if (pointerDownPosRef.current) {
      const dx = Math.abs(e.clientX - pointerDownPosRef.current.x);
      const dy = Math.abs(e.clientY - pointerDownPosRef.current.y);
      if (dx > 25 || dy > 25) {
        return; // Dragged/swiped camera, not an intentional tap
      }
    }

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseRef.current.set(x, y);

    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const targets = [
      piecesGroupRef.current,
      markersGroupRef.current,
      boardGroupRef.current,
    ].filter(Boolean) as THREE.Object3D[];
    const intersects = raycasterRef.current.intersectObjects(targets, true);

    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj && obj.userData?.row === undefined) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.row !== undefined) {
        onSquareClick(obj.userData.row, obj.userData.col);
        break;
      }
    }
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextZoom = Math.max(0.70, zoomFactorRef.current - 0.1);
    zoomFactorRef.current = nextZoom;
    setZoomDisplay(Math.round((1 / nextZoom) * 100));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextZoom = Math.min(1.45, zoomFactorRef.current + 0.1);
    zoomFactorRef.current = nextZoom;
    setZoomDisplay(Math.round((1 / nextZoom) * 100));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    zoomFactorRef.current = 1.0;
    setZoomDisplay(100);
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-xl">
      <div
        ref={mountRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="w-full h-full select-none touch-none overflow-hidden"
        style={{ cursor: cursorStyle }}
      />
      {/* 3D Dama Table Zoom HUD */}
      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg border border-amber-500/30 text-xs text-amber-200 z-20 shadow-xl pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Masa Yakınlaştır (Tekerlek veya +)"
          className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800/80 hover:bg-amber-600/50 text-white font-bold cursor-pointer transition-colors"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          title="Standart Masaya Dön (%100)"
          className="px-1.5 h-6 flex items-center justify-center rounded bg-zinc-800/80 hover:bg-amber-600/50 text-[10px] font-mono font-bold text-amber-300 cursor-pointer transition-colors"
        >
          %{zoomDisplay}
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Masayı Genişlet / Uzaklaştır (Tekerlek veya -)"
          className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800/80 hover:bg-amber-600/50 text-white font-bold cursor-pointer transition-colors"
        >
          -
        </button>
      </div>
    </div>
  );
};
