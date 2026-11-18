# Roadmap

Open work for Leoforma, derived from code review and consumer requests (the Leotheca and Leoposta roadmaps name no missing token, component or icon at the time of writing). Items are ordered by impact. Each needs a test, and a component change needs an axe check (see [CONTRIBUTING.md](CONTRIBUTING.md)).

## Open

- [ ] **Dev toolchain advisories.** `npm audit` reports 10 findings in dev dependencies (2 critical in `tinypool` through vitest 3, 8 moderate in `minimatch` through typescript-eslint). Dev only and never shipped; the fix is a vitest 5 and typescript-eslint bump, verified against `npm run check`.
- [ ] **ToastRegion announcements.** Each toast carries `role="status"` or `role="alert"` and is inserted with its content, which some screen readers do not announce; the region itself is a plain landmark. Check with real assistive technology, then consider a pre-existing live region.
- [ ] **Menu typeahead.** The WAI-ARIA menu button pattern recommends type-to-select by first letter; `Menu` has arrows, Home and End only.

## Done

- [x] **Tooltip: a focus-opened tooltip stays open after hover ends** (2026-11-18): a `Tooltip` that keyboard focus opened no longer closes when the pointer hovers the trigger or tooltip and leaves (WCAG 1.4.13, persistent). It stays while the trigger matches `:focus-visible`, read when the pointer leaves so a mouse click that only focuses the trigger does not pin it open; blur and Escape still close it, and after Escape a pointer-opened tooltip closes as a hover tooltip does. Tests: 9 new in `test/components.test.tsx` (3 fail without the fix, verified by stashing the source change; the other 6 guard blur, Escape, click-focus, unrelated focus and a browser that cannot evaluate `:focus-visible`); jsdom answers `:focus-visible` like `:focus`, so the tests stub it. `npm run check` passes with 374 tests (baseline 365). An independent review found no Critical or High issues; its two wording and flag-reset points are applied. Unreleased, see the changelog.
- [x] **Tooltip is hoverable** (2026-11-17): `.ds-tooltip` takes pointer events and an open tooltip survives a 150 ms grace period after the pointer leaves the trigger or the tooltip (WCAG 1.4.13, hoverable). Escape, blur and focus behaviour unchanged. Tests: 10 new (9 in `test/components.test.tsx`, 1 in `test/tooltipStyles.test.ts`), 8 of which fail without the fix (verified by stashing the source change); `npm run check` passes with 365 tests (baseline 355). The persistent part of 1.4.13 for a focus-opened tooltip is split off as an open item. Unreleased, see the changelog.
- [x] **Loading buttons keep focus** (2026-11-16): `Button` and `IconButton` with `loading` stay focusable (`aria-disabled`, not `disabled`). Unreleased, see the changelog.
