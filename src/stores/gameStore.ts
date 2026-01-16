'use client';

/**
 * Zustand store for game state management
 * @module stores/gameStore
 */

import { create } from 'zustand';
import type {
  CellState,
  GameActions,
  GameMode,
  GamePhase,
  GameOutcome,
  Player,
  Settings,
  StoreState,
} from '@/types/game';
import { makeMove as gameMakeMove, createInitialGameState } from '@/lib/gameLogic';
import { TOTAL_CELLS } from '@/lib/constants';

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  aiDifficulty: 'medium',
  humanPlayer: 'X',
  aiMovesFirst: false,
};

// ============================================================================
// STORE TYPE
// ============================================================================

type GameStore = StoreState & GameActions;

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial game state
  board: Array<CellState>(TOTAL_CELLS).fill('empty'),
  currentPlayer: 'X' as Player,
  phase: 'menu' as GamePhase,
  winner: null as GameOutcome,
  winningLine: null,
  moveCount: 0,
  gameMode: 'pvp' as GameMode,
  isAIThinking: false,

  // Settings
  settings: DEFAULT_SETTINGS,
  isSettingsOpen: false,

  // ============================================================================
  // GAME ACTIONS
  // ============================================================================

  startGame: () => {
    const { settings, gameMode } = get();
    // In AI mode: determine first player based on aiMovesFirst setting
    // AI plays the opposite of humanPlayer
    let firstPlayer: Player = 'X';
    if (gameMode === 'ai') {
      const aiPlayer = settings.humanPlayer === 'X' ? 'O' : 'X';
      firstPlayer = settings.aiMovesFirst ? aiPlayer : settings.humanPlayer;
    }

    set({
      board: Array<CellState>(TOTAL_CELLS).fill('empty'),
      currentPlayer: firstPlayer,
      phase: 'playing',
      winner: null,
      winningLine: null,
      moveCount: 0,
      isAIThinking: false,
    });
  },

  makeMove: (index: number) => {
    const state = get();

    // Don't allow moves while AI is thinking
    if (state.isAIThinking) {
      return;
    }

    // Use the pure game logic function
    const currentGameState = {
      board: state.board,
      currentPlayer: state.currentPlayer,
      phase: state.phase,
      winner: state.winner,
      winningLine: state.winningLine,
      moveCount: state.moveCount,
      gameMode: state.gameMode,
      isAIThinking: state.isAIThinking,
    };

    const newState = gameMakeMove(currentGameState, index);

    if (newState) {
      set({
        board: newState.board,
        currentPlayer: newState.currentPlayer,
        phase: newState.phase,
        winner: newState.winner,
        winningLine: newState.winningLine,
        moveCount: newState.moveCount,
        isAIThinking: false,
      });
    }
  },

  restartGame: () => {
    const { settings, gameMode } = get();
    // Same logic as startGame
    let firstPlayer: Player = 'X';
    if (gameMode === 'ai') {
      const aiPlayer = settings.humanPlayer === 'X' ? 'O' : 'X';
      firstPlayer = settings.aiMovesFirst ? aiPlayer : settings.humanPlayer;
    }

    set({
      board: Array<CellState>(TOTAL_CELLS).fill('empty'),
      currentPlayer: firstPlayer,
      phase: 'playing',
      winner: null,
      winningLine: null,
      moveCount: 0,
      isAIThinking: false,
    });
  },

  returnToMenu: () => {
    set({
      ...createInitialGameState(),
      phase: 'menu',
    });
  },

  setGameMode: (mode: GameMode) => {
    set({ gameMode: mode });
  },

  setAIThinking: (thinking: boolean) => {
    set({ isAIThinking: thinking });
  },

  // ============================================================================
  // SETTINGS ACTIONS
  // ============================================================================

  updateSettings: (newSettings: Partial<Settings>) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
      },
    }));
  },

  openSettings: () => {
    set({ isSettingsOpen: true });
  },

  closeSettings: () => {
    set({ isSettingsOpen: false });
  },
}));

// ============================================================================
// SELECTORS (for optimized subscriptions)
// ============================================================================

/** Select only the board state */
export const selectBoard = (state: GameStore) => state.board;

/** Select the current player */
export const selectCurrentPlayer = (state: GameStore) => state.currentPlayer;

/** Select the game phase */
export const selectPhase = (state: GameStore) => state.phase;

/** Select the winner */
export const selectWinner = (state: GameStore) => state.winner;

/** Select the winning line */
export const selectWinningLine = (state: GameStore) => state.winningLine;

/** Select move count */
export const selectMoveCount = (state: GameStore) => state.moveCount;

/** Select game mode */
export const selectGameMode = (state: GameStore) => state.gameMode;

/** Select AI thinking state */
export const selectIsAIThinking = (state: GameStore) => state.isAIThinking;

/** Select settings */
export const selectSettings = (state: GameStore) => state.settings;

/** Select whether settings panel is open */
export const selectIsSettingsOpen = (state: GameStore) => state.isSettingsOpen;

/** Select whether it's the player's turn (not AI thinking) */
export const selectCanInteract = (state: GameStore) =>
  state.phase === 'playing' && !state.isAIThinking;

/** Select whether the game is over */
export const selectIsGameOver = (state: GameStore) => state.phase === 'gameOver';

/** Select sound enabled setting */
export const selectSoundEnabled = (state: GameStore) => state.settings.soundEnabled;

/** Select AI difficulty setting */
export const selectAIDifficulty = (state: GameStore) => state.settings.aiDifficulty;
