'use client';

/**
 * Winning line visual component
 * Animated line connecting the three winning cells
 * @module components/game/WinLine
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { CELL_POSITIONS, COLORS } from '@/lib/constants';

interface WinLineProps {
  startIndex: number;
  endIndex: number;
}

/**
 * Animated winning line component
 * Draws a glowing line between winning cells
 */
export function WinLine({ startIndex, endIndex }: WinLineProps) {
  const opacityRef = useRef(0.8);

  // Get start and end positions
  const startPos = CELL_POSITIONS[startIndex];
  const endPos = CELL_POSITIONS[endIndex];

  // Create points array for the line
  const points = useMemo(() => {
    if (!startPos || !endPos) {
      return [];
    }
    return [
      new THREE.Vector3(startPos[0], startPos[1], startPos[2]),
      new THREE.Vector3(endPos[0], endPos[1], endPos[2]),
    ];
  }, [startPos, endPos]);

  // Pulsing animation - update the opacity ref
  useFrame(({ clock }) => {
    const pulse = Math.sin(clock.getElapsedTime() * 3) * 0.3 + 0.7;
    opacityRef.current = pulse;
  });

  if (!startPos || !endPos || points.length === 0) {
    return null;
  }

  return (
    <Line
      points={points}
      color={COLORS.cyan}
      lineWidth={4}
      transparent
      opacity={0.8}
    />
  );
}

export default WinLine;
