'use client';

/**
 * Interactive grid cell component
 * Only renders for empty, interactive cells to prevent blocking inner cells
 * Shows ghost preview on hover
 * @module components/game/GridCell
 */

import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { CELL_SIZE, COLORS, ANIMATION_CONFIG } from '@/lib/constants';
import type { Player } from '@/types/game';

interface GridCellProps {
  position: [number, number, number];
  index: number;
  isEmpty: boolean;
  isInteractive: boolean;
  currentPlayer: Player;
  onClick: (index: number) => void;
}

// Pre-create color objects
const cyanColor = new THREE.Color(COLORS.cyan);
const magentaColor = new THREE.Color(COLORS.magenta);

/**
 * Interactive grid cell
 * - Only rendered for empty cells (non-empty cells are just pieces)
 * - Shows colored ghost preview on hover
 * - Smaller hit box allows clicking through gaps to inner cells
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

  const canInteract = isEmpty && isInteractive;

  // Get player color for hover preview
  const playerColor = useMemo(
    () => (currentPlayer === 'X' ? cyanColor : magentaColor),
    [currentPlayer]
  );

  // Animate opacity on hover
  useFrame(() => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.MeshStandardMaterial;

    // Show ghost preview when hovered
    const targetOpacity = hovered ? ANIMATION_CONFIG.hoverOpacity : 0;
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.2);

    // Update color to match current player
    if (hovered) {
      material.color.lerp(playerColor, 0.3);
      material.emissive.lerp(playerColor, 0.2);
    }
  });

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(true);
      document.body.style.cursor = 'pointer';
    },
    []
  );

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onClick(index);
    },
    [onClick, index]
  );

  // DON'T render mesh for non-interactive cells
  // This prevents blocking clicks to inner cells
  if (!canInteract) {
    return null;
  }

  // Use a smaller hit box to allow clicking through gaps
  const hitBoxSize = CELL_SIZE * 0.75;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[hitBoxSize, hitBoxSize, hitBoxSize]} />
      <meshStandardMaterial
        color={playerColor}
        emissive={playerColor}
        emissiveIntensity={0.1}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}

export default GridCell;
