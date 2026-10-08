import { getPublicPuzzle, PUZZLE_TITLE } from "@/lib/puzzle";
import { CrosswordApp } from "@/components/CrosswordApp";

export default function Home() {
  const puzzle = getPublicPuzzle();

  return (
    <div className="min-h-full flex flex-col bg-background">
      <header className="border-b-4 border-foreground bg-primary">
        <div className="max-w-5xl mx-auto px-4 py-5 sm:py-6">
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight leading-none text-primary-foreground">
            WORDWINK
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-bold text-primary-foreground/75">
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
