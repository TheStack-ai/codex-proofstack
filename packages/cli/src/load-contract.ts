import { readFile } from "node:fs/promises"
import { type ProofContract, ProofContractSchema } from "@proofstack/core"
import { parse as parseYaml } from "yaml"

export async function loadContract(contractPath: string): Promise<ProofContract> {
  const source = await readFile(contractPath, "utf8")
  const decoded: unknown = parseYaml(source)
  return ProofContractSchema.parse(decoded)
}
