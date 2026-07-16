import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ProofBundleSchema, type ProofContract, ProofContractSchema } from "@proofstack/core"
import { describe, expect, it, onTestFinished } from "vitest"
import { runVerification } from "../src/run-verification.js"
import { writeBundle } from "../src/write-bundle.js"

async function createTemporaryRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "proofstack-run-"))
  onTestFinished(() => rm(root, { force: true, recursive: true }))
  return root
}

function contract(claims: unknown): ProofContract {
  return ProofContractSchema.parse({ version: 1, project: "proofstack-demo", claims })
}

describe("runVerification", () => {
  it("creates a failed claim and a bounded, path-safe repair packet", async () => {
    const givenRoot = await createTemporaryRoot()
    const givenContract = contract([
      {
        id: "status",
        title: "Visible verification status",
        checks: [{ id: "copy", type: "file", path: "missing.html" }],
      },
    ])

    const whenRun = await runVerification(givenContract, givenRoot)

    expect(whenRun.score).toBe(0)
    expect(whenRun.complete).toBe(true)
    expect(whenRun.project.root).toBe("$PROJECT_ROOT")
    expect(whenRun.repairPacket.failedClaimIds).toEqual(["status"])
    expect(whenRun.repairPacket.prompt).toContain("Visible verification status")
    expect(whenRun.repairPacket.prompt.length).toBeLessThanOrEqual(12_000)
    expect(JSON.stringify(whenRun)).not.toContain(givenRoot)
  })

  it("scores weighted claims and scopes repair details to non-passing claims", async () => {
    const givenRoot = await createTemporaryRoot()
    await writeFile(join(givenRoot, "ready.txt"), "ready")
    const givenContract = contract([
      {
        id: "ready",
        title: "Passing behavior",
        weight: 2,
        checks: [{ id: "ready-file", type: "file", path: "ready.txt", contains: "ready" }],
      },
      {
        id: "missing",
        title: "Missing behavior",
        weight: 1,
        checks: [{ id: "missing-file", type: "file", path: "ready.txt", contains: "verified" }],
      },
    ])

    const whenRun = await runVerification(givenContract, givenRoot)

    expect(whenRun.score).toBe(67)
    expect(whenRun.repairPacket.failedClaimIds).toEqual(["missing"])
    expect(whenRun.repairPacket.prompt).toContain("Missing behavior")
    expect(whenRun.repairPacket.prompt).not.toContain("## Passing behavior")
  })

  it("marks a run incomplete when a check cannot be executed", async () => {
    const givenRoot = await createTemporaryRoot()
    const givenContract = contract([
      {
        id: "command",
        title: "Command verification",
        checks: [{ id: "blocked-command", type: "command", command: "node" }],
      },
    ])

    const whenRun = await runVerification(givenContract, givenRoot)

    expect(whenRun.complete).toBe(false)
    expect(whenRun.claims[0]?.verdict).toBe("unknown")
    expect(whenRun.repairPacket.failedClaimIds).toEqual(["command"])
  })

  it("writes a private schema-valid report without overwriting a run", async () => {
    const givenRoot = await createTemporaryRoot()
    await writeFile(join(givenRoot, "ready.txt"), "ready")
    const givenContract = contract([
      {
        id: "ready",
        title: "Ready file",
        checks: [{ id: "ready-file", type: "file", path: "ready.txt" }],
      },
    ])
    const givenBundle = await runVerification(givenContract, givenRoot)

    const whenWritten = await writeBundle(givenRoot, givenBundle)
    const whenDecoded: unknown = JSON.parse(await readFile(whenWritten, "utf8"))

    expect(ProofBundleSchema.parse(whenDecoded).runId).toBe(givenBundle.runId)
    expect((await stat(whenWritten)).mode & 0o777).toBe(0o600)
    await expect(writeBundle(givenRoot, givenBundle)).rejects.toThrow()
  })
})
