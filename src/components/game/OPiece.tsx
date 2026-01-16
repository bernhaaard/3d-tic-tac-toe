'use client';

/**
 * O piece 3D geometry component
 * Torus (donut shape) forming an O
 * @module components/game/OPiece
 */

import { useRef } from 'react';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { PIECE_GEOMETRY, COLORS, MATERIAL_CONFIG, ANIMATION_CONFIG } from '@/lib/constants';

interface OPieceProps {
  position: [number, number, number];
  isWinning?: boolean;
}

/**
 * Animated O piece component
 * Appears with spring animation when placed
 */
export function OPiece({ position, isWinning = false }: OPieceProps) {
  const meshRef = useRef<THREE.Mesh>(null);

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

  const { torusRadius, tubeRadius, radialSegments, tubularSegments } = PIECE_GEOMETRY.o;

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={scale}
      rotation={[Math.PI / 2, 0, 0]} // Rotate to face forward
    >
      <torusGeometry args={[torusRadius, tubeRadius, radialSegments, tubularSegments]} />
      <animated.meshStandardMaterial
        color={COLORS.magenta}
        metalness={MATERIAL_CONFIG.piece.metalness}
        roughness={MATERIAL_CONFIG.piece.roughness}
        emissive={COLORS.magenta}
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={opacity}
        toneMapped={false}
      />
    </animated.mesh>
  );
}

export default OPiece;
