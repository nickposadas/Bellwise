# Bellwise design rules

> **Superseded 2026-09-16**: the palette and tokens below (navy/teal, Jensen Huang direction) were replaced in a full redesign with an ivory/forest-green/bronze "upscale hospitality" system, implemented across all 7 screens. See the bottom of this document for the current tokens. This section is kept as a record of the reasoning that led to the first pass; the styling itself is out of date — check `website/bellwise.css` for ground truth.

Step 1 of the design workflow: define the rules before touching more screens. This document is the reference for every later step (visual system check, wireframes, refine, implement, verify). Nothing here is final — it's what gets reviewed before F&B and Housekeeping get the same treatment the executive overview already has.

## Style direction

Bellwise is an operations tool a GM triages in under two minutes between meetings, not a site a guest browses. That rules out most of the six styles:

- **Not Christopher Nolan** (motion, unusual scrolling) — an ops dashboard needs to be scanned instantly; interpretive motion costs comprehension speed and adds development work for no operational payoff.
- **Not Zendaya** (editorial, cinematic) — editorial layouts prioritize a single reading path; this tool needs many concurrent signals visible at once (KPIs, reports, queue, brief).
- **Not Virgil Abloh** (one striking element) — a dashboard's job is even-handed information density, not a single focal statement.
- **Not pure Steve Jobs minimalism** — the white-space-first approach would force hiding information a GM actually needs on screen simultaneously.

**Primary: Jensen Huang** — precise grids, restrained styling, product-focused. This is what "reliable and technically capable" looks like to a hotel exec and to the engineers evaluating the platform.
**Secondary, used sparingly: Drew Barrymore warmth** — hospitality is a people business. Warmth shows up in tone (department leader callouts, plain-language copy) and in the teal/human-callout color, not in illustration or soft shapes layered everywhere.

## Typography

- Font: Inter, loaded (not just referenced — this was a real bug, now fixed).
- Body: 16px / 1.5 line-height. Do not go below 14px for anything a human decision depends on (report text, override reasons, audit entries).
- Scale in use today: 1.8rem (page h1) / 1.2rem (modal h2) / 1.02–1.15rem (card/panel h2/h3) / 0.92–0.94rem (body/buttons) / 0.74–0.85rem (labels, pills, metadata).
- Rule going forward: every new text element must map to one of these six sizes. No one-off font-sizes. `rem` gives relative sizing but does not enforce a scale by itself — the discipline is picking from the list above, not just using `rem`.
- Weight: 700–800 for headings and emphasis, 600 for interactive labels (buttons, nav), 400 for body copy.

## Layout & grid

- Desktop content column: max-width 1260px, centered.
- Two structural grids in play, and that's the ceiling — do not introduce a third:
  1. **App shell**: 252px sidebar + fluid content.
  2. **Content grid**: 4-column KPI row; 1.65fr/.75fr two-column layout for "primary work + brief" pages; single column below 900px.
- Spacing scale: 8px increments (8/12/14/16/18/22/28px currently in use). Anything that isn't a multiple of 2px close to this scale is a mistake, not a design choice.
- **Do not force every page into the 3-panel or card layout.** Reports read better as a report — a heading, a leadership-insight callout, metrics, a review-status line — not as another KPI-card grid. Tables (rooms, F&B tasks, audit) stay tables. Match structure to the content, per your note — this is already partially true in the current code (Housekeeping/F&B use tables, Reports uses cards) and should stay that way rather than being homogenized.

## Color

Every color already has one job; this section makes that explicit so it doesn't drift:

| Token | Value | Purpose |
|---|---|---|
| `--ink` | `#102437` | primary text |
| `--muted` | `#637282` | secondary text, metadata |
| `--paper` | `#f4f7f9` | page background |
| `--card` | `#fff` | surface background |
| `--nav` / `--nav2` | `#0b1f33` / `#15304a` | sidebar, dark surfaces |
| `--teal` / `--teal-soft` | `#0f766e` / `#dff6f2` | primary action, "on track," human-insight callouts |
| `--amber` / `--amber-soft` | `#9a6700` / `#fff5d6` | needs attention, pending, over-target |
| `--red` | `#b42318` | overridden, blocked, off-target |
| `--blue` | `#2563eb` | focus rings and links only — never a status color |

Rule: **no new color without a named purpose added to this table.** If a screen needs a status that isn't attention/on-track/blocked, that's a sign the status model needs a decision, not a new hex value.

## Shape

Current radii are inconsistent (8, 9, 10, 12, 13, 16px scattered across components — not a deliberate scale, just accretion). Rounded corners are one styling choice among many, not a substitute for a design system. Going forward, consolidate to three:

- `--radius-sm` (8px): inputs, small buttons, chips
- `--radius` (12px): cards, panels, KPI tiles
- `--radius-lg` (16px): dialogs, the largest surfaces

This is a cleanup to schedule, not urgent — flagging it here so it doesn't get re-introduced as new inconsistency during the F&B/Housekeeping pass.

## Motion

Subtle only, and only to communicate a state change: toast slide-in, button hover/active transitions, dialog open. No entrance animations, no scroll-triggered reveals, nothing decorative. This is an explicit rejection of the Nolan style, not an oversight.

## The missing piece: human insight vs. AI suggestion vs. approved decision

This is the one real gap the current design doesn't solve, and it's central to what Bellwise is supposed to demonstrate — that AI reviews and connects work, but doesn't originate or approve it.

Right now everything defaults to the same visual treatment (a status pill + body text). Proposed distinction:

- **Human insight** (a director's analysis): the existing teal-bordered `.human-callout` treatment — keep it, and use it *only* for this.
- **AI-generated content** (synthesis, flags, the executive brief): needs its own visual marker — not a new color, but a consistent label pattern, e.g. a small "AI synthesis" eyebrow (already exists on the brief box) applied everywhere AI-generated text appears, so it's never visually confused with a human's own words.
- **Approved / overridden decision**: already has one (`.decision` / `.decision.overridden`) — this one's fine as-is.

Action: audit every screen for text that is AI-authored vs. human-authored vs. a recorded decision, and make sure each carries its correct marker. Today the executive brief and department "AI review and checks" text read visually identical to a human's insight callout in places — that's the fix.

## Anti-patterns (explicitly out of scope)

Most of the "professional vs. amateur" checklist you listed targets marketing sites, and importing it wholesale would be wrong for an ops tool. What still applies:

- Descriptive button labels only — no "Read more" anywhere (already true; keep it true as new screens are added).
- Legible text over any imagery (currently no imagery in the app — if any is added later, this applies).
- One clear focal point per screen — for a dashboard this means one primary action per page (already mostly true: "Create report," "Run AI manager review," etc.), not one hero visual.
- Genuine evidence of credibility — for Bellwise this means citing the actual metric or source record behind a recommendation, not a testimonial or trust badge.

What does **not** apply here: hero sections, testimonials, oversized headlines, hero video. None of that belongs in an operational dashboard and none of it should show up in the F&B/Housekeeping redesign.

## Rollout sequence

1. Executive overview — already redesigned and verified against these rules (this document mostly formalizes decisions already made there).
2. Extend to Department Reports, F&B, Housekeeping, Approvals, Audit using the same rules — including the human/AI/decision visual distinction, which those screens don't yet have.
3. Radius consolidation (cosmetic cleanup, low priority, can ride along with step 2).
4. Durable data storage is a separate functional milestone, tracked in START-HERE.md — not part of this visual pass, and its implementation (local-first vs. hosted) should be decided on its own merits, not bundled into the design work.

## Before I touch more code

Per your own workflow, this is the point to react to before I move to wireframes: does the style direction, the color-purpose table, and the human/AI/decision distinction above match what you want carried into F&B and Housekeeping? Anything you'd change here is cheaper to fix now than after I've applied it to four more screens.

---

## Current tokens (2026-09-16 redesign — supersedes everything above)

Palette moved from navy/teal to an ivory-and-forest-green "upscale hospitality" system, verified for contrast (see `website/bellwise.js` and `bellwise.css` for the live implementation):

| Token | Value | Contrast checked |
|---|---|---|
| `--bg` | `#F7F6F2` | — |
| `--surface` | `#FFFFFF` | — |
| `--nav-bg` | `#F0EFEA` | — |
| `--ink` on `--bg` | `#242824` | 13.8:1 |
| `--muted` on `--surface` | `#62685F` | 5.7:1 |
| `--primary` / `--primary-hover` (white text) | `#294D40` / `#203D33` | 9.4:1 / 11.8:1 |
| `--bronze` (large text / icons / decorative only) | `#947448` | 4.3:1 — fails AA for small body text, passes for large text and graphics (3:1) |
| `--success` on soft bg | `#1E7A46` / `#E6F4EC` | 4.7:1 |
| `--warning` on soft bg | `#92650B` / `#FBF0DC` | 4.6:1 |
| `--error` on soft bg | `#A6341E` / `#FBEAE5` | 5.8:1 |

Font: Source Sans 3, self-hosted as two woff2 files under `website/fonts/` (variable font, weights 400–700 in one file per subset) — no runtime dependency on Google Fonts or any CDN. Radii: 7px controls, 12px containers (consolidated, per the "pick a scale" note above). Tabular numerals (`font-variant-numeric: tabular-nums`) on all KPI values and financial/operational table cells.

Structural changes beyond the palette: KPI band is one bordered container split by internal dividers, not four shadowed cards; a computed "Needs attention" table replaced the static approval-queue preview; Front Desk is a new department/screen; all state persists to `localStorage` with an explicit Reset demo data confirmation; approvals now support Approve / Return for revision / Override (previously only Approve/Override).
