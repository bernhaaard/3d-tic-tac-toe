'use client';

/**
 * Main game page
 * Combines 3D scene with UI overlay
 */

import dynamic from 'next/dynamic';
import { UIOverlay } from '@/components/ui';
import { SoundController } from '@/components/game/SoundController';

// Dynamic import for Scene to prevent SSR issues with Three.js
const Scene = dynamic(
  () => import('@/components/game/Scene').then((mod) => mod.Scene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-[var(--color-cyan)] border-t-transparent" />
          <p className="text-[var(--color-text-muted)]">Loading 3D scene...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Sound controller for win/draw sounds */}
      <SoundController />

      {/* 3D Scene (full screen) */}
      <div className="absolute inset-0">
        <Scene />
      </div>

      {/* UI Overlay (above 3D scene) */}
      <UIOverlay />
    </main>
  );
}
