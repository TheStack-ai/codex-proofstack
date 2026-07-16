#!/usr/bin/env node
import { Command } from "commander"
import { loadContract } from "./load-contract.js"
import { resolveProject } from "./root.js"
import { runVerification } from "./run-verification.js"
import { TOOL_VERSION } from "./version.js"
import { writeBundle } from "./write-bundle.js"

type VerifyOptions = {
  readonly cwd: string
  readonly json: boolean
}

const program = new Command()
  .name("proofstack")
  .description("Prove AI coding delivery claims with real evidence")
  .version(TOOL_VERSION)

program
  .command("verify")
  .description("Run the nearest proofstack.yml contract")
  .option("--cwd <path>", "starting directory", process.cwd())
  .option("--json", "print a machine-readable summary", false)
  .action(async (options: VerifyOptions) => {
    try {
      const project = await resolveProject(options.cwd)
      const contract = await loadContract(project.contractPath)
      const bundle = await runVerification(contract, project.root)
      const report = await writeBundle(project.root, bundle)

      if (options.json) {
        console.log(
          JSON.stringify(
            { runId: bundle.runId, score: bundle.score, complete: bundle.complete, report },
            null,
            2,
          ),
        )
      } else {
        console.log(`${bundle.score}% verified — ${report}`)
      }

      const requiredClaimFailed = bundle.claims.some(
        (claim) => claim.required && claim.verdict !== "pass",
      )
      process.exitCode = requiredClaimFailed ? 1 : 0
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[proofstack] ${message}`)
      process.exitCode = 2
    }
  })

await program.parseAsync()
