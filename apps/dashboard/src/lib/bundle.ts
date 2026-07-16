import { type ProofBundle, ProofBundleSchema } from "@proofstack/core"

export function parseBundle(value: unknown): ProofBundle {
  return ProofBundleSchema.parse(value)
}

export async function loadBundleFile(file: File): Promise<ProofBundle> {
  return parseBundle(JSON.parse(await file.text()))
}

export async function fetchBundle(path: string): Promise<ProofBundle> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Bundle request failed: ${response.status}`)
  }
  return parseBundle(await response.json())
}
