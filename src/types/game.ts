/**
 * Game type definitions for 3D Tic-Tac-Toe
 * @module types/game
 */

/** State of a single cell in the 3D grid */
export type CellState = 'empty' | 'X' | 'O';

/** The two players in the game */
export type Player = 'X' | 'O';

/** Current phase of the game */
export type GamePhase = 'menu' | 'playing' | 'gameOver';

/** Outcome of a game - winner, draw, or ongoing (null) */
export type GameOutcome = Player | 'draw' | null;

/** Game mode - Player vs Player or Player vs AI */
export type GameMode = 'pvp' | 'ai';

/** AI difficulty levels */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';

/** 3D coordinates in the grid */
export interface Coord3D {
  x: number;
  y: number;
  z: number;
}

/** Core game state */
export interface GameState {
  /** 27-cell array representing the 3x3x3 grid */
  board: CellState[];
  /** Which player's turn it is */
  currentPlayer: Player;
  /** Current game phase */
  phase: GamePhase;
  /** Winner of the game, 'draw', or null if ongoing */
  winner: GameOutcome;
  /** Indices of the winning line, or null */
  winningLine: number[] | null;
  /** Number of moves made so far */
  moveCount: number;
  /** Current game mode */
  gameMode: GameMode;
  /** Whether the AI is currently computing a move */
  isAIThinking: boolean;
}

/** User settings that persist across games */
export interface Settings {
  /** Whether sound effects are enabled */
  soundEnabled: boolean;
  /** AI difficulty level */
  aiDifficulty: Difficulty;
  /** Which player goes first in AI mode */
  firstPlayer: Player;
}

/** Combined store state including settings */
export interface StoreState extends GameState {
  /** User settings */
  settings: Settings;
  /** Whether the settings panel is open */
  isSettingsOpen: boolean;
}

/** Actions available in the game store */
export interface GameActions {
  /** Start a new game */
  startGame: () => void;
  /** Make a move at the given cell index */
  makeMove: (index: number) => void;
  /** Restart the current game */
  restartGame: () => void;
  /** Return to the main menu */
  returnToMenu: () => void;
  /** Set the game mode */
  setGameMode: (mode: GameMode) => void;
  /** Set AI thinking state */
  setAIThinking: (thinking: boolean) => void;
  /** Update settings */
  updateSettings: (settings: Partial<Settings>) => void;
  /** Open the settings panel */
  openSettings: () => void;
  /** Close the settings panel */
  closeSettings: () => void;
}

/** A winning line represented as three cell indices */
export type WinningLine = readonly [number, number, number];

/** Animation configuration for spring animations */
export interface SpringConfig {
  tension: number;
  friction: number;
}
