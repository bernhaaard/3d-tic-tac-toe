'use client';

/**
 * Main game board component
 * Renders pieces, grid lines, and handles cell selection
 * @module components/game/GameBoard
 */

import { useCallback, useMemo } from 'react';
import {
  useGameStore,
  selectBoard,
  selectWinningLine,
  selectCanInteract,
  selectCurrentPlayer,
  selectPhase,
} from '@/stores/gameStore';
import { CELL_POSITIONS } from '@/lib/constants';
import type { CellState } from '@/types/game';

/**
 * Demo board state shown on the main menu
 * Shows a mid-game scenario to make the menu more interesting
 */
const DEMO_BOARD: CellState[] = [
  // Layer 0 (z=0, bottom)
  'X', 'empty', 'empty',  // y=0
  'empty', 'O', 'empty',  // y=1
  'empty', 'empty', 'X',  // y=2
  // Layer 1 (z=1, middle)
  'empty', 'empty', 'O',  // y=0
  'empty', 'X', 'empty',  // y=1
  'O', 'empty', 'empty',  // y=2
  // Layer 2 (z=2, top)
  'empty', 'O', 'empty',  // y=0
  'empty', 'empty', 'empty', // y=1
  'X', 'empty', 'empty',  // y=2
];
import { GridLines } from './GridLines';
import { CellSelector } from './CellSelector';
import { XPiece } from './XPiece';
import { OPiece } from './OPiece';
import { WinLine } from './WinLine';

/**
 * Main game board component
 * Uses selective Zustand subscriptions for optimal performance
 */
export function GameBoard() {
  const gameBoard = useGameStore(selectBoard);
  const phase = useGameStore(selectPhase);
  const winningLine = useGameStore(selectWinningLine);
  const canInteract = useGameStore(selectCanInteract);
  const currentPlayer = useGameStore(selectCurrentPlayer);
  const makeMove = useGameStore((state) => state.makeMove);

  // Use demo board on menu, actual game board otherwise
  const board = useMemo(() => {
    return phase === 'menu' ? DEMO_BOARD : gameBoard;
  }, [phase, gameBoard]);

  const handleCellClick = useCallback(
    (index: number) => {
      makeMove(index);
    },
    [makeMove]
  );

  const isWinningCell = useCallback(
    (index: number) => {
      return winningLine?.includes(index) ?? false;
    },
    [winningLine]
  );

  return (
    <group>
      {/* Glowing grid lines (# pattern on each layer) */}
      <GridLines />

      {/* Cell selection with geometric calculation - only show during gameplay */}
      {phase !== 'menu' && (
        <CellSelector
          board={board}
          isInteractive={canInteract}
          currentPlayer={currentPlayer}
          onCellClick={handleCellClick}
        />
      )}

      {/* Render pieces for filled cells */}
      {CELL_POSITIONS.map((position, index) => {
        const cellState = board[index];
        if (cellState === 'empty') return null;

        const positionArray = position as [number, number, number];

        return cellState === 'X' ? (
          <XPiece
            key={`x-${index}`}
            position={positionArray}
            isWinning={isWinningCell(index)}
          />
        ) : (
          <OPiece
            key={`o-${index}`}
            position={positionArray}
            isWinning={isWinningCell(index)}
          />
        );
      })}

      {/* Winning line visualization */}
      {winningLine &&
        winningLine.length === 3 &&
        winningLine[0] !== undefined &&
        winningLine[2] !== undefined && (
          <WinLine startIndex={winningLine[0]} endIndex={winningLine[2]} />
        )}
    </group>
  );
}

export default GameBoard;
