import { z } from "zod"
import { CheckIdSchema, CheckTypeSchema, ClaimIdSchema, VerdictSchema } from "./contract-schema.js"

const NonEmptyTextSchema = z.string().trim().min(1)

export const RunIdSchema = NonEmptyTextSchema.brand("RunId")
export const EvidenceIdSchema = NonEmptyTextSchema.brand("EvidenceId")
export const RootFingerprintSchema = NonEmptyTextSchema.brand("RootFingerprint")

const ProjectIdentitySchema = z
  .object({
    name: NonEmptyTextSchema,
    root: NonEmptyTextSchema,
    rootFingerprint: RootFingerprintSchema,
  })
  .strict()
  .readonly()

export const EvidenceSchema = z
  .object({
    id: EvidenceIdSchema,
    claimId: ClaimIdSchema,
    checkId: CheckIdSchema,
    type: CheckTypeSchema,
    verdict: VerdictSchema,
    summary: NonEmptyTextSchema,
    detail: z.string().optional(),
    durationMs: z.number().int().nonnegative(),
    asset: NonEmptyTextSchema.optional(),
  })
  .strict()
  .readonly()

export const ClaimResultSchema = z
  .object({
    id: ClaimIdSchema,
    title: NonEmptyTextSchema,
    required: z.boolean(),
    weight: z.number().positive(),
    verdict: VerdictSchema,
    evidenceIds: z.array(EvidenceIdSchema).min(1).readonly(),
  })
  .strict()
  .readonly()

export const RepairPacketSchema = z
  .object({
    version: z.literal(1),
    failedClaimIds: z.array(ClaimIdSchema).readonly(),
    prompt: NonEmptyTextSchema,
  })
  .strict()
  .readonly()

function containsDuplicates<T>(values: readonly T[]): boolean {
  return new Set(values).size !== values.length
}

export const ProofBundleSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    runId: RunIdSchema,
    generatedAt: z.iso.datetime(),
    toolVersion: NonEmptyTextSchema,
    project: ProjectIdentitySchema,
    score: z.number().int().min(0).max(100),
    complete: z.boolean(),
    durationMs: z.number().int().nonnegative(),
    claims: z.array(ClaimResultSchema).min(1).readonly(),
    evidence: z.array(EvidenceSchema).min(1).readonly(),
    repairPacket: RepairPacketSchema,
  })
  .strict()
  .superRefine((value, context) => {
    const claimIds = value.claims.map((claim) => claim.id)
    const evidenceIds = value.evidence.map((evidence) => evidence.id)

    if (containsDuplicates(claimIds)) {
      context.addIssue({
        code: "custom",
        message: "Bundle claim ids must be unique",
        path: ["claims"],
      })
    }

    if (containsDuplicates(evidenceIds)) {
      context.addIssue({
        code: "custom",
        message: "Evidence ids must be unique",
        path: ["evidence"],
      })
    }

    const knownClaimIds = new Set(claimIds)
    if (value.evidence.some((evidence) => !knownClaimIds.has(evidence.claimId))) {
      context.addIssue({
        code: "custom",
        message: "Evidence claim ids must reference known claims",
        path: ["evidence"],
      })
    }

    const knownEvidenceIds = new Set(evidenceIds)
    if (value.claims.some((claim) => claim.evidenceIds.some((id) => !knownEvidenceIds.has(id)))) {
      context.addIssue({
        code: "custom",
        message: "Claim evidence ids must reference known evidence",
        path: ["claims"],
      })
    }

    const evidenceById = new Map(value.evidence.map((evidence) => [evidence.id, evidence]))
    const hasMismatchedEvidence = value.claims.some((claim) =>
      claim.evidenceIds.some((id) => {
        const evidence = evidenceById.get(id)
        return evidence !== undefined && evidence.claimId !== claim.id
      }),
    )
    if (hasMismatchedEvidence) {
      context.addIssue({
        code: "custom",
        message: "Claim evidence must belong to the same claim",
        path: ["claims"],
      })
    }

    if (value.repairPacket.failedClaimIds.some((id) => !knownClaimIds.has(id))) {
      context.addIssue({
        code: "custom",
        message: "Repair packet claim ids must reference known claims",
        path: ["repairPacket", "failedClaimIds"],
      })
    }
  })
  .readonly()

export type RunId = z.infer<typeof RunIdSchema>
export type EvidenceId = z.infer<typeof EvidenceIdSchema>
export type Evidence = z.infer<typeof EvidenceSchema>
export type ClaimResult = z.infer<typeof ClaimResultSchema>
export type RepairPacket = z.infer<typeof RepairPacketSchema>
export type ProofBundle = z.infer<typeof ProofBundleSchema>
