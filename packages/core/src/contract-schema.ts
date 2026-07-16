import { z } from "zod"

const NonEmptyTextSchema = z.string().trim().min(1)

export const ClaimIdSchema = NonEmptyTextSchema.brand("ClaimId")
export const CheckIdSchema = NonEmptyTextSchema.brand("CheckId")

const CheckBaseShape = {
  id: CheckIdSchema,
} as const

const FileCheckSchema = z
  .object({
    ...CheckBaseShape,
    type: z.literal("file"),
    path: NonEmptyTextSchema,
    contains: z.string().optional(),
  })
  .strict()
  .readonly()

const CommandCheckSchema = z
  .object({
    ...CheckBaseShape,
    type: z.literal("command"),
    command: NonEmptyTextSchema,
    args: z.array(z.string()).readonly().default([]),
    timeoutMs: z.number().int().positive().max(120_000).default(30_000),
  })
  .strict()
  .readonly()

const HttpCheckSchema = z
  .object({
    ...CheckBaseShape,
    type: z.literal("http"),
    url: z.url(),
    status: z.number().int().min(100).max(599).default(200),
    contains: z.string().optional(),
    maxLatencyMs: z.number().positive().optional(),
  })
  .strict()
  .readonly()

const BrowserCheckSchema = z
  .object({
    ...CheckBaseShape,
    type: z.literal("browser"),
    url: z.url(),
    text: z.string().optional(),
    role: NonEmptyTextSchema.optional(),
    name: z.string().optional(),
    screenshot: NonEmptyTextSchema.optional(),
  })
  .strict()
  .readonly()

const RulesCheckSchema = z
  .object({
    ...CheckBaseShape,
    type: z.literal("rules"),
    path: NonEmptyTextSchema,
    mustContain: z.array(z.string().min(1)).min(1).readonly(),
  })
  .strict()
  .readonly()

export const CHECK_TYPES = ["file", "command", "http", "browser", "rules"] as const
export const CheckTypeSchema = z.enum(CHECK_TYPES)

export const CheckSchema = z.discriminatedUnion("type", [
  FileCheckSchema,
  CommandCheckSchema,
  HttpCheckSchema,
  BrowserCheckSchema,
  RulesCheckSchema,
])

const ClaimSchema = z
  .object({
    id: ClaimIdSchema,
    title: NonEmptyTextSchema,
    required: z.boolean().default(true),
    weight: z.number().positive().default(1),
    checks: z.array(CheckSchema).min(1).readonly(),
  })
  .strict()
  .readonly()

export const ProofContractSchema = z
  .object({
    version: z.literal(1),
    project: NonEmptyTextSchema,
    allowedCommands: z.array(NonEmptyTextSchema).readonly().default([]),
    claims: z.array(ClaimSchema).min(1).readonly(),
  })
  .strict()
  .superRefine((value, context) => {
    const claimIds = value.claims.map((claim) => claim.id)
    if (new Set(claimIds).size !== claimIds.length) {
      context.addIssue({
        code: "custom",
        message: "Claim ids must be unique",
        path: ["claims"],
      })
    }

    const checkIds = value.claims.flatMap((claim) => claim.checks.map((check) => check.id))
    if (new Set(checkIds).size !== checkIds.length) {
      context.addIssue({
        code: "custom",
        message: "Check ids must be unique",
        path: ["claims"],
      })
    }
  })
  .readonly()

export const VERDICTS = ["pass", "fail", "unknown"] as const
export const VerdictSchema = z.enum(VERDICTS)

export type ClaimId = z.infer<typeof ClaimIdSchema>
export type CheckId = z.infer<typeof CheckIdSchema>
export type CheckType = z.infer<typeof CheckTypeSchema>
export type ProofContract = z.infer<typeof ProofContractSchema>
export type Check = z.infer<typeof CheckSchema>
export type Verdict = z.infer<typeof VerdictSchema>
