import { describe, expect, it } from "vitest"
import { aggregateVerdict, calculateScore } from "../src/verdict.js"

describe("verdicts", () => {
  it("never converts missing or unknown evidence to pass", () => {
    const whenUnknownIsPresent = aggregateVerdict(["pass", "unknown"])
    const whenEvidenceIsMissing = aggregateVerdict([])

    expect(whenUnknownIsPresent).toBe("unknown")
    expect(whenEvidenceIsMissing).toBe("unknown")
  })

  it("lets a failed check override other verdicts", () => {
    const whenFailureIsPresent = aggregateVerdict(["pass", "unknown", "fail"])

    expect(whenFailureIsPresent).toBe("fail")
  })

  it("weights only passing claims", () => {
    const givenClaims = [
      { verdict: "pass", weight: 3 },
      { verdict: "fail", weight: 1 },
    ] as const

    const whenScored = calculateScore(givenClaims)

    expect(whenScored).toBe(75)
  })
})
