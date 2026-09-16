# Bellwise

A working prototype of Bellwise, a subscription hotel-operations platform. This is a demo, not a production system: it uses synthetic hotel data and simulated AI review, with no live PMS/POS connections, no backend, and no real authentication.

See [START-HERE.md](START-HERE.md) for a full breakdown of what's implemented vs. not, and [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) for the visual design tokens and reasoning.

## Run it locally

No build step, no dependencies, no package installation.

**Option A — open directly:**
Open `website/index.html` in any modern browser.

**Option B — local server** (recommended, avoids any browser file:// quirks):
```bash
python3 -m http.server 8000 --directory website
```
Then open http://localhost:8000.

## What it does

Seven connected screens — Executive overview, Department reports, Front Desk, Food & Beverage, Housekeeping, Approval queue, and Audit history — covering report creation/review, a housekeeping room-status workflow with mandatory human inspection, F&B task management, an approval queue (approve / return for revision / override), and a full audit trail with CSV export.

All demo state (reports, tasks, rooms, guest requests, approvals, audit log) is saved to your browser's `localStorage` under the key `bellwise-demo-v1`, so refreshing the page does not lose your changes. This is **per-browser storage only** — nothing is shared between devices, users, or browsers. Use the "Demo mode" button in the top bar to reset it back to the original sample data at any time.

## Hosting a public copy

This is a fully static site (HTML/CSS/vanilla JS, self-hosted fonts, no server-side code), so any static host works. **GitHub Pages** is the simplest option that preserves every feature, including file downloads (a sandboxed preview like a Claude Artifact blocks `<a download>` links, which would silently break the "download report" and "export audit CSV" buttons — a real static host does not have that restriction):

1. On GitHub, go to this repo's **Settings → Pages**.
2. Under "Build and deployment", set **Source** to "Deploy from a branch".
3. Set **Branch** to `main` and the folder to `/website` (or `/root` if you move the site files to the repo root — GitHub Pages doesn't support a `/website` subfolder directly, so see the note below).
4. Save. GitHub will publish at `https://<username>.github.io/bellwise/` within a few minutes.

**Note:** GitHub Pages only serves from the repo root or a `/docs` folder, not an arbitrary subfolder like `/website`. To publish via Pages without restructuring the repo, either:
- add a minimal `index.html` redirect at the repo root that forwards to `/website/index.html`, or
- configure Pages to serve from a `gh-pages` branch built from the `website/` folder's contents, or
- rename/copy `website/` to `docs/` and point Pages at `/docs`.

Any other static host (Netlify, Vercel, Cloudflare Pages, a plain S3 bucket) works the same way — just point it at the `website/` folder as the publish directory.

## Project structure

```
website/           the actual application (this is what you deploy)
  index.html       page shell, navigation, dialogs
  bellwise.css     design tokens and layout
  bellwise.js      data, persistence, rendering, event handling
  fonts/           self-hosted Source Sans 3 (no external font CDN at runtime)
START-HERE.md      implemented-vs-planned breakdown, file notes, changelog
DESIGN-SYSTEM.md   design tokens, contrast verification, style rationale
```
