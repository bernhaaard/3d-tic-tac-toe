'use client';

/**
 * X piece 3D geometry component
 * Two crossed cylinders forming an X shape
 * @module components/game/XPiece
 */

import { useRef } from 'react';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { PIECE_GEOMETRY, COLORS, MATERIAL_CONFIG, ANIMATION_CONFIG } from '@/lib/constants';

interface XPieceProps {
  position: [number, number, number];
  isWinning?: boolean;
}

/**
 * Animated X piece component
 * Appears with spring animation when placed
 */
export function XPiece({ position, isWinning = false }: XPieceProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Spring animation for piece appearance
  const { scale, opacity } = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: ANIMATION_CONFIG.pieceSpring,
  });

  // Pulsing animation for winning pieces
  const { emissiveIntensity } = useSpring({
    from: { emissiveIntensity: MATERIAL_CONFIG.piece.emissiveIntensity },
    to: {
      emissiveIntensity: isWinning ? 0.6 : MATERIAL_CONFIG.piece.emissiveIntensity,
    },
    loop: isWinning ? { reverse: true } : false,
    config: { duration: ANIMATION_CONFIG.winPulseDuration / 2 },
  });

  const { cylinderRadius, cylinderLength, segments, rotationAngle } = PIECE_GEOMETRY.x;

  return (
    <animated.group
      ref={groupRef}
      position={position}
      scale={scale}
    >
      {/* First diagonal cylinder */}
      <mesh rotation={[0, 0, rotationAngle]}>
        <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderLength, segments]} />
        <animated.meshStandardMaterial
          color={COLORS.cyan}
          metalness={MATERIAL_CONFIG.piece.metalness}
          roughness={MATERIAL_CONFIG.piece.roughness}
          emissive={COLORS.cyan}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>

      {/* Second diagonal cylinder (crossed) */}
      <mesh rotation={[0, 0, -rotationAngle]}>
        <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderLength, segments]} />
        <animated.meshStandardMaterial
          color={COLORS.cyan}
          metalness={MATERIAL_CONFIG.piece.metalness}
          roughness={MATERIAL_CONFIG.piece.roughness}
          emissive={COLORS.cyan}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>
    </animated.group>
  );
}

export default XPiece;
