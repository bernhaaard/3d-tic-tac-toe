'use client';

/**
 * Interactive grid cell component
 * Handles hover effects with player-based color tinting
 * @module components/game/GridCell
 */

import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { CELL_SIZE, COLORS, MATERIAL_CONFIG, ANIMATION_CONFIG } from '@/lib/constants';
import type { Player } from '@/types/game';

interface GridCellProps {
  position: [number, number, number];
  index: number;
  isEmpty: boolean;
  isInteractive: boolean;
  currentPlayer: Player;
  onClick: (index: number) => void;
}

// Pre-create color objects for lerping
const baseColor = new THREE.Color(COLORS.grid);
const cyanColor = new THREE.Color(COLORS.cyan);
const magentaColor = new THREE.Color(COLORS.magenta);

/**
 * Interactive grid cell with hover effects and player color tinting
 */
export function GridCell({
  position,
  index,
  isEmpty,
  isInteractive,
  currentPlayer,
  onClick,
}: GridCellProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate whether cell should respond to interactions
  const canInteract = isEmpty && isInteractive;

  // Get target color based on current player
  const targetPlayerColor = useMemo(
    () => (currentPlayer === 'X' ? cyanColor : magentaColor),
    [currentPlayer]
  );

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

    // Lerp color towards player color on hover (subtle hue shift + saturation bump)
    if (canInteract && hovered) {
      // Mix base color with player color (30% player color for subtle tint)
      const mixedColor = baseColor.clone().lerp(targetPlayerColor, 0.3);
      // Increase saturation slightly
      const hsl = { h: 0, s: 0, l: 0 };
      mixedColor.getHSL(hsl);
      mixedColor.setHSL(hsl.h, Math.min(hsl.s * 1.5, 1), hsl.l);
      material.color.lerp(mixedColor, 0.15);
    } else {
      // Return to base color
      material.color.lerp(baseColor, 0.1);
    }

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
