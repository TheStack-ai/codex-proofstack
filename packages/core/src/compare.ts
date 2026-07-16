import type { ClaimId, Verdict } from "./schema.js"

export type ComparableClaim = {
  readonly id: ClaimId
  readonly verdict: Verdict
}

export type RunChange =
  | {
      readonly id: ClaimId
      readonly before: Verdict
      readonly after: Verdict
      readonly change: "improved" | "regressed" | "unchanged"
    }
  | { readonly id: ClaimId; readonly after: Verdict; readonly change: "added" }
  | { readonly id: ClaimId; readonly before: Verdict; readonly change: "removed" }

const VERDICT_RANK = {
  fail: 0,
  unknown: 1,
  pass: 2,
} as const satisfies Record<Verdict, number>

export function compareRuns(
  before: readonly ComparableClaim[],
  after: readonly ComparableClaim[],
): readonly RunChange[] {
  const beforeById = new Map(before.map((claim) => [claim.id, claim.verdict]))
  const afterIds = new Set(after.map((claim) => claim.id))

  const currentChanges = after.map((claim): RunChange => {
    const previousVerdict = beforeById.get(claim.id)
    if (previousVerdict === undefined) {
      return { id: claim.id, after: claim.verdict, change: "added" }
    }
    if (VERDICT_RANK[claim.verdict] > VERDICT_RANK[previousVerdict]) {
      return { id: claim.id, before: previousVerdict, after: claim.verdict, change: "improved" }
    }
    if (VERDICT_RANK[claim.verdict] < VERDICT_RANK[previousVerdict]) {
      return { id: claim.id, before: previousVerdict, after: claim.verdict, change: "regressed" }
    }
    return { id: claim.id, before: previousVerdict, after: claim.verdict, change: "unchanged" }
  })

  const removedChanges = before
    .filter((claim) => !afterIds.has(claim.id))
    .map((claim): RunChange => ({ id: claim.id, before: claim.verdict, change: "removed" }))

  return [...currentChanges, ...removedChanges].sort((left, right) =>
    left.id.localeCompare(right.id),
  )
}
