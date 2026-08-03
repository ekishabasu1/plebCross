"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Direction, PublicPuzzle } from "@/lib/types";
import { cellKey } from "@/lib/grid-utils";

interface CrosswordGridProps {
  puzzle: PublicPuzzle;
  values: string[][];
  selected: { row: number; col: number } | null;
  direction: Direction;
  activeCells: Set<string>;
  revealedCells: Set<string>;
  wrongCells: Set<string>;
  onSelectCell: (row: number, col: number) => void;
  onType: (row: number, col: number, letter: string) => void;
  onBackspace: (row: number, col: number) => void;
  onMove: (row: number, col: number, dRow: number, dCol: number) => void;
}

export function CrosswordGrid({
  puzzle,
  values,
  selected,
  activeCells,
  revealedCells,
  wrongCells,
  onSelectCell,
  onType,
  onBackspace,
  onMove,
}: CrosswordGridProps) {
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (!selected) return;
    const el = cellRefs.current.get(cellKey(selected.row, selected.col));
    el?.focus();
  }, [selected]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, row: number, col: number) => {
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        onType(row, col, e.key.toUpperCase());
      } else if (e.key === "Backspace") {
        e.preventDefault();
        onBackspace(row, col);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onMove(row, col, 0, 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onMove(row, col, 0, -1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onMove(row, col, 1, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onMove(row, col, -1, 0);
      }
    },
    [onType, onBackspace, onMove]
  );

  return (
    <div
      className="grid select-none rounded-md overflow-hidden border-2 border-neutral-800 dark:border-neutral-300 shadow-sm mx-auto"
      style={{
        gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
        aspectRatio: `${puzzle.cols} / ${puzzle.rows}`,
        maxWidth: "min(94vw, 640px)",
      }}
    >
      {puzzle.cells.flatMap((row) =>
        row.map((cell) => {
          const key = cellKey(cell.row, cell.col);
          if (cell.block) {
            return (
              <div
                key={key}
                className="bg-neutral-900 dark:bg-black border border-neutral-700"
              />
            );
          }

          const isSelected =
            selected && selected.row === cell.row && selected.col === cell.col;
          const isActive = activeCells.has(key);
          const isRevealed = revealedCells.has(key);
          const isWrong = wrongCells.has(key);
          const letter = values[cell.row]?.[cell.col] ?? "";

          return (
            <button
              type="button"
              key={key}
              ref={(el) => {
                if (el) cellRefs.current.set(key, el);
                else cellRefs.current.delete(key);
              }}
              onClick={() => onSelectCell(cell.row, cell.col)}
              onKeyDown={(e) => handleKeyDown(e, cell.row, cell.col)}
              className={`relative flex items-center justify-center border border-neutral-300 dark:border-neutral-600 text-xs sm:text-lg font-medium aspect-square transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                isSelected
                  ? "bg-amber-300 dark:bg-amber-400"
                  : isActive
                  ? "bg-sky-100 dark:bg-sky-900"
                  : "bg-white dark:bg-neutral-950"
              }`}
            >
              {cell.number !== null && (
                <span className="absolute top-0.5 left-1 text-[9px] sm:text-[10px] leading-none text-neutral-500 dark:text-neutral-400">
                  {cell.number}
                </span>
              )}
              <span
                className={
                  isWrong
                    ? "text-red-600 dark:text-red-400"
                    : isRevealed
                    ? "text-red-600 dark:text-red-400"
                    : "text-neutral-900 dark:text-neutral-100"
                }
              >
                {letter}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}
