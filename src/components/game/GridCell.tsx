'use client';

/**
 * Interactive grid cell component
 * Handles hover effects and click interactions
 * @module components/game/GridCell
 */

import { useRef, useState, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { CELL_SIZE, COLORS, MATERIAL_CONFIG, ANIMATION_CONFIG } from '@/lib/constants';

interface GridCellProps {
  position: [number, number, number];
  index: number;
  isEmpty: boolean;
  isInteractive: boolean;
  onClick: (index: number) => void;
}

/**
 * Interactive grid cell with hover effects
 */
export function GridCell({
  position,
  index,
  isEmpty,
  isInteractive,
  onClick,
}: GridCellProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate whether cell should respond to interactions
  const canInteract = isEmpty && isInteractive;

  // Smooth hover animation using useFrame
  useFrame(() => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.MeshStandardMaterial;

    // Target opacity based on hover state
    const targetOpacity = canInteract && hovered
      ? ANIMATION_CONFIG.hoverOpacity
      : ANIMATION_CONFIG.defaultOpacity;

    // Lerp opacity for smooth transition
    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      targetOpacity,
      0.1
    );

    // Target scale based on hover state
    const targetScale = canInteract && hovered ? ANIMATION_CONFIG.hoverScale : 1;

    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  // Handle pointer over
  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (canInteract) {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }
    },
    [canInteract]
  );

  // Handle pointer out
  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(false);
      document.body.style.cursor = 'default';
    },
    []
  );

  // Handle click
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (canInteract) {
        onClick(index);
      }
    },
    [canInteract, onClick, index]
  );

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[CELL_SIZE, CELL_SIZE, CELL_SIZE]} />
      <meshStandardMaterial
        color={COLORS.grid}
        metalness={MATERIAL_CONFIG.grid.metalness}
        roughness={MATERIAL_CONFIG.grid.roughness}
        transparent
        opacity={ANIMATION_CONFIG.defaultOpacity}
        depthWrite={false}
      />
    </mesh>
  );
}

export default GridCell;
