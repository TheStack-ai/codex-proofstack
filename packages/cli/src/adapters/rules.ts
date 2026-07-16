import type { Check } from "@proofstack/core"
import { readProjectFile } from "./project-file.js"
import { type AdapterContext, type AdapterResult, assertNever, redactEvidence } from "./types.js"

export async function runRulesCheck(
  check: Extract<Check, { type: "rules" }>,
  context: AdapterContext,
): Promise<AdapterResult> {
  const startedAt = Date.now()
  const result = await readProjectFile(context.root, check.path)

  switch (result.kind) {
    case "outside-root":
      return {
        checkId: check.id,
        type: check.type,
        verdict: "unknown",
        summary: "Rules file path is outside the project root",
        detail: redactEvidence(result.path, context),
        durationMs: Date.now() - startedAt,
      }
    case "unreadable":
      return {
        checkId: check.id,
        type: check.type,
        verdict: "fail",
        summary: `${check.path} could not be read`,
        detail: redactEvidence(result.message, context),
        durationMs: Date.now() - startedAt,
      }
    case "read": {
      const missingPhrases = check.mustContain.filter((phrase) => !result.content.includes(phrase))
      const allPhrasesFound = missingPhrases.length === 0
      const phraseLabel = missingPhrases.length === 1 ? "phrase" : "phrases"
      return {
        checkId: check.id,
        type: check.type,
        verdict: allPhrasesFound ? "pass" : "fail",
        summary: allPhrasesFound
          ? `All ${check.mustContain.length} required rule phrases found`
          : `${missingPhrases.length} required rule ${phraseLabel} missing`,
        detail: allPhrasesFound
          ? redactEvidence(result.path, context)
          : redactEvidence(`Missing: ${missingPhrases.join(", ")}`, context),
        durationMs: Date.now() - startedAt,
      }
    }
    default:
      return assertNever(result)
  }
}
