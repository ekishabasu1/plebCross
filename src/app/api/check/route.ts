import { NextResponse } from "next/server";
import type { Direction } from "@/lib/types";
import { checkEntry } from "@/lib/puzzle";

interface CheckRequestEntry {
  number: number;
  direction: Direction;
  guess: string;
}

export async function POST(request: Request) {
  let body: { entries?: CheckRequestEntry[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(body.entries)) {
    return NextResponse.json({ error: "Missing entries." }, { status: 400 });
  }

  const results = body.entries.map(({ number, direction, guess }) => {
    const { correct, correctCells } = checkEntry(number, direction, guess ?? "");
    return { number, direction, correct, correctCells };
  });

  return NextResponse.json({ results });
}
