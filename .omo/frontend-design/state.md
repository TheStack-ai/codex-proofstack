# ProofStack Frontend Design State

## Current Objective

Build a submission-grade proof dashboard that makes claim-to-evidence verification understandable in one glance and inspectable in depth.

## Locked Decisions

- Direction: Midnight Evidence Chamber.
- References: `soft-skill` execution discipline plus `linear.app` luminance hierarchy.
- Typeface: Geist Variable and Geist Mono; no generic Inter fallback as the intended rendered face.
- Signature: double-bezel proof surfaces and an evidence beam linking the selected claim to proof.
- Accessibility outranks visual flourish; verdicts always include text and shape.

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

- Lazyweb search is blocked by a current Pro paywall; retry before submission if access changes.
- Imagen draft cannot be generated mid-build under the active tool response contract; rendered showcase becomes the reference contract.

## Evidence Index

- To be populated with showcase, dashboard, Lighthouse, and final review artifacts during Tasks 8–11.
