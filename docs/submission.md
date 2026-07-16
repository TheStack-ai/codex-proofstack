# OpenAI Build Week submission copy

This is the paste-ready source for the Devpost entry. Keep the working-product claims synchronized
with the repository and production demo.

Official requirement snapshot checked on July 16, 2026:
[OpenAI Build Week overview](https://openai.devpost.com/) and
[official rules](https://openai.devpost.com/rules).

## Core fields

**Project name**

Codex ProofStack

**Tagline**

Make “done” provable with local evidence, explicit verdicts, and bounded Codex repairs.

**Category**

Developer Tools

**Elevator pitch**

ProofStack catches the gap between a green pipeline and the product a reviewer can actually use. A
project declares delivery claims in `proofstack.yml`; a local CLI gathers file, command, HTTP,
browser, and rules evidence; and a dashboard turns the result into claim-level verdicts, a bounded
Codex repair packet, and a before/after proof trail. The included demo has passing tests but a broken
rendered product at 38%, then reaches 100% only after every required claim agrees.

## Project story

### Inspiration

AI coding agents are getting better at implementation, but the last mile is still fragile. “Tests
passed,” “the page works,” and “the artifact exists” are often reported as prose, even when the
reviewer-visible product says something else. We wanted a handoff format where an agent's confidence
does not outrank observable evidence.

The motivating question was simple: what if “done” were a contract that another developer could
rerun, inspect, and compare instead of a sentence in a chat?

### What it does

ProofStack turns each delivery claim into an executable proof chain:

1. Define required and optional claims in a strict local YAML contract.
2. Gather evidence through five adapters: file, command, HTTP, browser, and project rules.
3. Score weighted claims while keeping the run incomplete if any required claim is not `pass`.
4. Write a versioned local bundle containing redacted evidence and browser screenshots.
5. Inspect claim → evidence → verdict in a responsive dashboard.
6. Copy a repair packet that tells Codex to preserve passing behavior and fix only failed claims.
7. Rerun the same contract and compare improved, regressed, and unchanged claims.

The judge demo opens directly on a 38 → 100 comparison. The original fixture's health test passes,
but its project-rule and browser-visible-status claims fail. The repaired fixture reaches 100 only
after those two gaps close.

### How we built it

ProofStack is a strict TypeScript pnpm workspace:

- `@proofstack/core` defines Zod contracts, proof bundles, verdicts, weighted scoring, redaction, and
  run comparison.
- `@proofstack/cli` resolves the nearest project contract, enforces root containment and command
  allowlists, runs the five evidence adapters, and writes mode-0600 reports and assets.
- The React/Vite dashboard parses bundles locally, shows the selected evidence and screenshot,
  compares runs claim by claim, and copies the exact repair packet.
- Two release-console fixtures create a controlled counterexample: green tests plus a broken product,
  then the verified repair.

The public demo is static and needs no account, rebuild, backend, API key, or source upload. The CLI
was also packed and installed into a fresh temporary project to prove that it does not import source
paths or unpublished workspace packages.

### Challenges we ran into

The hardest design problem was refusing to let a high-level score hide a required failure. ProofStack
therefore exposes progress as a weighted score but uses required-claim semantics for completion and
the process exit code.

Browser evidence introduced a second boundary: screenshots and accessible role assertions had to be
useful without letting paths escape the project root or letting evidence text become instructions for
the repair agent. We added path containment, command allowlisting, shell-free execution, redaction,
and an explicit untrusted-evidence preamble.

The clean-install test found a real release defect late in the build: the packed CLI initially tried
to download a private workspace package. We changed the build so the CLI entry contains its core
runtime while ordinary third-party dependencies remain normal package dependencies, then verified a
100% run from the installed tarball.

Finally, deterministic demo generation surfaced timing text that changed by a few milliseconds on
every run. Normalizing both duration fields and summaries made consecutive asset hashes identical.

### Accomplishments that we're proud of

- A reproducible fixture where unit tests pass but browser proof fails, scoring 38 instead of giving a
  false green.
- A repaired run that reaches 100 with two improved claims, zero regressions, and three unchanged
  proofs.
- 46 unit/component tests plus a live cross-package integration path, strict TypeScript checks, and
  production builds behind one `pnpm verify` command.
- A polished local-first dashboard verified at mobile, tablet, and desktop widths with keyboard,
  clipboard, reduced-motion, and long-content states.
- A standalone packed CLI tested through help, version, failure semantics, and a complete 100% run.
- No model/API dependency in the shipped verifier, so proof remains deterministic and inexpensive.

### What we learned

Agentic development needs a proof protocol more than another success summary. Browser state and
project instructions are first-class delivery requirements, not optional polish after tests pass.

We also learned that a repair prompt is safer and more useful when it is generated from failed claims
only, explicitly preserves passing behavior, and treats every captured artifact as untrusted data.
The strongest loop was not “agent writes code”; it was claim → evidence → verdict → bounded repair →
the same claim rerun.

### What's next

- A GitHub Check that annotates pull requests with required-claim failures and proof links.
- Signed proof bundles and artifact attestations for CI/release use.
- Framework presets for common web, API, mobile, and CLI projects.
- Baseline policies for approved regressions and team-owned claim libraries.
- Windows verification and cross-platform CI.
- A Codex integration that opens the bounded packet and returns the new proof bundle to the same
  review surface while keeping the human in control.

## How Codex and GPT-5.6 were used

The majority of the project was built in one core Codex session with GPT-5.6. Codex helped shape the
initial product idea into a concrete proof contract, implemented the core and adapters with failing
tests first, created the deliberately broken/repaired fixtures, and built the responsive evidence
dashboard.

The work repeatedly returned to the matching real surface: CLI help/error/happy paths, live HTTP and
Playwright checks, actual screenshots, local file imports, clipboard copy, responsive layouts, a
production build, and a clean packed install. GPT-5.6 helped diagnose and repair issues uncovered by
those surfaces, including reverse-order comparison semantics, reduced-motion specificity,
non-deterministic generated evidence, and the private workspace dependency in the release tarball.

Human decisions defined the safety and product boundary: no source upload, no autonomous mutation,
no shell commands, required claims cannot be averaged away, and evidence is untrusted input. The
runtime itself intentionally makes no model call; it produces reliable context for the next Codex
turn.

## Built with

Codex, GPT-5.6, TypeScript, Node.js, React, Vite, Playwright, Zod, Vitest, Testing Library, Commander,
Execa, YAML, Biome, and pnpm.

## Links

- Public repository: https://github.com/TheStack-ai/codex-proofstack
- Hosted demo: https://thestack-ai.github.io/codex-proofstack/
- Public YouTube demo: **[ ] replace with the public video URL after upload**

## Required release items

- [ ] Paste the `/feedback` Codex session ID from the core build session.
- [ ] Upload a public YouTube video under three minutes with audio naming Codex and GPT-5.6.
- [ ] Verify the repository, demo, and YouTube link in a logged-out browser.
- [ ] Confirm Developer Tools is selected.
- [ ] Preview the final Devpost page before submission.

The repository is public and MIT licensed, so private reviewer sharing is not required. If it must be
made private, share it with both official reviewer accounts before submission:

- `testing@devpost.com`
- `build-week-event@openai.com`

## Official deadline guardrail

- Official deadline: July 21, 2026 at 5:00 PM PDT, which is July 22 at 9:00 AM KST.
- Internal submission cutoff: **July 22 at 7:00 AM KST**.
