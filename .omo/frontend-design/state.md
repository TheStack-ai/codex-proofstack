# ProofStack Frontend Design State

## Current Objective

Build a submission-grade proof dashboard that makes claim-to-evidence verification understandable in one glance and inspectable in depth.

## Locked Decisions

- Direction: Midnight Evidence Chamber.
- References: `soft-skill` execution discipline plus `linear.app` luminance hierarchy.
- Typeface: Geist Variable and Geist Mono; no generic Inter fallback as the intended rendered face.
- Signature: double-bezel proof surfaces and an evidence beam linking the selected claim to proof.
- Accessibility outranks visual flourish; verdicts always include text and shape.
- The default comparison keeps the repaired run primary and selects the highest-weight changed
  claim, exposing the browser proof that closed the largest gap.
- The document owns scrolling; claim and evidence cards never create competing page-height scroll
  regions.
- `react-grab` and `react-scan` load only in development. Production output contains neither tool.

## Source Inputs

- `DESIGN.md`
- `docs/superpowers/specs/2026-07-16-codex-proofstack-design.md`
- `docs/superpowers/plans/2026-07-16-codex-proofstack-implementation.md`
- Generated proof bundles and browser screenshots under each demo fixture’s `.proofstack/` directory.

## Design Brief

Primary journey: understand run trust, locate a non-passing required claim, inspect its evidence, copy a bounded repair packet, and compare the repaired run. Tone is calm, exact, and plain-language technical.

## Inclusive Personas

- On-call builder: time pressure; must locate first required failure in under ten seconds.
- Keyboard/screen-reader developer: must complete inspection and copy actions without pointer input.
- Color-vision-deficient reviewer: must distinguish verdicts without hue.
- Motion-sensitive reviewer: must receive equivalent static feedback.

## Adaptive Preferences

- Reduced motion removes reveal/pulse/scale.
- Forced colors preserves semantic controls and visible focus.
- 200% zoom and long technical strings must not produce primary horizontal scrolling.

## Verification Matrix

- Primitive showcase: 375px, 768px, 1280px; focus, loading, empty, error, long-content, reduced-motion.
- Product dashboard: real production build in Chromium; keyboard traversal; mobile/tablet/desktop screenshots.
- Performance/accessibility: production Lighthouse through real Chrome where the environment permits.
- Final: objective visual evidence first, then accessibility/heuristic/persona review against the same build.

## Design Debt Register

| ID | Date | Source | Severity | Issue | Affected users | Suggested fix | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| REF-001 | 2026-07-16 | Lane A research | Minor | Lazyweb search requires a Pro plan. | Design reviewers | Re-run the shortlisted dashboard query if access changes. | Open | No external screen was copied. |
| REF-002 | 2026-07-16 | Lane A research | Minor | Imagen cannot provide an iterative mid-turn reference. | Design reviewers | Use the rendered primitive showcase as the implementation reference. | Accepted | No product or accessibility behavior is affected. |

## Handoff Notes

- Task 9 implements live DOM primitives, local bundle import, highest-weight failure selection,
  screenshot evidence, and the bounded repair packet.
- Task 10 loads repaired and broken bundles together, keeps the repaired run primary, exposes
  claim-level changes, and preserves the current failing bundle as the repair source even when
  users import runs in reverse order.
- Preserve `StatusBadge`, `ClaimMatrix`, and `EvidencePanel` anatomy; their keyboard and non-color
  status semantics are already covered by component tests and live captures.
- Visual-review subagents remain unavailable because the repository instructions prohibit task
  delegation without explicit user approval. Final QA must record direct browser evidence and this
  constraint without claiming independent review.

## Evidence Index

- Primitive showcase, 375px:
  `.omo/evidence/proofstack-showcase-phase0/showcase-375.png`
- Primitive showcase, 768px:
  `.omo/evidence/proofstack-showcase-phase0/showcase-768.png`
- Primitive showcase, 1280px:
  `.omo/evidence/proofstack-showcase-phase0/showcase-1280.png`
- Broken dashboard, 390px:
  `.omo/evidence/proofstack-dashboard-task9/dashboard-broken-390.png`
- Broken dashboard, 1280px:
  `.omo/evidence/proofstack-dashboard-task9/dashboard-broken-1280.png`
- Browser metrics: all listed captures matched viewport width with no horizontal overflow; the
  browser evidence image loaded at 1440 × 900.
- Static React audit: React Doctor 0.7.8 reported 100/100 with no issues.
- Production gate: Vite build passed and contained no `react-grab` or `react-scan` strings.
- Final primitive showcase, 375px / 768px / 1280px:
  `.omo/evidence/proofstack-visual-qa-final/showcase-{375,768,1280}.png`
- Interaction states: action rest/mid/settled/focus and claim rest/mid/settled are under
  `.omo/evidence/proofstack-visual-qa-final/`.
- Comparison dashboard, 390px / 768px / 1280px:
  `.omo/evidence/proofstack-dashboard-task10/dashboard-comparison-{390,768,1280}.png`
- Final browser metrics: no horizontal overflow at any target width, no console/page errors,
  exact repair-packet clipboard copy, and reduced-motion durations of `0.01ms`.
