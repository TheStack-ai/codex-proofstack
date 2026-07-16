import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import { type ProofBundle, ProofBundleSchema } from "@proofstack/core"
import { prepareRunDirectory } from "./run-directory.js"

export class BundleAlreadyExistsError extends Error {
  readonly name = "BundleAlreadyExistsError"

  constructor(readonly path: string) {
    super(`Proof bundle already exists: ${path}`)
  }
}

export async function writeBundle(root: string, bundle: ProofBundle): Promise<string> {
  const validated = ProofBundleSchema.parse(bundle)
  const runDirectory = await prepareRunDirectory(root, validated.runId)
  const reportPath = join(runDirectory, "proofstack-report.json")

  try {
    await writeFile(reportPath, `${JSON.stringify(validated, null, 2)}\n`, {
      flag: "wx",
      mode: 0o600,
    })
    return reportPath
  } catch (error) {
    if (!(error instanceof Error)) throw error
    if ("code" in error && error.code === "EEXIST") {
      throw new BundleAlreadyExistsError(reportPath)
    }
    throw error
  }
}
