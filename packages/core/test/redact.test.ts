import { describe, expect, it } from "vitest"
import { redactText } from "../src/redact.js"

describe("redactText", () => {
  it("redacts credentials and home paths before truncating output", () => {
    const givenOutput = [
      "OPENAI_API_KEY=sk-secret-value",
      "Authorization: Bearer bearer-secret",
      "password: password-secret",
      '{"apiKey":"json-secret"}',
      "standalone sk-proj-standalone-secret",
      "github_pat_token-secret",
      "/Users/alice/project/report.txt",
      "x".repeat(300),
    ].join("\n")

    const whenRedacted = redactText(givenOutput, { home: "/Users/alice", maxLength: 260 })

    expect(whenRedacted).not.toContain("sk-secret-value")
    expect(whenRedacted).not.toContain("bearer-secret")
    expect(whenRedacted).not.toContain("password-secret")
    expect(whenRedacted).not.toContain("json-secret")
    expect(whenRedacted).not.toContain("sk-proj-standalone-secret")
    expect(whenRedacted).not.toContain("github_pat_token-secret")
    expect(whenRedacted).toContain("~/project/report.txt")
    expect(whenRedacted).toContain("[TRUNCATED]")
  })

  it("handles an empty home option without rewriting every character", () => {
    const givenOutput = "/project/file.txt"

    const whenRedacted = redactText(givenOutput, { home: "" })

    expect(whenRedacted).toBe(givenOutput)
  })
})
