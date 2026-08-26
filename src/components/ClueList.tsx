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
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 px-3 py-2 sticky top-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
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
                    ? "border-violet-500 bg-gradient-to-r from-violet-100 to-fuchsia-50 dark:from-violet-900 dark:to-fuchsia-950 text-neutral-900 dark:text-neutral-50"
                    : "border-transparent hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:border-violet-200 dark:hover:border-violet-800 text-neutral-700 dark:text-neutral-300"
                } ${isSolved ? "line-through decoration-2 opacity-50" : ""}`}
              >
                <span className={`font-semibold shrink-0 w-5 text-right ${isActive ? "text-violet-600 dark:text-violet-400" : ""}`}>
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
