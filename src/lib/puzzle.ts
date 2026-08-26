import "server-only";
import type { Direction, PublicCell, PublicEntry, PublicPuzzle } from "./types";

// Original 13x13 daily-style puzzle (not sourced from any published NYT grid).
// Built with a constraint solver against a curated word list, then hand-clued.
// "#" marks a block square; every other character is the solution letter.
const GRID_ROWS = [
  "PUT#EPOCH#SPA",
  "ONE#ALGAE#EAR",
  "ODE#TARRY#ARM",
  "PONY#NET#ALKY",
  "###EVE#OAR###",
  "MOTTO#BOTTLES",
  "IRE#GAUNT#AGE",
  "CENTURY#INGOT",
  "###WET#ICE###",
  "VETO#ION#WOOF",
  "ERR#SCALD#VIA",
  "AGO#ALTER#ELM",
  "LOT#TESTY#RYE",
];

const ACROSS_CLUES: Record<number, string> = {
  1: "Place; set down",
  4: "Era in history",
  9: "Place for a massage",
  12: "Number after zero",
  13: "Pond scum, essentially",
  14: "Corn unit, or hearing organ",
  15: "Poem of praise",
  16: "Linger; delay",
  17: "Limb with a hand",
  18: "\"___ Express\" (mail service using relay riders, 1860-61)",
  20: "After deductions, as income",
  21: "Heavy drinker, slangily",
  22: "Night before a holiday",
  24: "Rowing tool",
  26: "Guiding principle or slogan",
  29: "Puts into containers, as beer",
  33: "Anger",
  34: "Thin and bony",
  36: "How old someone is",
  37: "\"20th ___ Fox\" (film studio behind \"Avatar\")",
  39: "Bar of gold or silver",
  41: "Not dry",
  42: "Frozen water",
  43: "Presidential rejection of a bill",
  46: "Charged particle",
  48: "Dog's bark, or fabric's crosswise threads",
  52: "Make a mistake",
  53: "Burn with hot liquid",
  55: "By way of",
  56: "In the past, as \"10 years ___\"",
  57: "Change",
  58: "Shade tree common in American towns",
  59: "A great deal, or parking area",
  60: "Irritable",
  61: "Bread or whiskey grain",
};

const DOWN_CLUES: Record<number, string> = {
  1: "\"___ deck\" (rear structure of a ship)",
  2: "Ctrl+Z action",
  3: "13-to-19-year-old",
  4: "Consume food",
  5: "Aircraft, or woodworking tool",
  6: "Green fairy-tale giant made famous by a 2001 animated film",
  7: "\"The Simpsons\" or \"Looney Tunes,\" e.g.",
  8: "Casual greeting",
  9: "Marine mammal, or official stamp",
  10: "Place with swings and slides",
  11: "\"___ of the Potomac\" (Civil War Union force)",
  19: "However; up to now",
  21: "Museum display",
  23: "1990 Madonna chart-topper, or height of fashion",
  25: "Space just under the roof",
  26: "Stage equipment for a singer, informally",
  27: "Raw mineral from a mine",
  28: "Perfect score, often",
  29: "Purchase",
  30: "Fall behind",
  31: "Sense of self-importance",
  32: "Group of matching items",
  35: "News piece, or grammar's \"the\"",
  38: "Number of shoes in a pair",
  40: "\"Brand ___\"",
  42: "Small coastal bay",
  43: "Meat from a calf",
  44: "Therefore, in Latin",
  45: "Horse's gait between walk and canter",
  47: "Horse feed, or breakfast grain",
  49: "Finished; done",
  50: "Greasy",
  51: "Celebrity status",
  53: "Took a test, or sat down",
  54: "Not wet; humorless, as wit",
};

export const PUZZLE_TITLE = "WordWink Daily";

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
