import { type Check, redactText } from "@proofstack/core"
import { readProjectFile } from "./project-file.js"
import { type AdapterContext, type AdapterResult, assertNever } from "./types.js"

export async function runFileCheck(
  check: Extract<Check, { type: "file" }>,
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
        summary: "File path is outside the project root",
        detail: redactText(result.path, { home: context.home }),
        durationMs: Date.now() - startedAt,
      }
    case "unreadable":
      return {
        checkId: check.id,
        type: check.type,
        verdict: "fail",
        summary: `${check.path} could not be read`,
        detail: redactText(result.message, { home: context.home }),
        durationMs: Date.now() - startedAt,
      }
    case "read": {
      const hasExpectedContent =
        check.contains === undefined || result.content.includes(check.contains)
      return {
        checkId: check.id,
        type: check.type,
        verdict: hasExpectedContent ? "pass" : "fail",
        summary: hasExpectedContent
          ? `${check.path} verified`
          : `${check.path} is missing expected content`,
        detail: redactText(result.content, { home: context.home }),
        durationMs: Date.now() - startedAt,
      }
    }
    default:
      return assertNever(result)
  }
}
