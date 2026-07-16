import { NextResponse } from "next/server";
import type { Direction } from "@/lib/types";
import { getHintBundle } from "@/lib/hints";

export async function POST(request: Request) {
  let body: { number?: number; direction?: Direction };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { number, direction } = body;
  if (
    typeof number !== "number" ||
    (direction !== "across" && direction !== "down")
  ) {
    return NextResponse.json({ error: "Missing number or direction." }, { status: 400 });
  }

  try {
    const bundle = await getHintBundle(number, direction);
    return NextResponse.json({ hints: bundle.hints });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate hints.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
