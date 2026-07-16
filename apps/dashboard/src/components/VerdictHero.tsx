function scoreMessage(score: number, complete: boolean): string {
  if (!complete) return "Incomplete evidence"
  if (score === 100) return "Every required claim is proven"
  return `${100 - score} points remain unverified`
}

function scoreTone(score: number, complete: boolean): "pass" | "fail" | "unknown" {
  if (!complete) return "unknown"
  return score === 100 ? "pass" : "fail"
}

export function VerdictHero({
  complete,
  project,
  runId,
  score,
}: {
  complete: boolean
  project: string
  runId: string
  score: number
}) {
  const tone = scoreTone(score, complete)
  return (
    <section className={`score-chamber score-chamber--${tone}`} aria-labelledby="verdict-title">
      <div className="score-chamber__copy">
        <p className="eyebrow">Verification verdict</p>
        <h2 id="verdict-title">{score}% verified</h2>
        <p className="score-chamber__message">{scoreMessage(score, complete)}</p>
        <dl className="score-meta">
          <div>
            <dt>Project</dt>
            <dd>{project}</dd>
          </div>
          <div>
            <dt>Run</dt>
            <dd>{runId}</dd>
          </div>
        </dl>
      </div>
      <div className="score-meter" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <title>{score} percent verified</title>
          <circle className="score-meter__track" cx="60" cy="60" r="52" pathLength="100" />
          <circle
            className="score-meter__value"
            cx="60"
            cy="60"
            r="52"
            pathLength="100"
            strokeDasharray={`${score} 100`}
          />
        </svg>
        <span>{score}</span>
      </div>
    </section>
  )
}
