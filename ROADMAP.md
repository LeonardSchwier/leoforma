# Roadmap

Open work for Leoforma, derived from code review and consumer requests (the Leotheca and Leoposta roadmaps name no missing token, component or icon at the time of writing). Items are ordered by impact. Each needs a test, and a component change needs an axe check (see [CONTRIBUTING.md](CONTRIBUTING.md)).

## Open

- [ ] **Tooltip: make it hoverable (WCAG 1.4.13).** `.ds-tooltip` has `pointer-events: none` and the tooltip closes the moment the pointer leaves the trigger, so the pointer cannot move onto it. Allow the pointer onto the tooltip with a short grace timer across the gap, keep Escape and blur dismissal, test with fake timers. Until then `docs/components/overlays.md` says only the dismissible part is met.
- [ ] **Dev toolchain advisories.** `npm audit` reports 10 findings in dev dependencies (2 critical in `tinypool` through vitest 3, 8 moderate in `minimatch` through typescript-eslint). Dev only and never shipped; the fix is a vitest 5 and typescript-eslint bump, verified against `npm run check`.
- [ ] **ToastRegion announcements.** Each toast carries `role="status"` or `role="alert"` and is inserted with its content, which some screen readers do not announce; the region itself is a plain landmark. Check with real assistive technology, then consider a pre-existing live region.
- [ ] **Menu typeahead.** The WAI-ARIA menu button pattern recommends type-to-select by first letter; `Menu` has arrows, Home and End only.

## Done

- [x] **Loading buttons keep focus** (2026-11-16): `Button` and `IconButton` with `loading` stay focusable (`aria-disabled`, not `disabled`). Unreleased, see the changelog.
