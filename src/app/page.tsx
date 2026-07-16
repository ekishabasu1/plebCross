import { getPublicPuzzle, PUZZLE_TITLE } from "@/lib/puzzle";
import { CrosswordApp } from "@/components/CrosswordApp";

export default function Home() {
  const puzzle = getPublicPuzzle();

  return (
    <div className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <header className="bg-neutral-900 dark:bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-baseline gap-3">
          <h1 className="text-xl font-bold tracking-tight">PlebCross</h1>
          <p className="text-xs text-neutral-400">{PUZZLE_TITLE} · click a clue for hints</p>
        </div>
      </header>
      <main className="flex-1">
        <CrosswordApp puzzle={puzzle} />
      </main>
    </div>
  );
}
