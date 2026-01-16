# Performance Optimization Guide

**Last Updated:** January 2026
**Target:** 60 FPS on all devices with <100MB memory footprint

---

## Performance Budgets

### Frame Time Budget (60 FPS Target)

| Metric | Budget | Critical Threshold |
|--------|--------|-------------------|
| **Frame Time** | 16.67ms | 20ms (drops to 50 FPS) |
| **JavaScript Execution** | <8ms | <10ms |
| **Rendering** | <6ms | <8ms |
| **Idle Time** | >2ms | >1ms |

### Memory Budget

| Resource | Budget | Critical Threshold |
|----------|--------|-------------------|
| **Total Memory** | <100MB | <150MB |
| **Geometries** | <30 | <50 |
| **Textures** | <20MB | <40MB |
| **Materials** | <15 | <25 |
| **Draw Calls** | <50 | <75 |

### Network Budget

| Asset Type | Budget | Notes |
|------------|--------|-------|
| **Initial Bundle (JS)** | <200KB gzipped | Code splitting required |
| **Three.js** | ~160KB gzipped | Tree-shake unused modules |
| **R3F + Drei** | ~40KB gzipped | Use selective imports |
| **Sound Files** | <500KB total | OGG preferred over MP3 |

### Rendering Budget

| Metric | Budget | Notes |
|--------|--------|-------|
| **Triangles** | <10,000 | Current: ~2,700 |
| **Draw Calls** | <50 | Current: ~30-35 |
| **Shader Switches** | <10 | Use material reuse |
| **Texture Switches** | <5 | Texture atlasing if needed |

---

## Device Performance Targets

### Desktop (1920×1080)

| Specification | Target |
|---------------|--------|
| **Frame Rate** | 60 FPS constant |
| **Resolution** | Full HD (1920×1080) |
| **DPR** | 2 (capped) |
| **Memory** | <80MB |
| **GPU** | Integrated graphics capable |

### Tablet (768×1024)

| Specification | Target |
|---------------|--------|
| **Frame Rate** | 60 FPS |
| **Resolution** | 768×1024 |
| **DPR** | 2 (capped) |
| **Memory** | <90MB |
| **Touch Latency** | <100ms |

### Mobile (375×667)

| Specification | Target |
|---------------|--------|
| **Frame Rate** | 60 FPS (50 FPS acceptable) |
| **Resolution** | 375×667 |
| **DPR** | 2 (capped, not 3-4) |
| **Memory** | <100MB |
| **Touch Latency** | <120ms |
| **Battery Impact** | Minimal (low GPU usage) |

---

## Critical Performance Bottlenecks

### 1. Device Pixel Ratio (DPR)

**Problem:** Modern mobile devices have DPR of 3-4, causing 9-16× more pixels to render.

**Solution:**
```typescript
<Canvas
  dpr={[1, 2]}  // Clamp maximum DPR to 2
  gl={{ antialias: true, alpha: false }}
>
  {/* Scene */}
</Canvas>
```

**Impact:** 50-75% performance improvement on high-DPR devices.

### 2. Shadows

**Problem:** Real-time shadow mapping is extremely expensive (10-20ms per frame).

**Solution:**
```typescript
// DISABLED for 60 FPS target
<Canvas shadows={false}>
  <directionalLight castShadow={false} />
</Canvas>
```

**Alternative:** Use baked ambient occlusion or fake shadows with transparent planes if absolutely needed.

**Impact:** 10-15ms saved per frame.

### 3. State Updates in useFrame

**Problem:** Updating React state in `useFrame` causes 60 re-renders per second.

**Solution:**
```typescript
// BAD: Causes 60 re-renders/sec
function BadComponent() {
  const [rotation, setRotation] = useState(0);

  useFrame(() => {
    setRotation(r => r + 0.01); // DON'T DO THIS
  });

  return <mesh rotation={[0, rotation, 0]} />;
}

// GOOD: Direct ref mutation
function GoodComponent() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01; // Direct mutation
    }
  });

  return <mesh ref={meshRef} />;
}
```

**Impact:** Prevents unnecessary React reconciliation (5-10ms saved).

### 4. Zustand Store Subscriptions

**Problem:** Subscribing to entire store causes re-renders on any change.

**Solution:**
```typescript
// BAD: Subscribes to entire store
const { board, currentPlayer, winner } = useGameStore();

// GOOD: Selective subscription
const board = useGameStore(state => state.board);
const currentPlayer = useGameStore(state => state.currentPlayer);
const winner = useGameStore(state => state.winner);

// BETTER: Single cell subscription (for Cell component)
const cellState = useGameStore(state => state.board[index]);
```

**Impact:** 90% reduction in component re-renders.

### 5. Geometry Complexity

**Problem:** High segment counts increase vertex processing.

**Current Geometry Stats:**
- 27 grid cells (boxes): 27 × 12 triangles = 324 triangles
- X piece (2 cylinders): 2 × (8 segments × 2) = 32 triangles each
- O piece (torus): 8 × 24 × 2 = 384 triangles each
- **Total max:** ~2,700 triangles (well under budget)

**Optimization:**
```typescript
// X Piece: Use minimal segments
<cylinderGeometry args={[0.12, 0.12, 1.6, 8, 1]} />
//                                          ^ radialSegments
//                                             ^ heightSegments (1 is enough)

// O Piece: Reduce segments
<torusGeometry args={[0.7, 0.15, 8, 24]} />
//                                ^ radialSegments (8 is minimum)
//                                   ^ tubularSegments (24 is reasonable)
```

**Impact:** Already optimized, no changes needed.

### 6. Material Reuse

**Problem:** Each material instance requires shader compilation and GPU upload.

**Solution:**
```typescript
// Create materials once, reuse across components
const MATERIALS = {
  xPiece: new THREE.MeshStandardMaterial({
    color: '#00E4E4',
    roughness: 0.3,
    metalness: 0.1,
  }),
  oPiece: new THREE.MeshStandardMaterial({
    color: '#FF0088',
    roughness: 0.3,
    metalness: 0.1,
  }),
  gridCell: new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: 0.05,
    color: '#ffffff',
  }),
};

// Use shared material
function XPiece({ position }: Props) {
  return (
    <group position={position}>
      <mesh material={MATERIALS.xPiece}>
        <cylinderGeometry args={[0.12, 0.12, 1.6, 8, 1]} />
      </mesh>
      <mesh material={MATERIALS.xPiece}>
        <cylinderGeometry args={[0.12, 0.12, 1.6, 8, 1]} />
      </mesh>
    </group>
  );
}
```

**Impact:** Reduces shader switches (2-3ms per frame).

### 7. Animation Performance

**Problem:** React Spring runs on main thread, can block rendering.

**Solution Hierarchy:**
```typescript
// 1. FASTEST: Direct ref mutation with lerp (0 overhead)
useFrame(() => {
  meshRef.current.scale.lerp(targetScale, 0.1);
});

// 2. FAST: React Spring for infrequent animations
const { scale } = useSpring({
  scale: hovered ? 1.1 : 1,
  config: { tension: 200, friction: 20 },
});

// 3. SLOWEST: GSAP (avoid unless necessary)
```

**Guidelines:**
- Hover effects: Use `useFrame` with lerp
- Piece placement: Use React Spring (one-time animation)
- Win line pulse: Use `useFrame` with sine wave
- Max simultaneous springs: 10

**Impact:** Keeps animation overhead <2ms.

---

## Memory Management Best Practices

### 1. GPU Resource Disposal

**CRITICAL:** Three.js does NOT auto-dispose GPU resources.

```typescript
import { useEffect } from 'react';
import * as THREE from 'three';

function Component() {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.Material>(null);

  useEffect(() => {
    return () => {
      // Dispose on unmount
      geometryRef.current?.dispose();
      materialRef.current?.dispose();
    };
  }, []);

  return <mesh geometry={geometryRef.current} material={materialRef.current} />;
}
```

**Note:** Most Drei components (RoundedBox, etc.) auto-dispose. Manual disposal only needed for custom geometries/materials.

### 2. Texture Management

**Problem:** Textures consume GPU memory even when not visible.

**Current Status:** No textures used (solid colors only) - excellent for performance.

**If textures added:**
```typescript
// Dispose textures
texture.dispose();

// Use power-of-two dimensions (512×512, 1024×1024)
// Compress with Basis Universal or KTX2
```

### 3. Memory Monitoring

```typescript
// Development only
useEffect(() => {
  const interval = setInterval(() => {
    const gl = renderer.getContext();
    console.log('GPU Memory:', renderer.info.memory);
    // { geometries: X, textures: Y }
  }, 5000);

  return () => clearInterval(interval);
}, []);
```

**Warning Signs:**
- Geometries > 50: Memory leak
- Textures > 0 (for this project): Unexpected
- Programs > 5: Material reuse opportunity

### 4. Audio Preloading

```typescript
// Preload sounds to avoid stutters
const sounds = [
  '/sounds/place.mp3',
  '/sounds/win.mp3',
  '/sounds/draw.mp3',
  '/sounds/click.mp3',
  '/sounds/invalid.mp3',
];

useEffect(() => {
  sounds.forEach(src => {
    const audio = new Audio(src);
    audio.preload = 'auto';
  });
}, []);
```

**Budget:** <500KB total for all sounds (use OGG format).

---

## Bundle Size Optimization

### 1. Tree-Shaking Three.js

**Problem:** Three.js is 600KB+ unminified.

**Solution:**
```typescript
// BAD: Imports entire Three.js
import * as THREE from 'three';

// GOOD: Import only what's needed
import { Mesh } from 'three/src/objects/Mesh';
import { BoxGeometry } from 'three/src/geometries/BoxGeometry';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
```

**Reality:** R3F handles this automatically for most cases. Manual imports only needed for advanced usage.

### 2. Drei Selective Imports

```typescript
// BAD: Imports all of Drei
import { OrbitControls, Html, RoundedBox } from '@react-three/drei';

// GOOD: Already tree-shaken in v10+
// No change needed
```

**Note:** Drei v10.7.7+ has automatic tree-shaking.

### 3. Code Splitting

```typescript
// app/page.tsx
import dynamic from 'next/dynamic';

// Load Canvas only on client-side
const GameScene = dynamic(() => import('@/components/game/GameScene'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Page() {
  return <GameScene />;
}
```

**Impact:** Reduces initial bundle by ~200KB.

### 4. Audio Format Optimization

```typescript
// Use OGG (better compression, seamless looping)
const sounds = {
  place: '/sounds/place.ogg',
  win: '/sounds/win.ogg',
  // Fallback for Safari
  placeMp3: '/sounds/place.mp3',
  winMp3: '/sounds/win.mp3',
};

// Auto-detect format support
const format = navigator.userAgent.includes('Safari') ? 'mp3' : 'ogg';
```

**Savings:** 30-50% smaller file sizes vs MP3.

---

## Mobile-Specific Optimizations

### 1. Touch Latency Reduction

```typescript
// Prevent 300ms click delay on mobile
<Canvas
  style={{ touchAction: 'none' }}
  onPointerDown={(e) => e.preventDefault()}
>
```

**Impact:** Instant touch response.

### 2. Reduced Pixel Density

```typescript
// Mobile devices can have DPR 3-4
<Canvas dpr={Math.min(window.devicePixelRatio, 2)}>
```

**Impact:** 50-75% fewer pixels on high-DPR devices.

### 3. Simplified Lighting

```typescript
// Mobile: Use hemisphere light instead of 3-point lighting
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

{isMobile ? (
  <>
    <ambientLight intensity={0.6} />
    <hemisphereLight
      skyColor="#ffffff"
      groundColor="#444444"
      intensity={0.4}
    />
  </>
) : (
  <>
    <ambientLight intensity={0.4} />
    <directionalLight position={[10, 15, 10]} intensity={0.8} />
    <pointLight position={[-8, 5, -8]} intensity={0.3} />
  </>
)}
```

**Impact:** 2-3ms saved on mobile.

### 4. Reduced Segments on Mobile

```typescript
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
const segments = isMobile ? 6 : 8;

<cylinderGeometry args={[0.12, 0.12, 1.6, segments, 1]} />
```

**Impact:** 25% fewer triangles on mobile.

### 5. Disable Damping on Low-End Devices

```typescript
const enableDamping = !isMobile || performance.now() < 1000;

<OrbitControls
  enableDamping={enableDamping}
  dampingFactor={0.05}
/>
```

**Reason:** Damping requires constant rendering, drains battery.

### 6. Lazy Load Audio

```typescript
// Don't preload audio on mobile (saves bandwidth)
useEffect(() => {
  if (!isMobile) {
    sounds.forEach(src => {
      const audio = new Audio(src);
      audio.preload = 'auto';
    });
  }
}, []);
```

---

## Profiling Strategies

### 1. Chrome DevTools Performance

**Steps:**
1. Open DevTools → Performance tab
2. Click Record
3. Play game for 10 seconds
4. Stop recording
5. Analyze flame chart

**What to Look For:**
- **Long Tasks (>50ms):** JavaScript blocking rendering
- **Frame Drops:** Red bars in FPS timeline
- **Memory Leaks:** Increasing heap size over time

### 2. React DevTools Profiler

**Steps:**
1. Install React DevTools
2. Go to Profiler tab
3. Click Record
4. Interact with game
5. Stop recording

**What to Look For:**
- **Slow Components:** Yellow/orange bars
- **Excessive Re-renders:** Same component rendering 60×/sec
- **Large Render Duration:** >16ms

### 3. R3F Performance Monitor

```typescript
import { Perf } from 'r3f-perf';

// Development only
{process.env.NODE_ENV === 'development' && <Perf position="top-left" />}
```

**Displays:**
- FPS (real-time)
- Memory usage
- Draw calls
- Triangles

### 4. Custom Performance Metrics

```typescript
// Track game-specific metrics
class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();

  track() {
    this.frameCount++;
    const now = performance.now();

    if (now - this.lastTime >= 1000) {
      const fps = this.frameCount;
      console.log(`FPS: ${fps}`);

      if (fps < 55) {
        console.warn('Performance degradation detected');
      }

      this.frameCount = 0;
      this.lastTime = now;
    }
  }
}

// In useFrame
const monitor = useMemo(() => new PerformanceMonitor(), []);
useFrame(() => monitor.track());
```

### 5. GPU Profiling (Advanced)

**Chrome:** `chrome://gpu`

**Firefox:** `about:support` (Graphics section)

**Look For:**
- GPU model
- WebGL renderer
- Driver version
- Feature support

---

## Performance Optimization Checklist

### Pre-Implementation

- [ ] Disable shadows globally (`shadows={false}`)
- [ ] Cap DPR to 2 (`dpr={[1, 2]}`)
- [ ] Use selective Zustand subscriptions
- [ ] Avoid state updates in `useFrame`
- [ ] Reuse materials (create once, reference everywhere)
- [ ] Keep geometry segments low (8 for cylinders, 8×24 for torus)
- [ ] Code split Canvas with `dynamic` import

### During Development

- [ ] Monitor FPS with `<Perf />` component
- [ ] Check memory with `renderer.info.memory`
- [ ] Profile with React DevTools
- [ ] Test on mobile device (not just emulator)
- [ ] Verify draw calls <50
- [ ] Ensure no memory leaks (geometries count stable)

### Animation-Specific

- [ ] Use `useFrame` for simple effects (hover, lerp)
- [ ] Limit React Spring to <10 simultaneous animations
- [ ] Avoid animating 27 cells simultaneously
- [ ] Use direct ref mutation, not state updates
- [ ] Preload audio files (desktop only)

### Mobile-Specific

- [ ] Test on real device (iPhone 12+, Android mid-range)
- [ ] Verify touch latency <120ms
- [ ] Check DPR capping works (use `window.devicePixelRatio`)
- [ ] Test with simplified lighting
- [ ] Confirm battery impact is minimal

### Pre-Production

- [ ] Bundle size <200KB gzipped (excluding Three.js)
- [ ] Lighthouse performance score >90
- [ ] 60 FPS on target devices
- [ ] Memory footprint <100MB
- [ ] No console warnings/errors
- [ ] Dispose pattern verified (no leaks after 100 games)

---

## Performance Monitoring Code

### Development HUD

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';

export function PerformanceHUD() {
  const [stats, setStats] = useState({ fps: 0, memory: { geometries: 0, textures: 0 } });
  const { gl } = useThree();

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const interval = setInterval(() => {
      const now = performance.now();
      const fps = Math.round(frameCount / ((now - lastTime) / 1000));
      const memory = gl.info.memory;

      setStats({ fps, memory });

      frameCount = 0;
      lastTime = now;
    }, 1000);

    const frame = () => {
      frameCount++;
      requestAnimationFrame(frame);
    };
    frame();

    return () => clearInterval(interval);
  }, [gl]);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg font-mono text-sm">
      <div className={stats.fps < 55 ? 'text-red-400' : 'text-green-400'}>
        FPS: {stats.fps}
      </div>
      <div>Geometries: {stats.memory.geometries}</div>
      <div>Textures: {stats.memory.textures}</div>
    </div>
  );
}
```

### Production Performance Tracking

```typescript
// Track real user metrics
export function usePerformanceTracking() {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          // Send to analytics
          console.log(`${entry.name}: ${entry.duration}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => observer.disconnect();
  }, []);

  const measureMove = useCallback(() => {
    performance.mark('move-start');

    return () => {
      performance.mark('move-end');
      performance.measure('move-duration', 'move-start', 'move-end');
    };
  }, []);

  return { measureMove };
}
```

---

## Device-Specific Considerations

### Desktop

**Strengths:**
- Powerful GPU
- High memory available
- Large screen (detailed graphics)

**Optimizations:**
- Full quality lighting (3-point setup)
- DPR up to 2
- All animation features enabled
- Audio preloading

**Caveats:**
- Integrated graphics (Intel HD) still common
- Some users on 4K displays (capped DPR helps)

### Tablet

**Strengths:**
- Moderate GPU power
- Touch-friendly
- Medium screen size

**Optimizations:**
- Standard lighting
- DPR capped at 2
- Touch event optimization
- Reduced audio preloading

**Caveats:**
- Wide variety of devices (iPad Pro vs budget Android)
- Performance varies greatly

### Mobile

**Strengths:**
- Portability
- Touch-native

**Challenges:**
- Weak GPU (especially Android mid-range)
- High DPR (3-4× common)
- Small screen
- Battery constraints

**Optimizations:**
- Simplified lighting (hemisphere)
- DPR capped at 2 (critical)
- Reduced geometry segments
- Disable damping
- No audio preloading
- Lazy load components

**Target Devices:**
- iPhone 12+ (A14+ chip)
- Android mid-range (Snapdragon 730+)
- Avoid targeting <2020 devices

---

## Performance Red Flags

### Critical Issues (Fix Immediately)

- **FPS <50:** Something is fundamentally broken
- **Memory leak:** Geometries count increasing over time
- **Draw calls >75:** Too many separate objects
- **Frame time >20ms:** JavaScript blocking rendering
- **Bundle >500KB:** Not properly tree-shaken

### Warning Signs (Monitor)

- **FPS 50-55:** Approaching threshold, optimize
- **Memory 100-150MB:** High but acceptable
- **Draw calls 50-75:** Room for optimization
- **Frame time 16-20ms:** Little headroom
- **Bundle 200-500KB:** Large but acceptable

### Expected Metrics

- **FPS:** 60 constant
- **Memory:** <100MB
- **Draw calls:** 30-50
- **Frame time:** <16ms
- **Bundle:** <200KB gzipped

---

## Optimization Priority Matrix

### High Impact, Low Effort

1. **Cap DPR to 2** (1 line of code, 50-75% performance gain)
2. **Disable shadows** (1 line of code, 10-15ms saved)
3. **Selective Zustand subscriptions** (10 minutes, 90% fewer re-renders)
4. **Code split Canvas** (5 minutes, -200KB bundle)

### High Impact, Medium Effort

5. **Material reuse** (30 minutes, 2-3ms saved)
6. **Audio optimization** (1 hour, -200KB bandwidth)
7. **Mobile-specific rendering** (2 hours, 50% mobile performance gain)

### Medium Impact, Low Effort

8. **Geometry segment reduction** (10 minutes, 10-20% fewer triangles)
9. **useFrame instead of state** (case-by-case, prevents re-renders)

### Low Priority

10. Texture compression (no textures in this project)
11. Instanced rendering (only 27 objects, not needed)
12. LOD systems (simple geometry already)

---

## Testing Environments

### Desktop Targets

| Browser | OS | GPU | Expected FPS |
|---------|----|----|--------------|
| Chrome 120+ | Windows 11 | Integrated | 60 |
| Chrome 120+ | macOS 14+ | M1+ | 60 |
| Firefox 121+ | Linux | AMD/NVIDIA | 60 |
| Safari 17+ | macOS 14+ | M1+ | 60 |

### Mobile Targets

| Device | OS | Expected FPS |
|--------|----|--------------|
| iPhone 12+ | iOS 17+ | 60 |
| iPhone SE 2022 | iOS 17+ | 55-60 |
| Samsung Galaxy S21+ | Android 13+ | 60 |
| Google Pixel 6+ | Android 13+ | 60 |
| Mid-range Android | Android 12+ | 50-55 |

### Avoid Testing On

- **Desktop:** Pre-2015 hardware, IE11
- **Mobile:** <2020 devices, <2GB RAM, Android <10

---

## Handoff Notes

### For Implementation Team

- **All optimizations documented** - follow checklist
- **Performance budgets defined** - use as acceptance criteria
- **Profiling tools specified** - integrate into dev workflow
- **Device targets clear** - test on these platforms

### For Testing Team

- **FPS must be 60** on desktop, 50+ on mobile
- **Memory must be <100MB** after 100 games (no leaks)
- **Bundle must be <200KB** gzipped (excluding Three.js)
- **Touch latency must be <120ms** on mobile

### For Review Team

- Check `dpr={[1, 2]}` in Canvas
- Check `shadows={false}` in Canvas
- Check Zustand subscriptions are selective
- Check no state updates in `useFrame`
- Check material reuse pattern
- Check mobile detection logic

---

## Sources

- [React Three Fiber Performance](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- [Three.js Performance Best Practices](https://threejs.org/manual/#en/rendering-on-demand)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Web Performance Budgets](https://web.dev/performance-budgets-101/)
- [R3F Perf Monitor](https://github.com/RenaudRohlinger/r3f-perf)
- [Zustand Performance](https://docs.pmnd.rs/zustand/guides/performance)
- [React Spring Performance](https://www.react-spring.dev/docs/advanced/performance)
