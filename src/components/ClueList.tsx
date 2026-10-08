"use client";

import { Check } from "lucide-react";
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
      <h3 className="text-xs font-black uppercase tracking-wide text-foreground px-3 py-2 sticky top-0 bg-card border-b-2 border-foreground/20">
        {title}
      </h3>
      <ul className="space-y-0.5 p-1">
        {entries.map((entry) => {
          const key = entryKey(entry.number, entry.direction as Direction);
          const isActive = key === activeKey;
          const isSolved = solvedKeys.has(key);
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onSelect(entry)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-all duration-150 flex gap-2 ${
                  isActive
                    ? "border-2 border-foreground bg-primary text-primary-foreground font-bold shadow-brutal-sm"
                    : "border-2 border-transparent hover:bg-secondary/20 text-foreground"
                } ${isSolved ? "line-through decoration-2 opacity-50" : ""}`}
              >
                <span className="font-black shrink-0 w-5 text-right">{entry.number}</span>
                <span className="min-w-0 break-words">{entry.clue}</span>
                {isSolved && <Check className="size-4 ml-auto shrink-0" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
