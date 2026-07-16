import type { Verdict } from "@proofstack/core"

export function EvidenceBeam({ verdict }: { verdict: Verdict }) {
  return (
    <div className={`evidence-beam evidence-beam--${verdict}`} aria-hidden="true">
      <span />
    </div>
  )
}
