# Bellwise design principles & system

One reference file covering both the general design methodology used on this project and Bellwise's actual, currently-implemented design system. Meant to be handed to a fresh chat as full context — read Part 2 first if you just need the working tokens; read Part 1 for the reasoning behind them.

---

## Part 1 — General design methodology (reusable, not Bellwise-specific)

### Six web design styles (a reference framework, not a universal taxonomy)

| Style nickname | Main characteristics | Intended impression |
|---|---|---|
| Steve Jobs | Minimal elements, white space, systematic typography | Clean and refined |
| Jensen Huang | Precise grids, restrained styling, product focus | Reliable and technically capable |
| Drew Barrymore | Warm colors, approachable imagery, softer shapes | Friendly and welcoming |
| Zendaya | Editorial layouts, distinctive typography, cinematic imagery | Tasteful and fashionable |
| Virgil Abloh | One striking visual element used intentionally | Memorable and distinctive |
| Christopher Nolan | Motion, immersive interactions, unusual scrolling | Dramatic and experiential |

Notes:
- Choose a style based on the audience and purpose, not personal taste.
- White space can be intentional; empty space doesn't automatically need decoration.
- A single distinctive element can establish identity on its own.
- Complex animation adds real design and development work — don't reach for it by default.

### Five foundational design skills

- **Typography**: choose fonts deliberately; set consistent sizes, weights, spacing, line heights. Starting point: ~16px body text, ~1.5 line height.
- **Layout**: use a grid, consistent spacing, and visual hierarchy. Starting point: 12 desktop columns, 8px spacing increments. These are starting points, not mandatory formulas — `rem` gives relative sizing but does not by itself create a type scale; that discipline still has to be chosen and enforced.
- **Color**: give every color a purpose. Use a restrained palette, reserve accents for emphasis, and check contrast — don't assume a combination is accessible.
- **Coding**: understand what HTML (structure), CSS (appearance), and JavaScript (interaction) each actually do. Adapt existing solutions with an understanding of how they work, rather than copy-pasting blind.
- **Action**: design around what the user needs to accomplish. Attractive visuals alone don't guarantee a successful experience.

### Professional vs. amateur design — the recurring fixes

- Establish one clear focal point per screen.
- Keep navigation and logos from competing with the primary content.
- Give important text sufficient space.
- Explain the audience, benefit, and next action clearly.
- Use consistent icons and button treatments.
- Keep text legible over any imagery.
- Preserve the strong parts of an existing design rather than discarding them wholesale.
- Borrow selected principles from references and adapt them to the actual business — never copy another company's branding outright.
- Use descriptive action labels ("Return for revision"), never vague ones ("Read more").
- Include genuine evidence of credibility when available.

**Important caveat**: most of this checklist targets marketing websites. Oversized headlines, testimonials, and hero videos should not automatically carry over into an operational dashboard — a tool people use to get work done needs density and speed of scanning, not a hero section.

### Designing-with-Claude workflow

1. **Define the design rules** — document colors, typography, spacing, shapes, components, and constraints in a design document (this file, for Bellwise).
2. **Inspect the visual system** — review how those choices look together before applying them everywhere.
3. **Create wireframes** — decide where information and controls belong before investing in detailed styling.
4. **Refine selected screens** — give specific feedback tied to particular elements; group related corrections together.
5. **Implement the design** — carry the agreed structure and styles into the working code.
6. **Check the result** — compare implementation against the design; test different screen sizes and interactions.
7. **Add persistence** — working buttons alone don't mean records survive refreshes or restarts.
8. **Deploy after verification.**

Additional lessons: specific references reduce guesswork. Consistency requires checking — a design document cannot guarantee it by existing. Use subtle motion only to communicate state changes. Written skills provide instructions; connected tools provide the ability to act. Generated code still needs review, including permissions and data handling.

---

## Part 2 — Bellwise's current design system (as implemented)

### Style direction chosen, and why

Bellwise is an operations tool a GM triages in minutes between meetings, not a site a guest browses — that rules out most of the six styles above. Reference points actually used: **Linear** (alignment and information hierarchy), **Airbnb** (component consistency), and the **restrained tone of upscale hospitality** (Aman, Mews) — translated into an original identity, not copied branding.

- **Not Christopher Nolan** — motion and unusual scrolling cost comprehension speed for no operational payoff here.
- **Not Zendaya** — editorial layouts prioritize one reading path; this tool needs many concurrent signals visible at once.
- **Not Virgil Abloh** — a dashboard needs even-handed information density, not one dominant visual statement.
- **Not pure Steve Jobs minimalism** — a GM needs density, not white space, when triaging five-plus departments at a glance.
- **Closest to Jensen Huang** (precise grids, restrained styling, product-credible), with **Drew Barrymore warmth used sparingly** — in tone and a few callout treatments, never in decoration.

### Design tokens (contrast-verified, not assumed)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#F7F6F2` | Page background |
| `--surface` | `#FFFFFF` | Card/panel surfaces |
| `--nav-bg` | `#F0EFEA` | Quiet sidebar/nav background |
| `--nav-selected` | `#E6ECE6` | Selected nav item |
| `--ink` | `#242824` | Primary text — 13.8:1 on `--bg`, 15:1 on white |
| `--muted` | `#62685F` | Secondary text — 5.7:1 on white, 5.3:1 on `--bg` (both pass AA) |
| `--line` | `#E2E3DC` | Dividers |
| `--primary` / `--primary-hover` | `#294D40` / `#203D33` | Primary action (white text: 9.4:1 / 11.8:1) |
| `--bronze` | `#947448` | Restrained accent **only** — 4.3:1 on white, which **fails AA for small body text** but passes for large text and icons/graphics (3:1 threshold). Never use for pills, labels, or small copy. |
| `--success` / `--success-soft` | `#1E7A46` / `#E6F4EC` | 4.7:1 |
| `--warning` / `--warning-soft` | `#92650B` / `#FBF0DC` | 4.6:1 |
| `--error` / `--error-soft` | `#A6341E` / `#FBEAE5` | 5.8:1 |
| `--focus-ring` | `#1D4ED8` | Keyboard focus only, never a status color |

Rule: no new color without a named purpose in this table. Status colors are always paired with a text label, never color alone.

### Typography

Source Sans 3, **self-hosted** as two woff2 files (variable font, weights 400–700 in one file per subset — no Google Fonts or other CDN request at runtime). Body 16px/1.5. Tabular numerals (`font-variant-numeric: tabular-nums`) on every KPI value and financial/operational table cell. Fallback stack: `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`.

### Layout & shape

- App shell: ~240px quiet sidebar + fluid content, max-width ~1180px.
- **KPI band is one bordered container split by internal dividers, not four separate shadowed cards** — this is a deliberate rejection of "put everything in its own card."
- Panels use whitespace and dividers internally rather than nesting more cards.
- Tables for room lists and task lists; report-style layout (heading + insight callout + metrics + review status) for department analysis — match structure to content, don't force one pattern everywhere.
- Radii: ~7px controls, ~12px major containers — a deliberate two-step scale, not scattered ad-hoc values.
- Shadows reserved for overlays (dialogs) only.
- Motion: subtle only, and only to communicate a state change (toast, hover, dialog open). No decorative or scroll-triggered animation. Respect `prefers-reduced-motion`.

### The one structural pattern worth naming: "Needs attention"

A computed table (Issue / Department / Owner / Status / Action) built from live data — flagged reports and blocked approvals — not a hand-maintained list. It shrinks automatically as items get acknowledged or verified. This is the pattern for surfacing "what needs a human decision" anywhere in the app, rather than a static preview list.

### Distinguishing human insight, AI output, and recorded decisions

This is the one design problem specific to what Bellwise claims to be — that AI reviews and connects work but doesn't originate or approve it — and it needed its own visual language, not just color:

- **Human insight** (a director's own analysis): solid left-border callout (`--primary`), labeled "Director's analysis" or similar.
- **AI-generated content** (synthesis, review notes): a visually distinct treatment — dashed border, neutral/slate background, labeled "AI synthesis · simulated" — never allowed to look like the human callout.
- **Recorded decision** (approved / returned for revision / overridden): a status pill + a decision line naming the actor, and for revision/override, a required reason.

### Anti-patterns rejected here

No hero sections, testimonials, oversized headlines, or hero video — none of that belongs in an operational dashboard. No neon accents, gradients, glass effects, oversized pills, "AI sparkle" decoration, or excessive animation. No vague CTAs ("Read more") — every action label states what it does.

### Accessibility & responsiveness baseline

Visible keyboard focus (`:focus-visible` outline, not suppressed), labeled form fields, accessible dialogs (`aria-labelledby`), `prefers-reduced-motion` support, no page-level horizontal overflow at any width (checked at 375/768/1440px — internal `overflow-x: auto` on wide tables is fine, the page body scrolling sideways is not).

### Technical honesty constraints (always true, restate when unsure)

Sample data and simulated AI must stay clearly labeled everywhere they appear. Never imply live PMS/POS connections, real authentication, enforced backend permissions, or a deployed local AI model exist — none of them do yet. The role selector is a demo view switch, not a security control.

---

## Part 3 — Status

Implemented and verified in-browser (see `START-HERE.md` for the full acceptance-check list): all 7 screens, the full data/design token system above, `localStorage` persistence with an explicit reset action, and the human/AI/decision visual distinction. Not yet done: real AI, real integrations, a real backend, real auth — tracked as the next functional milestone in `START-HERE.md`, deliberately kept separate from this visual/UX work.
