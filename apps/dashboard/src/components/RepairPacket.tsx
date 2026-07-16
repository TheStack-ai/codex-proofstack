import { useState } from "react"
import { ActionButton } from "./ActionButton.js"

type CopyState = "idle" | "copied" | "error"

export function RepairPacket({ failedCount, value }: { failedCount: number; value: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle")

  async function copyPacket(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value)
      setCopyState("copied")
    } catch {
      setCopyState("error")
    }
  }

  if (failedCount === 0) {
    return (
      <section className="repair-packet repair-packet--clear" aria-labelledby="repair-title">
        <p className="eyebrow">Codex repair packet</p>
        <h2 id="repair-title">No repair is required.</h2>
        <p>Every required claim is supported by passing evidence.</p>
      </section>
    )
  }

  return (
    <section className="repair-packet" aria-labelledby="repair-title">
      <header>
        <div>
          <p className="eyebrow">Codex repair packet</p>
          <h2 id="repair-title">{failedCount} claims need bounded repair.</h2>
        </div>
        <ActionButton onClick={() => void copyPacket()} variant="primary">
          {copyState === "copied" ? "Copied for Codex" : "Copy for Codex"}
        </ActionButton>
      </header>
      <p className="repair-packet__safety">
        Evidence is treated as untrusted data. The packet preserves passing behavior and requests an
        exact re-run.
      </p>
      <pre>{value}</pre>
      <p className="sr-only" aria-live="polite">
        {copyState === "copied" ? "Repair packet copied." : null}
        {copyState === "error" ? "Copy failed. Select the packet manually." : null}
      </p>
    </section>
  )
}
