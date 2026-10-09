"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";
import type { Direction, Hint, PublicEntry, PublicPuzzle } from "@/lib/types";
import { cellKey, entryForCell, entryKey, findEntryAt, nextEntry } from "@/lib/grid-utils";
import { CrosswordGrid } from "./CrosswordGrid";
import { ClueList } from "./ClueList";
import { HintPanel, type HintState } from "./HintPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CrosswordAppProps {
  puzzle: PublicPuzzle;
}

function emptyGrid(puzzle: PublicPuzzle): string[][] {
  return puzzle.cells.map((row) => row.map((c) => (c.block ? "" : "")));
}

export function CrosswordApp({ puzzle }: CrosswordAppProps) {
  const [values, setValues] = useState<string[][]>(() => emptyGrid(puzzle));
  const [selected, setSelected] = useState<{ row: number; col: number } | null>({
    row: 0,
    col: 0,
  });
  const [direction, setDirection] = useState<Direction>("across");
  const [hints, setHints] = useState<Record<string, HintState>>({});
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [mobileTab, setMobileTab] = useState<Direction>("across");
  const [solved, setSolved] = useState(false);

  const acrossEntries = useMemo(
    () => puzzle.entries.filter((e) => e.direction === "across"),
    [puzzle]
  );
  const downEntries = useMemo(
    () => puzzle.entries.filter((e) => e.direction === "down"),
    [puzzle]
  );

  const activeEntry: PublicEntry | undefined = selected
    ? entryForCell(puzzle, selected.row, selected.col, direction)
    : undefined;
  const effectiveDirection: Direction = activeEntry?.direction ?? direction;
  const activeKey = activeEntry ? entryKey(activeEntry.number, activeEntry.direction) : null;

  const activeCells = useMemo(() => {
    const s = new Set<string>();
    activeEntry?.cells.forEach(([r, c]) => s.add(cellKey(r, c)));
    return s;
  }, [activeEntry]);

  const solvedKeys = useMemo(() => {
    const s = new Set<string>();
    for (const entry of puzzle.entries) {
      const filled = entry.cells.every(([r, c]) => values[r][c].trim() !== "");
      if (filled) s.add(entryKey(entry.number, entry.direction));
    }
    return s;
  }, [puzzle, values]);

  const isGridFull = useMemo(
    () => puzzle.cells.every((row, r) => row.every((cell, c) => cell.block || values[r][c].trim() !== "")),
    [puzzle, values]
  );

  useEffect(() => {
    if (!isGridFull || solved) return;
    let cancelled = false;

    async function checkWholeGrid() {
      const entries = puzzle.entries.map((entry) => ({
        number: entry.number,
        direction: entry.direction,
        guess: entry.cells.map(([r, c]) => values[r][c]).join(""),
      }));
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      if (!res.ok || cancelled) return;
      const data = await res.json();
      const allCorrect = (data.results ?? []).every((r: { correct: boolean }) => r.correct);
      if (allCorrect && !cancelled) {
        setSolved(true);
        const duration = 1500;
        const end = Date.now() + duration;
        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 60,
            origin: { x: 0 },
            colors: ["#e8a628", "#4a8c82", "#d1663d", "#d98fa3"],
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 60,
            origin: { x: 1 },
            colors: ["#e8a628", "#4a8c82", "#d1663d", "#d98fa3"],
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        })();
      }
    }

    checkWholeGrid();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGridFull]);

  function selectCell(row: number, col: number) {
    const cell = puzzle.cells[row][col];
    if (cell.block) return;
    if (selected && selected.row === row && selected.col === col) {
      const other: Direction = direction === "across" ? "down" : "across";
      if (findEntryAt(puzzle, row, col, other)) {
        setDirection(other);
      }
      return;
    }
    const preferred = findEntryAt(puzzle, row, col, direction) ? direction : direction === "across" ? "down" : "across";
    setDirection(preferred);
    setSelected({ row, col });
  }

  function setLetter(row: number, col: number, letter: string) {
    setValues((prev) => {
      const next = prev.map((r) => r.slice());
      next[row][col] = letter;
      return next;
    });
    setWrongCells((prev) => {
      if (!prev.has(cellKey(row, col))) return prev;
      const next = new Set(prev);
      next.delete(cellKey(row, col));
      return next;
    });
    setRevealedCells((prev) => {
      if (!prev.has(cellKey(row, col))) return prev;
      const next = new Set(prev);
      next.delete(cellKey(row, col));
      return next;
    });
  }

  function advance(row: number, col: number, dir: Direction, delta: 1 | -1) {
    const dRow = dir === "down" ? delta : 0;
    const dCol = dir === "across" ? delta : 0;
    let r = row + dRow;
    let c = col + dCol;
    while (r >= 0 && r < puzzle.rows && c >= 0 && c < puzzle.cols) {
      if (!puzzle.cells[r][c].block) {
        setSelected({ row: r, col: c });
        return;
      }
      r += dRow;
      c += dCol;
    }
  }

  function handleType(row: number, col: number, letter: string) {
    setLetter(row, col, letter);
    advance(row, col, effectiveDirection, 1);
  }

  function handleBackspace(row: number, col: number) {
    if (values[row][col]) {
      setLetter(row, col, "");
    } else {
      advance(row, col, effectiveDirection, -1);
    }
  }

  function handleMove(row: number, col: number, dRow: number, dCol: number) {
    if (dRow !== 0) setDirection("down");
    if (dCol !== 0) setDirection("across");
    let r = row + dRow;
    let c = col + dCol;
    while (r >= 0 && r < puzzle.rows && c >= 0 && c < puzzle.cols) {
      if (!puzzle.cells[r][c].block) {
        setSelected({ row: r, col: c });
        return;
      }
      r += dRow;
      c += dCol;
    }
  }

  function selectEntry(entry: PublicEntry) {
    setSelected({ row: entry.row, col: entry.col });
    setDirection(entry.direction);
    setMobileTab(entry.direction);
    requestHints(entry);
  }

  function goToEntry(entry: PublicEntry) {
    setSelected({ row: entry.row, col: entry.col });
    setDirection(entry.direction);
    setMobileTab(entry.direction);
  }

  function goToAdjacentClue(delta: 1 | -1) {
    if (!activeEntry) return;
    goToEntry(nextEntry(puzzle, activeEntry, delta));
  }

  async function requestHints(entry: PublicEntry) {
    const key = entryKey(entry.number, entry.direction);
    const existing = hints[key];
    if (existing?.hints || existing?.loading) return;

    setHints((prev) => ({
      ...prev,
      [key]: {
        hints: null,
        loading: true,
        error: null,
        revealedCount: 0,
        answer: null,
        explanation: null,
        revealLoading: false,
      },
    }));

    try {
      const res = await fetch("/api/hints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: entry.number, direction: entry.direction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get hints.");
      setHints((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          hints: data.hints as Hint[],
          loading: false,
          revealedCount: 1,
        },
      }));
    } catch (err) {
      setHints((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          loading: false,
          error: err instanceof Error ? err.message : "Something went wrong.",
        },
      }));
    }
  }

  function showNextHint(entry: PublicEntry) {
    const key = entryKey(entry.number, entry.direction);
    setHints((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      return {
        ...prev,
        [key]: { ...existing, revealedCount: Math.min(existing.revealedCount + 1, 3) },
      };
    });
  }

  async function revealAnswer(entry: PublicEntry) {
    const key = entryKey(entry.number, entry.direction);
    setHints((prev) => ({
      ...prev,
      [key]: { ...prev[key], revealLoading: true },
    }));
    try {
      const res = await fetch("/api/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: entry.number, direction: entry.direction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to reveal answer.");
      setHints((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          answer: data.answer,
          explanation: data.explanation,
          revealLoading: false,
        },
      }));
      setValues((prev) => {
        const next = prev.map((r) => r.slice());
        entry.cells.forEach(([r, c], i) => {
          next[r][c] = data.answer[i];
        });
        return next;
      });
      setRevealedCells((prev) => {
        const next = new Set(prev);
        entry.cells.forEach(([r, c]) => next.add(cellKey(r, c)));
        return next;
      });
    } catch (err) {
      setHints((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          revealLoading: false,
          error: err instanceof Error ? err.message : "Something went wrong.",
        },
      }));
    }
  }

  async function checkCurrentWord() {
    if (!activeEntry) return;
    const guess = activeEntry.cells.map(([r, c]) => values[r][c] || " ").join("");
    const res = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entries: [{ number: activeEntry.number, direction: activeEntry.direction, guess }],
      }),
    });
    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return;
    setWrongCells((prev) => {
      const next = new Set(prev);
      activeEntry.cells.forEach(([r, c], i) => {
        const k = cellKey(r, c);
        if (values[r][c] && !result.correctCells[i]) next.add(k);
        else next.delete(k);
      });
      return next;
    });
  }

  const listsToShow: { key: Direction; entries: PublicEntry[]; title: string }[] = [
    { key: "across", entries: acrossEntries, title: "Across" },
    { key: "down", entries: downEntries, title: "Down" },
  ];

  const clueNavCard = (
    <Card className="px-3 py-2.5 gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToAdjacentClue(-1)}
          disabled={!activeEntry}
          aria-label="Previous clue"
        >
          <ChevronLeft />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-xs font-bold text-accent">
            {activeEntry ? `${activeEntry.number} ${activeEntry.direction === "across" ? "Across" : "Down"}` : "—"}
          </p>
          <p className="text-sm font-bold text-foreground truncate">
            {activeEntry?.clue ?? "Select a clue to begin"}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToAdjacentClue(1)}
          disabled={!activeEntry}
          aria-label="Next clue"
        >
          <ChevronRight />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <AnimatePresence>
          {solved && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-xl bg-success text-success-foreground px-4 py-3 border-2 border-foreground shadow-brutal text-center font-black flex items-center justify-center gap-2"
            >
              <PartyPopper className="size-5" /> Solved it! Nice work.
            </motion.div>
          )}
        </AnimatePresence>

        <CrosswordGrid
          puzzle={puzzle}
          values={values}
          selected={selected}
          direction={effectiveDirection}
          activeCells={activeCells}
          revealedCells={revealedCells}
          wrongCells={wrongCells}
          onSelectCell={selectCell}
          onType={handleType}
          onBackspace={handleBackspace}
          onMove={handleMove}
          onCheck={checkCurrentWord}
        />

        <div className="lg:hidden">{clueNavCard}</div>

        <div className="lg:hidden">
          <HintPanel
            entry={activeEntry ?? null}
            direction={effectiveDirection}
            state={activeKey ? hints[activeKey] : undefined}
            onRequestHints={() => activeEntry && requestHints(activeEntry)}
            onShowNext={() => activeEntry && showNextHint(activeEntry)}
            onReveal={() => activeEntry && revealAnswer(activeEntry)}
          />
        </div>

        <div className="lg:hidden rounded-xl border-2 border-foreground shadow-brutal overflow-hidden bg-card">
          <div className="flex border-b-2 border-foreground">
            {listsToShow.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => setMobileTab(l.key)}
                className={`flex-1 py-2 text-sm font-black transition-colors ${
                  mobileTab === l.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {l.title}
              </button>
            ))}
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            <ClueList
              title=""
              entries={listsToShow.find((l) => l.key === mobileTab)!.entries}
              activeKey={activeKey}
              solvedKeys={solvedKeys}
              onSelect={selectEntry}
            />
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-col gap-4">
        {clueNavCard}
        <HintPanel
          entry={activeEntry ?? null}
          direction={effectiveDirection}
          state={activeKey ? hints[activeKey] : undefined}
          onRequestHints={() => activeEntry && requestHints(activeEntry)}
          onShowNext={() => activeEntry && showNextHint(activeEntry)}
          onReveal={() => activeEntry && revealAnswer(activeEntry)}
        />
        <div className="rounded-xl border-2 border-foreground shadow-brutal bg-card flex divide-x-2 divide-foreground overflow-hidden max-h-[420px]">
          <div className="flex-1 overflow-y-auto">
            <ClueList
              title="Across"
              entries={acrossEntries}
              activeKey={activeKey}
              solvedKeys={solvedKeys}
              onSelect={selectEntry}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <ClueList
              title="Down"
              entries={downEntries}
              activeKey={activeKey}
              solvedKeys={solvedKeys}
              onSelect={selectEntry}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
