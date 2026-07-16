export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`.trim()}>
      <span className="brand-lockup__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <title>ProofStack mark</title>
          <path d="M4 7h11M9 12h11M4 17h11" />
        </svg>
      </span>
      <span>ProofStack</span>
      <small>0.1</small>
    </span>
  )
}
