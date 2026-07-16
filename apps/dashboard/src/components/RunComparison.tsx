import type { RunChange, Verdict } from "@proofstack/core"
import { StatusBadge } from "./StatusBadge.js"

const changeLabels = {
  added: "added",
  improved: "improved",
  regressed: "regressed",
  removed: "removed",
  unchanged: "unchanged",
} satisfies Record<RunChange["change"], string>

function verdictBefore(change: RunChange): Verdict | null {
  return "before" in change ? change.before : null
}

function verdictAfter(change: RunChange): Verdict | null {
  return "after" in change ? change.after : null
}

export function RunComparison({
  afterScore,
  beforeScore,
  changes,
  onBaselineFile,
}: {
  afterScore: number
  beforeScore?: number | undefined
  changes: readonly RunChange[]
  onBaselineFile: (file: File) => void
}) {
  const improved = changes.filter((item) => item.change === "improved").length
  const regressed = changes.filter((item) => item.change === "regressed").length
  const unchanged = changes.filter((item) => item.change === "unchanged").length
  const improvedClaimLabel = improved === 1 ? "claim" : "claims"

  return (
    <section className="run-comparison" aria-labelledby="comparison-title">
      <header className="run-comparison__header">
        <div>
          <p className="eyebrow">Before / after</p>
          <h2 id="comparison-title">
            {beforeScore === undefined
              ? "Add a baseline to compare."
              : `${improved} ${improvedClaimLabel} improved.`}
          </h2>
        </div>
        <label className="baseline-button">
          {beforeScore === undefined ? "Open baseline bundle" : "Replace baseline"}
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0]
              if (file) onBaselineFile(file)
            }}
          />
        </label>
      </header>

      {beforeScore === undefined ? (
        <p className="comparison-empty">
          The imported report remains primary. A second local bundle unlocks claim-by-claim change
          labels.
        </p>
      ) : (
        <>
          <div className="comparison-strip">
            <div>
              <span>Before</span>
              <strong>{beforeScore}</strong>
            </div>
            <span className="comparison-strip__direction" aria-hidden="true">
              →
            </span>
            <div>
              <span>After</span>
              <strong>{afterScore}</strong>
            </div>
            <p className="comparison-score">
              {beforeScore} → {afterScore}
            </p>
            <dl>
              <div>
                <dt>Improved</dt>
                <dd>{improved}</dd>
              </div>
              <div>
                <dt>Regressed</dt>
                <dd>{regressed}</dd>
              </div>
              <div>
                <dt>Unchanged</dt>
                <dd>{unchanged}</dd>
              </div>
            </dl>
          </div>

          <ul className="change-list" aria-label="Claim changes">
            {changes.map((item) => {
              const before = verdictBefore(item)
              const after = verdictAfter(item)
              return (
                <li className={`change-row change-row--${item.change}`} key={item.id}>
                  <code>{item.id}</code>
                  <div className="change-row__verdicts">
                    {before ? <StatusBadge verdict={before} /> : <span>Not present</span>}
                    <span aria-hidden="true">→</span>
                    {after ? <StatusBadge verdict={after} /> : <span>Removed</span>}
                  </div>
                  <strong>{changeLabels[item.change]}</strong>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
