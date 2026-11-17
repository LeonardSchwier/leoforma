# Roadmap

Open work for Leoforma, derived from code review and consumer requests (the Leotheca and Leoposta roadmaps name no missing token, component or icon at the time of writing). Items are ordered by impact. Each needs a test, and a component change needs an axe check (see [CONTRIBUTING.md](CONTRIBUTING.md)).

## Open

- [ ] **Tooltip: keep a focus-opened tooltip open after hover ends (WCAG 1.4.13, persistent).** A tooltip opened by keyboard focus closes 150 ms after the pointer hovers the trigger or tooltip and leaves, though focus is still on the trigger. Keep it open while the trigger has keyboard focus (`:focus-visible`), without making a mouse click leave a sticky tooltip.
- [ ] **Dev toolchain advisories.** `npm audit` reports 10 findings in dev dependencies (2 critical in `tinypool` through vitest 3, 8 moderate in `minimatch` through typescript-eslint). Dev only and never shipped; the fix is a vitest 5 and typescript-eslint bump, verified against `npm run check`.
- [ ] **ToastRegion announcements.** Each toast carries `role="status"` or `role="alert"` and is inserted with its content, which some screen readers do not announce; the region itself is a plain landmark. Check with real assistive technology, then consider a pre-existing live region.
- [ ] **Menu typeahead.** The WAI-ARIA menu button pattern recommends type-to-select by first letter; `Menu` has arrows, Home and End only.

## Done

- [x] **Tooltip is hoverable** (2026-11-17): `.ds-tooltip` takes pointer events and an open tooltip survives a 150 ms grace period after the pointer leaves the trigger or the tooltip (WCAG 1.4.13, hoverable). Escape, blur and focus behaviour unchanged. Tests: 10 new (9 in `test/components.test.tsx`, 1 in `test/tooltipStyles.test.ts`), 8 of which fail without the fix (verified by stashing the source change); `npm run check` passes with 365 tests (baseline 355). The persistent part of 1.4.13 for a focus-opened tooltip is split off as an open item. Unreleased, see the changelog.
- [x] **Loading buttons keep focus** (2026-11-16): `Button` and `IconButton` with `loading` stay focusable (`aria-disabled`, not `disabled`). Unreleased, see the changelog.
