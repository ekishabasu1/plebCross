import { getPublicPuzzle, PUZZLE_TITLE } from "@/lib/puzzle";
import { CrosswordApp } from "@/components/CrosswordApp";

export default function Home() {
  const puzzle = getPublicPuzzle();

  return (
    <div className="min-h-full flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1.5">
            <span aria-hidden>😉</span> WordWink
          </h1>
          <p className="text-xs text-muted-foreground">{PUZZLE_TITLE} · click a clue for hints</p>
        </div>
      </header>
      <main className="flex-1">
        <CrosswordApp puzzle={puzzle} />
      </main>
    </div>
  );
}
