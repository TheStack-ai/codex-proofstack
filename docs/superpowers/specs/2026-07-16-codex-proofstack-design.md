# Codex ProofStack — Product Design

Date: 2026-07-16  
Status: Approved direction; ready for implementation planning after user review  
Hackathon: OpenAI Build Week 2026  
Track: Developer Tools

## 1. Product thesis

AI coding agents can report that a task is complete while the real product is still wrong: the command ran in the wrong project, a test passed against stale output, a browser screen does not match the requested behavior, or project instructions conflict across global, repository, path, and workflow layers.

Codex ProofStack is a local-first verification layer for AI-assisted development. It converts a set of delivery claims into deterministic checks, collects evidence from the repository and the running product, and produces a visual report that shows:

> claim -> evidence -> verdict -> remediation -> re-verification

The product promise is: **do not trust “done”; make it provable.**

## 2. Audience and problem

Primary users are individual developers and technical leads using Codex or another coding agent on real projects. They need to answer four questions quickly:

1. Did the agent work in the intended project and instruction scope?
2. Does the current file, test, runtime, route, and browser surface support the completion claim?
3. If a claim failed, what evidence explains the failure?
4. Can another person reproduce the verification without reading the entire agent conversation?

The current alternatives are fragmented: test runners verify code paths, browser tools verify isolated UI behavior, instruction files describe expectations, and agent transcripts record actions. None presents these as one delivery contract with a shareable proof trail.

## 3. Goals

- Verify a small set of explicit project claims using real local evidence.
- Make failures legible to a judge or teammate in under one minute.
- Demonstrate a complete before/fix/after loop in under three minutes.
- Run without requiring an OpenAI API key or paid external service.
- Keep project data local by default and redact obvious secrets and machine-specific paths.
- Generate a compact repair packet that can be handed back to Codex.
- Provide a hosted sample dashboard and a locally runnable CLI for judges.

## 4. Non-goals

- General-purpose CI/CD orchestration.
- Autonomous execution of destructive fixes.
- Replacing unit, integration, or browser tests.
- Reading the user’s private Codex database or memory automatically.
- Generic Mac cleanup or broad runtime maintenance.
- Proving semantic correctness for every possible product claim.

## 5. Core experience

### 5.1 Define the proof contract

A repository contains a small `proofstack.yml` file. Each claim has a human-readable statement, importance weight, and one or more evidence checks. The first release supports these check types:

- `file`: file existence and safe text matching.
- `command`: allowlisted test, build, lint, or diagnostic commands.
- `http`: status, response body, and latency checks against a local or demo URL.
- `browser`: visible text, accessible role, and screenshot checks through Playwright.
- `rules`: instruction-scope checks for files such as `AGENTS.md` and path-specific rules.

Checks return `pass`, `fail`, or `unknown`. Unknown is never silently converted to pass.

### 5.2 Run verification

The CLI command `proofstack verify` validates the contract, executes checks in a controlled order, redacts output, and writes a versioned proof bundle. A run records:

- project identity and resolved root;
- timestamp and tool version;
- claim and check results;
- bounded command output;
- HTTP and browser evidence;
- screenshots referenced by relative path;
- relevant rule sources;
- a deterministic overall score;
- failures suitable for a Codex repair packet.

The verifier is read-only except for its own `.proofstack/` output directory.

### 5.3 Inspect the report

The web dashboard can open a local proof bundle or show the bundled demo. Its primary views are:

1. **Verdict overview** — verified score, passed/failed/unknown claims, duration, and root identity.
2. **Claim matrix** — compact cards connecting each claim to its evidence.
3. **Evidence detail** — command excerpt, file/rule source, HTTP response, browser assertion, and screenshot.
4. **Repair packet** — a copyable Codex prompt containing only failed claims, evidence, constraints, and re-run instructions.
5. **Run comparison** — before and after reports with changed verdicts highlighted.

The visual language is closer to an incident console than a generic AI dashboard: dark neutral canvas, restrained green/amber/red states, dense evidence cards, and one strong verification score.

### 5.4 Repair and re-verify

ProofStack does not modify project code. The user copies the repair packet into Codex, lets Codex implement the fix, then runs `proofstack verify` again. The dashboard compares the two proof bundles and shows exactly what changed.

This boundary keeps the tool trustworthy and makes Codex’s contribution visible in the demo.

## 6. Architecture

The repository will use a TypeScript workspace with four bounded areas:

### `packages/core`

- Proof contract and proof bundle schemas.
- Validation, redaction, scoring, comparison, and report utilities.
- No filesystem, process, browser, or network side effects.

### `packages/cli`

- Project-root resolution and contract loading.
- Evidence runner and adapters.
- Output directory management.
- Repair-packet generation.
- Clear exit codes: `0` all required claims pass, `1` claim failure, `2` invalid contract or runner error.

### `apps/dashboard`

- React and TypeScript dashboard.
- Bundled demo reports for instant judging.
- Local JSON import without uploading data.
- Responsive report, comparison, and repair views.

### `examples/proofstack-demo`

- Small intentionally broken web project.
- Reproducible initial and repaired states.
- Proof contract exercising file, command, HTTP, browser, and rules checks.

Adapters depend on `core`; the dashboard consumes only the proof bundle schema. The dashboard never invokes commands. This keeps execution and presentation independently testable.

## 7. Data flow

1. Resolve the real project root from the contract location.
2. Parse and validate `proofstack.yml`.
3. Build an execution plan from enabled checks.
4. Run non-browser checks, then runtime checks, then browser checks.
5. Redact environment-like values, absolute home paths, tokens, and oversized output.
6. Evaluate each claim from its evidence policy.
7. Write an immutable proof bundle and referenced screenshots.
8. Load the bundle in the dashboard.
9. Generate a repair packet for failed or unknown required claims.
10. Compare the next run with the previous run.

## 8. Safety and privacy

- No arbitrary shell string execution. Command checks use argument arrays and a contract-level allowlist.
- No destructive commands in the default adapter set.
- Environment variables are not serialized.
- Common token, key, credential, cookie, and authorization patterns are replaced with `[REDACTED]`.
- Absolute paths under the user’s home directory are converted to workspace-relative paths or `~`.
- Command output is capped and records truncation explicitly.
- Browser checks default to localhost or an explicitly listed host.
- Imported proof bundles are processed locally in the browser.
- The hosted demo contains synthetic data only.

## 9. Failure handling

- Invalid contracts stop before any check runs and show exact schema errors.
- A missing optional dependency returns `unknown` with an installation hint.
- A failed command is evidence, not an application crash.
- A server that cannot be reached fails only dependent HTTP/browser checks.
- A stale or mismatched root is a first-class failure displayed at the top of the report.
- Missing screenshots never produce a passing browser verdict.
- Partial runs remain inspectable and are labeled incomplete.

## 10. Demo story

The public demo uses a small project whose tests pass while the delivered product is still wrong:

- the CLI resolves an unexpected nested project root;
- a project rule requires a visible “Evidence verified” status;
- the unit test passes, but the live page lacks that status;
- an HTTP health check succeeds, demonstrating that server health alone is insufficient.

The first ProofStack run shows mixed green and red evidence. The repair packet is given to Codex. Codex fixes the root handling and visible status while preserving existing behavior. The second run turns the required claims green, and the dashboard shows a before/after evidence comparison.

The sub-three-minute video sequence is:

1. Problem and one-line promise — 15 seconds.
2. Broken project and proof contract — 25 seconds.
3. First verification and evidence dashboard — 45 seconds.
4. Codex repair packet and fix — 35 seconds.
5. Re-verification and before/after report — 35 seconds.
6. Architecture, privacy boundary, and impact — 20 seconds.

## 11. Testing strategy

### Core

- Schema validation fixtures.
- Deterministic scoring and comparison tests.
- Redaction tests covering secrets, home paths, and output caps.
- Claim aggregation tests for pass/fail/unknown policies.

### CLI

- Fixture repositories in isolated temporary directories.
- Root-resolution and exit-code tests.
- Safe command invocation tests using argument arrays.
- HTTP adapter tests against a disposable local server.
- Browser adapter smoke test against the demo project.
- Verification that only `.proofstack/` is written.

### Dashboard

- Component tests for verdict and evidence states.
- Invalid/partial bundle import tests.
- Responsive layout checks.
- End-to-end demo import, comparison, and repair-packet copy flow.

### Release proof

- Clean installation from the packed CLI artifact.
- Fresh-clone README path from install to demo report.
- Hosted demo checked in a real browser.
- Final public repository and demo video links tested in a logged-out browser.

## 12. Hackathon submission package

The submission will include:

- a working hosted dashboard with the synthetic sample report;
- a public repository with license and setup instructions;
- a locally runnable CLI and demo project;
- a concise README with architecture, privacy, and judge quickstart;
- a public YouTube demo shorter than three minutes with narration;
- a clear account of where Codex and GPT-5.6 accelerated design, implementation, diagnosis, and repair;
- the required `/feedback` Codex Session ID from the core build session;
- installation instructions and a no-install judge path through the hosted demo.

## 13. Delivery schedule

The official deadline is July 21, 2026 at 5:00 PM PDT, which is July 22 at 9:00 AM KST. The project will use an earlier internal cutoff:

- **July 16 KST:** implementation plan, repository scaffold, schemas, and demo contract.
- **July 17 KST:** core verifier, redaction, file/command/rules adapters, and unit tests.
- **July 18 KST:** HTTP/browser adapters and reproducible broken/repaired demo states.
- **July 19 KST:** dashboard, comparison view, repair packet, and responsive visual polish.
- **July 20 KST:** clean-install verification, hosted demo, README, and submission copy.
- **July 21 KST:** demo recording, public-link verification, Devpost draft, and contingency fixes.
- **July 22 before 7:00 AM KST:** final submission lock, leaving a two-hour platform buffer.

Scope is reduced before quality gates are relaxed. The first removable item is generic local report import; the deterministic demo, evidence matrix, repair packet, and before/after comparison remain mandatory.

## 14. Success criteria

The MVP is submission-ready only when all of the following are true:

- One command produces a valid proof bundle from the demo repository.
- The bundle contains at least one check of every supported MVP type.
- The first demo run contains a credible failure that unit tests alone miss.
- The repaired run passes all required claims.
- The dashboard displays both runs and their evidence without a backend.
- A judge can understand the product’s value in under 30 seconds.
- A fresh user can reproduce the demo from the README in under five minutes.
- No private user project data, credentials, or local Codex history appears in the repository or hosted demo.
- The final submission satisfies every Devpost field and link requirement.

## 15. Decisions and trade-offs

- **Developer Tools is the selected track.** The target user and technical proof align directly with testing, DevOps, agentic workflows, and security.
- **Deterministic core, Codex-assisted repair.** The verification verdict does not depend on an opaque model judgment; Codex is used to build and repair against evidence.
- **Local-first over SaaS accounts.** This lowers setup friction, protects source code, and gives judges a reliable demo.
- **No autonomous fixes in the MVP.** A visible handoff to Codex is safer, easier to explain, and better demonstrates the agent workflow.
- **Settings and runtime hygiene are modules, not the headline.** They strengthen real-world relevance without turning the product into a configuration linter or a generic cleanup tool.
