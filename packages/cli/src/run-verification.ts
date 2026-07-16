import { createHash, randomUUID } from "node:crypto"
import { homedir } from "node:os"
import { join } from "node:path"
import {
  aggregateVerdict,
  type Check,
  type ClaimResult,
  ClaimResultSchema,
  calculateScore,
  type Evidence,
  EvidenceSchema,
  type ProofBundle,
  ProofBundleSchema,
  type ProofContract,
} from "@proofstack/core"
import { runBrowserCheck } from "./adapters/browser.js"
import { runCommandCheck } from "./adapters/command.js"
import { runFileCheck } from "./adapters/file.js"
import { runHttpCheck } from "./adapters/http.js"
import { runRulesCheck } from "./adapters/rules.js"
import { type AdapterContext, type AdapterResult, assertNever } from "./adapters/types.js"
import { createRepairPacket } from "./repair-packet.js"
import { prepareRunDirectory } from "./run-directory.js"
import { TOOL_VERSION } from "./version.js"

async function executeCheck(check: Check, context: AdapterContext): Promise<AdapterResult> {
  switch (check.type) {
    case "file":
      return runFileCheck(check, context)
    case "rules":
      return runRulesCheck(check, context)
    case "command":
      return runCommandCheck(check, context)
    case "http":
      return runHttpCheck(check, context)
    case "browser":
      return runBrowserCheck(check, context)
    default:
      return assertNever(check)
  }
}

export async function runVerification(contract: ProofContract, root: string): Promise<ProofBundle> {
  const startedAt = performance.now()
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const runId = `run-${timestamp}-${randomUUID().slice(0, 8)}`
  const runDirectory = await prepareRunDirectory(root, runId)
  const context: AdapterContext = {
    root,
    allowedCommands: contract.allowedCommands,
    home: homedir(),
    assetsDir: join(runDirectory, "assets"),
  }
  const evidence: Evidence[] = []
  const claims: ClaimResult[] = []

  for (const claim of contract.claims) {
    const claimEvidence: Evidence[] = []
    for (const check of claim.checks) {
      const result = await executeCheck(check, context)
      claimEvidence.push(
        EvidenceSchema.parse({
          ...result,
          id: `evidence-${result.checkId}`,
          claimId: claim.id,
        }),
      )
    }

    evidence.push(...claimEvidence)
    claims.push(
      ClaimResultSchema.parse({
        id: claim.id,
        title: claim.title,
        required: claim.required,
        weight: claim.weight,
        verdict: aggregateVerdict(claimEvidence.map((item) => item.verdict)),
        evidenceIds: claimEvidence.map((item) => item.id),
      }),
    )
  }

  const complete = evidence.every((item) => item.verdict === "pass" || item.verdict === "fail")
  const rootFingerprint = createHash("sha256").update(root).digest("hex").slice(0, 16)

  return ProofBundleSchema.parse({
    schemaVersion: "1.0",
    runId,
    generatedAt: new Date().toISOString(),
    toolVersion: TOOL_VERSION,
    project: { name: contract.project, root: "$PROJECT_ROOT", rootFingerprint },
    score: calculateScore(claims),
    complete,
    durationMs: Math.round(performance.now() - startedAt),
    claims,
    evidence,
    repairPacket: createRepairPacket(claims, evidence),
  })
}
