import { type Check, redactText } from "@proofstack/core"
import type { AdapterContext, AdapterResult } from "./types.js"

const HTTP_PROTOCOLS = new Set(["http:", "https:"])

export async function runHttpCheck(
  check: Extract<Check, { type: "http" }>,
  context: AdapterContext,
): Promise<AdapterResult> {
  const startedAt = performance.now()
  const protocol = new URL(check.url).protocol

  if (!HTTP_PROTOCOLS.has(protocol)) {
    return {
      checkId: check.id,
      type: check.type,
      verdict: "unknown",
      summary: `${protocol} is not a supported HTTP protocol`,
      durationMs: Math.round(performance.now() - startedAt),
    }
  }

  try {
    const response = await fetch(check.url, { signal: AbortSignal.timeout(10_000) })
    const body = await response.text()
    const durationMs = Math.round(performance.now() - startedAt)
    const statusMatches = response.status === check.status
    const contentMatches = check.contains === undefined || body.includes(check.contains)
    const latencyMatches = check.maxLatencyMs === undefined || durationMs <= check.maxLatencyMs
    const passed = statusMatches && contentMatches && latencyMatches

    return {
      checkId: check.id,
      type: check.type,
      verdict: passed ? "pass" : "fail",
      summary: `HTTP ${response.status} in ${durationMs}ms; expected ${check.status}`,
      detail: redactText(body, { home: context.home, maxLength: 2_000 }),
      durationMs,
    }
  } catch (error) {
    if (!(error instanceof Error)) throw error
    return {
      checkId: check.id,
      type: check.type,
      verdict: "unknown",
      summary: "HTTP target could not be reached",
      detail: redactText(error.message, { home: context.home }),
      durationMs: Math.round(performance.now() - startedAt),
    }
  }
}
