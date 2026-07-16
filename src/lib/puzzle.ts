import "server-only";
import type { Direction, PublicCell, PublicEntry, PublicPuzzle } from "./types";

// Original demo mini puzzle (not sourced from any published NYT grid).
// "#" marks a block square; every other character is the solution letter.
const GRID_ROWS = ["LOST#", "OUTER", "STORE", "TERMS", "#REST"];

const ACROSS_CLUES: Record<number, string> = {
  1: "Unable to find one's way",
  5: "Farthest from the center",
  7: "Place to buy milk and eggs",
  8: "Conditions of an agreement",
  9: "Relaxation, or what's left",
};

const DOWN_CLUES: Record<number, string> = {
  1: "Hit ABC series about island plane-crash survivors, with \"The\"",
  2: "\"___ Banks,\" N.C. vacation spot",
  3: "Apple ___ (spot to buy an iPhone)",
  4: "\"___ of Endearment\" (1983 Best Picture winner)",
  6: "\"___ in peace\" (epitaph phrase)",
};

export const PUZZLE_TITLE = "PlebCross Mini";

interface EntryFull extends PublicEntry {
  answer: string;
}

interface BuiltPuzzle {
  rows: number;
  cols: number;
  cellNumbers: (number | null)[][];
  blocks: boolean[][];
  entries: EntryFull[];
}

function build(): BuiltPuzzle {
  const rows = GRID_ROWS.length;
  const cols = GRID_ROWS[0].length;
  const blocks: boolean[][] = [];
  const letters: (string | null)[][] = [];

  for (let r = 0; r < rows; r++) {
    const blockRow: boolean[] = [];
    const letterRow: (string | null)[] = [];
    for (let c = 0; c < cols; c++) {
      const ch = GRID_ROWS[r][c];
      const isBlock = ch === "#";
      blockRow.push(isBlock);
      letterRow.push(isBlock ? null : ch);
    }
    blocks.push(blockRow);
    letters.push(letterRow);
  }

  const cellNumbers: (number | null)[][] = Array.from({ length: rows }, () =>
    Array<number | null>(cols).fill(null)
  );
  const entries: EntryFull[] = [];
  let nextNumber = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (blocks[r][c]) continue;

      const startsAcross =
        (c === 0 || blocks[r][c - 1]) && c + 1 < cols && !blocks[r][c + 1];
      const startsDown =
        (r === 0 || blocks[r - 1][c]) && r + 1 < rows && !blocks[r + 1][c];

      if (!startsAcross && !startsDown) continue;

      const number = nextNumber++;
      cellNumbers[r][c] = number;

      if (startsAcross) {
        const cells: [number, number][] = [];
        let cc = c;
        let answer = "";
        while (cc < cols && !blocks[r][cc]) {
          cells.push([r, cc]);
          answer += letters[r][cc];
          cc++;
        }
        entries.push({
          number,
          direction: "across",
          clue: ACROSS_CLUES[number] ?? "",
          length: cells.length,
          row: r,
          col: c,
          cells,
          answer,
        });
      }

      if (startsDown) {
        const cells: [number, number][] = [];
        let rr = r;
        let answer = "";
        while (rr < rows && !blocks[rr][c]) {
          cells.push([rr, c]);
          answer += letters[rr][c];
          rr++;
        }
        entries.push({
          number,
          direction: "down",
          clue: DOWN_CLUES[number] ?? "",
          length: cells.length,
          row: r,
          col: c,
          cells,
          answer,
        });
      }
    }
  }

  return { rows, cols, cellNumbers, blocks, entries };
}

let cached: BuiltPuzzle | null = null;
function getPuzzle(): BuiltPuzzle {
  if (!cached) cached = build();
  return cached;
}

export function getPublicPuzzle(): PublicPuzzle {
  const p = getPuzzle();
  const cells: PublicCell[][] = [];
  for (let r = 0; r < p.rows; r++) {
    const row: PublicCell[] = [];
    for (let c = 0; c < p.cols; c++) {
      row.push({
        row: r,
        col: c,
        block: p.blocks[r][c],
        number: p.cellNumbers[r][c],
      });
    }
    cells.push(row);
  }

  const entries: PublicEntry[] = p.entries.map((entry) => {
    const { number, direction, clue, length, row, col, cells } = entry;
    return { number, direction, clue, length, row, col, cells };
  });

  return {
    title: PUZZLE_TITLE,
    rows: p.rows,
    cols: p.cols,
    cells,
    entries,
  };
}

export function findEntry(number: number, direction: Direction): EntryFull | null {
  const p = getPuzzle();
  return p.entries.find((e) => e.number === number && e.direction === direction) ?? null;
}

export function checkEntry(
  number: number,
  direction: Direction,
  guess: string
): { correct: boolean; correctCells: boolean[] } {
  const entry = findEntry(number, direction);
  if (!entry) return { correct: false, correctCells: [] };
  const normalizedGuess = guess.toUpperCase().padEnd(entry.answer.length, " ");
  const correctCells = entry.answer
    .split("")
    .map((letter, i) => letter === normalizedGuess[i]);
  return { correct: correctCells.every(Boolean), correctCells };
}
