import { mkdir, realpath } from "node:fs/promises"
import { isAbsolute, relative, resolve, sep } from "node:path"

export class UnsafeOutputDirectoryError extends Error {
  readonly name = "UnsafeOutputDirectoryError"

  constructor(readonly path: string) {
    super(`ProofStack output must stay inside the project root: ${path}`)
  }
}

function isContainedPath(root: string, target: string): boolean {
  const relativePath = relative(root, target)
  const escapesRoot = relativePath === ".." || relativePath.startsWith(`..${sep}`)
  return !escapesRoot && !isAbsolute(relativePath)
}

export async function prepareRunDirectory(root: string, runId: string): Promise<string> {
  const resolvedRoot = await realpath(root)
  const outputCandidate = resolve(resolvedRoot, ".proofstack")
  await mkdir(outputCandidate, { recursive: true, mode: 0o700 })
  const outputRoot = await realpath(outputCandidate)

  if (!isContainedPath(resolvedRoot, outputRoot)) {
    throw new UnsafeOutputDirectoryError(outputRoot)
  }

  const runCandidate = resolve(outputRoot, runId)
  if (!isContainedPath(outputRoot, runCandidate)) {
    throw new UnsafeOutputDirectoryError(runCandidate)
  }

  await mkdir(runCandidate, { recursive: true, mode: 0o700 })
  const runDirectory = await realpath(runCandidate)
  if (!isContainedPath(outputRoot, runDirectory)) {
    throw new UnsafeOutputDirectoryError(runDirectory)
  }

  return runDirectory
}
