# Codex ProofStack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first CLI and hosted evidence dashboard that verifies AI coding delivery claims against file, command, rules, HTTP, and browser evidence, then produces a Codex repair packet and before/after comparison.

**Architecture:** A TypeScript pnpm workspace separates deterministic schemas and scoring (`packages/core`), side-effecting evidence collection (`packages/cli`), a synthetic reproducible demo (`examples/proofstack-demo`), and a static React report viewer (`apps/dashboard`). The CLI writes a versioned JSON proof bundle and screenshots; the dashboard reads bundles locally and never executes commands or uploads source data.

**Tech Stack:** Node.js 22+, TypeScript, pnpm workspaces, Zod, YAML, Commander, Execa, Playwright, React 19, Vite, Vitest, Testing Library, plain CSS.

---

## File map

### Repository foundation

- `.gitignore` — generated files, dependencies, local evidence, and browser artifacts.
- `package.json` — root scripts and workspace metadata.
- `pnpm-workspace.yaml` — workspace package locations.
- `tsconfig.base.json` — strict shared TypeScript settings.
- `vitest.workspace.ts` — package test discovery.

### Core package

- `packages/core/src/schema.ts` — proof contract and proof bundle Zod schemas plus exported types.
- `packages/core/src/verdict.ts` — claim aggregation and deterministic score.
- `packages/core/src/redact.ts` — secrets, home-path, and output-length redaction.
- `packages/core/src/compare.ts` — before/after verdict changes.
- `packages/core/src/index.ts` — public API.
- `packages/core/test/*.test.ts` — schema, verdict, redaction, and comparison tests.

### CLI package

- `packages/cli/src/root.ts` — real project-root and contract resolution.
- `packages/cli/src/load-contract.ts` — YAML loading and schema validation.
- `packages/cli/src/adapters/types.ts` — adapter context and result contract.
- `packages/cli/src/adapters/file.ts` — file checks.
- `packages/cli/src/adapters/rules.ts` — instruction-file checks.
- `packages/cli/src/adapters/command.ts` — allowlisted process checks without a shell.
- `packages/cli/src/adapters/http.ts` — status/body/latency checks.
- `packages/cli/src/adapters/browser.ts` — visible-text, accessible-role, and screenshot checks.
- `packages/cli/src/run-verification.ts` — ordered orchestration and claim aggregation.
- `packages/cli/src/write-bundle.ts` — immutable bundle and asset output.
- `packages/cli/src/repair-packet.ts` — bounded Codex handoff prompt.
- `packages/cli/src/main.ts` — Commander entry point and exit codes.
- `packages/cli/test/*.test.ts` — adapter, root, orchestration, and output tests.

### Demo

- `examples/proofstack-demo/server.mjs` — disposable local server with health route.
- `examples/proofstack-demo/run-demo.mjs` — starts the selected fixture and invokes ProofStack.
- `examples/proofstack-demo/broken/*` — green unit test but failed visible/rules claims.
- `examples/proofstack-demo/repaired/*` — all required claims pass.

### Dashboard

- `apps/dashboard/src/lib/bundle.ts` — local JSON loading and validation.
- `apps/dashboard/src/components/VerdictHero.tsx` — score and run identity.
- `apps/dashboard/src/components/ClaimMatrix.tsx` — claim-to-evidence cards.
- `apps/dashboard/src/components/EvidencePanel.tsx` — selected evidence detail.
- `apps/dashboard/src/components/RunComparison.tsx` — before/after changes.
- `apps/dashboard/src/components/RepairPacket.tsx` — bounded copy flow.
- `apps/dashboard/src/App.tsx` — view composition and state.
- `apps/dashboard/src/styles.css` — complete product visual system.
- `apps/dashboard/public/demo/*.json` — synthetic generated proof bundles.
- `apps/dashboard/test/*.test.tsx` — import, report, comparison, and copy tests.

### Delivery

- `README.md` — judge-first quickstart, architecture, privacy, and Codex/GPT-5.6 usage.
- `LICENSE` — MIT license.
- `docs/demo-script.md` — sub-three-minute narration and shot list.
- `docs/submission.md` — Devpost copy and final link checklist.

---

### Task 1: Scaffold the strict TypeScript workspace

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `biome.jsonc`
- Create: `tsconfig.base.json`
- Create: `vitest.workspace.ts`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/tsconfig.build.json`
- Create: `packages/core/vitest.config.ts`
- Create: `packages/core/src/index.ts`
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/tsconfig.build.json`
- Create: `packages/cli/vitest.config.ts`
- Create: `packages/cli/src/main.ts`

- [ ] **Step 1: Add root workspace files**

```json
// package.json
{
  "name": "codex-proofstack",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.9.0",
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm --filter @proofstack/core build && pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "lint": "biome check .",
    "format": "biome check --write .",
    "verify": "pnpm lint && pnpm test && pnpm typecheck && pnpm build"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.5.4",
    "@types/node": "^24.0.3",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - packages/*
  - apps/*

allowBuilds:
  esbuild: true
```

```jsonc
// biome.jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.5.4/schema.json",
  "assist": { "actions": { "source": { "organizeImports": "on" } } },
  "files": {
    "includes": ["**", "!**/node_modules", "!**/dist", "!**/coverage", "!**/.proofstack"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": { "quoteStyle": "double", "semicolons": "asNeeded" }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "preset": "recommended",
      "suspicious": {
        "noExplicitAny": "error",
        "noConfusingVoidType": "error",
        "noFallthroughSwitchClause": "error"
      },
      "style": {
        "noDefaultExport": "error",
        "useImportType": "error",
        "noNonNullAssertion": "error",
        "noParameterAssign": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      }
    }
  }
}
```

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  }
}
```

```ts
// vitest.workspace.ts
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/*/vitest.config.ts",
  "apps/*/vitest.config.ts",
]);
```

```gitignore
node_modules/
dist/
coverage/
.proofstack/
.codegraph/
.playwright-mcp/
playwright-report/
test-results/
.DS_Store
*.log
.env*
!.env.example
```

- [ ] **Step 2: Add package manifests and TypeScript configs**

```json
// packages/core/package.json
{
  "name": "@proofstack/core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./dist/index.js" },
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": { "zod": "^4.0.5" }
}
```

```json
// packages/cli/package.json
{
  "name": "@proofstack/cli",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "bin": { "proofstack": "./dist/main.js" },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@proofstack/core": "workspace:*",
    "commander": "^14.0.0",
    "execa": "^9.6.0",
    "playwright": "^1.53.1",
    "yaml": "^2.8.0"
  }
}
```

```json
// packages/core/tsconfig.json and packages/cli/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src/**/*.ts", "test/**/*.ts", "vitest.config.ts"]
}
```

```json
// packages/core/tsconfig.build.json and packages/cli/tsconfig.build.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "tsBuildInfoFile": "dist/.tsbuildinfo"
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Add package Vitest configs**

```ts
// packages/core/vitest.config.ts and packages/cli/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["test/**/*.test.ts"], environment: "node" },
});
```

Add an empty module entrypoint in each package (`export {};`) so the initial typecheck exercises
the strict compiler configuration before behavior is added. These files are scaffolding only; the
first behavior still starts with a failing test in Task 2.

- [ ] **Step 4: Install and verify workspace discovery**

Run: `pnpm install`

Expected: lockfile created; both workspace packages resolved; no peer-dependency errors.

Run: `pnpm -r typecheck`

Expected: both packages exit `0` even before source files exist.

- [ ] **Step 5: Commit**

```bash
git add .gitignore package.json pnpm-workspace.yaml biome.jsonc tsconfig.base.json vitest.workspace.ts packages
git commit -m "chore: scaffold ProofStack workspace"
```

### Task 2: Define contracts, bundles, and deterministic verdicts

**Files:**
- Create: `packages/core/src/contract-schema.ts`
- Create: `packages/core/src/bundle-schema.ts`
- Create: `packages/core/src/schema.ts`
- Create: `packages/core/src/verdict.ts`
- Create: `packages/core/src/index.ts`
- Test: `packages/core/test/schema.test.ts`
- Test: `packages/core/test/bundle-schema.test.ts`
- Test: `packages/core/test/verdict.test.ts`

Implementation note: keep the contract and proof-bundle boundary schemas in separate files so each
stays below the 250-line limit. `schema.ts` is the public re-export surface. The repair packet is a
typed object (`version`, `failedClaimIds`, `prompt`) so tests can assert stable IDs instead of
fragile natural-language prompt text.

- [ ] **Step 1: Write failing schema and verdict tests**

```ts
// packages/core/test/schema.test.ts
import { describe, expect, it } from "vitest";
import { ProofContractSchema } from "../src/schema.js";

describe("ProofContractSchema", () => {
  it("accepts a weighted claim with deterministic checks", () => {
    const parsed = ProofContractSchema.parse({
      version: 1,
      project: "proofstack-demo",
      allowedCommands: ["node"],
      claims: [{
        id: "visible-status",
        title: "The page shows Evidence verified",
        required: true,
        weight: 2,
        checks: [{ id: "page-copy", type: "browser", url: "http://127.0.0.1:4173", text: "Evidence verified" }],
      }],
    });
    expect(parsed.claims[0]?.required).toBe(true);
  });

  it("rejects duplicate claim ids", () => {
    expect(() => ProofContractSchema.parse({
      version: 1,
      project: "demo",
      claims: [
        { id: "same", title: "A", checks: [{ id: "a", type: "file", path: "a" }] },
        { id: "same", title: "B", checks: [{ id: "b", type: "file", path: "b" }] },
      ],
    })).toThrow(/unique/i);
  });
});
```

```ts
// packages/core/test/verdict.test.ts
import { describe, expect, it } from "vitest";
import { aggregateVerdict, calculateScore } from "../src/verdict.js";

describe("verdicts", () => {
  it("never converts unknown evidence to pass", () => {
    expect(aggregateVerdict(["pass", "unknown"])).toBe("unknown");
    expect(aggregateVerdict(["pass", "fail"])).toBe("fail");
  });

  it("weights only passing claims", () => {
    expect(calculateScore([
      { verdict: "pass", weight: 3 },
      { verdict: "fail", weight: 1 },
    ])).toBe(75);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm --filter @proofstack/core test`

Expected: FAIL because `schema.ts` and `verdict.ts` do not exist.

- [ ] **Step 3: Implement schemas and verdict functions**

```ts
// packages/core/src/schema.ts
import { z } from "zod";

const BaseCheck = z.object({ id: z.string().min(1) });
const FileCheck = BaseCheck.extend({ type: z.literal("file"), path: z.string().min(1), contains: z.string().optional() });
const CommandCheck = BaseCheck.extend({ type: z.literal("command"), command: z.string().min(1), args: z.array(z.string()).default([]), timeoutMs: z.number().int().positive().max(120_000).default(30_000) });
const HttpCheck = BaseCheck.extend({ type: z.literal("http"), url: z.string().url(), status: z.number().int().default(200), contains: z.string().optional(), maxLatencyMs: z.number().positive().optional() });
const BrowserCheck = BaseCheck.extend({ type: z.literal("browser"), url: z.string().url(), text: z.string().optional(), role: z.string().optional(), name: z.string().optional(), screenshot: z.string().optional() });
const RulesCheck = BaseCheck.extend({ type: z.literal("rules"), path: z.string().min(1), mustContain: z.array(z.string()).min(1) });

export const CheckSchema = z.discriminatedUnion("type", [FileCheck, CommandCheck, HttpCheck, BrowserCheck, RulesCheck]);
export const ProofContractSchema = z.object({
  version: z.literal(1),
  project: z.string().min(1),
  allowedCommands: z.array(z.string()).default([]),
  claims: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    required: z.boolean().default(true),
    weight: z.number().positive().default(1),
    checks: z.array(CheckSchema).min(1),
  })).min(1),
}).superRefine((value, ctx) => {
  const ids = value.claims.map((claim) => claim.id);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Claim ids must be unique", path: ["claims"] });
});

export const VerdictSchema = z.enum(["pass", "fail", "unknown"]);
export const EvidenceSchema = z.object({
  id: z.string(), claimId: z.string(), type: z.string(), verdict: VerdictSchema,
  summary: z.string(), detail: z.string().optional(), durationMs: z.number().nonnegative(), asset: z.string().optional(),
});
export const ClaimResultSchema = z.object({
  id: z.string(), title: z.string(), required: z.boolean(), weight: z.number().positive(), verdict: VerdictSchema, evidenceIds: z.array(z.string()),
});
export const ProofBundleSchema = z.object({
  schemaVersion: z.literal("1.0"), runId: z.string(), generatedAt: z.string().datetime(),
  project: z.object({ name: z.string(), root: z.string(), rootFingerprint: z.string() }),
  score: z.number().min(0).max(100), complete: z.boolean(),
  claims: z.array(ClaimResultSchema), evidence: z.array(EvidenceSchema), repairPacket: z.string(),
});

export type ProofContract = z.infer<typeof ProofContractSchema>;
export type Check = z.infer<typeof CheckSchema>;
export type Verdict = z.infer<typeof VerdictSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type ClaimResult = z.infer<typeof ClaimResultSchema>;
export type ProofBundle = z.infer<typeof ProofBundleSchema>;
```

```ts
// packages/core/src/verdict.ts
import type { Verdict } from "./schema.js";

export function aggregateVerdict(verdicts: Verdict[]): Verdict {
  if (verdicts.includes("fail")) return "fail";
  if (verdicts.includes("unknown")) return "unknown";
  return verdicts.length > 0 ? "pass" : "unknown";
}

export function calculateScore(claims: Array<{ verdict: Verdict; weight: number }>): number {
  const total = claims.reduce((sum, claim) => sum + claim.weight, 0);
  if (total === 0) return 0;
  const passed = claims.filter((claim) => claim.verdict === "pass").reduce((sum, claim) => sum + claim.weight, 0);
  return Math.round((passed / total) * 100);
}
```

```ts
// packages/core/src/index.ts
export * from "./schema.js";
export * from "./verdict.js";
```

- [ ] **Step 4: Run tests and typecheck**

Run: `pnpm --filter @proofstack/core test && pnpm --filter @proofstack/core typecheck`

Expected: PASS; two test files green; TypeScript exits `0`.

- [ ] **Step 5: Commit**

```bash
git add packages/core
git commit -m "feat(core): define proof contracts and verdicts"
```

### Task 3: Add privacy redaction and run comparison

**Files:**
- Create: `packages/core/src/redact.ts`
- Create: `packages/core/src/compare.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/test/redact.test.ts`
- Test: `packages/core/test/compare.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/core/test/redact.test.ts
import { expect, it } from "vitest";
import { redactText } from "../src/redact.js";

it("redacts keys, bearer tokens, home paths, and caps output", () => {
  const value = `OPENAI_API_KEY=sk-secret\nAuthorization: Bearer abc123\n/Users/alice/project\n${"x".repeat(300)}`;
  const redacted = redactText(value, { home: "/Users/alice", maxLength: 160 });
  expect(redacted).not.toContain("sk-secret");
  expect(redacted).not.toContain("abc123");
  expect(redacted).toContain("~/project");
  expect(redacted).toContain("[TRUNCATED]");
});
```

```ts
// packages/core/test/compare.test.ts
import { expect, it } from "vitest";
import { compareRuns } from "../src/compare.js";

it("reports improved, regressed, and unchanged claims", () => {
  const before = [{ id: "ui", verdict: "fail" as const }, { id: "test", verdict: "pass" as const }];
  const after = [{ id: "ui", verdict: "pass" as const }, { id: "test", verdict: "pass" as const }];
  expect(compareRuns(before, after)).toEqual([
    { id: "test", before: "pass", after: "pass", change: "unchanged" },
    { id: "ui", before: "fail", after: "pass", change: "improved" },
  ]);
});
```

- [ ] **Step 2: Verify tests fail**

Run: `pnpm --filter @proofstack/core test`

Expected: FAIL because redaction and comparison modules are missing.

- [ ] **Step 3: Implement redaction and comparison**

```ts
// packages/core/src/redact.ts
export function redactText(input: string, options: { home?: string; maxLength?: number } = {}): string {
  const maxLength = options.maxLength ?? 4_000;
  let value = input
    .replace(/((?:api[_-]?key|token|secret|password)\s*[=:]\s*)\S+/gi, "$1[REDACTED]")
    .replace(/(Authorization:\s*Bearer\s+)\S+/gi, "$1[REDACTED]")
    .replace(/\bsk-[A-Za-z0-9_-]+\b/g, "[REDACTED]");
  if (options.home) value = value.split(options.home).join("~");
  return value.length > maxLength ? `${value.slice(0, maxLength)}\n[TRUNCATED]` : value;
}
```

```ts
// packages/core/src/compare.ts
import type { Verdict } from "./schema.js";

export interface RunChange { id: string; before: Verdict; after: Verdict; change: "improved" | "regressed" | "unchanged"; }
const rank: Record<Verdict, number> = { fail: 0, unknown: 1, pass: 2 };

export function compareRuns(before: Array<{ id: string; verdict: Verdict }>, after: Array<{ id: string; verdict: Verdict }>): RunChange[] {
  const previous = new Map(before.map((item) => [item.id, item.verdict]));
  return after.flatMap((item) => {
    const old = previous.get(item.id);
    if (!old) return [];
    return [{ id: item.id, before: old, after: item.verdict, change: rank[item.verdict] > rank[old] ? "improved" : rank[item.verdict] < rank[old] ? "regressed" : "unchanged" }];
  }).sort((a, b) => a.id.localeCompare(b.id));
}
```

Update `packages/core/src/index.ts`:

```ts
export * from "./schema.js";
export * from "./verdict.js";
export * from "./redact.js";
export * from "./compare.js";
```

- [ ] **Step 4: Run package verification**

Run: `pnpm --filter @proofstack/core test && pnpm --filter @proofstack/core typecheck && pnpm --filter @proofstack/core build`

Expected: all core tests pass; `dist/index.js` and declarations exist.

- [ ] **Step 5: Commit**

```bash
git add packages/core
git commit -m "feat(core): redact evidence and compare runs"
```

### Task 4: Resolve roots, load YAML, and implement local adapters

**Files:**
- Create: `packages/cli/src/root.ts`
- Create: `packages/cli/src/load-contract.ts`
- Create: `packages/cli/src/adapters/types.ts`
- Create: `packages/cli/src/adapters/file.ts`
- Create: `packages/cli/src/adapters/rules.ts`
- Create: `packages/cli/src/adapters/command.ts`
- Test: `packages/cli/test/root.test.ts`
- Test: `packages/cli/test/local-adapters.test.ts`

- [ ] **Step 1: Write failing root and adapter tests**

```ts
// packages/cli/test/root.test.ts
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { resolveProject } from "../src/root.js";

it("uses the contract directory as the real project root", async () => {
  const root = await mkdtemp(join(tmpdir(), "proofstack-"));
  await writeFile(join(root, "proofstack.yml"), "version: 1");
  await mkdir(join(root, "nested"));
  expect(await resolveProject(join(root, "nested"))).toEqual({ root, contractPath: join(root, "proofstack.yml") });
});
```

```ts
// packages/cli/test/local-adapters.test.ts
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { runFileCheck } from "../src/adapters/file.js";
import { runCommandCheck } from "../src/adapters/command.js";

it("fails missing visible content", async () => {
  const root = await mkdtemp(join(tmpdir(), "proofstack-"));
  await writeFile(join(root, "index.html"), "<h1>Hello</h1>");
  const result = await runFileCheck({ id: "copy", type: "file", path: "index.html", contains: "Evidence verified" }, { root, allowedCommands: [], home: tmpdir(), assetsDir: join(root, ".proofstack") });
  expect(result.verdict).toBe("fail");
});

it("refuses a command outside the allowlist", async () => {
  const root = await mkdtemp(join(tmpdir(), "proofstack-"));
  const result = await runCommandCheck({ id: "unsafe", type: "command", command: "rm", args: ["-rf", "."], timeoutMs: 1000 }, { root, allowedCommands: ["node"], home: tmpdir(), assetsDir: join(root, ".proofstack") });
  expect(result.verdict).toBe("unknown");
  expect(result.summary).toMatch(/allowlist/i);
});
```

- [ ] **Step 2: Verify tests fail**

Run: `pnpm --filter @proofstack/cli test`

Expected: FAIL because root and adapters are missing.

- [ ] **Step 3: Implement resolution, loading, and adapter interfaces**

```ts
// packages/cli/src/root.ts
import { access } from "node:fs/promises";
import { dirname, join, parse, resolve } from "node:path";

export async function resolveProject(start: string): Promise<{ root: string; contractPath: string }> {
  let current = resolve(start);
  const filesystemRoot = parse(current).root;
  while (true) {
    const candidate = join(current, "proofstack.yml");
    if (await access(candidate).then(() => true).catch(() => false)) return { root: current, contractPath: candidate };
    if (current === filesystemRoot) throw new Error(`proofstack.yml not found from ${start}`);
    current = dirname(current);
  }
}
```

```ts
// packages/cli/src/load-contract.ts
import { readFile } from "node:fs/promises";
import { ProofContractSchema, type ProofContract } from "@proofstack/core";
import { parse } from "yaml";

export async function loadContract(path: string): Promise<ProofContract> {
  return ProofContractSchema.parse(parse(await readFile(path, "utf8")));
}
```

```ts
// packages/cli/src/adapters/types.ts
import type { Evidence } from "@proofstack/core";

export interface AdapterContext { root: string; allowedCommands: string[]; home: string; assetsDir: string; }
export type AdapterResult = Omit<Evidence, "claimId">;
```

- [ ] **Step 4: Implement file, rules, and command adapters**

```ts
// packages/cli/src/adapters/file.ts
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { redactText, type Check } from "@proofstack/core";
import type { AdapterContext, AdapterResult } from "./types.js";

export async function runFileCheck(check: Extract<Check, { type: "file" }>, context: AdapterContext): Promise<AdapterResult> {
  const started = performance.now();
  try {
    const content = await readFile(resolve(context.root, check.path), "utf8");
    const pass = check.contains ? content.includes(check.contains) : true;
    return { id: check.id, type: check.type, verdict: pass ? "pass" : "fail", summary: pass ? `${check.path} satisfies the file check` : `${check.path} is missing required content`, detail: redactText(content, { home: context.home, maxLength: 1000 }), durationMs: Math.round(performance.now() - started) };
  } catch (error) {
    return { id: check.id, type: check.type, verdict: "fail", summary: `${check.path} could not be read`, detail: String(error), durationMs: Math.round(performance.now() - started) };
  }
}
```

```ts
// packages/cli/src/adapters/rules.ts
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Check } from "@proofstack/core";
import type { AdapterContext, AdapterResult } from "./types.js";

export async function runRulesCheck(check: Extract<Check, { type: "rules" }>, context: AdapterContext): Promise<AdapterResult> {
  const started = performance.now();
  try {
    const content = await readFile(resolve(context.root, check.path), "utf8");
    const missing = check.mustContain.filter((value) => !content.includes(value));
    return { id: check.id, type: check.type, verdict: missing.length ? "fail" : "pass", summary: missing.length ? `${missing.length} required rule phrase(s) missing` : "Instruction scope contains all required phrases", detail: missing.join("\n"), durationMs: Math.round(performance.now() - started) };
  } catch (error) {
    return { id: check.id, type: check.type, verdict: "fail", summary: `${check.path} could not be inspected`, detail: String(error), durationMs: Math.round(performance.now() - started) };
  }
}
```

```ts
// packages/cli/src/adapters/command.ts
import { execa } from "execa";
import { redactText, type Check } from "@proofstack/core";
import type { AdapterContext, AdapterResult } from "./types.js";

export async function runCommandCheck(check: Extract<Check, { type: "command" }>, context: AdapterContext): Promise<AdapterResult> {
  const started = performance.now();
  if (!context.allowedCommands.includes(check.command)) return { id: check.id, type: check.type, verdict: "unknown", summary: `${check.command} is not in the command allowlist`, durationMs: 0 };
  try {
    const result = await execa(check.command, check.args, { cwd: context.root, timeout: check.timeoutMs, shell: false, reject: false, all: true });
    return { id: check.id, type: check.type, verdict: result.exitCode === 0 ? "pass" : "fail", summary: `${check.command} exited ${result.exitCode}`, detail: redactText(result.all ?? "", { home: context.home }), durationMs: Math.round(performance.now() - started) };
  } catch (error) {
    return { id: check.id, type: check.type, verdict: "unknown", summary: `${check.command} could not run`, detail: String(error), durationMs: Math.round(performance.now() - started) };
  }
}
```

- [ ] **Step 5: Run tests and commit**

Run: `pnpm --filter @proofstack/cli test && pnpm --filter @proofstack/cli typecheck`

Expected: root and local-adapter tests pass; no shell invocation exists.

```bash
git add packages/cli
git commit -m "feat(cli): resolve projects and collect local evidence"
```

### Task 5: Add HTTP and browser evidence

**Files:**
- Create: `packages/cli/src/adapters/http.ts`
- Create: `packages/cli/src/adapters/browser.ts`
- Test: `packages/cli/test/runtime-adapters.test.ts`

- [ ] **Step 1: Write failing runtime-adapter tests**

```ts
// packages/cli/test/runtime-adapters.test.ts
import { createServer } from "node:http";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, expect, it } from "vitest";
import { runHttpCheck } from "../src/adapters/http.js";
import { runBrowserCheck } from "../src/adapters/browser.js";

const server = createServer((_, response) => { response.writeHead(200, { "content-type": "text/html" }); response.end("<main><h1>ProofStack</h1></main>"); });
let url = "";
beforeAll(async () => { await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve)); const address = server.address(); if (!address || typeof address === "string") throw new Error("missing address"); url = `http://127.0.0.1:${address.port}`; });
afterAll(() => server.close());

it("collects HTTP evidence", async () => {
  const context = { root: process.cwd(), allowedCommands: [], home: tmpdir(), assetsDir: await mkdtemp(join(tmpdir(), "proof-assets-")) };
  expect((await runHttpCheck({ id: "health", type: "http", url, status: 200 }, context)).verdict).toBe("pass");
});

it("fails browser-visible text and writes a screenshot", async () => {
  const context = { root: process.cwd(), allowedCommands: [], home: tmpdir(), assetsDir: await mkdtemp(join(tmpdir(), "proof-assets-")) };
  const result = await runBrowserCheck({ id: "copy", type: "browser", url, text: "Evidence verified", screenshot: "copy.png" }, context);
  expect(result.verdict).toBe("fail");
  expect(result.asset).toBe("copy.png");
});
```

- [ ] **Step 2: Verify tests fail**

Run: `pnpm --filter @proofstack/cli test`

Expected: FAIL because runtime adapters are missing.

- [ ] **Step 3: Implement HTTP and browser adapters**

```ts
// packages/cli/src/adapters/http.ts
import type { Check } from "@proofstack/core";
import type { AdapterContext, AdapterResult } from "./types.js";

export async function runHttpCheck(check: Extract<Check, { type: "http" }>, _context: AdapterContext): Promise<AdapterResult> {
  const started = performance.now();
  try {
    const response = await fetch(check.url, { signal: AbortSignal.timeout(10_000) });
    const body = await response.text();
    const durationMs = Math.round(performance.now() - started);
    const pass = response.status === check.status && (!check.contains || body.includes(check.contains)) && (!check.maxLatencyMs || durationMs <= check.maxLatencyMs);
    return { id: check.id, type: check.type, verdict: pass ? "pass" : "fail", summary: `${response.status} in ${durationMs}ms`, detail: body.slice(0, 1000), durationMs };
  } catch (error) {
    return { id: check.id, type: check.type, verdict: "unknown", summary: "HTTP target could not be reached", detail: String(error), durationMs: Math.round(performance.now() - started) };
  }
}
```

```ts
// packages/cli/src/adapters/browser.ts
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import type { Check } from "@proofstack/core";
import type { AdapterContext, AdapterResult } from "./types.js";

export async function runBrowserCheck(check: Extract<Check, { type: "browser" }>, context: AdapterContext): Promise<AdapterResult> {
  const started = performance.now();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(check.url, { waitUntil: "networkidle", timeout: 15_000 });
    let pass = true;
    if (check.text) pass = pass && await page.getByText(check.text, { exact: false }).first().isVisible().catch(() => false);
    if (check.role) pass = pass && await page.getByRole(check.role as never, check.name ? { name: check.name } : {}).first().isVisible().catch(() => false);
    const asset = check.screenshot ?? `${check.id}.png`;
    await mkdir(context.assetsDir, { recursive: true });
    await page.screenshot({ path: join(context.assetsDir, asset), fullPage: true });
    return { id: check.id, type: check.type, verdict: pass ? "pass" : "fail", summary: pass ? "Browser assertion is visible" : "Browser assertion is not visible", durationMs: Math.round(performance.now() - started), asset };
  } catch (error) {
    return { id: check.id, type: check.type, verdict: "unknown", summary: "Browser verification could not complete", detail: String(error), durationMs: Math.round(performance.now() - started) };
  } finally {
    await browser.close();
  }
}
```

- [ ] **Step 4: Install browser and run tests**

Run: `pnpm exec playwright install chromium`

Expected: Chromium installed without modifying project source.

Run: `pnpm --filter @proofstack/cli test`

Expected: HTTP test passes; browser negative assertion passes and screenshot exists in temporary assets.

- [ ] **Step 5: Commit**

```bash
git add packages/cli
git commit -m "feat(cli): capture HTTP and browser evidence"
```

### Task 6: Orchestrate verification, write bundles, and generate repair packets

**Files:**
- Create: `packages/cli/src/run-verification.ts`
- Create: `packages/cli/src/write-bundle.ts`
- Create: `packages/cli/src/repair-packet.ts`
- Create: `packages/cli/src/main.ts`
- Test: `packages/cli/test/run-verification.test.ts`

- [ ] **Step 1: Write a failing orchestration test**

```ts
// packages/cli/test/run-verification.test.ts
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { runVerification } from "../src/run-verification.js";

it("creates a failed claim and bounded repair packet", async () => {
  const root = await mkdtemp(join(tmpdir(), "proofstack-"));
  await writeFile(join(root, "index.html"), "<h1>Hello</h1>");
  const bundle = await runVerification({ version: 1, project: "demo", allowedCommands: [], claims: [{ id: "status", title: "Visible status", required: true, weight: 1, checks: [{ id: "copy", type: "file", path: "index.html", contains: "Evidence verified" }] }] }, root);
  expect(bundle.score).toBe(0);
  expect(bundle.repairPacket).toContain("Visible status");
  expect(bundle.project.root).toBe("~project");
});
```

- [ ] **Step 2: Verify the test fails**

Run: `pnpm --filter @proofstack/cli test`

Expected: FAIL because orchestration is missing.

- [ ] **Step 3: Implement repair packet and bundle writer**

```ts
// packages/cli/src/repair-packet.ts
import type { ClaimResult, Evidence } from "@proofstack/core";

export function createRepairPacket(claims: ClaimResult[], evidence: Evidence[]): string {
  const failed = claims.filter((claim) => claim.verdict !== "pass");
  if (!failed.length) return "All required claims are verified. No repair is requested.";
  return [
    "# Codex repair packet",
    "Fix only the failed claims below. Preserve passing behavior and rerun `proofstack verify`.",
    ...failed.map((claim) => {
      const details = evidence.filter((item) => item.claimId === claim.id).map((item) => `- ${item.verdict.toUpperCase()}: ${item.summary}${item.detail ? ` — ${item.detail}` : ""}`).join("\n");
      return `\n## ${claim.title}\n${details}`;
    }),
  ].join("\n").slice(0, 12_000);
}
```

```ts
// packages/cli/src/write-bundle.ts
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ProofBundle } from "@proofstack/core";

export async function writeBundle(root: string, bundle: ProofBundle): Promise<string> {
  const output = join(root, ".proofstack", bundle.runId);
  await mkdir(output, { recursive: true });
  const path = join(output, "proofstack-report.json");
  await writeFile(path, `${JSON.stringify(bundle, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  return path;
}
```

- [ ] **Step 4: Implement orchestration and CLI entry point**

```ts
// packages/cli/src/run-verification.ts
import { createHash, randomUUID } from "node:crypto";
import { homedir } from "node:os";
import { basename } from "node:path";
import { aggregateVerdict, calculateScore, type Check, type Evidence, type ProofBundle, type ProofContract } from "@proofstack/core";
import { runBrowserCheck } from "./adapters/browser.js";
import { runCommandCheck } from "./adapters/command.js";
import { runFileCheck } from "./adapters/file.js";
import { runHttpCheck } from "./adapters/http.js";
import { runRulesCheck } from "./adapters/rules.js";
import { createRepairPacket } from "./repair-packet.js";

export async function runVerification(contract: ProofContract, root: string): Promise<ProofBundle> {
  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`;
  const context = { root, allowedCommands: contract.allowedCommands, home: homedir(), assetsDir: `${root}/.proofstack/${runId}/assets` };
  const evidence: Evidence[] = [];
  const execute = (check: Check) => check.type === "file" ? runFileCheck(check, context) : check.type === "rules" ? runRulesCheck(check, context) : check.type === "command" ? runCommandCheck(check, context) : check.type === "http" ? runHttpCheck(check, context) : runBrowserCheck(check, context);
  const claims = [];
  for (const claim of contract.claims) {
    const results = [];
    for (const check of claim.checks) results.push(await execute(check));
    evidence.push(...results.map((item) => ({ ...item, claimId: claim.id })));
    claims.push({ id: claim.id, title: claim.title, required: claim.required, weight: claim.weight, verdict: aggregateVerdict(results.map((item) => item.verdict)), evidenceIds: results.map((item) => item.id) });
  }
  const bundleBase = { schemaVersion: "1.0" as const, runId, generatedAt: new Date().toISOString(), project: { name: contract.project, root: "~project", rootFingerprint: createHash("sha256").update(root).digest("hex").slice(0, 12) }, score: calculateScore(claims), complete: claims.every((claim) => claim.verdict !== "unknown"), claims, evidence };
  return { ...bundleBase, repairPacket: createRepairPacket(claims, evidence) };
}
```

```ts
// packages/cli/src/main.ts
#!/usr/bin/env node
import { Command } from "commander";
import { loadContract } from "./load-contract.js";
import { resolveProject } from "./root.js";
import { runVerification } from "./run-verification.js";
import { writeBundle } from "./write-bundle.js";

const program = new Command().name("proofstack").description("Prove AI coding delivery claims with real evidence");
program.command("verify").option("--cwd <path>", "starting directory", process.cwd()).action(async ({ cwd }) => {
  try {
    const project = await resolveProject(cwd);
    const contract = await loadContract(project.contractPath);
    const bundle = await runVerification(contract, project.root);
    const output = await writeBundle(project.root, bundle);
    console.log(`${bundle.score}% verified — ${output}`);
    process.exitCode = bundle.claims.some((claim) => claim.required && claim.verdict !== "pass") ? 1 : 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
});
await program.parseAsync();
```

- [ ] **Step 5: Run tests, build, CLI smoke, and commit**

Run: `pnpm --filter @proofstack/cli test && pnpm --filter @proofstack/cli build`

Expected: orchestration test passes and `dist/main.js` is executable through Node.

Run: `node packages/cli/dist/main.js verify --cwd packages/cli`

Expected: exit `2` with `proofstack.yml not found`, proving the invalid-project path is explicit.

```bash
git add packages/cli
git commit -m "feat(cli): orchestrate proof bundles and repair packets"
```

### Task 7: Build the reproducible broken and repaired demo

**Files:**
- Create: `examples/proofstack-demo/server.mjs`
- Create: `examples/proofstack-demo/run-demo.mjs`
- Create: `examples/proofstack-demo/broken/index.html`
- Create: `examples/proofstack-demo/broken/AGENTS.md`
- Create: `examples/proofstack-demo/broken/proofstack.yml`
- Create: `examples/proofstack-demo/repaired/index.html`
- Create: `examples/proofstack-demo/repaired/AGENTS.md`
- Create: `examples/proofstack-demo/repaired/proofstack.yml`
- Test: `examples/proofstack-demo/test.mjs`

- [ ] **Step 1: Create the server and green-but-insufficient test**

```js
// examples/proofstack-demo/server.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const fixture = process.env.PROOFSTACK_DEMO_STATE ?? "broken";
const port = Number(process.env.PORT ?? 4173);
const html = await readFile(join(import.meta.dirname, fixture, "index.html"), "utf8");
createServer((request, response) => {
  if (request.url === "/health") { response.writeHead(200, { "content-type": "application/json" }); response.end('{"status":"ok"}'); return; }
  response.writeHead(200, { "content-type": "text/html" }); response.end(html);
}).listen(port, "127.0.0.1", () => console.log(`demo:${fixture}:${port}`));
```

```js
// examples/proofstack-demo/test.mjs
const response = await fetch("http://127.0.0.1:4173/health");
if (response.status !== 200 || (await response.json()).status !== "ok") process.exit(1);
console.log("health test passed");
```

- [ ] **Step 2: Create broken and repaired fixtures**

```html
<!-- examples/proofstack-demo/broken/index.html -->
<!doctype html><html><head><meta charset="utf-8"><title>Release Console</title></head><body><main><p>Release candidate</p><h1>Ship with confidence.</h1><p>Unit tests are green and the service is healthy.</p><button>Deploy release</button></main></body></html>
```

```html
<!-- examples/proofstack-demo/repaired/index.html -->
<!doctype html><html><head><meta charset="utf-8"><title>Release Console</title></head><body><main><p>Release candidate</p><h1>Ship with confidence.</h1><p role="status">Evidence verified</p><p>Unit tests, service health, project rules, and the visible product agree.</p><button>Deploy release</button></main></body></html>
```

```markdown
<!-- examples/proofstack-demo/broken/AGENTS.md -->
# Delivery rules

Verify tests before completion.
```

```markdown
<!-- examples/proofstack-demo/repaired/AGENTS.md -->
# Delivery rules

Verify tests before completion.
Verify the rendered product before completion.
```

- [ ] **Step 3: Create proof contracts**

```yaml
# both proofstack.yml files; paths remain identical inside each fixture
version: 1
project: proofstack-release-console
allowedCommands:
  - node
claims:
  - id: health
    title: The service is healthy
    weight: 1
    checks:
      - id: health-http
        type: http
        url: http://127.0.0.1:4173/health
        status: 200
        contains: ok
  - id: tests
    title: The health test passes
    weight: 1
    checks:
      - id: unit-command
        type: command
        command: node
        args: [../test.mjs]
  - id: instructions
    title: Project rules require rendered-product verification
    weight: 2
    checks:
      - id: agents-rules
        type: rules
        path: AGENTS.md
        mustContain: [Verify the rendered product before completion.]
  - id: visible-status
    title: The live page exposes an evidence-verified status
    weight: 3
    checks:
      - id: status-browser
        type: browser
        url: http://127.0.0.1:4173
        role: status
        name: Evidence verified
        screenshot: release-console.png
```

- [ ] **Step 4: Create the demo runner**

```js
// examples/proofstack-demo/run-demo.mjs
import { spawn } from "node:child_process";
import { join } from "node:path";
const state = process.argv[2] ?? "broken";
if (!new Set(["broken", "repaired"]).has(state)) throw new Error("state must be broken or repaired");
const server = spawn(process.execPath, [join(import.meta.dirname, "server.mjs")], { env: { ...process.env, PROOFSTACK_DEMO_STATE: state }, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((resolve, reject) => { server.stdout.on("data", (chunk) => chunk.toString().includes(`demo:${state}`) && resolve()); server.on("exit", reject); });
const cli = spawn(process.execPath, [join(import.meta.dirname, "../../packages/cli/dist/main.js"), "verify", "--cwd", join(import.meta.dirname, state)], { stdio: "inherit" });
const exitCode = await new Promise((resolve) => cli.on("exit", resolve));
server.kill("SIGTERM");
process.exitCode = state === "broken" ? (exitCode === 1 ? 0 : 1) : exitCode;
```

- [ ] **Step 5: Run both states and commit**

Run: `node examples/proofstack-demo/run-demo.mjs broken`

Expected: wrapper exits `0`; generated report score is below `100`; rules and visible-status claims fail while health and tests pass.

Run: `node examples/proofstack-demo/run-demo.mjs repaired`

Expected: exits `0`; generated report score is `100`; screenshot contains visible status.

```bash
git add examples
git commit -m "feat(demo): prove green tests can miss a broken product"
```

### Task 8: Scaffold and test the static dashboard

**Files:**
- Create: `apps/dashboard/package.json`
- Create: `apps/dashboard/tsconfig.json`
- Create: `apps/dashboard/vite.config.ts`
- Create: `apps/dashboard/vitest.config.ts`
- Create: `apps/dashboard/index.html`
- Create: `apps/dashboard/src/main.tsx`
- Create: `apps/dashboard/src/lib/bundle.ts`
- Create: `apps/dashboard/src/App.tsx`
- Test: `apps/dashboard/test/bundle.test.ts`

- [ ] **Step 1: Add dashboard manifest and configs**

```json
// apps/dashboard/package.json
{
  "name": "@proofstack/dashboard",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": { "dev": "vite", "build": "tsc -b && vite build", "test": "vitest run", "typecheck": "tsc -b --pretty false" },
  "dependencies": { "@proofstack/core": "workspace:*", "react": "^19.1.0", "react-dom": "^19.1.0" },
  "devDependencies": { "@testing-library/jest-dom": "^6.6.3", "@testing-library/react": "^16.3.0", "@types/react": "^19.1.8", "@types/react-dom": "^19.1.6", "@vitejs/plugin-react": "^4.6.0", "jsdom": "^26.1.0", "vite": "^7.0.0" }
}
```

```json
// apps/dashboard/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "test", "vite.config.ts", "vitest.config.ts"]
}
```

```ts
// apps/dashboard/vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [react()] });
```

```ts
// apps/dashboard/vitest.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./test/setup.ts"], include: ["test/**/*.test.ts", "test/**/*.test.tsx"] },
});
```

```ts
// apps/dashboard/test/setup.ts
import "@testing-library/jest-dom/vitest";
```

```html
<!-- apps/dashboard/index.html -->
<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="theme-color" content="#090b0d" /><title>Codex ProofStack</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
```

- [ ] **Step 2: Write a failing bundle-loader test**

```ts
// apps/dashboard/test/bundle.test.ts
import { expect, it } from "vitest";
import { parseBundle } from "../src/lib/bundle.js";

it("rejects arbitrary JSON that is not a proof bundle", () => {
  expect(() => parseBundle({ score: 100 })).toThrow(/schemaVersion/);
});
```

- [ ] **Step 3: Implement local bundle validation**

```ts
// apps/dashboard/src/lib/bundle.ts
import { ProofBundleSchema, type ProofBundle } from "@proofstack/core";

export function parseBundle(value: unknown): ProofBundle { return ProofBundleSchema.parse(value); }
export async function loadBundleFile(file: File): Promise<ProofBundle> { return parseBundle(JSON.parse(await file.text())); }
export async function fetchBundle(path: string): Promise<ProofBundle> { const response = await fetch(path); if (!response.ok) throw new Error(`Bundle request failed: ${response.status}`); return parseBundle(await response.json()); }
```

- [ ] **Step 4: Add the initial application shell**

```tsx
// apps/dashboard/src/App.tsx
import { useEffect, useState } from "react";
import type { ProofBundle } from "@proofstack/core";
import { fetchBundle, loadBundleFile } from "./lib/bundle.js";

export function App() {
  const [bundle, setBundle] = useState<ProofBundle | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { fetchBundle("/demo/broken.json").then(setBundle).catch((value) => setError(String(value))); }, []);
  return <main><header><p>CODEX PROOFSTACK</p><h1>Make “done” provable.</h1><label>Open proof bundle<input type="file" accept="application/json" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) loadBundleFile(file).then(setBundle).catch((value) => setError(String(value))); }} /></label></header>{error && <p role="alert">{error}</p>}{bundle && <pre>{bundle.score}% verified</pre>}</main>;
}
```

```tsx
// apps/dashboard/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import "./styles.css";
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
```

- [ ] **Step 5: Install, test, and commit**

Run: `pnpm install && pnpm --filter @proofstack/dashboard test && pnpm --filter @proofstack/dashboard typecheck`

Expected: bundle validation test passes; React typecheck exits `0`.

```bash
git add apps/dashboard pnpm-lock.yaml
git commit -m "feat(dashboard): load proof bundles locally"
```

### Task 9: Build the evidence-first dashboard experience

**Files:**
- Create: `apps/dashboard/src/components/VerdictHero.tsx`
- Create: `apps/dashboard/src/components/ClaimMatrix.tsx`
- Create: `apps/dashboard/src/components/EvidencePanel.tsx`
- Create: `apps/dashboard/src/components/RepairPacket.tsx`
- Modify: `apps/dashboard/src/App.tsx`
- Create: `apps/dashboard/src/styles.css`
- Test: `apps/dashboard/test/report.test.tsx`

- [ ] **Step 1: Write a failing product-surface test**

```tsx
// apps/dashboard/test/report.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { VerdictHero } from "../src/components/VerdictHero.js";

it("shows the verification score and incomplete state", () => {
  render(<VerdictHero score={43} complete={false} project="release-console" />);
  expect(screen.getByText("43% verified")).toBeVisible();
  expect(screen.getByText(/incomplete evidence/i)).toBeVisible();
});
```

- [ ] **Step 2: Implement focused report components**

```tsx
// apps/dashboard/src/components/VerdictHero.tsx
import type { CSSProperties } from "react";

export function VerdictHero({ score, complete, project }: { score: number; complete: boolean; project: string }) {
  return <section className="verdict-hero"><div><p className="eyebrow">VERIFICATION VERDICT</p><h2>{score}% verified</h2><p>{project}</p></div><div className={`score-ring score-${score === 100 ? "pass" : "mixed"}`} style={{ "--score": `${score * 3.6}deg` } as CSSProperties}><span>{score}</span></div>{!complete && <p className="status-unknown">Incomplete evidence</p>}</section>;
}
```

```tsx
// apps/dashboard/src/components/ClaimMatrix.tsx
import type { ClaimResult } from "@proofstack/core";
export function ClaimMatrix({ claims, selected, onSelect }: { claims: ClaimResult[]; selected?: string; onSelect: (id: string) => void }) {
  return <section className="claim-grid" aria-label="Claim matrix">{claims.map((claim) => <button key={claim.id} className={`claim-card verdict-${claim.verdict} ${selected === claim.id ? "selected" : ""}`} onClick={() => onSelect(claim.id)}><span>{claim.verdict}</span><h3>{claim.title}</h3><small>{claim.evidenceIds.length} evidence item(s) · weight {claim.weight}</small></button>)}</section>;
}
```

```tsx
// apps/dashboard/src/components/EvidencePanel.tsx
import type { Evidence } from "@proofstack/core";
export function EvidencePanel({ evidence }: { evidence: Evidence[] }) { return <aside className="evidence-panel"><p className="eyebrow">EVIDENCE</p>{evidence.map((item) => <article key={item.id}><header><span className={`pill verdict-${item.verdict}`}>{item.verdict}</span><strong>{item.type}</strong><time>{item.durationMs}ms</time></header><h3>{item.summary}</h3>{item.detail && <pre>{item.detail}</pre>}{item.asset && <p>Screenshot: {item.asset}</p>}</article>)}</aside>; }
```

```tsx
// apps/dashboard/src/components/RepairPacket.tsx
export function RepairPacket({ value }: { value: string }) { return <section className="repair"><div><p className="eyebrow">CODEX REPAIR PACKET</p><h2>Failed claims, bounded context, exact re-run.</h2></div><button onClick={() => navigator.clipboard.writeText(value)}>Copy for Codex</button><pre>{value}</pre></section>; }
```

- [ ] **Step 3: Compose report state in App**

```tsx
// apps/dashboard/src/App.tsx
import { useEffect, useMemo, useState } from "react";
import type { ProofBundle } from "@proofstack/core";
import { ClaimMatrix } from "./components/ClaimMatrix.js";
import { EvidencePanel } from "./components/EvidencePanel.js";
import { RepairPacket } from "./components/RepairPacket.js";
import { VerdictHero } from "./components/VerdictHero.js";
import { fetchBundle, loadBundleFile } from "./lib/bundle.js";

export function App() {
  const [bundle, setBundle] = useState<ProofBundle | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBundle("/demo/broken.json").then((value) => { setBundle(value); setSelectedClaim(value.claims[0]?.id); }).catch((value) => setError(String(value)));
  }, []);

  const selectedEvidence = useMemo(
    () => bundle?.evidence.filter((item) => item.claimId === selectedClaim) ?? [],
    [bundle, selectedClaim],
  );

  async function importBundle(file: File) {
    try {
      const value = await loadBundleFile(file);
      setBundle(value);
      setSelectedClaim(value.claims[0]?.id);
      setError("");
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value));
    }
  }

  return (
    <main>
      <header className="topbar">
        <div><p className="eyebrow">CODEX PROOFSTACK</p><strong>Make “done” provable.</strong></div>
        <label>Open proof bundle<input type="file" accept="application/json" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void importBundle(file); }} /></label>
      </header>
      <h1>Evidence for every delivery claim.</h1>
      {error && <p role="alert">{error}</p>}
      {bundle && <>
        <VerdictHero score={bundle.score} complete={bundle.complete} project={bundle.project.name} />
        <ClaimMatrix claims={bundle.claims} selected={selectedClaim} onSelect={setSelectedClaim} />
        <EvidencePanel evidence={selectedEvidence} />
        <RepairPacket value={bundle.repairPacket} />
      </>}
    </main>
  );
}
```

- [ ] **Step 4: Add the complete visual system**

```css
/* apps/dashboard/src/styles.css */
:root { color: #e8edf2; background: #090b0d; font-family: Inter, ui-sans-serif, system-ui, sans-serif; font-synthesis: none; --green:#70f0a6; --amber:#ffcb6b; --red:#ff7a7a; --line:#252a30; }
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; background: radial-gradient(circle at 70% -10%, #17382a 0, transparent 32rem), #090b0d; }
button, input { font: inherit; }
main { width: min(1380px, calc(100% - 40px)); margin: 0 auto; padding: 32px 0 80px; }
.topbar { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line); padding-bottom:20px; }
.eyebrow { color:#8d98a3; font-size:11px; letter-spacing:.18em; font-weight:800; }
h1 { font-size:clamp(40px,7vw,90px); max-width:900px; line-height:.94; letter-spacing:-.06em; }
.verdict-hero { margin:42px 0 24px; display:grid; grid-template-columns:1fr auto; gap:28px; padding:32px; border:1px solid var(--line); border-radius:28px; background:rgba(17,20,23,.86); }
.verdict-hero h2 { margin:.1em 0; font-size:clamp(42px,6vw,78px); letter-spacing:-.05em; }
.score-ring { --score:0deg; width:150px; aspect-ratio:1; border-radius:50%; display:grid; place-items:center; background:conic-gradient(var(--green) var(--score), #20252a 0); position:relative; }
.score-ring::before { content:""; position:absolute; inset:10px; border-radius:50%; background:#0f1215; }
.score-ring span { position:relative; font-size:38px; font-weight:800; }
.claim-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.claim-card { text-align:left; color:inherit; border:1px solid var(--line); border-radius:18px; padding:20px; background:#111417; min-height:170px; cursor:pointer; }
.claim-card.selected { outline:2px solid #c7d2dc; outline-offset:2px; }
.claim-card span, .pill { text-transform:uppercase; font-size:10px; letter-spacing:.16em; font-weight:900; }
.verdict-pass span, .pill.verdict-pass { color:var(--green); }
.verdict-fail span, .pill.verdict-fail { color:var(--red); }
.verdict-unknown span, .pill.verdict-unknown { color:var(--amber); }
.evidence-panel, .repair { margin-top:16px; border:1px solid var(--line); border-radius:22px; background:#0f1215; padding:24px; }
.evidence-panel article { padding:18px 0; border-top:1px solid var(--line); }
.evidence-panel header { display:flex; gap:12px; align-items:center; }
.evidence-panel time { margin-left:auto; color:#7b8690; }
pre { white-space:pre-wrap; overflow-wrap:anywhere; max-height:300px; overflow:auto; padding:16px; color:#bec8d1; background:#090b0d; border-radius:12px; }
.repair button { border:0; border-radius:999px; background:var(--green); color:#07110b; font-weight:800; padding:12px 18px; cursor:pointer; }
@media (max-width:900px) { main { width:min(100% - 24px, 720px); } .claim-grid { grid-template-columns:1fr 1fr; } .verdict-hero { grid-template-columns:1fr; } .score-ring { width:110px; } }
@media (max-width:560px) { .claim-grid { grid-template-columns:1fr; } h1 { font-size:48px; } }
```

- [ ] **Step 5: Test, screenshot, and commit**

Run: `pnpm --filter @proofstack/dashboard test && pnpm --filter @proofstack/dashboard build`

Expected: product-surface test passes; Vite build emits static assets.

Open locally and capture 1440×900 plus 390×844 screenshots. Expected: no overflow, four claim cards visible on desktop, single-column mobile layout, strong verdict hierarchy.

```bash
git add apps/dashboard
git commit -m "feat(dashboard): visualize claims and evidence"
```

### Task 10: Add before/after comparison and repair-copy verification

**Files:**
- Create: `apps/dashboard/src/components/RunComparison.tsx`
- Modify: `apps/dashboard/src/App.tsx`
- Modify: `apps/dashboard/src/styles.css`
- Test: `apps/dashboard/test/comparison.test.tsx`

- [ ] **Step 1: Write failing comparison and clipboard tests**

```tsx
// apps/dashboard/test/comparison.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { RunComparison } from "../src/components/RunComparison.js";
import { RepairPacket } from "../src/components/RepairPacket.js";

it("labels a failed-to-passing claim as improved", () => {
  render(<RunComparison changes={[{ id: "visible-status", before: "fail", after: "pass", change: "improved" }]} />);
  expect(screen.getByText("improved")).toBeVisible();
});

it("copies the exact repair packet", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  render(<RepairPacket value="repair exactly this" />);
  fireEvent.click(screen.getByRole("button", { name: /copy for codex/i }));
  expect(writeText).toHaveBeenCalledWith("repair exactly this");
});
```

- [ ] **Step 2: Implement comparison component**

```tsx
// apps/dashboard/src/components/RunComparison.tsx
import type { RunChange } from "@proofstack/core";
export function RunComparison({ changes }: { changes: RunChange[] }) { return <section className="comparison"><p className="eyebrow">RUN COMPARISON</p><div>{changes.map((item) => <article key={item.id} className={`change-${item.change}`}><strong>{item.id}</strong><span>{item.before} → {item.after}</span><b>{item.change}</b></article>)}</div></section>; }
```

- [ ] **Step 3: Add dual-run loading to App**

Load `/demo/broken.json` and `/demo/repaired.json` on startup, retain the repaired run as the primary selectable report, call `compareRuns(before.claims, after.claims)`, and render `RunComparison`. File import replaces only the primary report and labels comparison unavailable unless a second file is selected.

```tsx
const [before, setBefore] = useState<ProofBundle | null>(null);
const [bundle, setBundle] = useState<ProofBundle | null>(null);
const changes = before && bundle ? compareRuns(before.claims, bundle.claims) : [];
```

- [ ] **Step 4: Style comparison states**

```css
.comparison { margin-top:16px; padding:24px; border:1px solid var(--line); border-radius:22px; background:#111417; }
.comparison article { display:grid; grid-template-columns:1fr auto 110px; gap:18px; padding:14px 0; border-top:1px solid var(--line); }
.comparison b { text-align:right; text-transform:uppercase; font-size:11px; letter-spacing:.12em; }
.change-improved b { color:var(--green); }
.change-regressed b { color:var(--red); }
.change-unchanged b { color:#8d98a3; }
```

- [ ] **Step 5: Test and commit**

Run: `pnpm --filter @proofstack/dashboard test && pnpm --filter @proofstack/dashboard build`

Expected: comparison and copy tests pass; before/after cards render without console errors.

```bash
git add apps/dashboard packages/core
git commit -m "feat(dashboard): compare proof runs and hand off repairs"
```

### Task 11: Generate demo assets and verify the full clean-install path

**Files:**
- Create: `scripts/generate-demo-assets.mjs`
- Modify: `package.json`
- Generate: `apps/dashboard/public/demo/broken.json`
- Generate: `apps/dashboard/public/demo/repaired.json`
- Generate: `apps/dashboard/public/demo/assets/*.png`
- Test: `test/integration/demo.test.mjs`

- [ ] **Step 1: Add a deterministic asset-generation script**

```js
// scripts/generate-demo-assets.mjs
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
for (const state of ["broken", "repaired"]) {
  const runner = spawn(process.execPath, [join(root, "examples/proofstack-demo/run-demo.mjs"), state], { stdio: "inherit" });
  const exit = await new Promise((resolve) => runner.on("exit", resolve));
  if (exit !== 0) throw new Error(`${state} demo failed`);
  const runs = (await readdir(join(root, "examples/proofstack-demo", state, ".proofstack"))).sort();
  const latest = runs.at(-1);
  if (!latest) throw new Error(`${state} report missing`);
  const source = join(root, "examples/proofstack-demo", state, ".proofstack", latest);
  const bundle = JSON.parse(await readFile(join(source, "proofstack-report.json"), "utf8"));
  bundle.generatedAt = state === "broken" ? "2026-07-16T00:00:00.000Z" : "2026-07-16T00:05:00.000Z";
  bundle.runId = `demo-${state}`;
  const target = join(root, "apps/dashboard/public/demo");
  await mkdir(join(target, "assets"), { recursive: true });
  await writeFile(join(target, `${state}.json`), `${JSON.stringify(bundle, null, 2)}\n`);
  await cp(join(source, "assets"), join(target, "assets", state), { recursive: true, force: true });
}
```

- [ ] **Step 2: Add root scripts**

```json
"scripts": {
  "build": "pnpm -r build",
  "test": "pnpm --filter @proofstack/core build && pnpm -r test",
  "typecheck": "pnpm -r typecheck",
  "demo:generate": "node scripts/generate-demo-assets.mjs",
  "verify": "pnpm test && pnpm typecheck && pnpm build && pnpm demo:generate"
}
```

- [ ] **Step 3: Write the integration assertion**

```js
// test/integration/demo.test.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const broken = JSON.parse(await readFile("apps/dashboard/public/demo/broken.json", "utf8"));
const repaired = JSON.parse(await readFile("apps/dashboard/public/demo/repaired.json", "utf8"));
assert.ok(broken.score < 100);
assert.equal(repaired.score, 100);
assert.equal(broken.claims.find((item) => item.id === "tests").verdict, "pass");
assert.equal(broken.claims.find((item) => item.id === "visible-status").verdict, "fail");
console.log("demo integration passed");
```

- [ ] **Step 4: Run the complete verification ladder**

Run: `pnpm verify && node test/integration/demo.test.mjs`

Expected: all unit/component tests pass, all packages typecheck/build, broken score below 100, repaired score 100, integration script prints `demo integration passed`.

Run in a temporary directory: `pnpm --filter @proofstack/cli pack --pack-destination <temp>`, install the tarball, and run `proofstack verify` against the repaired fixture.

Expected: installed CLI generates a 100% bundle without importing source paths from the monorepo.

- [ ] **Step 5: Commit**

```bash
git add scripts test package.json apps/dashboard/public/demo
git commit -m "test: verify the complete ProofStack demo path"
```

### Task 12: Create the judge-facing documentation and submission package

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Create: `docs/demo-script.md`
- Create: `docs/submission.md`

- [ ] **Step 1: Write the README with exact judge path**

README sections, in order:

```markdown
# Codex ProofStack
Make “done” provable.

## 30-second judge path
1. Open the hosted demo.
2. Select a failed claim.
3. Inspect its browser/rules evidence.
4. Open Run Comparison to see the repaired result.
5. Copy the bounded Codex repair packet.

## Run locally
pnpm install
pnpm exec playwright install chromium
pnpm build
node examples/proofstack-demo/run-demo.mjs broken
node examples/proofstack-demo/run-demo.mjs repaired
pnpm --filter @proofstack/dashboard dev

## Why it exists
## How the proof contract works
## Architecture
## Privacy and safety
## How Codex and GPT-5.6 were used
## Test and release verification
## License
```

The final README must include the actual hosted URL, screenshot, repository diagram, supported check table, exit codes, and a statement that API keys are not required.

- [ ] **Step 2: Add MIT license and demo narration**

`LICENSE` uses the standard MIT text with copyright `2026 Duwon Park`.

`docs/demo-script.md` follows the approved timing: 15s problem, 25s contract, 45s failed report, 35s Codex repair, 35s comparison, 20s architecture/privacy. Every shot names the exact route, command, or UI section shown.

- [ ] **Step 3: Add complete Devpost submission copy**

`docs/submission.md` contains final-ready text for:

- Project name and tagline.
- Developer Tools category.
- Problem, solution, implementation, challenges, accomplishments, lessons, and next steps.
- Exact explanation of Codex and GPT-5.6 usage.
- Public repository URL.
- Hosted demo URL.
- Public YouTube URL represented by an unchecked release item until the upload exists.
- `/feedback` session ID checklist item.
- Logged-out link verification checklist.
- Required private-repository sharing addresses if the repository is not public.

- [ ] **Step 4: Perform reader-first and logged-out QA**

Run: `pnpm verify`

Expected: complete verification ladder passes after documentation changes.

Open README links and hosted demo in a logged-out browser. Expected: no authentication, no broken image, no local path, demo report loads, and repair copy works.

- [ ] **Step 5: Commit**

```bash
git add README.md LICENSE docs
git commit -m "docs: prepare ProofStack hackathon submission"
```

### Task 13: Deploy, record, and submit

**Files:**
- Modify: `README.md`
- Modify: `docs/submission.md`
- Create: `docs/release-checklist.md`

- [ ] **Step 1: Deploy the static dashboard**

Build: `pnpm --filter @proofstack/dashboard build`

Deploy `apps/dashboard/dist` to the selected static host. Record the immutable production URL in README and submission copy.

Expected: production responds `200`, loads both demo bundles, and has no console errors in desktop or mobile viewports.

- [ ] **Step 2: Record and publish the demo**

Use `docs/demo-script.md`, record at 1440×900, narrate how Codex and GPT-5.6 were used, keep total duration below 2:50, upload publicly to YouTube, and verify playback while logged out.

- [ ] **Step 3: Capture the Codex session ID**

Run `/feedback` in the core Codex build session. Add the returned session ID to the Devpost draft and `docs/release-checklist.md`. Do not publish private transcript content.

- [ ] **Step 4: Complete final submission QA**

`docs/release-checklist.md` must record PASS for:

```markdown
- [ ] Production demo opens logged out
- [ ] Public repository opens logged out
- [ ] README clean-install commands pass
- [ ] YouTube video is public and under three minutes
- [ ] Video audio names both Codex and GPT-5.6
- [ ] Developer Tools category selected
- [ ] Project description matches the working product
- [ ] `/feedback` session ID entered
- [ ] No credentials, local paths, or private project data published
- [ ] Devpost preview reviewed before final submission
```

- [ ] **Step 5: Commit final links, then submit before internal cutoff**

```bash
git add README.md docs
git commit -m "release: finalize OpenAI Build Week submission"
```

Submit by July 22, 2026 at 7:00 AM KST, two hours before the official deadline. Save the Devpost confirmation screen and final public project URL as release evidence.
