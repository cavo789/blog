// The one place that knows HOW an ELI5 annotation is obtained — and the only thing that
// changes between the two backends.
//
// Everything around the call is shared and stays shared: the prompt (`systemPromptFor`), the
// numbered-lines user message, the JSON parsing, the key/line-bound validation, and
// `hashSource()`. A sidecar generated locally is byte-compatible with one generated through the
// API except for its `model` field — which is the point: `hashSource()` must keep matching, or
// switching backend would invalidate the 1611 sidecars already on disk (TODO 0131).
//
// Why a local backend is worth having here: an ELI5 is a bounded, structured task — a two-key
// JSON, line numbers to respect, short sentences — which is the profile where a local model
// holds up. And on one point it does better than the paid path: Ollama takes a `format` schema
// and CONSTRAINS the output grammar, so the malformation `repairLoneBackslashes()` exists to
// repair after the fact cannot be produced in the first place.
//
// The intended split, stated in the `eli5` help screen: iterate locally, publish with Haiku.
// The local backend is how a prompt rewrite gets tried on thirty snippets without spending
// anything; the final pass stays paid and of known quality.

import { cmd } from "./cheatsheet-hint.mjs";
import { ELI5_COST_PER_FILE } from "./i18n-eligibility.mjs";

export const ELI5_BACKENDS = ["claude", "ollama"];

/** Paid, known quality — what every published sidecar is generated with. */
export const DEFAULT_BACKEND = "claude";

export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

// Same endpoint and override as generate-questions.mjs: 172.17.0.1 is the Docker bridge, i.e.
// the host running Ollama as seen from inside the devcontainer.
export const OLLAMA_URL = process.env.OLLAMA_URL || "http://172.17.0.1:11434";

// `code-quality` with thinking OFF — see the bench recorded in TODO 0131. Thinking buys nothing
// on a task this bounded and roughly triples the wall time. ELI5_OLLAMA_MODEL (not OLLAMA_MODEL)
// so trying another model here never silently changes which model writes the questions.
export const OLLAMA_MODEL = process.env.ELI5_OLLAMA_MODEL || "code-quality:latest";

/**
 * The shape the prompt already asks for, expressed as a JSON schema so Ollama can constrain
 * its output grammar to it. `explanations` has one key per explained line, so its keys are
 * open-ended — `additionalProperties` is what expresses that, and llama.cpp's grammar
 * conversion honours it (verified against code-quality:latest, not assumed).
 */
export const ELI5_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    explanations: { type: "object", additionalProperties: { type: "string" } },
  },
  required: ["summary", "explanations"],
};

// A sidecar written locally REPLACES the published one, exactly as a Claude run does — that is
// what the flag is for. The safety net is not a refusal to write, it is provenance: the `model`
// field records who wrote it, and check-eli5-freshness.mjs reports any published sidecar that a
// non-`claude-*` model produced (and fails `--strict` on it). `sourceHash` alone cannot see this
// — the source never changed, so a locally regenerated sidecar reads as perfectly fresh.
//
// An earlier version of this file sent local output to a `.eli5-local/` directory instead. It
// was dropped: nothing reads that directory, so the file served no purpose, and it broke the
// one thing the flag is meant to do. Comparing two prompt variants is what `--output` is for.

/** Whether this backend bills per call. Only `claude` does. */
export function isPaid(backend) {
  return backend === "claude";
}

/** The model name to record in the sidecar's `model` field. */
export function modelFor(backend) {
  return backend === "ollama" ? OLLAMA_MODEL : CLAUDE_MODEL;
}

/**
 * Reads `--backend <name>` out of an argument list.
 *
 * Throws on an unknown name rather than falling back to the default: a typo'd `--backend olama`
 * that silently spends money is exactly the failure this flag exists to prevent.
 */
export function resolveBackend(args) {
  const idx = args.indexOf("--backend");
  if (idx === -1) return DEFAULT_BACKEND;
  const value = args[idx + 1];
  if (!value || !ELI5_BACKENDS.includes(value)) {
    throw new Error(
      `Unsupported --backend "${value ?? ""}" (known: ${ELI5_BACKENDS.join(", ")}).`,
    );
  }
  return value;
}

/**
 * The line that makes the free backend impossible to forget.
 *
 * It prints at the moment it is relevant — right before the first paid call of a run, with that
 * run's own count and price — which is what a README line or a help screen cannot do. Silent
 * for the local backend (nothing to warn about) and for an empty run.
 */
export function printCostNotice(backend, fileCount) {
  if (!isPaid(backend) || fileCount <= 0) return;
  const total = fileCount * ELI5_COST_PER_FILE;
  console.log(
    `💡 ${fileCount} file(s) × $${ELI5_COST_PER_FILE.toFixed(2)} = $${total.toFixed(2)} · ` +
      `${cmd("eli5", "--backend", "ollama")} to iterate for free`,
  );
}

async function callClaude({ systemPrompt, userContent, maxTokens }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your .env file or export it before running " +
        "this script — or pass --backend ollama, which needs no key.",
    );
  }

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });
    return message.content[0].text.trim();
  } catch (err) {
    throw new Error(`Claude API error: ${err.message}`, { cause: err });
  }
}

async function callOllama({ systemPrompt, userContent, maxTokens }) {
  let res;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: ELI5_RESPONSE_SCHEMA,
        think: false,
        // Low temperature: this is a description of code, not a piece of writing — the same
        // snippet should get the same explanation twice.
        options: { temperature: 0.2, num_predict: maxTokens },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });
  } catch (err) {
    throw new Error(
      `Could not reach Ollama at ${OLLAMA_URL} (is it running? set OLLAMA_URL to override): ${err.message}`,
      { cause: err },
    );
  }

  if (!res.ok) {
    throw new Error(`Ollama returned HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  return (json.message?.content ?? "").trim();
}

/**
 * Ask the chosen backend for one snippet's annotation, and hand back its raw text.
 *
 * Raw on purpose: parsing, repairing and validating that text is the caller's job, and is
 * identical for both backends — a local answer gets exactly the same scrutiny as a paid one.
 *
 * @returns {Promise<string>}
 */
export async function callEli5Backend({
  backend = DEFAULT_BACKEND,
  systemPrompt,
  userContent,
  maxTokens,
}) {
  if (backend === "ollama") return callOllama({ systemPrompt, userContent, maxTokens });
  return callClaude({ systemPrompt, userContent, maxTokens });
}
