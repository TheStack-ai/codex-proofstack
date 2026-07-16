import type { Verdict } from "./schema.js"

export type ScoredClaim = {
  readonly verdict: Verdict
  readonly weight: number
}

export function aggregateVerdict(verdicts: readonly Verdict[]): Verdict {
  if (verdicts.includes("fail")) return "fail"
  if (verdicts.includes("unknown")) return "unknown"
  return verdicts.length > 0 ? "pass" : "unknown"
}

export function calculateScore(claims: readonly ScoredClaim[]): number {
  const totalWeight = claims.reduce((sum, claim) => sum + claim.weight, 0)
  if (totalWeight === 0) return 0

  const passedWeight = claims
    .filter((claim) => claim.verdict === "pass")
    .reduce((sum, claim) => sum + claim.weight, 0)

  return Math.round((passedWeight / totalWeight) * 100)
}
