export type Direction = "across" | "down";

export interface PublicCell {
  row: number;
  col: number;
  block: boolean;
  number: number | null;
}

export interface PublicEntry {
  number: number;
  direction: Direction;
  clue: string;
  length: number;
  row: number;
  col: number;
  cells: [number, number][];
}

export interface PublicPuzzle {
  title: string;
  rows: number;
  cols: number;
  cells: PublicCell[][];
  entries: PublicEntry[];
}

export interface Hint {
  text: string;
  reference: string | null;
}

export interface HintBundle {
  hints: [Hint, Hint, Hint];
  explanation: string;
  answer: string;
}
