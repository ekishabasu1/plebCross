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
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selected) return;
    hiddenInputRef.current?.focus();
  }, [selected]);

  function focusHiddenInput() {
    hiddenInputRef.current?.focus();
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, row: number, col: number) => {
      if (e.key === "Backspace") {
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
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        // Handled in onChange too, but physical keyboards fire this
        // reliably and synchronously, so prevent the duplicate input event.
        e.preventDefault();
        onType(row, col, e.key.toUpperCase());
      }
    },
    [onType, onBackspace, onMove]
  );

  function handleHiddenInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    e.target.value = "";
    if (!selected) return;
    const letter = value.slice(-1);
    if (/^[a-zA-Z]$/.test(letter)) {
      onType(selected.row, selected.col, letter.toUpperCase());
    }
  }

  return (
    <div className="relative mx-auto" style={{ maxWidth: "min(94vw, 640px)" }}>
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="sr-only text-base"
        onChange={handleHiddenInputChange}
        onKeyDown={(e) => selected && handleKeyDown(e, selected.row, selected.col)}
        aria-label="Crossword letter input"
      />
      <div
        className="grid select-none rounded-xl overflow-hidden border-2 border-foreground shadow-brutal-lg bg-card"
        style={{
          gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
          aspectRatio: `${puzzle.cols} / ${puzzle.rows}`,
        }}
      >
        {puzzle.cells.flatMap((row) =>
          row.map((cell) => {
            const key = cellKey(cell.row, cell.col);
            if (cell.block) {
              return (
                <div key={key} className="bg-foreground border border-foreground/50" />
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
                onClick={() => {
                  onSelectCell(cell.row, cell.col);
                  focusHiddenInput();
                }}
                className={`relative flex items-center justify-center border border-foreground/30 text-xs sm:text-lg font-black aspect-square transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring ${
                  isWrong ? "animate-shake" : ""
                } ${
                  isSelected
                    ? "bg-primary shadow-[inset_0_0_0_2px_var(--foreground)] scale-[1.04] z-10"
                    : isActive
                    ? "bg-secondary/30"
                    : "bg-card hover:bg-secondary/15"
                }`}
              >
                {cell.number !== null && (
                  <span className="absolute top-0.5 left-1 text-[9px] sm:text-[10px] leading-none text-muted-foreground">
                    {cell.number}
                  </span>
                )}
                <span
                  key={letter || "empty"}
                  className={`${letter ? "animate-pop-in" : ""} ${
                    isWrong
                      ? "text-destructive"
                      : isRevealed
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {letter}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
