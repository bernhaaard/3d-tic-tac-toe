'use client';

/**
 * O piece 3D geometry component
 * Torus (donut shape) forming an O
 * Always faces the camera (billboard effect)
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

// Reusable vector for lookAt calculation
const tempLookAt = new THREE.Vector3();

/**
 * Animated O piece component
 * Appears with spring animation when placed
 * Always faces the camera (billboard effect)
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

  // Billboard effect - make piece face camera
  useFrame(() => {
    if (!groupRef.current) return;
    // Get camera position and make the piece look at it
    tempLookAt.copy(camera.position);
    groupRef.current.lookAt(tempLookAt);
  });

  const { torusRadius, tubeRadius, radialSegments, tubularSegments } = PIECE_GEOMETRY.o;

  return (
    <animated.group
      ref={groupRef}
      position={position}
      scale={scale}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
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
