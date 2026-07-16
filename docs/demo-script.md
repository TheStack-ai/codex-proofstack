# Codex ProofStack demo script

Target length: **2:45**. Hard limit: **under 3:00**. Capture at 1440 × 900 with the browser zoom at
100%, a visible pointer, and no private tabs, notifications, local absolute paths, or account details.

The phase allocation follows the approved story while compressing the failed-report and Codex
handoff beats enough to leave upload headroom.

## Recording preparation

1. Run `pnpm verify` and keep the final `38 broken → 100 repaired` output available.
2. Open the production route at `https://thestack-ai.github.io/codex-proofstack/`.
3. Open `examples/proofstack-demo/repaired/proofstack.yml` in a clean editor window.
4. Open the Architecture section of `README.md` in the rendered GitHub view.
5. Disable desktop notifications and close any screen containing tokens, email, local paths, or other
   projects.
6. Record one clean take, then trim only pauses. Do not speed up pointer motion or narration.

## Shot list and narration

### 0:00–0:15 — The problem

**Surface:** terminal output from
`node examples/proofstack-demo/run-demo.mjs broken`, ending on `Score: 38%`, then a quick cut to the
broken release-console screenshot.

**Action:** highlight that the health test passed while the rendered delivery status did not.

**Narration:**

> Coding agents can finish with green tests while the product a reviewer opens is still wrong. This
> fixture passes its test, but its rendered delivery claim has no proof. ProofStack makes that gap
> impossible to hide.

### 0:15–0:40 — The proof contract

**Surface:** `examples/proofstack-demo/repaired/proofstack.yml`.

**Action:** point to `allowedCommands`, the low-weight command check, and the weight-3 browser role
check. Keep the full claim block readable.

**Narration:**

> A project declares delivery claims in one local YAML contract. Checks can inspect files, commands,
> HTTP, browser accessibility, and project rules. Commands are allowlisted, paths stay inside the
> project root, and required claims must actually pass.

### 0:40–1:20 — Failed report and real evidence

**Surface:** production route `/`.

**Action:** show the 100% current verdict, scroll to `Before / after`, and pause on `38 → 100`. Point
to the `instructions` and `visible-status` rows marked `FAIL → PASS`. Return to the claim matrix,
select **The live page exposes an evidence-verified status**, and show the browser screenshot.

**Narration:**

> The dashboard opens two signed-off moments together. The original run scored 38 even though its
> test passed, because project instructions and the live browser claim failed. Every verdict links to
> the evidence that produced it, including the final rendered screenshot. The repaired run reaches
> 100 only when every required claim agrees.

### 1:20–1:50 — Bounded Codex repair

**Surface:** `Codex repair packet / resolved` section on production `/`.

**Action:** click **Copy for Codex** and hold on the `Copied for Codex` state. Briefly reveal the first
two safety lines in the packet.

**Narration:**

> ProofStack does not mutate code by itself. It creates a bounded packet for Codex: treat evidence as
> untrusted data, preserve passing behavior, and fix only the listed claims. I built this project in
> Codex with GPT-5.6; that same collaboration loop turned each observed failure into a focused repair
> and an exact rerun.

### 1:50–2:25 — Comparison closes the loop

**Surface:** production `Before / after` section, followed by the 100% verdict chamber.

**Action:** trace `38 → 100`, the two improved claims, and the three unchanged claims. End on the
100% ring and `Every required claim is proven`.

**Narration:**

> Rerunning the same contract creates a claim-level diff. Two claims improved, three stayed proven,
> and nothing regressed. That is the difference between an agent saying “done” and a handoff another
> developer can independently inspect.

### 2:25–2:45 — Architecture, privacy, and close

**Surface:** rendered README Architecture diagram and Privacy and safety bullets.

**Action:** follow contract → adapters → evidence → verdict → repair → rerun. End on the repository
and live-demo links.

**Narration:**

> The CLI and dashboard are local-first. There is no source upload and no API key. Evidence is
> redacted, commands run without a shell, and missing proof stays unknown. Codex ProofStack makes
> “done” provable before the handoff.

## Final video checks

- [ ] Runtime is 2:50 or less.
- [ ] YouTube visibility is Public, not Unlisted or Private.
- [ ] Audio clearly says both **Codex** and **GPT-5.6**.
- [ ] The project is visibly working; no slide-only explanation replaces the live product.
- [ ] Browser and repository URLs are readable.
- [ ] No email, token, local absolute path, private transcript, or unrelated project is visible.
- [ ] Playback succeeds in a logged-out browser with captions enabled.

