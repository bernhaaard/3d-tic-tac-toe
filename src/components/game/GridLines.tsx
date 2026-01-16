'use client';

/**
 * Glowing 3D grid separator lines
 * Creates the classic tic-tac-toe grid pattern in 3D
 * Uses warm white (~4000K) glowing lines as primary lighting
 * @module components/game/GridLines
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CELL_SPACING, LAYER_SEPARATION, CENTER_OFFSET, COLORS } from '@/lib/constants';

// Grid dimensions
const GRID_EXTENT = CENTER_OFFSET + CELL_SPACING / 2; // How far the lines extend
const LINE_THICKNESS = 0.04; // Thickness of the grid lines

/**
 * Creates geometry for a single line segment as a thin cylinder
 */
function GridLine({
  start,
  end,
  glowIntensity = 1,
}: {
  start: [number, number, number];
  end: [number, number, number];
  glowIntensity?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate line properties
  const { position, rotation, length } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const midpoint = startVec.clone().add(endVec).multiplyScalar(0.5);
    const direction = endVec.clone().sub(startVec);
    const lineLength = direction.length();

    // Calculate rotation to align cylinder with the line direction
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(up, direction.normalize());
    const euler = new THREE.Euler().setFromQuaternion(quaternion);

    return {
      position: [midpoint.x, midpoint.y, midpoint.z] as [number, number, number],
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
      length: lineLength,
    };
  }, [start, end]);

  // Subtle pulsing animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      const pulse = Math.sin(clock.getElapsedTime() * 0.5) * 0.1 + 0.9;
      material.emissiveIntensity = 0.8 * pulse * glowIntensity;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <cylinderGeometry args={[LINE_THICKNESS, LINE_THICKNESS, length, 6]} />
      <meshStandardMaterial
        color={COLORS.warmWhite}
        emissive={COLORS.warmWhiteGlow}
        emissiveIntensity={0.8}
        metalness={0.1}
        roughness={0.3}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Glowing point light attached to grid intersections
 */
function GridGlow({ position }: { position: [number, number, number] }) {
  return (
    <pointLight
      position={position}
      color={COLORS.warmWhite}
      intensity={0.15}
      distance={8}
      decay={2}
    />
  );
}

/**
 * Main GridLines component
 * Creates the tic-tac-toe separator lines in 3D space
 */
export function GridLines() {
  const lines = useMemo(() => {
    const allLines: { start: [number, number, number]; end: [number, number, number] }[] = [];

    // Calculate separator positions (between cells)
    // For a 3x3 grid, there are 2 separators (at positions -spacing/2 and +spacing/2 from center)
    const sep1 = -CELL_SPACING / 2;
    const sep2 = CELL_SPACING / 2;
    const separators = [sep1, sep2];

    // Layer Z positions
    const layerZs = [
      -LAYER_SEPARATION,
      0,
      LAYER_SEPARATION,
    ];

    // --- XY Plane Lines (within each layer) ---
    for (const z of layerZs) {
      // Horizontal lines (parallel to X axis)
      for (const y of separators) {
        allLines.push({
          start: [-GRID_EXTENT, y, z],
          end: [GRID_EXTENT, y, z],
        });
      }
      // Vertical lines (parallel to Y axis)
      for (const x of separators) {
        allLines.push({
          start: [x, -GRID_EXTENT, z],
          end: [x, GRID_EXTENT, z],
        });
      }
    }

    // --- XZ Plane Lines (connecting layers, top and bottom faces) ---
    for (const y of [-GRID_EXTENT, GRID_EXTENT]) {
      // Lines parallel to X
      for (const x of separators) {
        allLines.push({
          start: [x, y, -LAYER_SEPARATION - CELL_SPACING / 2],
          end: [x, y, LAYER_SEPARATION + CELL_SPACING / 2],
        });
      }
      // Lines parallel to Z
      for (const z of [sep1 + LAYER_SEPARATION, sep2 + LAYER_SEPARATION, sep1 - LAYER_SEPARATION, sep2 - LAYER_SEPARATION]) {
        // Skip - we want lines between layers
      }
    }

    // --- YZ Plane Lines (connecting layers, side faces) ---
    for (const x of [-GRID_EXTENT, GRID_EXTENT]) {
      // Lines parallel to Y
      for (const y of separators) {
        allLines.push({
          start: [x, y, -LAYER_SEPARATION - CELL_SPACING / 2],
          end: [x, y, LAYER_SEPARATION + CELL_SPACING / 2],
        });
      }
    }

    // --- Depth lines (Z axis) at grid intersections ---
    for (const x of separators) {
      for (const y of separators) {
        allLines.push({
          start: [x, y, -LAYER_SEPARATION - CELL_SPACING / 2],
          end: [x, y, LAYER_SEPARATION + CELL_SPACING / 2],
        });
      }
    }

    return allLines;
  }, []);

  // Calculate glow positions at key intersections
  const glowPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const sep1 = -CELL_SPACING / 2;
    const sep2 = CELL_SPACING / 2;

    // Add glow at central intersections of each layer
    for (const z of [-LAYER_SEPARATION, 0, LAYER_SEPARATION]) {
      positions.push([sep1, sep1, z]);
      positions.push([sep1, sep2, z]);
      positions.push([sep2, sep1, z]);
      positions.push([sep2, sep2, z]);
    }

    return positions;
  }, []);

  return (
    <group>
      {/* Render all grid lines */}
      {lines.map((line, index) => (
        <GridLine
          key={index}
          start={line.start}
          end={line.end}
        />
      ))}

      {/* Add point lights at intersections for glow effect */}
      {glowPositions.map((pos, index) => (
        <GridGlow key={`glow-${index}`} position={pos} />
      ))}
    </group>
  );
}

export default GridLines;
