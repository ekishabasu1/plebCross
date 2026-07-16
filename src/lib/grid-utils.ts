import type { Direction, PublicEntry, PublicPuzzle } from "./types";

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function entryKey(number: number, direction: Direction): string {
  return `${direction}-${number}`;
}

export function findEntryAt(
  puzzle: PublicPuzzle,
  row: number,
  col: number,
  direction: Direction
): PublicEntry | undefined {
  return puzzle.entries.find(
    (e) =>
      e.direction === direction && e.cells.some(([r, c]) => r === row && c === col)
  );
}

export function entryForCell(
  puzzle: PublicPuzzle,
  row: number,
  col: number,
  preferredDirection: Direction
): PublicEntry | undefined {
  return (
    findEntryAt(puzzle, row, col, preferredDirection) ??
    findEntryAt(puzzle, row, col, preferredDirection === "across" ? "down" : "across")
  );
}

export function nextEntry(
  puzzle: PublicPuzzle,
  current: PublicEntry,
  delta: 1 | -1
): PublicEntry {
  const sameDir = puzzle.entries.filter((e) => e.direction === current.direction);
  const idx = sameDir.findIndex((e) => e.number === current.number);
  const nextIdx = (idx + delta + sameDir.length) % sameDir.length;
  return sameDir[nextIdx];
}
