import type { ProofBundle } from "@proofstack/core"
import { useEffect, useState } from "react"
import { fetchBundle, loadBundleFile } from "./lib/bundle.js"

function errorMessage(value: unknown): string {
  return value instanceof Error ? value.message : String(value)
}

export function App() {
  const [bundle, setBundle] = useState<ProofBundle | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    void fetchBundle("/demo/repaired.json")
      .then((value) => {
        if (active) setBundle(value)
      })
      .catch((value: unknown) => {
        if (active) setError(errorMessage(value))
      })
    return () => {
      active = false
    }
  }, [])

  async function importBundle(file: File): Promise<void> {
    try {
      setBundle(await loadBundleFile(file))
      setError("")
    } catch (value) {
      setError(errorMessage(value))
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="ProofStack home">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
            <path d="M4 7h11M9 12h11M4 17h11" />
          </svg>
          <span>ProofStack</span>
          <small>0.1</small>
        </a>
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
      </header>

      <section className="loading-stage" aria-live="polite">
        <p className="eyebrow">Local-first verification</p>
        <h1>Make “done” provable.</h1>
        {error ? <p role="alert">{error}</p> : null}
        {bundle ? (
          <p>
            Loaded <strong>{bundle.project.name}</strong> at {bundle.score}% verified.
          </p>
        ) : (
          <p>Loading the reproducible proof run…</p>
        )}
      </section>
    </main>
  )
}
