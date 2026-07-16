import { basename } from "node:path"
import { type Check, redactText } from "@proofstack/core"
import { execa } from "execa"
import type { AdapterContext, AdapterResult } from "./types.js"

const BLOCKED_EXECUTABLES = new Set(["dd", "diskutil", "mkfs", "reboot", "rm", "rmdir", "shutdown"])

export async function runCommandCheck(
  check: Extract<Check, { type: "command" }>,
  context: AdapterContext,
): Promise<AdapterResult> {
  const startedAt = Date.now()
  const executable = basename(check.command)
    .toLowerCase()
    .replace(/\.exe$/, "")

  if (BLOCKED_EXECUTABLES.has(executable)) {
    return {
      checkId: check.id,
      type: check.type,
      verdict: "unknown",
      summary: `${check.command} is blocked by the destructive-command policy`,
      durationMs: Date.now() - startedAt,
    }
  }

  if (!context.allowedCommands.includes(check.command)) {
    return {
      checkId: check.id,
      type: check.type,
      verdict: "unknown",
      summary: `${check.command} is outside the command allowlist`,
      durationMs: Date.now() - startedAt,
    }
  }

  try {
    const result = await execa(check.command, check.args, {
      all: true,
      cwd: context.root,
      reject: false,
      shell: false,
      timeout: check.timeoutMs,
    })
    const passed = result.exitCode === 0
    return {
      checkId: check.id,
      type: check.type,
      verdict: passed ? "pass" : "fail",
      summary: `${check.command} exited with code ${result.exitCode}`,
      detail: redactText(result.all ?? "", { home: context.home }),
      durationMs: Date.now() - startedAt,
    }
  } catch (error) {
    if (!(error instanceof Error)) throw error
    return {
      checkId: check.id,
      type: check.type,
      verdict: "unknown",
      summary: `${check.command} could not be executed`,
      detail: redactText(error.message, { home: context.home }),
      durationMs: Date.now() - startedAt,
    }
  }
}
