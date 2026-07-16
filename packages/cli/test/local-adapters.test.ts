import { mkdtemp, rm, symlink, writeFile } from "node:fs/promises"
import { homedir, tmpdir } from "node:os"
import { join } from "node:path"
import { type Check, CheckSchema } from "@proofstack/core"
import { describe, expect, it, onTestFinished } from "vitest"
import { runCommandCheck } from "../src/adapters/command.js"
import { runFileCheck } from "../src/adapters/file.js"
import { runRulesCheck } from "../src/adapters/rules.js"
import type { AdapterContext } from "../src/adapters/types.js"

async function createTemporaryRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "proofstack-adapter-"))
  onTestFinished(() => rm(root, { force: true, recursive: true }))
  return root
}

function context(root: string, allowedCommands: readonly string[] = []): AdapterContext {
  return {
    root,
    allowedCommands,
    home: homedir(),
    assetsDir: join(root, ".proofstack", "assets"),
  }
}

function fileCheck(input: unknown): Extract<Check, { type: "file" }> {
  const parsed = CheckSchema.parse(input)
  if (parsed.type !== "file") throw new TypeError("Expected a file check fixture")
  return parsed
}

function rulesCheck(input: unknown): Extract<Check, { type: "rules" }> {
  const parsed = CheckSchema.parse(input)
  if (parsed.type !== "rules") throw new TypeError("Expected a rules check fixture")
  return parsed
}

function commandCheck(input: unknown): Extract<Check, { type: "command" }> {
  const parsed = CheckSchema.parse(input)
  if (parsed.type !== "command") throw new TypeError("Expected a command check fixture")
  return parsed
}

describe("local adapters", () => {
  it("fails a file check when visible content is missing", async () => {
    const givenRoot = await createTemporaryRoot()
    await writeFile(join(givenRoot, "index.html"), "<h1>Hello</h1>")
    const givenCheck = fileCheck({
      id: "copy",
      type: "file",
      path: "index.html",
      contains: "Evidence verified",
    })

    const whenRun = await runFileCheck(givenCheck, context(givenRoot))

    expect(whenRun.verdict).toBe("fail")
    expect(whenRun.checkId).toBe("copy")
  })

  it("refuses a file path outside the project root", async () => {
    const givenRoot = await createTemporaryRoot()
    const givenCheck = fileCheck({ id: "escape", type: "file", path: "../outside.txt" })

    const whenRun = await runFileCheck(givenCheck, context(givenRoot))

    expect(whenRun.verdict).toBe("unknown")
    expect(whenRun.summary).toMatch(/project root/i)
  })

  it("allows an in-root filename beginning with two dots", async () => {
    const givenRoot = await createTemporaryRoot()
    await writeFile(join(givenRoot, "..notes.txt"), "verified")
    const givenCheck = fileCheck({ id: "dot-file", type: "file", path: "..notes.txt" })

    const whenRun = await runFileCheck(givenCheck, context(givenRoot))

    expect(whenRun.verdict).toBe("pass")
  })

  it("refuses a symlink that escapes the project root", async () => {
    const givenRoot = await createTemporaryRoot()
    const givenOutsideRoot = await createTemporaryRoot()
    const givenOutsideFile = join(givenOutsideRoot, "secret.txt")
    await writeFile(givenOutsideFile, "outside")
    await symlink(givenOutsideFile, join(givenRoot, "linked-secret.txt"))
    const givenCheck = fileCheck({ id: "symlink", type: "file", path: "linked-secret.txt" })

    const whenRun = await runFileCheck(givenCheck, context(givenRoot))

    expect(whenRun.verdict).toBe("unknown")
    expect(whenRun.summary).toMatch(/project root/i)
  })

  it("reports missing instruction phrases", async () => {
    const givenRoot = await createTemporaryRoot()
    await writeFile(join(givenRoot, "AGENTS.md"), "Always run tests.")
    const givenCheck = rulesCheck({
      id: "rules",
      type: "rules",
      path: "AGENTS.md",
      mustContain: ["run tests", "verify the browser"],
    })

    const whenRun = await runRulesCheck(givenCheck, context(givenRoot))

    expect(whenRun.verdict).toBe("fail")
    expect(whenRun.summary).toMatch(/1 required rule phrase/i)
  })

  it("refuses a command outside the allowlist", async () => {
    const givenRoot = await createTemporaryRoot()
    const givenCheck = commandCheck({ id: "blocked", type: "command", command: "node" })

    const whenRun = await runCommandCheck(givenCheck, context(givenRoot))

    expect(whenRun.verdict).toBe("unknown")
    expect(whenRun.summary).toMatch(/allowlist/i)
  })

  it("blocks destructive executables even when allowlisted", async () => {
    const givenRoot = await createTemporaryRoot()
    const givenCheck = commandCheck({
      id: "destructive",
      type: "command",
      command: "rm",
      args: ["-rf", "."],
    })

    const whenRun = await runCommandCheck(givenCheck, context(givenRoot, ["rm"]))

    expect(whenRun.verdict).toBe("unknown")
    expect(whenRun.summary).toMatch(/blocked/i)
  })

  it("captures a successful direct command without a shell", async () => {
    const givenRoot = await createTemporaryRoot()
    const givenCheck = commandCheck({
      id: "node-version",
      type: "command",
      command: process.execPath,
      args: ["-e", "process.stdout.write('verified')"],
    })

    const whenRun = await runCommandCheck(givenCheck, context(givenRoot, [process.execPath]))

    expect(whenRun.verdict).toBe("pass")
    expect(whenRun.detail).toContain("verified")
  })

  it("fails a direct command that exits non-zero", async () => {
    const givenRoot = await createTemporaryRoot()
    const givenCheck = commandCheck({
      id: "node-failure",
      type: "command",
      command: process.execPath,
      args: ["-e", "process.exit(3)"],
    })

    const whenRun = await runCommandCheck(givenCheck, context(givenRoot, [process.execPath]))

    expect(whenRun.verdict).toBe("fail")
    expect(whenRun.summary).toContain("3")
  })
})
