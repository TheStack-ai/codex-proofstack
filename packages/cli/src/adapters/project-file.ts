import { readFile, realpath } from "node:fs/promises"
import { isAbsolute, relative, resolve, sep } from "node:path"

export type ProjectFileRead =
  | { readonly kind: "read"; readonly path: string; readonly content: string }
  | { readonly kind: "outside-root"; readonly path: string }
  | { readonly kind: "unreadable"; readonly path: string; readonly message: string }

function isProjectPath(root: string, target: string): boolean {
  const relativePath = relative(root, target)
  const escapesRoot = relativePath === ".." || relativePath.startsWith(`..${sep}`)
  return !escapesRoot && !isAbsolute(relativePath)
}

export async function readProjectFile(
  root: string,
  requestedPath: string,
): Promise<ProjectFileRead> {
  const resolvedRoot = await realpath(root)
  const candidatePath = resolve(resolvedRoot, requestedPath)

  if (!isProjectPath(resolvedRoot, candidatePath)) {
    return { kind: "outside-root", path: candidatePath }
  }

  try {
    const resolvedPath = await realpath(candidatePath)
    if (!isProjectPath(resolvedRoot, resolvedPath)) {
      return { kind: "outside-root", path: resolvedPath }
    }

    return { kind: "read", path: resolvedPath, content: await readFile(resolvedPath, "utf8") }
  } catch (error) {
    if (!(error instanceof Error)) throw error
    return { kind: "unreadable", path: candidatePath, message: error.message }
  }
}
