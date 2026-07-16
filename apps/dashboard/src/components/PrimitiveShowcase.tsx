import {
  CheckIdSchema,
  type ClaimId,
  ClaimIdSchema,
  type ClaimResult,
  type Evidence,
  EvidenceIdSchema,
} from "@proofstack/core"
import { useMemo, useState } from "react"
import { ActionButton } from "./ActionButton.js"
import { BrandLockup } from "./BrandLockup.js"
import { ClaimMatrix } from "./ClaimMatrix.js"
import { EvidenceBeam } from "./EvidenceBeam.js"
import { EvidencePanel } from "./EvidencePanel.js"
import { RepairPacket } from "./RepairPacket.js"
import { RunComparison } from "./RunComparison.js"
import { StatusBadge } from "./StatusBadge.js"
import { VerdictHero } from "./VerdictHero.js"

const showcaseClaims: ClaimResult[] = [
  {
    id: ClaimIdSchema.parse("health"),
    title: "The service responds with the expected health contract",
    required: true,
    weight: 1,
    verdict: "pass",
    evidenceIds: [EvidenceIdSchema.parse("health-http")],
  },
  {
    id: ClaimIdSchema.parse("visible-status-with-an-unbroken-identifier-7ac9f807b77bd467"),
    title: "The rendered product exposes a verified state before handoff",
    required: true,
    weight: 3,
    verdict: "fail",
    evidenceIds: [EvidenceIdSchema.parse("status-browser")],
  },
  {
    id: ClaimIdSchema.parse("traceability"),
    title: "The release keeps a stable claim-to-evidence chain",
    required: false,
    weight: 2,
    verdict: "unknown",
    evidenceIds: [],
  },
]

const showcaseEvidence: Evidence[] = [
  {
    id: EvidenceIdSchema.parse("evidence-health-command"),
    claimId: ClaimIdSchema.parse("health"),
    checkId: CheckIdSchema.parse("health-command"),
    type: "command",
    verdict: "pass",
    summary: "node exited with code 0",
    detail: "Command: pnpm test --filter health",
    durationMs: 103,
  },
  {
    id: EvidenceIdSchema.parse("evidence-status-browser"),
    claimId: ClaimIdSchema.parse("visible-status-with-an-unbroken-identifier-7ac9f807b77bd467"),
    checkId: CheckIdSchema.parse("status-browser"),
    type: "browser",
    verdict: "fail",
    summary: "Browser assertion is not visible",
    detail: "Final URL: http://127.0.0.1:4173/\nTitle: Release Console",
    durationMs: 472,
  },
]

export function PrimitiveShowcase() {
  const [selected, setSelected] = useState<ClaimId | undefined>(showcaseClaims[1]?.id)
  const selectedClaim = showcaseClaims.find((claim) => claim.id === selected)
  const selectedEvidence = useMemo(
    () => showcaseEvidence.filter((evidence) => evidence.claimId === selected),
    [selected],
  )

  return (
    <main className="showcase-shell">
      <header className="showcase-header">
        <BrandLockup />
        <div>
          <p className="eyebrow">Primitive showcase / phase 0</p>
          <h1>Midnight Evidence Chamber</h1>
          <p>Token-driven states before product composition.</p>
        </div>
      </header>

      <section className="showcase-section" aria-labelledby="showcase-actions">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Actions and status</p>
            <h2 id="showcase-actions">Controls expose every state.</h2>
          </div>
        </div>
        <div className="showcase-cluster">
          <ActionButton variant="primary">Verify project</ActionButton>
          <ActionButton variant="secondary">Open bundle</ActionButton>
          <ActionButton variant="quiet">Inspect source</ActionButton>
          <ActionButton disabled>Verification busy</ActionButton>
          <StatusBadge verdict="pass" />
          <StatusBadge verdict="fail" />
          <StatusBadge verdict="unknown" />
        </div>
      </section>

      <section className="showcase-score-grid" aria-label="Score chamber states">
        <VerdictHero complete score={100} project="release-console" runId="demo-repaired" />
        <VerdictHero complete={false} score={63} project="release-console" runId="demo-pending" />
      </section>

      <section
        className="proof-workspace proof-workspace--showcase"
        aria-label="Claim and evidence primitives"
      >
        <ClaimMatrix claims={showcaseClaims} selected={selected} onSelect={setSelected} />
        <EvidenceBeam verdict={selectedClaim?.verdict ?? "unknown"} />
        <EvidencePanel
          assetBase="/demo/assets/broken"
          claim={selectedClaim}
          evidence={selectedEvidence}
        />
      </section>

      <section className="showcase-state-grid" aria-label="Empty and loading states">
        <article className="state-card">
          <p className="eyebrow">Loading</p>
          <div
            className="skeleton-stack"
            role="status"
            aria-label="Evidence loading"
            aria-busy="true"
          >
            <span />
            <span />
            <span />
          </div>
        </article>
        <EvidencePanel assetBase="/demo/assets/broken" evidence={[]} />
      </section>

      <RunComparison
        afterScore={100}
        beforeScore={38}
        changes={[
          {
            id: ClaimIdSchema.parse("visible-status"),
            before: "fail",
            after: "pass",
            change: "improved",
          },
        ]}
        onBaselineFile={() => undefined}
      />

      <section className="showcase-repair-grid" aria-label="Repair packet states">
        <RepairPacket
          failedCount={2}
          value={
            "# Codex repair packet\n\nFix only the listed non-passing claims. Preserve passing behavior."
          }
        />
        <RepairPacket failedCount={2} resolved value="" />
        <RepairPacket failedCount={0} value="" />
      </section>
    </main>
  )
}
