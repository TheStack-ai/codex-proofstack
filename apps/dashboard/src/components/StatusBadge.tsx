import type { Verdict } from "@proofstack/core"

const verdictLabels = {
  fail: "Fail",
  pass: "Pass",
  unknown: "Unknown",
} satisfies Record<Verdict, string>

function VerdictGlyph({ verdict }: { verdict: Verdict }) {
  if (verdict === "pass") {
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
        <title>Passed</title>
        <path d="m3.5 8.2 2.7 2.7 6.3-6.3" />
      </svg>
    )
  }
  if (verdict === "fail") {
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
        <title>Failed</title>
        <path d="m4.5 4.5 7 7m0-7-7 7" />
      </svg>
    )
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
      <title>Unknown</title>
      <path d="M4 8h8" />
    </svg>
  )
}

export function StatusBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`status-badge status-badge--${verdict}`}>
      <VerdictGlyph verdict={verdict} />
      {verdictLabels[verdict]}
    </span>
  )
}
