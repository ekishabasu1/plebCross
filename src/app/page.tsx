import { getPublicPuzzle, PUZZLE_TITLE } from "@/lib/puzzle";
import { CrosswordApp } from "@/components/CrosswordApp";

export default function Home() {
  const puzzle = getPublicPuzzle();

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-pink-50 via-teal-50 to-sky-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950">
      <header className="bg-gradient-to-r from-pink-200 via-teal-200 to-sky-200 text-neutral-800 shadow-sm border-b border-teal-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1.5">
            <span aria-hidden>😉</span> WordWink
          </h1>
          <p className="text-xs text-neutral-600">{PUZZLE_TITLE} · click a clue for hints</p>
        </div>
      </header>
      <main className="flex-1">
        <CrosswordApp puzzle={puzzle} />
      </main>
    </div>
  );
}
