'use client';

/**
 * Audio hook for game sound effects
 * Uses Web Audio API to synthesize sounds (no external audio files needed)
 * @module hooks/useAudio
 */

import { useCallback, useRef, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';

type SoundType = 'place' | 'hover' | 'win' | 'draw' | 'click';

/**
 * Audio context singleton (lazy initialized)
 */
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn('Web Audio API not supported');
      return null;
    }
  }

  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

/**
 * Play a synthesized sound effect
 */
function playSynthSound(type: SoundType, ctx: AudioContext) {
  const now = ctx.currentTime;

  switch (type) {
    case 'place': {
      // Satisfying "pop" sound for placing a piece
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.15);
      break;
    }

    case 'hover': {
      // Subtle tick for hover
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(1200, now);
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.start(now);
      osc.stop(now + 0.03);
      break;
    }

    case 'win': {
      // Triumphant ascending arpeggio
      const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(freq, now);
        osc.type = 'sine';

        const noteStart = now + i * 0.1;
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
      break;
    }

    case 'draw': {
      // Neutral descending tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
      osc.type = 'triangle';

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.4);
      break;
    }

    case 'click': {
      // UI click sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(800, now);
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }
  }
}

/**
 * Hook for playing game sound effects
 * Respects the soundEnabled setting from the game store
 */
export function useAudio() {
  const soundEnabled = useGameStore((state) => state.settings.soundEnabled);
  const lastHoverTime = useRef(0);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      getAudioContext();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled) return;

    // Throttle hover sounds to prevent spam
    if (type === 'hover') {
      const now = Date.now();
      if (now - lastHoverTime.current < 50) return;
      lastHoverTime.current = now;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    playSynthSound(type, ctx);
  }, [soundEnabled]);

  return { playSound };
}

export default useAudio;
