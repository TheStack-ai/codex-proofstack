import type { ClaimId, ClaimResult } from "@proofstack/core"
import { StatusBadge } from "./StatusBadge.js"

export function ClaimMatrix({
  claims,
  onSelect,
  selected,
}: {
  claims: readonly ClaimResult[]
  onSelect: (id: ClaimId) => void
  selected?: ClaimId | undefined
}) {
  return (
    <section className="claim-matrix" aria-labelledby="claim-matrix-title">
      <header className="section-heading">
        <div>
          <p className="eyebrow">Delivery claims</p>
          <h2 id="claim-matrix-title">Follow the weakest proof.</h2>
        </div>
        <p>{claims.length} claims inspected</p>
      </header>
      <div className="claim-list">
        {claims.map((claim, index) => (
          <button
            aria-pressed={selected === claim.id}
            className="claim-row"
            key={claim.id}
            onClick={() => onSelect(claim.id)}
            type="button"
          >
            <span className="claim-row__sequence">{String(index + 1).padStart(2, "0")}</span>
            <span className="claim-row__body">
              <strong>{claim.title}</strong>
              <code className="claim-row__id">{claim.id}</code>
              <small>
                {claim.evidenceIds.length} evidence · weight {claim.weight}
                {claim.required ? " · required" : " · optional"}
              </small>
            </span>
            <StatusBadge verdict={claim.verdict} />
            <svg
              className="claim-row__arrow"
              aria-hidden="true"
              viewBox="0 0 16 16"
              width="16"
              height="16"
            >
              <title>Inspect claim</title>
              <path d="m6 3 5 5-5 5" />
            </svg>
          </button>
        ))}
      </div>
    </section>
  )
}
