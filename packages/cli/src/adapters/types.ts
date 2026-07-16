import { type Evidence, redactText } from "@proofstack/core"

export type AdapterContext = {
  readonly root: string
  readonly allowedCommands: readonly string[]
  readonly home: string
  readonly assetsDir: string
}

export type AdapterResult = Omit<Evidence, "id" | "claimId">

export function redactEvidence(input: string, context: AdapterContext, maxLength?: number): string {
  return redactText(input, {
    home: context.home,
    projectRoot: context.root,
    ...(maxLength === undefined ? {} : { maxLength }),
  })
}

export function assertNever(value: never): never {
  throw new TypeError(`Unexpected adapter state: ${JSON.stringify(value)}`)
}
