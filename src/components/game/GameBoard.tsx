'use client';

/**
 * Main game board component
 * Renders all cells and pieces, handles interactions
 * @module components/game/GameBoard
 */

import { useCallback } from 'react';
import { useGameStore, selectBoard, selectWinningLine, selectCanInteract, selectCurrentPlayer } from '@/stores/gameStore';
import { CELL_POSITIONS } from '@/lib/constants';
import { GridCell } from './GridCell';
import { GridLines } from './GridLines';
import { XPiece } from './XPiece';
import { OPiece } from './OPiece';
import { WinLine } from './WinLine';

/**
 * Main game board component
 * Uses selective Zustand subscriptions for optimal performance
 */
export function GameBoard() {
  // Selective subscriptions - only re-render when needed
  const board = useGameStore(selectBoard);
  const winningLine = useGameStore(selectWinningLine);
  const canInteract = useGameStore(selectCanInteract);
  const currentPlayer = useGameStore(selectCurrentPlayer);
  const makeMove = useGameStore((state) => state.makeMove);

  // Handle cell click
  const handleCellClick = useCallback(
    (index: number) => {
      makeMove(index);
    },
    [makeMove]
  );

  // Check if a cell is part of the winning line
  const isWinningCell = useCallback(
    (index: number) => {
      return winningLine?.includes(index) ?? false;
    },
    [winningLine]
  );

  return (
    <group>
      {/* Glowing grid separator lines */}
      <GridLines />

      {/* Render all 27 cells and pieces */}
      {CELL_POSITIONS.map((position, index) => {
        const cellState = board[index];
        const isEmpty = cellState === 'empty';
        const positionArray = position as [number, number, number];

        return (
          <group key={index}>
            {/* Grid cell (interactive area) */}
            <GridCell
              position={positionArray}
              index={index}
              isEmpty={isEmpty}
              isInteractive={canInteract}
              currentPlayer={currentPlayer}
              onClick={handleCellClick}
            />

            {/* Render X piece if cell is X */}
            {cellState === 'X' && (
              <XPiece
                position={positionArray}
                isWinning={isWinningCell(index)}
              />
            )}

            {/* Render O piece if cell is O */}
            {cellState === 'O' && (
              <OPiece
                position={positionArray}
                isWinning={isWinningCell(index)}
              />
            )}
          </group>
        );
      })}

      {/* Render winning line if game is won */}
      {winningLine && winningLine.length === 3 && winningLine[0] !== undefined && winningLine[2] !== undefined && (
        <WinLine
          startIndex={winningLine[0]}
          endIndex={winningLine[2]}
        />
      )}
    </group>
  );
}

export default GameBoard;
