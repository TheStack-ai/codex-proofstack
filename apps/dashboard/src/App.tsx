import { type ClaimId, type ClaimResult, compareRuns, type ProofBundle } from "@proofstack/core"
import { useEffect, useMemo, useState } from "react"
import { BrandLockup } from "./components/BrandLockup.js"
import { ClaimMatrix } from "./components/ClaimMatrix.js"
import { EvidenceBeam } from "./components/EvidenceBeam.js"
import { EvidencePanel } from "./components/EvidencePanel.js"
import { PrimitiveShowcase } from "./components/PrimitiveShowcase.js"
import { RepairPacket } from "./components/RepairPacket.js"
import { RunComparison } from "./components/RunComparison.js"
import { VerdictHero } from "./components/VerdictHero.js"
import { fetchBundle, loadBundleFile } from "./lib/bundle.js"

function errorMessage(value: unknown): string {
  return value instanceof Error ? value.message : String(value)
}

function firstInspectableClaim(bundle: ProofBundle): ClaimId | undefined {
  let highestWeightFailure: ClaimResult | undefined
  for (const claim of bundle.claims) {
    if (
      claim.required &&
      claim.verdict === "fail" &&
      (!highestWeightFailure || claim.weight > highestWeightFailure.weight)
    ) {
      highestWeightFailure = claim
    }
  }
  return (
    highestWeightFailure?.id ??
    bundle.claims.find((claim) => claim.verdict === "unknown")?.id ??
    bundle.claims[0]?.id
  )
}

function firstChangedClaim(before: ProofBundle, after: ProofBundle): ClaimId | undefined {
  const previousVerdicts = new Map(before.claims.map((claim) => [claim.id, claim.verdict]))
  let highestWeightChange: ClaimResult | undefined
  for (const claim of after.claims) {
    if (
      previousVerdicts.get(claim.id) !== claim.verdict &&
      (!highestWeightChange || claim.weight > highestWeightChange.weight)
    ) {
      highestWeightChange = claim
    }
  }
  return highestWeightChange?.id ?? firstInspectableClaim(after)
}

function nonPassingRequiredCount(value: ProofBundle | null): number {
  return value?.claims.filter((claim) => claim.required && claim.verdict !== "pass").length ?? 0
}

export function App() {
  const showPrimitives = new URLSearchParams(window.location.search).has("showcase")
  const [before, setBefore] = useState<ProofBundle | null>(null)
  const [bundle, setBundle] = useState<ProofBundle | null>(null)
  const [selectedClaimId, setSelectedClaimId] = useState<ClaimId | undefined>()
  const [assetBase, setAssetBase] = useState<string | undefined>("/demo/assets/repaired")
  const [error, setError] = useState("")

  useEffect(() => {
    if (showPrimitives) return undefined
    let active = true
    void Promise.all([fetchBundle("/demo/broken.json"), fetchBundle("/demo/repaired.json")])
      .then(([baseline, current]) => {
        if (active) {
          setBefore(baseline)
          setBundle(current)
          setSelectedClaimId(firstChangedClaim(baseline, current))
        }
      })
      .catch((value: unknown) => {
        if (active) setError(errorMessage(value))
      })
    return () => {
      active = false
    }
  }, [showPrimitives])

  async function importBundle(file: File): Promise<void> {
    try {
      const value = await loadBundleFile(file)
      setBefore(null)
      setBundle(value)
      setSelectedClaimId(firstInspectableClaim(value))
      setAssetBase(undefined)
      setError("")
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value))
    }
  }

  async function importBaseline(file: File): Promise<void> {
    try {
      const value = await loadBundleFile(file)
      setBefore(value)
      if (bundle) setSelectedClaimId(firstChangedClaim(value, bundle))
      setError("")
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value))
    }
  }

  const selectedClaim = bundle?.claims.find((claim) => claim.id === selectedClaimId)
  const selectedEvidence = useMemo(
    () => bundle?.evidence.filter((evidence) => evidence.claimId === selectedClaimId) ?? [],
    [bundle, selectedClaimId],
  )
  const changes = useMemo(
    () => (before && bundle ? compareRuns(before.claims, bundle.claims) : []),
    [before, bundle],
  )
  const currentFailedCount = nonPassingRequiredCount(bundle)
  const baselineFailedCount = nonPassingRequiredCount(before)
  const resolvedRepairs = currentFailedCount === 0 && baselineFailedCount > 0
  const repairSource = currentFailedCount > 0 ? bundle : resolvedRepairs ? before : bundle
  const failedCount = currentFailedCount > 0 ? currentFailedCount : baselineFailedCount

  if (showPrimitives) return <PrimitiveShowcase />

  return (
    <>
      <a className="skip-link" href="#proof-report">
        Skip to proof report
      </a>
      <header className="product-topbar">
        <div className="product-topbar__inner">
          <a className="product-brand" href="/" aria-label="ProofStack home">
            <BrandLockup />
          </a>
          <div className="product-actions">
            <span className="local-note">
              <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
                <title>Local only</title>
                <path d="M4.5 7V5.5a3.5 3.5 0 0 1 7 0V7m-8 0h9v6h-9z" />
              </svg>
              Local only · no source upload
            </span>
            <label className="bundle-button">
              Open proof bundle
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0]
                  if (file) void importBundle(file)
                }}
              />
            </label>
          </div>
        </div>
      </header>

      <main className="product-shell" id="proof-report">
        <section className="report-intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Claim → evidence → verdict → repair</p>
            <h1 id="page-title">Proof before handoff.</h1>
          </div>
          <p>
            ProofStack catches the gap between a green pipeline and the product a reviewer can
            actually use.
          </p>
        </section>

        {error ? (
          <section className="report-error" role="alert">
            <strong>That bundle could not be opened.</strong>
            <span>{error}</span>
          </section>
        ) : null}

        {!bundle ? (
          <section className="report-loading" aria-busy="true" aria-label="Proof bundle loading">
            <span />
            <span />
            <span />
          </section>
        ) : (
          <div className="report-stack">
            <VerdictHero
              complete={bundle.complete}
              project={bundle.project.name}
              runId={bundle.runId}
              score={bundle.score}
            />
            <section className="proof-workspace" aria-label="Claim to evidence workspace">
              <ClaimMatrix
                claims={bundle.claims}
                selected={selectedClaimId}
                onSelect={setSelectedClaimId}
              />
              <EvidenceBeam verdict={selectedClaim?.verdict ?? "unknown"} />
              <EvidencePanel
                assetBase={assetBase}
                claim={selectedClaim}
                evidence={selectedEvidence}
              />
            </section>
            <RunComparison
              afterScore={bundle.score}
              beforeScore={before?.score}
              changes={changes}
              onBaselineFile={(file) => void importBaseline(file)}
            />
            <RepairPacket
              failedCount={failedCount}
              resolved={resolvedRepairs}
              value={repairSource?.repairPacket.prompt ?? ""}
            />
          </div>
        )}
      </main>
    </>
  )
}
