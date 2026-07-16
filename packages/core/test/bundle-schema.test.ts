import { describe, expect, it } from "vitest"
import { ProofBundleSchema } from "../src/schema.js"

function createBundle(evidenceClaimId = "visible-status") {
  return {
    schemaVersion: "1.0",
    runId: "run-before",
    generatedAt: "2026-07-16T05:00:00.000Z",
    toolVersion: "0.1.0",
    project: {
      name: "proofstack-demo",
      root: "$PROJECT_ROOT",
      rootFingerprint: "root-fingerprint",
    },
    score: 0,
    complete: true,
    durationMs: 40,
    claims: [
      {
        id: "visible-status",
        title: "The page shows its verification state",
        required: true,
        weight: 2,
        verdict: "fail",
        evidenceIds: ["evidence-visible-status"],
      },
    ],
    evidence: [
      {
        id: "evidence-visible-status",
        claimId: evidenceClaimId,
        checkId: "page-copy",
        type: "browser",
        verdict: "fail",
        summary: "Expected text was absent",
        durationMs: 20,
        asset: "screenshots/visible-status.png",
      },
    ],
    repairPacket: {
      version: 1,
      failedClaimIds: ["visible-status"],
      prompt: "Repair the failed claim and re-run ProofStack.",
    },
  }
}

function firstFixture<T>(items: readonly T[]): T {
  const first = items[0]
  if (first === undefined) throw new RangeError("Expected a non-empty fixture")
  return first
}

describe("ProofBundleSchema", () => {
  it("accepts a bundle with a structured repair packet", () => {
    const givenBundle = createBundle()

    const whenParsed = ProofBundleSchema.parse(givenBundle)

    expect(whenParsed.repairPacket.failedClaimIds).toEqual(["visible-status"])
    expect(whenParsed.evidence[0]?.checkId).toBe("page-copy")
  })

  it("rejects evidence that references an unknown claim", () => {
    const givenBundle = createBundle("missing-claim")

    const whenParsed = () => ProofBundleSchema.parse(givenBundle)

    expect(whenParsed).toThrow(/Evidence claim ids must reference known claims/)
  })

  it("rejects duplicate bundle claim ids", () => {
    const givenBundle = createBundle()
    givenBundle.claims.push({ ...firstFixture(givenBundle.claims) })

    const whenParsed = () => ProofBundleSchema.parse(givenBundle)

    expect(whenParsed).toThrow(/Bundle claim ids must be unique/)
  })

  it("rejects duplicate evidence ids", () => {
    const givenBundle = createBundle()
    givenBundle.evidence.push({ ...firstFixture(givenBundle.evidence) })

    const whenParsed = () => ProofBundleSchema.parse(givenBundle)

    expect(whenParsed).toThrow(/Evidence ids must be unique/)
  })

  it("rejects claim references to missing evidence", () => {
    const givenBundle = createBundle()
    firstFixture(givenBundle.claims).evidenceIds = ["missing-evidence"]

    const whenParsed = () => ProofBundleSchema.parse(givenBundle)

    expect(whenParsed).toThrow(/Claim evidence ids must reference known evidence/)
  })

  it("rejects evidence assigned to a different claim", () => {
    const givenBundle = createBundle()
    givenBundle.claims.push({
      ...firstFixture(givenBundle.claims),
      id: "secondary-claim",
      evidenceIds: ["evidence-visible-status"],
    })

    const whenParsed = () => ProofBundleSchema.parse(givenBundle)

    expect(whenParsed).toThrow(/Claim evidence must belong to the same claim/)
  })

  it("rejects repair packet references to unknown claims", () => {
    const givenBundle = createBundle()
    givenBundle.repairPacket.failedClaimIds = ["missing-claim"]

    const whenParsed = () => ProofBundleSchema.parse(givenBundle)

    expect(whenParsed).toThrow(/Repair packet claim ids must reference known claims/)
  })
})
