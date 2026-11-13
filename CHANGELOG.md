# Changelog

Versions follow [semver](https://semver.org). Release tags are `vMAJOR.MINOR.PATCH`.

## Unreleased

- Fixed: a `ToastRegion` toast with a `duration` paused its timer on hover or focus through one shared flag, so a keyboard user focused on the Dismiss button who moved the mouse over the toast and away resumed the timer, and the toast auto-dismissed with focus still on it (WCAG 2.2.1). Hover and focus now hold the timer independently, and focus moving between controls inside the toast (a link in the message, then Dismiss) counts as staying focused.
- Fixed: opening a `Menu` did not move focus into it in Chromium, so a keyboard or screen reader user stayed on the trigger and the arrow keys did nothing. The menu renders `visibility: hidden` until it is measured and asked for focus in that same pass; browsers refuse `focus()` on a hidden element, jsdom does not, so the old tests passed. Focus now moves once the menu is visible, to the first enabled item (the last for ArrowUp). Re-positioning an open menu (a changed `align`) no longer pulls focus back to an edge item. The new tests emulate the browser rule.
- Fixed: in Windows High Contrast (`forced-colors: active`) a `Switch` was an empty pill whether on or off, a pressed toggle `IconButton` looked unpressed, every `Tabs` tab kept an underline so the selected one could not be told apart, and the selected `SegmentedControl` option differed only by font weight. `components.css` now restates each state in system colors (`Highlight`, `HighlightText`, `CanvasText`, `Canvas`). The pressed `IconButton` and selected `SegmentedControl` option opt out of `forced-color-adjust` (Chromium otherwise paints a Canvas backplate behind text on an author fill, which turns a white label into white on white) and restate their focus ring. Nothing changes outside forced-colors mode. `test/forcedColors.test.ts` requires a forced-colors rule for every state selector in the stylesheet.
- Fixed: `Tabs` and `SegmentedControl` put their single tab stop on the selected item even when it was disabled (or, for `SegmentedControl`, when the value matched nothing and the first option was disabled). A disabled button cannot take focus, so the whole group was unreachable by keyboard. The stop now falls back to the first enabled item and arrow keys start from it.
- Fixed: an open `Menu` stayed open, with nothing to dismiss it but Escape or a click elsewhere, when its `disabled` prop turned true or its `items` became empty. It now closes.
- Fixed: `Input`, `Textarea` and `Select` discarded a host's own `aria-invalid` when no `error` text was set. `error` still wins and forces `aria-invalid="true"`.
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
