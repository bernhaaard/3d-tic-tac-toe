'use client';

/**
 * Main game board component
 * Renders pieces, grid lines, and handles cell selection
 * @module components/game/GameBoard
 */

import { useCallback } from 'react';
import {
  useGameStore,
  selectBoard,
  selectWinningLine,
  selectCanInteract,
  selectCurrentPlayer,
} from '@/stores/gameStore';
import { CELL_POSITIONS } from '@/lib/constants';
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
  const board = useGameStore(selectBoard);
  const winningLine = useGameStore(selectWinningLine);
  const canInteract = useGameStore(selectCanInteract);
  const currentPlayer = useGameStore(selectCurrentPlayer);
  const makeMove = useGameStore((state) => state.makeMove);

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

      {/* Cell selection with geometric calculation */}
      <CellSelector
        board={board}
        isInteractive={canInteract}
        currentPlayer={currentPlayer}
        onCellClick={handleCellClick}
      />

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
