'use client';

/**
 * Cell selection component using geometric calculation
 * Instead of per-cell hit boxes, calculates which cell the ray is pointing at
 * This allows selecting ANY cell including the center one
 * @module components/game/CellSelector
 */

import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CELL_POSITIONS,
  CELL_SIZE,
  COLORS,
  ANIMATION_CONFIG,
  PIECE_GEOMETRY,
  TOTAL_CELLS,
} from '@/lib/constants';
import { useAudio } from '@/hooks/useAudio';
import type { CellState, Player } from '@/types/game';

interface CellSelectorProps {
  board: CellState[];
  isInteractive: boolean;
  currentPlayer: Player;
  onCellClick: (index: number) => void;
}

// Pre-allocate reusable vectors to avoid GC pressure in render loop
// These are module-level singletons - safe because useFrame is single-threaded
const tempRayPoint = new THREE.Vector3();
const tempCellPos = new THREE.Vector3();

// Raycast configuration
const RAYCAST_CONFIG = {
  START_DISTANCE: 5,    // Start sampling 5 units from camera (skip near plane)
  MAX_DISTANCE: 30,     // Maximum ray distance to sample
  SAMPLE_STEP: 0.5,     // Sample every 0.5 units for precision
  HIT_TOLERANCE: 0.6,   // Accept hits within 60% of cell size
} as const;

/**
 * Find the closest empty cell to a point in 3D space
 * Uses pre-allocated vector to avoid garbage collection
 */
function findClosestCell(
  point: THREE.Vector3,
  board: CellState[]
): number | null {
  let closestIndex: number | null = null;
  let closestDistance = Infinity;
  const hitThreshold = CELL_SIZE * RAYCAST_CONFIG.HIT_TOLERANCE;

  for (let i = 0; i < TOTAL_CELLS; i++) {
    // Skip non-empty cells
    if (board[i] !== 'empty') continue;

    const cellPos = CELL_POSITIONS[i];
    if (!cellPos) continue;

    // Reuse tempCellPos instead of creating new Vector3
    tempCellPos.set(cellPos[0], cellPos[1], cellPos[2]);
    const distance = point.distanceTo(tempCellPos);

    // Only consider cells within hit threshold
    if (distance < hitThreshold && distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  }

  return closestIndex;
}

/**
 * Ghost X preview shown at hovered cell
 */
function GhostXPreview({
  position,
  visible,
}: {
  position: [number, number, number];
  visible: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  const { cylinderRadius, cylinderLength, segments, rotationAngle } = PIECE_GEOMETRY.x;
  const color = new THREE.Color(COLORS.cyan);

  useFrame(() => {
    const targetOpacity = visible ? ANIMATION_CONFIG.hoverOpacity : 0;
    for (const mat of materialsRef.current) {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.2);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={0.8}>
      <mesh rotation={[0, 0, rotationAngle]}>
        <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderLength, segments]} />
        <meshStandardMaterial
          ref={(mat) => { if (mat) materialsRef.current[0] = mat; }}
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[0, 0, -rotationAngle]}>
        <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderLength, segments]} />
        <meshStandardMaterial
          ref={(mat) => { if (mat) materialsRef.current[1] = mat; }}
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Ghost O preview shown at hovered cell
 */
function GhostOPreview({
  position,
  visible,
}: {
  position: [number, number, number];
  visible: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const { torusRadius, tubeRadius, radialSegments, tubularSegments } = PIECE_GEOMETRY.o;
  const color = new THREE.Color(COLORS.magenta);

  useFrame(() => {
    if (!materialRef.current) return;
    const targetOpacity = visible ? ANIMATION_CONFIG.hoverOpacity : 0;
    materialRef.current.opacity = THREE.MathUtils.lerp(
      materialRef.current.opacity,
      targetOpacity,
      0.2
    );
  });

  useEffect(() => {
    if (meshRef.current) {
      materialRef.current = meshRef.current.material as THREE.MeshStandardMaterial;
    }
  }, []);

  return (
    <mesh ref={meshRef} position={position} rotation={[Math.PI / 2, 0, 0]} scale={0.8}>
      <torusGeometry args={[torusRadius, tubeRadius, radialSegments, tubularSegments]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Cell selector component
 * Uses an invisible bounding box and calculates which cell the ray hits
 */
export function CellSelector({
  board,
  isInteractive,
  currentPlayer,
  onCellClick,
}: CellSelectorProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const prevHoveredCell = useRef<number | null>(null);
  const { raycaster, camera, pointer } = useThree();
  const { playSound } = useAudio();

  // Calculate bounding box that contains all cells
  const boundingBox = useMemo(() => {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const pos of CELL_POSITIONS) {
      minX = Math.min(minX, pos[0]);
      minY = Math.min(minY, pos[1]);
      minZ = Math.min(minZ, pos[2]);
      maxX = Math.max(maxX, pos[0]);
      maxY = Math.max(maxY, pos[1]);
      maxZ = Math.max(maxZ, pos[2]);
    }

    const padding = CELL_SIZE * RAYCAST_CONFIG.HIT_TOLERANCE;
    return {
      center: [
        (minX + maxX) / 2,
        (minY + maxY) / 2,
        (minZ + maxZ) / 2,
      ] as [number, number, number],
      size: [
        maxX - minX + padding * 2,
        maxY - minY + padding * 2,
        maxZ - minZ + padding * 2,
      ] as [number, number, number],
    };
  }, []);

  // Manage cursor via useEffect (not in render loop)
  useEffect(() => {
    document.body.style.cursor = hoveredCell !== null && isInteractive ? 'pointer' : 'default';
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [hoveredCell, isInteractive]);

  // Update hovered cell on each frame
  useFrame(() => {
    if (!isInteractive) {
      if (hoveredCell !== null) setHoveredCell(null);
      return;
    }

    // Cast ray from camera through pointer
    raycaster.setFromCamera(pointer, camera);
    const ray = raycaster.ray;

    // Extract bounds for checking
    const [cx, cy, cz] = boundingBox.center;
    const [sx, sy, sz] = boundingBox.size;
    const halfSX = sx / 2;
    const halfSY = sy / 2;
    const halfSZ = sz / 2;

    // Sample points along the ray - reuse tempRayPoint
    let bestCell: number | null = null;
    let bestDistance = Infinity;

    for (
      let rayDistance = RAYCAST_CONFIG.START_DISTANCE;
      rayDistance < RAYCAST_CONFIG.MAX_DISTANCE;
      rayDistance += RAYCAST_CONFIG.SAMPLE_STEP
    ) {
      // Reuse tempRayPoint instead of creating new vectors
      tempRayPoint.copy(ray.origin).addScaledVector(ray.direction, rayDistance);

      // Check if point is within grid bounds
      if (
        Math.abs(tempRayPoint.x - cx) > halfSX ||
        Math.abs(tempRayPoint.y - cy) > halfSY ||
        Math.abs(tempRayPoint.z - cz) > halfSZ
      ) {
        continue;
      }

      const cell = findClosestCell(tempRayPoint, board);
      if (cell !== null) {
        const cellPos = CELL_POSITIONS[cell];
        if (cellPos) {
          // Reuse tempCellPos for distance calculation
          tempCellPos.set(cellPos[0], cellPos[1], cellPos[2]);
          const dist = tempRayPoint.distanceTo(tempCellPos);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestCell = cell;
          }
        }
      }
    }

    // Play hover sound when hovering a new cell
    if (bestCell !== prevHoveredCell.current && bestCell !== null) {
      playSound('hover');
    }
    prevHoveredCell.current = bestCell;
    setHoveredCell(bestCell);
  });

  // Handle click
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (hoveredCell !== null && isInteractive) {
        playSound('place');
        onCellClick(hoveredCell);
      }
    },
    [hoveredCell, isInteractive, onCellClick, playSound]
  );

  // Get hovered cell position
  const hoveredPosition = useMemo((): [number, number, number] => {
    if (hoveredCell === null) {
      return [0, 0, 0];
    }
    const pos = CELL_POSITIONS[hoveredCell];
    if (!pos) {
      return [0, 0, 0];
    }
    return [pos[0], pos[1], pos[2]];
  }, [hoveredCell]);

  return (
    <group>
      {/* Invisible hit box covering entire grid */}
      <mesh
        position={boundingBox.center}
        onClick={handleClick}
        visible={false}
      >
        <boxGeometry args={boundingBox.size} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Ghost preview at hovered cell - shows actual symbol */}
      {currentPlayer === 'X' ? (
        <GhostXPreview
          position={hoveredPosition}
          visible={hoveredCell !== null}
        />
      ) : (
        <GhostOPreview
          position={hoveredPosition}
          visible={hoveredCell !== null}
        />
      )}
    </group>
  );
}

export default CellSelector;
