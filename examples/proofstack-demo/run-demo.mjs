import { spawn } from "node:child_process"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

const states = new Set(["broken", "repaired"])
const state = process.argv[2] ?? "broken"
const port = process.env.PROOFSTACK_DEMO_PORT ?? "4173"
if (!states.has(state)) throw new TypeError("State must be broken or repaired")

const server = spawn(process.execPath, [join(import.meta.dirname, "server.mjs")], {
  env: { ...process.env, PROOFSTACK_DEMO_STATE: state, PROOFSTACK_DEMO_PORT: port },
  stdio: ["ignore", "pipe", "pipe"],
})

function waitForReadiness() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Demo server readiness timed out")), 10_000)
    server.stdout.on("data", (chunk) => {
      if (!chunk.toString().includes(`proofstack-demo:${state}:${port}`)) return
      clearTimeout(timeout)
      resolve()
    })
    server.once("error", reject)
    server.once("exit", (code) => reject(new Error(`Demo server exited before readiness: ${code}`)))
  })
}

function collectProcess(child) {
  return new Promise((resolve, reject) => {
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString()
    })
    child.once("error", reject)
    child.once("exit", (code) => resolve({ code, stdout, stderr }))
  })
}

try {
  await waitForReadiness()
  const cli = spawn(
    process.execPath,
    [
      join(import.meta.dirname, "../../packages/cli/dist/main.js"),
      "verify",
      "--cwd",
      join(import.meta.dirname, state),
      "--json",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  )
  const result = await collectProcess(cli)
  const expectedExitCode = state === "broken" ? 1 : 0
  if (result.code !== expectedExitCode) {
    throw new Error(
      `ProofStack exited ${result.code}; expected ${expectedExitCode}\n${result.stderr}`,
    )
  }

  const summary = JSON.parse(result.stdout)
  const report = JSON.parse(await readFile(summary.report, "utf8"))
  if (
    state === "broken" &&
    (report.score >= 100 || report.repairPacket.failedClaimIds.length !== 2)
  ) {
    throw new Error("Broken demo did not expose the two intended delivery gaps")
  }
  if (
    state === "repaired" &&
    (report.score !== 100 || report.claims.some((claim) => claim.verdict !== "pass"))
  ) {
    throw new Error("Repaired demo did not verify every claim")
  }

  console.log(`ProofStack demo: ${state}`)
  console.log(`Score: ${report.score}%`)
  console.log(`Required repair claims: ${report.repairPacket.failedClaimIds.length}`)
  console.log(`Report: ${summary.report}`)
} finally {
  server.kill("SIGTERM")
}
