import { describe, expect, it } from "vitest"
import { compareRuns } from "../src/compare.js"
import { type ClaimId, ClaimIdSchema, type Verdict } from "../src/schema.js"

type ComparableFixture = {
  readonly id: ClaimId
  readonly verdict: Verdict
}

function claim(id: string, verdict: Verdict): ComparableFixture {
  return { id: ClaimIdSchema.parse(id), verdict }
}

describe("compareRuns", () => {
  it("reports every verdict change and contract membership change", () => {
    const givenBefore = [
      claim("improved", "fail"),
      claim("regressed", "pass"),
      claim("removed", "unknown"),
      claim("steady", "pass"),
    ]
    const givenAfter = [
      claim("added", "fail"),
      claim("improved", "pass"),
      claim("regressed", "unknown"),
      claim("steady", "pass"),
    ]

    const whenCompared = compareRuns(givenBefore, givenAfter)

    expect(whenCompared).toEqual([
      { id: "added", after: "fail", change: "added" },
      { id: "improved", before: "fail", after: "pass", change: "improved" },
      { id: "regressed", before: "pass", after: "unknown", change: "regressed" },
      { id: "removed", before: "unknown", change: "removed" },
      { id: "steady", before: "pass", after: "pass", change: "unchanged" },
    ])
  })
})
