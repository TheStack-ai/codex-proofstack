import { spawn } from "node:child_process"
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))
const target = join(root, "apps/dashboard/public/demo")
const states = ["broken", "repaired"]

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit" })
    child.once("error", reject)
    child.once("close", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with ${String(code)}`))
    })
  })
}

function normalizeBundle(bundle, state) {
  bundle.generatedAt = state === "broken" ? "2026-07-16T00:00:00.000Z" : "2026-07-16T00:05:00.000Z"
  bundle.runId = `demo-${state}`
  bundle.durationMs = state === "broken" ? 900 : 800
  bundle.project.rootFingerprint = `demo-${state}-fingerprint`
  bundle.evidence = bundle.evidence.map((item) => ({
    ...item,
    durationMs: { browser: 520, command: 100, file: 1, http: 20, rules: 1 }[item.type] ?? 1,
  }))
  return bundle
}

await rm(target, { recursive: true, force: true })
await mkdir(join(target, "assets"), { recursive: true })

for (const state of states) {
  await run(process.execPath, [join(root, "examples/proofstack-demo/run-demo.mjs"), state])

  const sourceRoot = join(root, "examples/proofstack-demo", state, ".proofstack")
  const runs = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("run-"))
    .map((entry) => entry.name)
    .sort()
  const latest = runs.at(-1)
  if (!latest) throw new Error(`${state} proof bundle is missing`)

  const source = join(sourceRoot, latest)
  const bundle = normalizeBundle(
    JSON.parse(await readFile(join(source, "proofstack-report.json"), "utf8")),
    state,
  )
  await writeFile(join(target, `${state}.json`), `${JSON.stringify(bundle, null, 2)}\n`, {
    mode: 0o644,
  })
  await cp(join(source, "assets"), join(target, "assets", state), {
    recursive: true,
    force: true,
  })
}

console.log(`ProofStack demo assets written to ${target}`)
