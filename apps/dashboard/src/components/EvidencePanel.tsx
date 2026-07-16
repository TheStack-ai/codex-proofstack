import type { ClaimResult, Evidence } from "@proofstack/core"
import { StatusBadge } from "./StatusBadge.js"

function safeAssetUrl(assetBase: string | undefined, asset: string): string | null {
  return assetBase && /^[a-zA-Z0-9._-]+$/.test(asset) ? `${assetBase}/${asset}` : null
}

export function EvidencePanel({
  assetBase,
  claim,
  evidence,
}: {
  assetBase?: string | undefined
  claim?: ClaimResult | undefined
  evidence: readonly Evidence[]
}) {
  return (
    <aside className="evidence-shell" aria-labelledby="evidence-title">
      <div className="evidence-chamber">
        <header className="evidence-chamber__header">
          <div>
            <p className="eyebrow">Selected evidence</p>
            <h2 id="evidence-title">{claim?.title ?? "Select a delivery claim"}</h2>
          </div>
          {claim ? <StatusBadge verdict={claim.verdict} /> : null}
        </header>

        {evidence.length === 0 ? (
          <div className="evidence-empty">
            <span aria-hidden="true">—</span>
            <p>No evidence is attached to this claim.</p>
          </div>
        ) : (
          <div className="evidence-list">
            {evidence.map((item) => {
              const assetUrl = item.asset ? safeAssetUrl(assetBase, item.asset) : null
              return (
                <article className="evidence-item" key={item.id}>
                  <header>
                    <StatusBadge verdict={item.verdict} />
                    <span className="evidence-type">{item.type}</span>
                    <time>{item.durationMs}ms</time>
                  </header>
                  <h3>{item.summary}</h3>
                  {item.detail ? (
                    <details>
                      <summary>Inspect redacted detail</summary>
                      <pre>{item.detail}</pre>
                    </details>
                  ) : null}
                  {assetUrl ? (
                    <figure>
                      <img
                        alt={`Captured browser evidence for ${claim?.title ?? item.claimId}`}
                        src={assetUrl}
                        width="1280"
                        height="900"
                      />
                      <figcaption>{item.asset}</figcaption>
                    </figure>
                  ) : null}
                  {item.asset && !assetUrl ? (
                    <p className="asset-warning">Screenshot asset: {item.asset}</p>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
