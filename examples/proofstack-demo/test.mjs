const port = process.env.PROOFSTACK_DEMO_PORT ?? "4173"
const baseUrl = process.env.PROOFSTACK_DEMO_URL ?? `http://127.0.0.1:${port}`
const response = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(5_000) })
const body = await response.json()

if (response.status !== 200 || body.status !== "ok") {
  throw new Error(`Health check failed with HTTP ${response.status}`)
}

console.log("health test passed")
