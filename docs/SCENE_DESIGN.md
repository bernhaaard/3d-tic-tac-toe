# 3D Scene Design Specification

**Last Updated:** January 2026
**Scope:** Camera, lighting, grid structure, and piece geometry for the 3×3×3 board

---

## Coordinate System

```
Y (up)
|
|
+---- X (right)
 \
  Z (toward viewer)
```

Right-handed coordinate system with Y-up (Three.js/R3F standard).

---

## Grid Structure

### Cell Dimensions

| Property | Value | Unit |
|----------|-------|------|
| Cell size | 2.0 | units |
| Cell spacing | 0.3 | units |
| Layer separation | 2.3 | units |

### Total Grid Size

- **Width (X):** 7.2 units
- **Height (Y):** 7.2 units
- **Depth (Z):** 7.2 units

Grid is centered at world origin (0, 0, 0).

### Cell Position Calculation

```typescript
const CELL_SIZE = 2.0;
const CELL_SPACING = 0.3;
const LAYER_SEPARATION = CELL_SIZE + CELL_SPACING;

const calculateCellPosition = (index: number): [number, number, number] => {
  const x = index % 3;
  const y = Math.floor(index / 3) % 3;
  const z = Math.floor(index / 9);

  return [
    (x - 1) * LAYER_SEPARATION,
    (y - 1) * LAYER_SEPARATION,
    (z - 1) * LAYER_SEPARATION,
  ];
};

// Pre-computed array of all 27 cell positions
const CELL_POSITIONS: [number, number, number][] = Array.from(
  { length: 27 },
  (_, i) => calculateCellPosition(i)
);
```

### Example Positions

| Index | Coordinates | Position |
|-------|-------------|----------|
| 0 | (0,0,0) | [-2.3, -2.3, -2.3] |
| 13 | (1,1,1) | [0, 0, 0] (center) |
| 26 | (2,2,2) | [2.3, 2.3, 2.3] |

---

## Camera Setup

### Initial Position

```typescript
const CAMERA_CONFIG = {
  position: [8, 8, 8] as [number, number, number],
  fov: 50,
  near: 0.1,
  far: 1000,
  target: [0, 0, 0] as [number, number, number],
};
```

**Rationale:**
- FOV 50° provides natural perspective without distortion
- Equal position on all axes creates isometric-like view
- Shows all three axes clearly

### Orbital Constraints

```typescript
const ORBIT_CONFIG = {
  minPolarAngle: Math.PI * 0.2,   // 36° - prevent flat top view
  maxPolarAngle: Math.PI * 0.8,   // 144° - prevent flat bottom view
  minDistance: 10,
  maxDistance: 25,
  enablePan: false,
  enableDamping: true,
  dampingFactor: 0.05,
  enableZoom: true,
  zoomSpeed: 0.8,
};
```

### Camera Presets (Optional)

| Preset | Position | Description |
|--------|----------|-------------|
| Default | [8, 8, 8] | Isometric view |
| Top | [0, 15, 0] | Bird's eye view |
| Front | [0, 4, 12] | Front view |
| Side | [12, 4, 0] | Side view |

---

## Lighting Configuration

### Three-Point Lighting Setup

```typescript
const LIGHTING_CONFIG = {
  ambient: {
    intensity: 0.4,
    color: '#ffffff',
  },
  directional: {
    position: [10, 15, 10] as [number, number, number],
    intensity: 0.8,
    color: '#ffffff',
    castShadow: false,  // Performance
  },
  fill: {
    position: [-8, 5, -8] as [number, number, number],
    intensity: 0.3,
    color: '#ffffff',
    distance: 30,
    decay: 2,
  },
};
```

### Implementation

```tsx
<ambientLight intensity={0.4} />
<directionalLight
  position={[10, 15, 10]}
  intensity={0.8}
  castShadow={false}
/>
<pointLight
  position={[-8, 5, -8]}
  intensity={0.3}
  distance={30}
  decay={2}
/>
```

---

## Piece Geometry

### X Marker (Two Crossed Cylinders)

```typescript
const X_PIECE_CONFIG = {
  cylinderRadius: 0.12,
  cylinderLength: 1.6,    // 80% of cell size
  radialSegments: 8,
  heightSegments: 1,
};

function XPiece({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.12, 0.12, 1.6, 8, 1]} />
        <meshStandardMaterial roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.12, 0.12, 1.6, 8, 1]} />
        <meshStandardMaterial roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}
```

### O Marker (Torus)

```typescript
const O_PIECE_CONFIG = {
  radius: 0.7,
  tubeRadius: 0.15,
  radialSegments: 8,
  tubularSegments: 24,
};

function OPiece({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <torusGeometry args={[0.7, 0.15, 8, 24]} />
      <meshStandardMaterial roughness={0.3} metalness={0.1} />
    </mesh>
  );
}
```

---

## Grid Visualization

### Recommended: Edge Lines with Transparent Cells

```typescript
function GridCell({ position, index }: { position: [number, number, number]; index: number }) {
  return (
    <group position={position}>
      {/* Transparent cell volume */}
      <mesh>
        <boxGeometry args={[2.0, 2.0, 2.0]} />
        <meshStandardMaterial transparent opacity={0.05} />
      </mesh>

      {/* Wireframe edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.0, 2.0, 2.0)]} />
        <lineBasicMaterial transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}
```

---

## Environment

### Background

```tsx
<color attach="background" args={['#1a1a2e']} />
```

Solid dark color keeps focus on the game grid. Specific color from visual-researcher.

---

## Spatial Diagram

```
Layer 2 (z=1):         Layer 1 (z=0):         Layer 0 (z=-1):
[18][19][20]           [9][10][11]            [0][1][2]
[21][22][23]           [12][13][14]           [3][4][5]
[24][25][26]           [15][16][17]           [6][7][8]

(back layer)           (middle layer)         (front layer)
```

---

## Component Hierarchy

```tsx
<Canvas>
  <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
  <OrbitControls {...ORBIT_CONFIG} />

  {/* Lighting */}
  <ambientLight intensity={0.4} />
  <directionalLight position={[10, 15, 10]} intensity={0.8} />
  <pointLight position={[-8, 5, -8]} intensity={0.3} />

  {/* Background */}
  <color attach="background" args={['#1a1a2e']} />

  {/* Game Grid */}
  {CELL_POSITIONS.map((position, index) => (
    <GridCell key={index} position={position} index={index} />
  ))}

  {/* Game Pieces */}
  {gameState.board.map((cell, index) =>
    cell === 'X' ? (
      <XPiece key={`x-${index}`} position={CELL_POSITIONS[index]} />
    ) : cell === 'O' ? (
      <OPiece key={`o-${index}`} position={CELL_POSITIONS[index]} />
    ) : null
  )}
</Canvas>
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Frame Rate | 60 FPS |
| Draw Calls | < 50 |
| Triangles | < 10,000 |
| Memory | < 100MB |

---

## Technical Specifications

| Parameter | Value | Unit |
|-----------|-------|------|
| Cell Size | 2.0 | units |
| Cell Spacing | 0.3 | units |
| Layer Separation | 2.3 | units |
| Camera FOV | 50 | degrees |
| Camera Distance | 13.86 | units |
| Polar Angle Range | 36° - 144° | degrees |
| Min View Distance | 10 | units |
| Max View Distance | 25 | units |

---

## Handoff Notes

### For Input Researcher
- Grid cells need raycasting interaction
- `CELL_POSITIONS` array available for hit detection
- OrbitControls configured - don't conflict

### For Animation Researcher
- Piece placement should animate (scale/fade in)
- Win line visualization needed
- Camera preset transitions

### For Visual Researcher
- Color palette needed for pieces, grid, background
- Material color properties ready

### For UI Researcher
- Camera presets from UI buttons
- Performance metrics overlay (debug mode)

---

## Sources

- [React Three Fiber Documentation](https://r3f.docs.pmnd.rs/)
- [OrbitControls - Drei](https://drei.docs.pmnd.rs/controls/orbit-controls)
- [Three.js Lighting Guide](https://threejs.org/docs/#api/en/lights/DirectionalLight)
