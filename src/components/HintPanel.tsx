"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Direction, Hint, PublicEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const HINT_BADGE_VARIANT: Array<"default" | "secondary" | "destructive"> = [
  "default",
  "secondary",
  "destructive",
];

export function HintPanel({ entry, state, onRequestHints, onShowNext, onReveal }: HintPanelProps) {
  if (!entry) {
    return (
      <Card className="border-dashed py-4 shadow-none">
        <CardContent className="text-sm text-muted-foreground text-center">
          👋 Click a clue to get started.
        </CardContent>
      </Card>
    );
  }

  const hints = state?.hints ?? null;
  const revealedCount = state?.revealedCount ?? 0;

  return (
    <Card className="py-0 overflow-hidden gap-0">
      <CardHeader className="px-4 py-3 bg-secondary border-b-2 border-foreground">
        <p className="text-xs font-bold text-secondary-foreground">
          {entry.number} {dirLabel[entry.direction]} · {entry.length} letters
        </p>
        <p className="text-sm font-bold text-secondary-foreground mt-0.5">{entry.clue}</p>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {!hints && !state?.loading && (
          <Button onClick={onRequestHints} className="w-full" size="lg">
            💡 Get a hint
          </Button>
        )}

        {state?.loading && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
            <span className="h-4 w-4 rounded-full border-2 border-muted border-t-primary animate-spin" />
            Thinking of a good hint…
          </div>
        )}

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <AnimatePresence initial={false}>
          {hints &&
            hints.slice(0, revealedCount).map((hint, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, height: 0, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, height: "auto", scale: 1 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="rounded-xl bg-card border-2 border-foreground shadow-brutal-sm p-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge
                    variant={HINT_BADGE_VARIANT[i % 3]}
                    className="h-5 w-5 rounded-full p-0 justify-center"
                  >
                    {i + 1}
                  </Badge>
                  <p className="text-xs font-bold text-muted-foreground">Hint {i + 1}</p>
                </div>
                <p className="text-sm text-foreground">{hint.text}</p>
                {hint.reference && (
                  <p className="text-xs text-muted-foreground mt-1.5 italic border-t-2 border-foreground/20 pt-1.5">
                    📚 {hint.reference}
                  </p>
                )}
              </motion.div>
            ))}
        </AnimatePresence>

        {hints && revealedCount < hints.length && (
          <Button onClick={onShowNext} variant="outline" className="w-full">
            Show hint {revealedCount + 1}
          </Button>
        )}

        {hints && (
          <div className="pt-1 border-t-2 border-foreground/20">
            <AnimatePresence mode="wait">
              {!state?.answer ? (
                <motion.div
                  key="reveal-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    onClick={onReveal}
                    disabled={state?.revealLoading}
                    variant="ghost"
                    className="w-full mt-3 text-muted-foreground hover:text-destructive"
                  >
                    {state?.revealLoading ? "Revealing…" : "🔍 Reveal answer & explanation"}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mt-3 rounded-xl bg-destructive/15 border-2 border-foreground shadow-brutal-sm p-3"
                >
                  <p className="text-sm font-black tracking-wide text-foreground">
                    {state.answer}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{state.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
