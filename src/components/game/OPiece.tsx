'use client';

/**
 * O piece 3D geometry component
 * Torus (donut shape) forming an O
 * Uses Y-axis billboard effect to stay flat while facing camera
 * @module components/game/OPiece
 */

import { useRef } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PIECE_GEOMETRY, COLORS, MATERIAL_CONFIG, ANIMATION_CONFIG } from '@/lib/constants';

interface OPieceProps {
  position: [number, number, number];
  isWinning?: boolean;
}

/**
 * Animated O piece component
 * Appears with spring animation when placed
 * Uses Y-axis billboard effect (rotates horizontally to face camera while staying flat)
 */
export function OPiece({ position, isWinning = false }: OPieceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

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

  // Y-axis billboard effect - rotate group around Y to face camera horizontally
  // The mesh inside has static X rotation to stand upright, group handles Y rotation
  useFrame(() => {
    if (!groupRef.current) return;
    // Calculate angle to camera on XZ plane
    const dx = camera.position.x - position[0];
    const dz = camera.position.z - position[2];
    const angle = Math.atan2(dx, dz);
    groupRef.current.rotation.y = angle;
  });

  const { torusRadius, tubeRadius, radialSegments, tubularSegments } = PIECE_GEOMETRY.o;

  return (
    <animated.group
      ref={groupRef}
      position={position}
      scale={scale}
    >
      {/* Torus in default XY plane (vertical), group rotates on Y to face camera */}
      <mesh>
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
      </mesh>
    </animated.group>
  );
}

export default OPiece;
