# ProofStack Design System

## 0. Research Log

- Embedded references: shortlisted `linear.app`, `sentry`, and `vercel` → picked `soft-skill` + `linear.app` because ProofStack needs operational precision without looking like a generic admin template.
- Lazyweb: 1 desktop query attempted, 0 screens viewed → the read-only search endpoint returned `MCP_PRO_REQUIRED`, so no external screenshot was consumed or copied.
- UI/UX database: queried developer-verification dashboards, technical premium typography, and dark status palettes → retained the operations-dashboard hierarchy, semantic status colors, 4/8 spacing rhythm, visible focus, and mono support type.
- Imagen drafts: skipped — the available image-generation tool terminates the active implementation response and cannot supply an iterative mid-build reference in this run.
- Direction selected: **Midnight Evidence Chamber** over a generic analytics dashboard or terminal clone. The memorable moment is an evidence beam that visibly links a claim to its proof and verdict.

## 1. Atmosphere & Identity

ProofStack feels like a precision instrument opened moments before a release: calm, dark, technical, and decisive. Dense evidence is progressively disclosed while the current verdict remains legible at a glance. The signature material is a machined double bezel—an ultraviolet outer rim around a darker inset evidence surface—paired with a thin “evidence beam” that visually connects claim, check, and outcome. This borrows Linear’s luminance hierarchy and compressed display rhythm, then adds ProofStack’s own semantic status ramp and physical proof-chain motif.

Primary users and success criteria:

- **On-call builder under time pressure:** identify the first required failure and its next action in under ten seconds.
- **Keyboard or screen-reader developer:** traverse run summary, claims, evidence, comparison, and repair controls in a logical order without pointer input.
- **Color-vision-deficient reviewer:** distinguish pass, fail, and unknown through labels, symbols, and structure—not hue alone.
- **Motion-sensitive reviewer:** receive the same information with all nonessential motion removed.

Anti-references: neon cyberpunk terminals, generic purple SaaS gradients, flat Bootstrap metric grids, emoji status icons, and dashboards that encode verdict only by color.

## 2. Color

ProofStack is dark-only for the hackathon release. Every component consumes semantic variables; raw color values belong only in the token declaration layer.

| Role | Token | Value | Usage |
|---|---|---:|---|
| Canvas/deep | `--surface-canvas` | `#07080b` | Page background |
| Canvas/glow | `--surface-atmosphere` | `#101122` | Radial atmosphere stop |
| Surface/base | `--surface-base` | `#0d0f14` | App shell and rails |
| Surface/raised | `--surface-raised` | `#141720` | Cards and controls |
| Surface/inset | `--surface-inset` | `#090b10` | Evidence cores and code |
| Surface/hover | `--surface-hover` | `#1a1e2a` | Interactive hover |
| Text/primary | `--text-primary` | `#f4f6fb` | Headlines and essential values |
| Text/secondary | `--text-secondary` | `#b6bdcb` | Body copy |
| Text/muted | `--text-muted` | `#7d8595` | Metadata and hints |
| Rim/subtle | `--rim-subtle` | `rgba(255,255,255,0.07)` | Inset/outer hairlines |
| Rim/strong | `--rim-strong` | `rgba(255,255,255,0.13)` | Focused surface edge |
| Accent/deep | `--accent-deep` | `#4b42a8` | Gradient low stop |
| Accent/primary | `--accent-primary` | `#7c72ff` | Primary interaction and beam |
| Accent/bright | `--accent-bright` | `#a59cff` | Hover/focus high stop |
| Accent/aura | `--accent-aura` | `rgba(124,114,255,0.22)` | Focal ambient light |
| Status/pass | `--status-pass` | `#46d6a0` | Passed verdict |
| Status/pass-soft | `--status-pass-soft` | `rgba(70,214,160,0.14)` | Passed badge background |
| Status/fail | `--status-fail` | `#ff7b8b` | Failed verdict |
| Status/fail-soft | `--status-fail-soft` | `rgba(255,123,139,0.14)` | Failed badge background |
| Status/unknown | `--status-unknown` | `#f4bf63` | Unknown verdict |
| Status/unknown-soft | `--status-unknown-soft` | `rgba(244,191,99,0.14)` | Unknown badge background |
| Focus | `--focus-ring` | `#b7b0ff` | Keyboard focus outline |

Rules:

- Accent violet marks interaction and proof-chain focus only; it is not background decoration.
- Status color always appears with a word label and a distinct SVG glyph or shape.
- Primary text must meet 4.5:1 against every surface; large score text targets 7:1.
- Atmospheric gradients use at least three declared stops and never replace semantic hierarchy.

## 3. Typography

### Font stack

- Display and UI: `Geist Variable`, then `Avenir Next`, then system sans-serif.
- Technical content: `Geist Mono`, then `SFMono-Regular`, then system monospace.
- The dashboard vendors the two Geist variable fonts; demo fixtures may use the fallback stack until the dashboard package exists.

### Scale

| Level | Token | Size | Weight | Line height | Tracking | Usage |
|---|---|---:|---:|---:|---:|---|
| Display | `--type-display` | `clamp(2.75rem, 7vw, 5.5rem)` | 560 | 0.94 | `-0.045em` | Score and hero statement |
| H1 | `--type-h1` | `clamp(2rem, 4vw, 3.5rem)` | 560 | 1.02 | `-0.035em` | Page title |
| H2 | `--type-h2` | `1.75rem` | 560 | 1.15 | `-0.025em` | Section heading |
| H3 | `--type-h3` | `1.125rem` | 560 | 1.3 | `-0.012em` | Card title |
| Lead | `--type-lead` | `1.125rem` | 420 | 1.6 | `-0.01em` | Introductory copy |
| Body | `--type-body` | `1rem` | 420 | 1.55 | `-0.005em` | Default text |
| Small | `--type-small` | `0.875rem` | 460 | 1.5 | `0` | Metadata |
| Label | `--type-label` | `0.75rem` | 560 | 1.35 | `0.08em` | Uppercase labels |
| Mono | `--type-mono` | `0.8125rem` | 450 | 1.55 | `-0.01em` | IDs, paths, evidence |

Rules:

- Numeric scores and durations use tabular figures.
- Body copy never drops below 16px on mobile; metadata never carries primary meaning alone.
- Long IDs wrap with `overflow-wrap:anywhere`; they are never silently clipped.
- Headings remain short and concrete: “2 required claims need repair,” not marketing filler.

## 4. Spacing & Layout

Base unit: **4px**.

| Token | Value | Usage |
|---|---:|---|
| `--space-1` | `4px` | Glyph gaps |
| `--space-2` | `8px` | Inline compact cluster |
| `--space-3` | `12px` | Badge and dense row gap |
| `--space-4` | `16px` | Mobile gutter and compact padding |
| `--space-5` | `20px` | Control padding |
| `--space-6` | `24px` | Card padding |
| `--space-8` | `32px` | Panel spacing |
| `--space-10` | `40px` | Section rhythm |
| `--space-12` | `48px` | Major mobile break |
| `--space-16` | `64px` | Desktop section break |
| `--space-20` | `80px` | Hero breathing room |

Layout rules:

- Product max width: `1440px`; readable copy max: `68ch`.
- Desktop shell: summary header, then an asymmetrical `7fr / 5fr` proof workspace; claim list owns page scroll, not nested card scroll.
- Tablet: summary remains full width; proof workspace becomes `1fr / 1fr` until content forces a stack.
- Mobile at 768px and below: one column, 16px gutter, no rotations or overlap, no primary horizontal scroll.
- Data grids use `minmax(min(18rem, 100%), 1fr)` so long evidence cannot force overflow.
- Validate 375px, 768px, 1280px, 200% zoom, long titles, empty data, and unbroken IDs.

## 5. Components

### Brand Lockup

- **Structure:** inline SVG mark + “ProofStack” wordmark + optional version.
- **States:** default and compact; no interaction unless wrapped in a real link.
- **Accessibility:** decorative mark is hidden when adjacent text supplies the name.

### Action Button

- **Structure:** semantic `button`, text, optional trailing 16px line SVG in a nested circular island.
- **Variants:** primary, secondary, quiet, copy-success.
- **Spacing:** `--space-2`, `--space-3`, `--space-5`; minimum hit target 44px.
- **States:** default, hover, active, focus-visible, disabled, busy, copied.
- **Accessibility:** busy uses `aria-busy`; copied feedback is announced through a polite live region.
- **Motion:** icon translates by at most 2px; active scales to 0.985 using transform only.

### Status Badge

- **Structure:** distinct SVG glyph/shape + uppercase verdict label.
- **Variants:** pass/check, fail/x, unknown/dash.
- **States:** static; selected state belongs to its parent claim control.
- **Accessibility:** visible verdict text is mandatory, so color is never the only signal.

### Score Chamber

- **Structure:** label, large tabular score, completion sentence, concentric SVG meter, run metadata.
- **Variants:** verified, needs-repair, incomplete.
- **States:** loading skeleton, complete, incomplete, empty.
- **Accessibility:** score is plain text before decorative SVG; SVG is `aria-hidden`.
- **Motion:** meter reveal is opacity/transform only and disabled under reduced motion.

### Claim Row

- **Structure:** semantic button containing sequence, title, check count, status badge, weight, and disclosure glyph.
- **States:** default, hover, active, focus-visible, selected, disabled.
- **Layout:** cluster on desktop; wraps title and metadata on narrow screens.
- **Accessibility:** `aria-pressed` identifies selection; title remains the accessible name.

### Evidence Chamber

- **Structure:** double-bezel outer shell, inset header, evidence summary, optional redacted detail, asset preview, timing metadata.
- **Variants:** file, command, HTTP, browser, rules; each keeps the same anatomy.
- **States:** loading, populated, missing asset, error, empty.
- **Accessibility:** evidence detail uses readable text/`pre`; screenshots have concise alt text and explicit dimensions.
- **Layout:** stack; the document owns scrolling.

### Evidence Beam

- **Structure:** decorative SVG path between selected claim and evidence chamber, with one brighter pulse segment.
- **States:** pass, fail, unknown, reduced-motion static.
- **Accessibility:** always `aria-hidden`; it never carries information unavailable in labels.
- **Motion:** one 420ms emphasis transition when claim selection changes; no continuous decorative loop.

### Comparison Strip

- **Structure:** before score, directional glyph, after score, and labeled improved/regressed/unchanged counts.
- **States:** no baseline, improved, regressed, unchanged.
- **Accessibility:** direction is written in text, not inferred from arrow/color.

### Repair Packet

- **Structure:** failed-claim summary, bounded prompt in a selectable `pre`, copy action, safety note.
- **States:** empty/all verified, actionable, copied, copy error.
- **Accessibility:** heading precedes prompt; copy result uses a live region; long text wraps without horizontal page overflow.

### Primitive Showcase

- **Structure:** a development-only route or query state rendering every primitive and required state.
- **Breakpoints:** must be captured at 375px, 768px, and 1280px before product composition is accepted.
- **Stress cases:** long labels, unbroken IDs, empty state, loading, keyboard focus, reduced motion.

## 6. Motion & Interaction

| Token | Duration | Easing | Usage |
|---|---:|---|---|
| `--motion-micro` | `120ms` | `cubic-bezier(.2,.8,.2,1)` | Press and hover feedback |
| `--motion-standard` | `220ms` | `cubic-bezier(.32,.72,0,1)` | Claim/evidence state change |
| `--motion-emphasis` | `420ms` | `cubic-bezier(.16,1,.3,1)` | Score and evidence-beam reveal |

Rules:

- Motion explains selection or verdict change; static decoration does not animate.
- Only `transform`, `opacity`, and tightly bounded `filter` transitions are allowed.
- All interactions remain interruptible and available during animation.
- `prefers-reduced-motion: reduce` removes reveal, pulse, and scale while preserving instant state feedback.
- Focus never depends on animation; `:focus-visible` uses a persistent 2px ring with offset.

## 7. Depth & Surface

Strategy: **constrained mixed depth**—Linear-style luminance stepping for hierarchy plus soft-skill double bezels for focal proof surfaces.

- Page depth comes from canvas → base → raised → inset tonal steps.
- Standard cards use an outer translucent rim and a one-step lighter inner surface; no generic gray border.
- Evidence and score chambers add an inset highlight, one ultraviolet aura, and a broad low-opacity shadow.
- Backdrop blur is reserved for a fixed modal/scrim if one is introduced; scrolling cards never use backdrop blur.
- The atmosphere is a multi-stop radial gradient plus a faint fixed grain generated in CSS. Grain is pointer-inert and below text.
- Z layers: content `0`, sticky controls `10`, scrim `20`, dialog `30`, tooltip `40`.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- Target WCAG 2.2 AA; body contrast at least 4.5:1 and large text/UI glyphs at least 3:1.
- Logical DOM order matches visual order at every breakpoint.
- Every control is reachable and operable by keyboard with visible focus.
- Status is never conveyed by color alone.
- At 200% zoom, primary content stays usable without two-dimensional scrolling.
- Screen-reader flow: run summary → claims → selected evidence → comparison → repair packet.
- Dense evidence uses plain language summaries before technical details to reduce cognitive load.
- Reduced-motion, forced-colors, and increased text size receive functional fallbacks.

### Accepted Debt

| Item | Location | Why accepted | Owner / Exit |
|---|---|---|---|
| Lazyweb reference lane unavailable | Research only | Current anonymous endpoint requires Pro payment; no product behavior is affected | Re-run if access becomes available before final submission |
| Imagen reference draft unavailable | Research only | Current image tool cannot participate mid-build without ending the active implementation turn | Replace with rendered primitive showcase as visual contract before dashboard composition |

