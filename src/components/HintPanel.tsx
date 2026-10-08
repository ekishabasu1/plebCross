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

const HINT_BADGE_GRADIENT = [
  "from-pink-200 to-purple-200",
  "from-purple-200 to-sky-200",
  "from-sky-200 to-teal-200",
];

export function HintPanel({ entry, state, onRequestHints, onShowNext, onReveal }: HintPanelProps) {
  if (!entry) {
    return (
      <div className="rounded-2xl border border-dashed border-purple-200 dark:border-violet-800 p-4 text-sm text-neutral-500 dark:text-neutral-400 text-center">
        👋 Click a clue to get started.
      </div>
    );
  }

  const hints = state?.hints ?? null;
  const revealedCount = state?.revealedCount ?? 0;

  return (
    <div className="rounded-2xl border border-purple-100 dark:border-violet-900 bg-white dark:bg-neutral-900 shadow-md overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-sky-50 dark:from-violet-950/60 dark:to-fuchsia-950/60 border-b border-purple-100 dark:border-violet-900">
        <p className="text-xs font-semibold text-purple-500 dark:text-violet-400">
          {entry.number} {dirLabel[entry.direction]} · {entry.length} letters
        </p>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
          {entry.clue}
        </p>
      </div>

      <div className="p-4 space-y-3">
        {!hints && !state?.loading && (
          <motion.button
            type="button"
            onClick={onRequestHints}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-full bg-gradient-to-r from-pink-200 via-purple-200 to-sky-200 text-neutral-800 text-sm font-semibold py-2.5 shadow-md shadow-purple-200/50"
          >
            💡 Get a hint
          </motion.button>
        )}

        {state?.loading && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="h-4 w-4 rounded-full border-2 border-purple-100 border-t-purple-400 animate-spin" />
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
                initial={{ opacity: 0, y: 8, height: 0, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, height: "auto", scale: 1 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${HINT_BADGE_GRADIENT[i % 3]} text-neutral-700 text-[11px] font-bold`}
                  >
                    {i + 1}
                  </span>
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Hint {i + 1}
                  </p>
                </div>
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
          <motion.button
            type="button"
            onClick={onShowNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-full border-2 border-purple-200 dark:border-violet-600 text-purple-500 dark:text-violet-400 text-sm font-semibold py-2 hover:bg-purple-50 dark:hover:bg-violet-950 transition-colors"
          >
            Show hint {revealedCount + 1}
          </motion.button>
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
                  className="w-full mt-3 rounded-md text-sm font-medium py-2 text-neutral-500 dark:text-neutral-400 hover:text-orange-500 dark:hover:text-orange-400 disabled:opacity-50 transition-colors"
                >
                  {state?.revealLoading ? "Revealing…" : "🔍 Reveal answer & explanation"}
                </motion.button>
              ) : (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mt-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-orange-100 dark:border-orange-900 p-3"
                >
                  <p className="text-sm font-bold tracking-wide text-orange-500 dark:text-orange-400">
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
