'use client';

/**
 * Glowing 3D grid separator lines
 * Creates the classic tic-tac-toe # pattern on each layer
 * Uses warm white (~4000K) glowing lines as primary lighting
 * @module components/game/GridLines
 */

import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CELL_SPACING, LAYER_SEPARATION, CENTER_OFFSET, COLORS } from '@/lib/constants';

// Grid dimensions
const GRID_HALF_SIZE = CENTER_OFFSET + CELL_SPACING / 2;
const LINE_THICKNESS = 0.04;

interface GridLineData {
  start: [number, number, number];
  end: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
}

/**
 * Pre-calculate line geometry data
 */
function calculateLineData(
  start: [number, number, number],
  end: [number, number, number]
): GridLineData {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const midpoint = startVec.clone().add(endVec).multiplyScalar(0.5);
  const direction = endVec.clone().sub(startVec);
  const lineLength = direction.length();

  // Calculate rotation to align cylinder with line direction
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(up, direction.normalize());
  const euler = new THREE.Euler().setFromQuaternion(quaternion);

  return {
    start,
    end,
    position: [midpoint.x, midpoint.y, midpoint.z],
    rotation: [euler.x, euler.y, euler.z],
    length: lineLength,
  };
}

/**
 * Point light at grid intersection for glow effect
 */
function GridGlow({ position }: { position: [number, number, number] }) {
  return (
    <pointLight
      position={position}
      color={COLORS.warmWhite}
      intensity={0.12}
      distance={6}
      decay={2}
    />
  );
}

/**
 * GridLines component
 * Creates the classic tic-tac-toe # pattern on each of the 3 layers
 * Total: 12 lines (4 per layer)
 *
 * Performance optimized:
 * - Single useFrame for all 12 lines (instead of 12 separate callbacks)
 * - Proper geometry/material disposal on unmount
 */
export function GridLines() {
  // Refs to all line materials for batch animation
  const materialRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Generate the 12 grid lines with pre-calculated geometry (4 per layer)
  const { lines, glowPositions } = useMemo(() => {
    const allLines: GridLineData[] = [];
    const allGlowPositions: [number, number, number][] = [];

    // Separator positions: lines between cells
    const sep1 = -CELL_SPACING / 2;
    const sep2 = CELL_SPACING / 2;

    // Layer Z positions
    const layerZPositions = [
      -LAYER_SEPARATION, // Front layer
      0,                 // Middle layer
      LAYER_SEPARATION,  // Back layer
    ];

    // Create # pattern for each layer
    for (const z of layerZPositions) {
      // Two horizontal lines (parallel to X axis)
      allLines.push(
        calculateLineData([-GRID_HALF_SIZE, sep1, z], [GRID_HALF_SIZE, sep1, z]),
        calculateLineData([-GRID_HALF_SIZE, sep2, z], [GRID_HALF_SIZE, sep2, z])
      );

      // Two vertical lines (parallel to Y axis)
      allLines.push(
        calculateLineData([sep1, -GRID_HALF_SIZE, z], [sep1, GRID_HALF_SIZE, z]),
        calculateLineData([sep2, -GRID_HALF_SIZE, z], [sep2, GRID_HALF_SIZE, z])
      );

      // Glow positions at 4 intersections
      allGlowPositions.push(
        [sep1, sep1, z],
        [sep1, sep2, z],
        [sep2, sep1, z],
        [sep2, sep2, z]
      );
    }

    return { lines: allLines, glowPositions: allGlowPositions };
  }, []);

  // Single useFrame for ALL grid lines (instead of 12 separate callbacks)
  useFrame(({ clock }) => {
    const pulse = Math.sin(clock.getElapsedTime() * 0.5) * 0.1 + 0.9;
    const intensity = 0.8 * pulse;

    // Update all materials at once
    for (const mat of materialRefs.current) {
      if (mat) {
        mat.emissiveIntensity = intensity;
      }
    }
  });

  // Cleanup on unmount - dispose all geometries and materials
  useEffect(() => {
    const meshes = meshRefs.current;
    return () => {
      for (const mesh of meshes) {
        if (mesh) {
          mesh.geometry?.dispose();
          if (mesh.material instanceof THREE.Material) {
            mesh.material.dispose();
          }
        }
      }
    };
  }, []);

  // Callback to store mesh refs
  const setMeshRef = (index: number) => (mesh: THREE.Mesh | null) => {
    meshRefs.current[index] = mesh;
    if (mesh) {
      materialRefs.current[index] = mesh.material as THREE.MeshStandardMaterial;
    }
  };

  return (
    <group>
      {lines.map((line, i) => (
        <mesh
          key={i}
          ref={setMeshRef(i)}
          position={line.position}
          rotation={line.rotation}
        >
          <cylinderGeometry args={[LINE_THICKNESS, LINE_THICKNESS, line.length, 8]} />
          <meshStandardMaterial
            color={COLORS.warmWhite}
            emissive={COLORS.warmWhiteGlow}
            emissiveIntensity={0.8}
            metalness={0.1}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>
      ))}
      {glowPositions.map((pos, i) => (
        <GridGlow key={`glow-${i}`} position={pos} />
      ))}
    </group>
  );
}

export default GridLines;
