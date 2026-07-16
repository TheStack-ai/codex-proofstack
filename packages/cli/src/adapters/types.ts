import type { Evidence } from "@proofstack/core"

export type AdapterContext = {
  readonly root: string
  readonly allowedCommands: readonly string[]
  readonly home: string
  readonly assetsDir: string
}

export type AdapterResult = Omit<Evidence, "id" | "claimId">

export function assertNever(value: never): never {
  throw new TypeError(`Unexpected adapter state: ${JSON.stringify(value)}`)
}
