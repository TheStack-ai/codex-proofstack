import { describe, expect, it } from "vitest"
import { ProofContractSchema } from "../src/schema.js"

describe("ProofContractSchema", () => {
  it("accepts a weighted claim with deterministic checks", () => {
    const givenContract = {
      version: 1,
      project: "proofstack-demo",
      allowedCommands: ["node"],
      claims: [
        {
          id: "visible-status",
          title: "The page shows its verification state",
          required: true,
          weight: 2,
          checks: [
            {
              id: "page-copy",
              type: "browser",
              url: "http://127.0.0.1:4173",
              text: "Evidence verified",
            },
          ],
        },
      ],
    }

    const whenParsed = ProofContractSchema.parse(givenContract)

    expect(whenParsed.claims[0]?.required).toBe(true)
    expect(whenParsed.claims[0]?.weight).toBe(2)
  })

  it("rejects duplicate claim ids", () => {
    const givenDuplicateClaims = {
      version: 1,
      project: "demo",
      claims: [
        {
          id: "same",
          title: "First claim",
          checks: [{ id: "first-file", type: "file", path: "first.txt" }],
        },
        {
          id: "same",
          title: "Second claim",
          checks: [{ id: "second-file", type: "file", path: "second.txt" }],
        },
      ],
    }

    const whenParsed = () => ProofContractSchema.parse(givenDuplicateClaims)

    expect(whenParsed).toThrow(/Claim ids must be unique/)
  })

  it("accepts all supported check variants and applies safe defaults", () => {
    const givenContract = {
      version: 1,
      project: "all-checks",
      claims: [
        {
          id: "supported-checks",
          title: "Every adapter has a deterministic contract",
          checks: [
            { id: "file-check", type: "file", path: "README.md" },
            { id: "command-check", type: "command", command: "node" },
            { id: "http-check", type: "http", url: "http://127.0.0.1:4173" },
            {
              id: "browser-check",
              type: "browser",
              url: "http://127.0.0.1:4173",
              text: "Ready",
            },
            {
              id: "rules-check",
              type: "rules",
              path: "AGENTS.md",
              mustContain: ["verify"],
            },
          ],
        },
      ],
    }

    const whenParsed = ProofContractSchema.parse(givenContract)

    expect(whenParsed.allowedCommands).toEqual([])
    expect(whenParsed.claims[0]?.required).toBe(true)
    expect(whenParsed.claims[0]?.weight).toBe(1)
    expect(whenParsed.claims[0]?.checks.map((check) => check.type)).toEqual([
      "file",
      "command",
      "http",
      "browser",
      "rules",
    ])
    expect(whenParsed.claims[0]?.checks[1]).toMatchObject({ args: [], timeoutMs: 30_000 })
    expect(whenParsed.claims[0]?.checks[2]).toMatchObject({ status: 200 })
  })

  it("rejects duplicate check ids across claims", () => {
    const givenDuplicateChecks = {
      version: 1,
      project: "demo",
      claims: [
        {
          id: "first",
          title: "First claim",
          checks: [{ id: "same-check", type: "file", path: "first.txt" }],
        },
        {
          id: "second",
          title: "Second claim",
          checks: [{ id: "same-check", type: "file", path: "second.txt" }],
        },
      ],
    }

    const whenParsed = () => ProofContractSchema.parse(givenDuplicateChecks)

    expect(whenParsed).toThrow(/Check ids must be unique/)
  })

  it("rejects browser roles outside the accessible role vocabulary", () => {
    const givenContract = {
      version: 1,
      project: "invalid-role",
      claims: [
        {
          id: "browser-role",
          title: "Browser checks use accessible roles",
          checks: [
            {
              id: "role-check",
              type: "browser",
              url: "http://127.0.0.1:4173",
              role: "clickable-thing",
            },
          ],
        },
      ],
    }

    const whenParsed = () => ProofContractSchema.parse(givenContract)

    expect(whenParsed).toThrow()
  })

  it("rejects an accessible name without a role", () => {
    const givenContract = {
      version: 1,
      project: "orphan-name",
      claims: [
        {
          id: "browser-name",
          title: "Accessible names are attached to roles",
          checks: [
            {
              id: "name-check",
              type: "browser",
              url: "http://127.0.0.1:4173",
              name: "Run proof",
            },
          ],
        },
      ],
    }

    const whenParsed = () => ProofContractSchema.parse(givenContract)

    expect(whenParsed).toThrow(/Browser name requires a role/)
  })
})
