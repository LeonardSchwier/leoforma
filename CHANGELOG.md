# Changelog

Versions follow [semver](https://semver.org). Release tags are `vMAJOR.MINOR.PATCH`.

## Unreleased

- Fixed: `IconButton` rendered `aria-pressed="false"` when `active` was not passed, so every icon button was announced as a toggle. `aria-pressed` is now only rendered when `active` is a boolean. A host that relied on the old attribute for a non-toggle button should pass `active={false}`, or better, drop it. A toggle that passes `active={maybeUndefined}` loses `aria-pressed` until the value is a boolean.
- Fixed: the `Dialog` and `Sheet` focus trap counted `tabindex="-1"` options (inactive `Tabs` and `SegmentedControl` items), hidden inputs and `hidden`, `inert` or `aria-hidden` subtrees as tab stops, so Tab could leave the dialog; Shift+Tab from the dialog surface could too.
- Fixed: Escape on an open `Menu` inside a `Dialog` or `Sheet` closed the whole dialog. The menu now closes first and the next Escape closes the dialog. `Menu` now stops the Escape event it handles, so a host's own `document` Escape listener no longer sees that press either. The dialog only defers to Leoforma's `Menu`, never to a foreign `role="menu"`.

## 0.2.0

- Added `Sheet`, `StatusIndicator`, a typed `Icon` set and bounded `EmptyState` actions.
- The release attaches the `npm pack` tarball.

## 0.1.1

- Documented the tarball install of release tags.

## 0.1.0

- Initial import of the Leo design system as Leoforma: tokens, Folio and Nordic themes, Preact components.
