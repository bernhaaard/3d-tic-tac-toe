'use client';

/**
 * Main 3D scene component with Canvas and environment setup
 * @module components/game/Scene
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { CAMERA_CONFIG, ORBIT_CONTROLS_CONFIG, COLORS } from '@/lib/constants';
import { GameBoard } from './GameBoard';

/**
 * Loading fallback for 3D scene
 */
function SceneLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4B5563" wireframe />
    </mesh>
  );
}

/**
 * Lighting setup for the scene
 * Minimal ambient lighting - grid lines are primary light source
 * Grid lines provide warm white ~4000K glow via GridLines component
 */
function Lighting() {
  return (
    <>
      {/* Very subtle ambient light - just enough to see dark areas */}
      <ambientLight intensity={0.15} />

      {/* Subtle directional key light for piece highlights */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={0.3}
        castShadow={false}
      />

      {/* Subtle rim light for depth */}
      <pointLight
        position={[0, -10, 5]}
        intensity={0.1}
        color={COLORS.cyan}
      />
    </>
  );
}

/**
 * Main scene content (inside Canvas)
 */
function SceneContent() {
  return (
    <>
      {/* Background color */}
      <color attach="background" args={[COLORS.background]} />

      {/* Lighting */}
      <Lighting />

      {/* Camera controls */}
      <OrbitControls
        minPolarAngle={ORBIT_CONTROLS_CONFIG.minPolarAngle}
        maxPolarAngle={ORBIT_CONTROLS_CONFIG.maxPolarAngle}
        minDistance={ORBIT_CONTROLS_CONFIG.minDistance}
        maxDistance={ORBIT_CONTROLS_CONFIG.maxDistance}
        enablePan={ORBIT_CONTROLS_CONFIG.enablePan}
        enableDamping={ORBIT_CONTROLS_CONFIG.enableDamping}
        dampingFactor={ORBIT_CONTROLS_CONFIG.dampingFactor}
        zoomSpeed={ORBIT_CONTROLS_CONFIG.zoomSpeed}
      />

      {/* Game board with cells and pieces */}
      <Suspense fallback={<SceneLoader />}>
        <GameBoard />
      </Suspense>
    </>
  );
}

/**
 * Main Scene component with Canvas wrapper
 */
export function Scene() {
  return (
    <Canvas
      camera={{
        position: CAMERA_CONFIG.position as [number, number, number],
        fov: CAMERA_CONFIG.fov,
        near: CAMERA_CONFIG.near,
        far: CAMERA_CONFIG.far,
      }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'manipulation',
      }}
    >
      <SceneContent />
    </Canvas>
  );
}

export default Scene;
