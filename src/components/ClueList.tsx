"use client";

import type { Direction, PublicEntry } from "@/lib/types";
import { entryKey } from "@/lib/grid-utils";

interface ClueListProps {
  title: string;
  entries: PublicEntry[];
  activeKey: string | null;
  solvedKeys: Set<string>;
  onSelect: (entry: PublicEntry) => void;
}

export function ClueList({ title, entries, activeKey, solvedKeys, onSelect }: ClueListProps) {
  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-3 py-2 sticky top-0 bg-card/90 backdrop-blur">
        {title}
      </h3>
      <ul className="space-y-0.5">
        {entries.map((entry) => {
          const key = entryKey(entry.number, entry.direction as Direction);
          const isActive = key === activeKey;
          const isSolved = solvedKeys.has(key);
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onSelect(entry)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-150 flex gap-2 border-l-4 ${
                  isActive
                    ? "border-primary bg-accent text-foreground"
                    : "border-transparent hover:bg-accent/60 hover:border-border text-muted-foreground"
                } ${isSolved ? "line-through decoration-2 opacity-50" : ""}`}
              >
                <span className={`font-semibold shrink-0 w-5 text-right ${isActive ? "text-primary" : ""}`}>
                  {entry.number}
                </span>
                <span className="min-w-0 break-words">{entry.clue}</span>
                {isSolved && <span className="ml-auto shrink-0">✅</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
