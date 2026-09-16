# Bellwise — reviewer briefing

## The idea, in one breath

Hotels run reservations, housekeeping, food & beverage, marketing, finance, and staffing as separate systems. Each department knows its own numbers, but assembling a cross-department picture is manual work. Bellwise pulls department reports into one place, has an AI review them for consistency and flag conflicts, and hands executives a combined briefing — while every actual decision is still made and signed off by a human. It doesn't replace a department director's judgment; it removes the busywork of assembling and cross-checking reports.

## What's actually built (be precise about this)

**Real:** A fully working, clickable prototype of the user experience — seven connected screens (executive overview, department reports, front desk, food & beverage, housekeeping, approvals, audit history) with real interaction logic: creating and reviewing reports, a housekeeping room-status workflow that requires human inspection before a room can be marked ready, an approval queue where a manager can approve, return something for revision, or override a recommendation with a required written reason, and a full audit trail with CSV export. This is the demonstrable shape of the product — how department leaders and executives would actually use it, and how human approval stays central.

**Simulated, not real:**
- The "AI" in this demo is a deterministic template, not a live model — it stands in for what an AI review would produce so the workflow (review → flag → human decision → audit) could be designed and tested first.
- No connection to any real hotel system (no PMS, no POS).
- No backend database — demo data is saved to the browser's local storage only, per device, not shared or synchronized.
- No real user authentication or enforced permissions — the role selector is a view switch for the demo, not a security control.
- Nothing is deployed for other people to use live.

## Business model

Subscription software: the integrations, updates, and support are the product — not access to an AI model by itself.

## What's next (the actual roadmap)

A real vertical slice: import sample housekeeping and F&B data (CSV first), validate it, store it in a real local database, generate an evidence-backed report using an actual local open-weight model, and keep the same human-approval and audit steps already working in this demo. Cloud hotel systems (PMS/POS) will still need real internet connections even with a local model — "local AI" doesn't mean the whole system runs offline.

## Anticipated questions

- **Is the AI real?** No — see above. That's intentional: the workflow around human review and override was worth designing and testing before committing to a specific model.
- **How does data get in?** Not built yet. Planned: approved API connections or controlled CSV imports, read-only to start.
- **Why would a hotel switch to this?** Less manual report-assembly work, plus a documented trail of who decided what and why.
- **What stops the AI from just deciding things?** By design, nothing it produces executes automatically — every recommendation sits in a human approval queue, and every decision (approve, revise, override) is logged with an actor, a timestamp, and a reason.

## Links

- Code: https://github.com/nickposadas/Bellwise (private)
- Run it: open `website/index.html`, or `python3 -m http.server 8000 --directory website`
- Full detail: see `START-HERE.md` (implemented vs. planned) and `DESIGN-SYSTEM.md` (design tokens and rationale) in this repo
