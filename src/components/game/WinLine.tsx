'use client';

/**
 * Winning line visual component
 * Animated line connecting the three winning cells
 * @module components/game/WinLine
 */

import { useRef, useMemo, useEffect } from 'react';
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
 * Draws a glowing line between winning cells with pulsing animation
 */
export function WinLine({ startIndex, endIndex }: WinLineProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null);

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

  // Pulsing animation - update the material opacity directly
  useFrame(({ clock }) => {
    if (lineRef.current && lineRef.current.material) {
      const pulse = Math.sin(clock.getElapsedTime() * 3) * 0.3 + 0.7;
      lineRef.current.material.opacity = pulse;
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    const line = lineRef.current;
    return () => {
      if (line) {
        line.geometry?.dispose();
        line.material?.dispose();
      }
    };
  }, []);

  if (!startPos || !endPos || points.length === 0) {
    return null;
  }

  return (
    <Line
      ref={lineRef}
      points={points}
      color={COLORS.cyan}
      lineWidth={4}
      transparent
      opacity={0.8}
    />
  );
}

export default WinLine;
