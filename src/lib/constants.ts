/**
 * Game constants for 3D Tic-Tac-Toe
 * @module lib/constants
 */

import type { SpringConfig, WinningLine } from '@/types/game';

// ============================================================================
// GRID CONSTANTS
// ============================================================================

/** Number of cells along each axis */
export const GRID_SIZE = 3;

/** Total number of cells in the 3D grid */
export const TOTAL_CELLS = 27;

/** Size of each cell in 3D units */
export const CELL_SIZE = 2.0;

/** Spacing between cell centers */
export const CELL_SPACING = 2.2;

/** Visual separation between layers (z-axis) */
export const LAYER_SEPARATION = 2.5;

/** Center offset to position grid at origin */
export const CENTER_OFFSET = (GRID_SIZE - 1) * CELL_SPACING / 2;

// ============================================================================
// 49 WINNING LINES
// ============================================================================

/**
 * All 49 possible winning lines in 3D Tic-Tac-Toe
 *
 * Grid layout (indices):
 * z=0 (front):     z=1 (middle):    z=2 (back):
 * [0]  [1]  [2]    [9]  [10] [11]   [18] [19] [20]
 * [3]  [4]  [5]    [12] [13] [14]   [21] [22] [23]
 * [6]  [7]  [8]    [15] [16] [17]   [24] [25] [26]
 */
export const WINNING_LINES: ReadonlyArray<WinningLine> = [
  // ========== ROWS (9 lines) - Horizontal X-axis ==========
  // Layer z=0
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  // Layer z=1
  [9, 10, 11], [12, 13, 14], [15, 16, 17],
  // Layer z=2
  [18, 19, 20], [21, 22, 23], [24, 25, 26],

  // ========== COLUMNS (9 lines) - Vertical Y-axis ==========
  // Layer z=0
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  // Layer z=1
  [9, 12, 15], [10, 13, 16], [11, 14, 17],
  // Layer z=2
  [18, 21, 24], [19, 22, 25], [20, 23, 26],

  // ========== LAYER DIAGONALS (6 lines) - Within XY planes ==========
  // Layer z=0
  [0, 4, 8], [2, 4, 6],
  // Layer z=1
  [9, 13, 17], [11, 13, 15],
  // Layer z=2
  [18, 22, 26], [20, 22, 24],

  // ========== VERTICAL COLUMNS (9 lines) - Through Z-axis ==========
  // x=0
  [0, 9, 18], [3, 12, 21], [6, 15, 24],
  // x=1
  [1, 10, 19], [4, 13, 22], [7, 16, 25],
  // x=2
  [2, 11, 20], [5, 14, 23], [8, 17, 26],

  // ========== VERTICAL FACE DIAGONALS (12 lines) ==========
  // XZ face (Y constant)
  [0, 10, 20], [2, 10, 18],  // y=0
  [3, 13, 23], [5, 13, 21],  // y=1
  [6, 16, 26], [8, 16, 24],  // y=2
  // YZ face (X constant)
  [0, 12, 24], [6, 12, 18],  // x=0
  [1, 13, 25], [7, 13, 19],  // x=1
  [2, 14, 26], [8, 14, 20],  // x=2

  // ========== SPACE DIAGONALS (4 lines) - Through center ==========
  [0, 13, 26],  // (0,0,0) → (1,1,1) → (2,2,2)
  [2, 13, 24],  // (2,0,0) → (1,1,1) → (0,2,2)
  [6, 13, 20],  // (0,2,0) → (1,1,1) → (2,0,2)
  [8, 13, 18],  // (2,2,0) → (1,1,1) → (0,0,2)
] as const;

// ============================================================================
// CELL TO LINES LOOKUP (Pre-computed)
// ============================================================================

/**
 * Maps each cell index to the indices of winning lines that contain it
 * Center cell (13) appears in 16 lines - most strategic position
 */
export const CELL_TO_LINES: ReadonlyArray<readonly number[]> = Array.from(
  { length: TOTAL_CELLS },
  (_, cellIndex) =>
    WINNING_LINES
      .map((line, lineIndex) => (line.includes(cellIndex) ? lineIndex : -1))
      .filter((lineIndex): lineIndex is number => lineIndex !== -1)
);

/** Index of the center cell (most strategic) */
export const CENTER_CELL = 13;

/** Corner cell indices */
export const CORNER_CELLS = [0, 2, 6, 8, 18, 20, 24, 26] as const;

/** Edge cell indices (excluding corners and centers) */
export const EDGE_CELLS = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25] as const;

/** Face center indices */
export const FACE_CENTERS = [4, 10, 12, 14, 16, 22] as const;

// ============================================================================
// 3D POSITIONS
// ============================================================================

/**
 * Pre-computed 3D positions for all 27 cells
 * Indexed by cell index (0-26)
 */
export const CELL_POSITIONS: ReadonlyArray<readonly [number, number, number]> =
  Array.from({ length: TOTAL_CELLS }, (_, index) => {
    const x = (index % 3) * CELL_SPACING - CENTER_OFFSET;
    const y = (Math.floor(index / 3) % 3) * CELL_SPACING - CENTER_OFFSET;
    const z = Math.floor(index / 9) * LAYER_SEPARATION - LAYER_SEPARATION;
    return [x, y, z] as const;
  });

// ============================================================================
// ANIMATION CONSTANTS
// ============================================================================

/** Spring configuration for piece placement animation */
export const PIECE_SPRING: SpringConfig = {
  tension: 200,
  friction: 20,
};

/** Animation configuration values */
export const ANIMATION_CONFIG = {
  // Piece placement
  pieceSpring: PIECE_SPRING,

  // Hover effects
  hoverDuration: 150,
  hoverScale: 1.1,
  hoverOpacity: 0.2,
  defaultOpacity: 0.05,

  // Win line
  winLineDelay: 200,
  winPulseDuration: 1000,

  // Screen transitions
  transitionDuration: 200,

  // AI thinking indicator
  thinkingPulseDuration: 800,
} as const;

// ============================================================================
// CAMERA CONFIGURATION
// ============================================================================

export const CAMERA_CONFIG = {
  position: [8, 8, 8] as const,
  fov: 50,
  near: 0.1,
  far: 1000,
} as const;

export const ORBIT_CONTROLS_CONFIG = {
  minPolarAngle: Math.PI * 0.2,
  maxPolarAngle: Math.PI * 0.8,
  minDistance: 10,
  maxDistance: 25,
  enablePan: false,
  enableDamping: true,
  dampingFactor: 0.05,
  zoomSpeed: 0.8,
} as const;

// ============================================================================
// 3D PIECE GEOMETRY
// ============================================================================

export const PIECE_GEOMETRY = {
  x: {
    cylinderRadius: 0.12,
    cylinderLength: 1.6,
    segments: 8,
    rotationAngle: Math.PI / 4,
  },
  o: {
    torusRadius: 0.7,
    tubeRadius: 0.15,
    radialSegments: 8,
    tubularSegments: 24,
  },
} as const;

// ============================================================================
// COLORS (for 3D materials)
// ============================================================================

export const COLORS = {
  cyan: '#00E4E4',
  magenta: '#FF0088',
  background: '#1a1a2e',
  surface: '#16213e',
  grid: '#4B5563',
} as const;

// ============================================================================
// MATERIAL PROPERTIES
// ============================================================================

export const MATERIAL_CONFIG = {
  piece: {
    metalness: 0.3,
    roughness: 0.4,
    emissiveIntensity: 0.2,
  },
  grid: {
    metalness: 0.1,
    roughness: 0.8,
    opacity: 0.3,
  },
} as const;
