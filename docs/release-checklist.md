# ProofStack release checklist

Last updated: July 16, 2026 (KST)

## Verified release surfaces

- [x] Production demo opens without authentication at
      https://thestack-ai.github.io/codex-proofstack/ (`200`).
- [x] Both production demo bundles return JSON (`200`).
- [x] Browser evidence image returns PNG (`200`) and renders at 1440×900.
- [x] Desktop 1440×900 and mobile 390×844 have no horizontal overflow, console errors, warnings, or
      page errors on the production demo.
- [x] The production comparison shows 38 → 100 and two improved claims with no regressions.
- [x] `Copy for Codex` writes the complete 709-character repair packet and includes the exact
      `proofstack verify` rerun instruction.
- [x] Public repository opens without authentication at
      https://github.com/TheStack-ai/codex-proofstack (`200`).
- [x] Public README, MIT license, and dashboard screenshot each return `200` from the `main` branch.
- [x] GitHub Pages workflow run
      https://github.com/TheStack-ai/codex-proofstack/actions/runs/29484537893 completed successfully.
- [x] `pnpm verify` passes the complete local verification ladder.
- [x] Packed CLI installs in a fresh external project and completes a repaired fixture at 100 with
      exit code 0.
- [x] Two consecutive demo generations have the same SHA-256:
      `9f263894487a9bdfcbf15176d789b93c2d80e125a8d1e717776eea13601637cb`.
- [x] Repository scan found no real credentials, private redemption codes, user email, or
      machine-specific `/Users/dd` path. Token-shaped strings are synthetic redaction test fixtures.

## Submission requirements

- [x] Working production project.
- [x] Public MIT-licensed repository with install, platform, test, and architecture guidance.
- [x] Developer Tools is the prepared category.
- [x] Project description matches the working product.
- [x] Codex `/feedback` session ID: `019f63ab-c2c0-7541-98fe-450f872884c4`.
- [ ] Public YouTube video is under three minutes.
- [ ] Video audio explicitly names both Codex and GPT-5.6.
- [ ] YouTube playback works while logged out.
- [ ] Developer Tools is selected in the saved Devpost project.
- [ ] Final Devpost preview is reviewed.
- [ ] Devpost submission is confirmed before the internal cutoff.

## Current blockers

- Devpost displayed an image CAPTCHA when creating the project; user confirmation is required before
  the agent may solve it.
- The required local `auto-montage` engine is not present at its configured/default path, so the
  Video Studio workflow is waiting for its current path or confirmation that it was removed.

## Deadline guardrail

- Official deadline: July 22, 2026 at 9:00 AM KST.
- Internal cutoff: July 22, 2026 at 7:00 AM KST.
