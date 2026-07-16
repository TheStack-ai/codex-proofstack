import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, it, onTestFinished } from "vitest"
import { loadContract } from "../src/load-contract.js"
import { ContractNotFoundError, resolveProject } from "../src/root.js"

async function createTemporaryRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "proofstack-root-"))
  onTestFinished(() => rm(root, { force: true, recursive: true }))
  return root
}

it("uses the contract directory as the real project root", async () => {
  const givenRoot = await createTemporaryRoot()
  const givenContractPath = join(givenRoot, "proofstack.yml")
  const givenNestedDirectory = join(givenRoot, "nested", "deeper")
  await writeFile(givenContractPath, "version: 1")
  await mkdir(givenNestedDirectory, { recursive: true })

  const whenResolved = await resolveProject(givenNestedDirectory)

  expect(whenResolved).toEqual({ root: givenRoot, contractPath: givenContractPath })
})

it("returns a typed error when no contract exists", async () => {
  const givenRoot = await createTemporaryRoot()

  const whenResolved = resolveProject(givenRoot)

  await expect(whenResolved).rejects.toBeInstanceOf(ContractNotFoundError)
})

it("loads YAML through the strict contract boundary", async () => {
  const givenRoot = await createTemporaryRoot()
  const givenContractPath = join(givenRoot, "proofstack.yml")
  await writeFile(
    givenContractPath,
    [
      "version: 1",
      "project: local-demo",
      "claims:",
      "  - id: readme",
      "    title: README exists",
      "    checks:",
      "      - id: readme-file",
      "        type: file",
      "        path: README.md",
    ].join("\n"),
  )

  const whenLoaded = await loadContract(givenContractPath)

  expect(whenLoaded.allowedCommands).toEqual([])
  expect(whenLoaded.claims[0]?.required).toBe(true)
  expect(whenLoaded.claims[0]?.checks[0]?.type).toBe("file")
})
