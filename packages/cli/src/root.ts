import { access } from "node:fs/promises"
import { dirname, join, parse, resolve } from "node:path"

export type ResolvedProject = {
  readonly root: string
  readonly contractPath: string
}

export class ContractNotFoundError extends Error {
  readonly name = "ContractNotFoundError"

  constructor(readonly start: string) {
    super(`proofstack.yml not found from ${start}`)
  }
}

export async function resolveProject(start: string): Promise<ResolvedProject> {
  let current = resolve(start)
  const filesystemRoot = parse(current).root

  while (true) {
    const contractPath = join(current, "proofstack.yml")
    try {
      await access(contractPath)
      return { root: current, contractPath }
    } catch (error) {
      if (!(error instanceof Error)) throw error
      if (!("code" in error && (error.code === "ENOENT" || error.code === "ENOTDIR"))) throw error
    }

    if (current === filesystemRoot) throw new ContractNotFoundError(start)
    current = dirname(current)
  }
}
