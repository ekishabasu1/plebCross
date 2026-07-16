import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Direction, HintBundle } from "./types";
import { findEntry } from "./puzzle";

const cache = new Map<string, HintBundle>();

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local to enable hints."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

const HINT_TOOL = {
  name: "provide_crossword_hints",
  description:
    "Provide three progressively revealing hints and a short post-solve explanation for a crossword clue.",
  input_schema: {
    type: "object" as const,
    properties: {
      hints: {
        type: "array" as const,
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object" as const,
          properties: {
            text: {
              type: "string" as const,
              description: "The hint shown to the solver.",
            },
            reference: {
              type: ["string", "null"] as const,
              description:
                "One-sentence gist of any historic/cultural/pop-culture reference relevant to this hint, or null if none.",
            },
          },
          required: ["text", "reference"],
        },
      },
      explanation: {
        type: "string" as const,
        description:
          "Shown only after the answer is revealed: 1-2 sentences on the wordplay/reasoning and any reference, for learning purposes.",
      },
    },
    required: ["hints", "explanation"],
  },
};

async function generate(
  clue: string,
  answer: string,
  direction: Direction
): Promise<HintBundle> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    temperature: 0.4,
    system: `You are a warm, encouraging crossword coach helping someone LEARN to solve NYT-style crosswords, not just get the answer. You will be given a clue and its correct answer (ground truth, already verified). Produce exactly 3 progressively revealing hints plus a short post-solve explanation, via the provide_crossword_hints tool.

Rules for the 3 hints:
- Hint 1 (gentle nudge): point at the category, topic, or clue-type (e.g. "this is a fill-in-the-blank" or "think about 1980s sitcoms") without giving synonyms of the answer or any letters.
- Hint 2 (more specific): a clearer paraphrase or closely-related synonym-adjacent clue. If the clue or answer involves a historic, cultural, literary, or pop-culture reference the solver might not know, use the "reference" field to give a one-sentence gist of it (who/what it is and why it fits) so they learn something.
- Hint 3 (very close): reveal the first letter of the answer as part of the hint text and give a strong, near-synonym paraphrase, such that the answer becomes obvious — but do NOT spell out the full answer word itself.
- Never include the literal answer word in hints 1 or 2.
- Keep each hint to one short sentence (plus the optional reference sentence).

The "explanation" field is shown only after the solver reveals or solves the answer — briefly explain the wordplay/reasoning and reference in 1-2 sentences, and it's fine to name the answer there.`,
    tools: [HINT_TOOL],
    tool_choice: { type: "tool", name: "provide_crossword_hints" },
    messages: [
      {
        role: "user",
        content: `Clue (${direction}): "${clue}"\nAnswer length: ${answer.length}\nCorrect answer: ${answer}`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("Model did not return structured hints.");
  }

  const input = toolUse.input as {
    hints: { text: string; reference: string | null }[];
    explanation: string;
  };

  if (!input.hints || input.hints.length !== 3) {
    throw new Error("Model returned an unexpected number of hints.");
  }

  return {
    hints: [input.hints[0], input.hints[1], input.hints[2]],
    explanation: input.explanation,
    answer,
  };
}

export async function getHintBundle(
  number: number,
  direction: Direction
): Promise<HintBundle> {
  const key = `${direction}-${number}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const entry = findEntry(number, direction);
  if (!entry) {
    throw new Error(`No such clue: ${number} ${direction}`);
  }

  const bundle = await generate(entry.clue, entry.answer, direction);
  cache.set(key, bundle);
  return bundle;
}
