import { getPublicPuzzle, PUZZLE_TITLE } from "@/lib/puzzle";
import { CrosswordApp } from "@/components/CrosswordApp";

export default function Home() {
  const puzzle = getPublicPuzzle();

  return (
    <div className="min-h-full flex flex-col bg-background">
      <header className="border-b-4 border-foreground bg-primary">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-baseline gap-3">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-primary-foreground">
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-foreground bg-success text-lg shadow-brutal-sm"
            >
              😉
            </span>
            WORDWINK
          </h1>
          <p className="text-xs font-bold text-primary-foreground/80">
            {PUZZLE_TITLE} · click a clue for hints
          </p>
        </div>
      </header>
      <main className="flex-1">
        <CrosswordApp puzzle={puzzle} />
      </main>
    </div>
  );
}
