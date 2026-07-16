"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Direction, Hint, PublicEntry } from "@/lib/types";

export interface HintState {
  hints: Hint[] | null;
  loading: boolean;
  error: string | null;
  revealedCount: number;
  answer: string | null;
  explanation: string | null;
  revealLoading: boolean;
}

interface HintPanelProps {
  entry: PublicEntry | null;
  direction: Direction;
  state: HintState | undefined;
  onRequestHints: () => void;
  onShowNext: () => void;
  onReveal: () => void;
}

const dirLabel: Record<Direction, string> = { across: "Across", down: "Down" };

export function HintPanel({ entry, state, onRequestHints, onShowNext, onReveal }: HintPanelProps) {
  if (!entry) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-4 text-sm text-neutral-500 dark:text-neutral-400 text-center">
        Click a clue to get started.
      </div>
    );
  }

  const hints = state?.hints ?? null;
  const revealedCount = state?.revealedCount ?? 0;

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {entry.number} {dirLabel[entry.direction]} · {entry.length} letters
        </p>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
          {entry.clue}
        </p>
      </div>

      <div className="p-4 space-y-3">
        {!hints && !state?.loading && (
          <button
            type="button"
            onClick={onRequestHints}
            className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 transition-colors"
          >
            💡 Get a hint
          </button>
        )}

        {state?.loading && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="h-4 w-4 rounded-full border-2 border-neutral-300 border-t-blue-600 animate-spin" />
            Thinking of a good hint…
          </div>
        )}

        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}

        <AnimatePresence initial={false}>
          {hints &&
            hints.slice(0, revealedCount).map((hint, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="rounded-md bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3"
              >
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  Hint {i + 1}
                </p>
                <p className="text-sm text-neutral-800 dark:text-neutral-200">{hint.text}</p>
                {hint.reference && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 italic border-t border-neutral-200 dark:border-neutral-700 pt-1.5">
                    📚 {hint.reference}
                  </p>
                )}
              </motion.div>
            ))}
        </AnimatePresence>

        {hints && revealedCount < hints.length && (
          <button
            type="button"
            onClick={onShowNext}
            className="w-full rounded-md border border-blue-600 text-blue-700 dark:text-blue-400 text-sm font-medium py-2 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
          >
            Show hint {revealedCount + 1}
          </button>
        )}

        {hints && (
          <div className="pt-1 border-t border-neutral-200 dark:border-neutral-700">
            <AnimatePresence mode="wait">
              {!state?.answer ? (
                <motion.button
                  key="reveal-btn"
                  type="button"
                  onClick={onReveal}
                  disabled={state?.revealLoading}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full mt-3 rounded-md text-sm font-medium py-2 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                >
                  {state?.revealLoading ? "Revealing…" : "Reveal answer & explanation"}
                </motion.button>
              ) : (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3"
                >
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    {state.answer}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    {state.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
