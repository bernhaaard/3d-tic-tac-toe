# Animation & Audio Specification

**Last Updated:** January 2026
**Scope:** Motion design, timing, sound effects, feedback systems

---

## Animation Library Choice

### Comparison

| Library | Bundle Size | R3F Integration | React 19 Support |
|---------|-------------|-----------------|------------------|
| **@react-spring/three** | ~15KB | Excellent | ✓ |
| framer-motion-3d | - | Discontinued | ✗ |
| GSAP | ~50KB | Manual | ✓ |
| useFrame (manual) | 0KB | Native | ✓ |

**Recommendation:** `@react-spring/three` for complex animations, `useFrame` for simple effects.

**Note:** framer-motion-3d is discontinued and incompatible with React 19.

---

## Installation

```bash
npm install @react-spring/three use-sound howler
```

---

## Piece Placement Animation

### Spring Animation

```typescript
import { useSpring, animated } from '@react-spring/three';

function AnimatedPiece({
  position,
  type,
}: {
  position: [number, number, number];
  type: 'X' | 'O';
}) {
  const { scale, opacity } = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: {
      tension: 200,
      friction: 20,
    },
  });

  return (
    <animated.group position={position} scale={scale}>
      {type === 'X' ? <XGeometry /> : <OGeometry />}
    </animated.group>
  );
}
```

### Animation Timing

| Animation | Duration | Easing |
|-----------|----------|--------|
| Piece appear | 300ms | Spring (tension: 200) |
| Piece hover | 150ms | Ease-out |
| Win line pulse | 1000ms | Loop |
| Screen transition | 200ms | Ease-in-out |

---

## Hover Effects

### Using useFrame (Simple)

```typescript
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function HoverableCell({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;

    // Smooth scale transition
    const targetScale = hovered ? 1.1 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );

    // Smooth opacity transition
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      hovered ? 0.3 : 0.05,
      0.1
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial transparent opacity={0.05} />
    </mesh>
  );
}
```

---

## Win Line Animation

```typescript
import { useSpring, animated } from '@react-spring/three';

function WinLine({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  const { progress, glow } = useSpring({
    from: { progress: 0, glow: 0.2 },
    to: async (next) => {
      await next({ progress: 1 });
      // Pulse loop
      while (true) {
        await next({ glow: 0.5 });
        await next({ glow: 0.2 });
      }
    },
    config: { tension: 100, friction: 20 },
  });

  return (
    <animated.line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...start, ...end])}
          itemSize={3}
        />
      </bufferGeometry>
      <animated.lineBasicMaterial
        color="#00E4E4"
        linewidth={3}
        transparent
        opacity={glow}
      />
    </animated.line>
  );
}
```

---

## Screen Transitions

### Framer Motion for 2D UI

```typescript
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function AnimatedScreen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Audio System

### Sound Hook

```typescript
import useSound from 'use-sound';

function useGameSounds() {
  const [playPlace] = useSound('/sounds/place.mp3', { volume: 0.5 });
  const [playWin] = useSound('/sounds/win.mp3', { volume: 0.7 });
  const [playDraw] = useSound('/sounds/draw.mp3', { volume: 0.5 });
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.3 });
  const [playInvalid] = useSound('/sounds/invalid.mp3', { volume: 0.4 });

  return { playPlace, playWin, playDraw, playClick, playInvalid };
}
```

### Sound Trigger Integration

```typescript
function useSoundEffects() {
  const { playPlace, playWin, playDraw, playInvalid } = useGameSounds();
  const soundEnabled = useGameStore(state => state.settings.soundEnabled);

  const onPiecePlaced = useCallback(() => {
    if (soundEnabled) playPlace();
  }, [soundEnabled, playPlace]);

  const onGameWon = useCallback(() => {
    if (soundEnabled) playWin();
  }, [soundEnabled, playWin]);

  const onGameDraw = useCallback(() => {
    if (soundEnabled) playDraw();
  }, [soundEnabled, playDraw]);

  const onInvalidMove = useCallback(() => {
    if (soundEnabled) playInvalid();
  }, [soundEnabled, playInvalid]);

  return { onPiecePlaced, onGameWon, onGameDraw, onInvalidMove };
}
```

---

## Procedural Audio (Alternative)

### Web Audio API

```typescript
class ProceduralAudio {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  playClick(): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  playWin(): void {
    const ctx = this.getContext();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);

      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  }
}

export const audio = new ProceduralAudio();
```

---

## Sound Files

### Required Sounds

| Sound | Trigger | Duration | Format |
|-------|---------|----------|--------|
| place.mp3 | Piece placed | 100-200ms | MP3/OGG |
| win.mp3 | Game won | 500-800ms | MP3/OGG |
| draw.mp3 | Game draw | 300-500ms | MP3/OGG |
| click.mp3 | UI click | 50-100ms | MP3/OGG |
| invalid.mp3 | Invalid move | 100-200ms | MP3/OGG |

### Format Recommendation

```typescript
// Prefer OGG for better compression and seamless looping
// Provide MP3 fallback for Safari
const sounds = {
  place: ['/sounds/place.ogg', '/sounds/place.mp3'],
  win: ['/sounds/win.ogg', '/sounds/win.mp3'],
};
```

---

## Animation Constants

```typescript
export const ANIMATION_CONFIG = {
  // Piece placement
  pieceSpring: {
    tension: 200,
    friction: 20,
  },

  // Hover effects
  hoverDuration: 150,
  hoverScale: 1.1,

  // Win line
  winLineDelay: 200,
  winPulseDuration: 1000,

  // Screen transitions
  transitionDuration: 200,

  // AI thinking indicator
  thinkingPulseDuration: 800,
};
```

---

## Performance Considerations

### Animation Budget

- Target: 60 FPS
- Max simultaneous animations: 10
- Prefer `useFrame` for simple lerps (no overhead)
- Use spring animations sparingly

### Audio Preloading

```typescript
// Preload sounds on app mount
useEffect(() => {
  const sounds = ['/sounds/place.mp3', '/sounds/win.mp3', '/sounds/click.mp3'];
  sounds.forEach(src => {
    const audio = new Audio(src);
    audio.preload = 'auto';
  });
}, []);
```

---

## Handoff Notes

### For Scene Designer
- Pieces animate from scale 0 → 1 on placement
- Win line appears with glow effect

### For UI Researcher
- Screen transitions: 200ms fade
- Button hover: scale + glow

### For Input Researcher
- Invalid move triggers error sound
- Successful placement triggers place sound

### For Visual Researcher
- Win line pulses with emissive glow
- Hover increases opacity to 30%

---

## Sources

- [React Spring Three.js](https://www.react-spring.dev/docs/components/animated)
- [use-sound](https://github.com/joshwcomeau/use-sound)
- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Framer Motion](https://www.framer.com/motion/)
