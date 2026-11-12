# Design principles

Each principle names the place in the repository where it is enforced, so it can be checked and not just believed.

## Tokens first

Every visual decision (colour, space, radius, type, motion, stacking) is a token in [`src/tokens/index.ts`](../src/tokens/index.ts). `scripts/build.mjs` generates `tokens.css` and `tokens.json` from that one module, and [`test/build.test.ts`](../test/build.test.ts) checks that both agree. Components read semantic roles such as `--ds-color-accent`, not literal values, so changing a theme or adding one touches no component. See [ADR 0001](adr/0001-tokens-as-css-custom-properties.md).

## Accessibility by default

- Every component is covered by an axe-core test ([`test/axeCheck.ts`](../test/axeCheck.ts), used in [`test/components.test.tsx`](../test/components.test.tsx)). See [ADR 0004](adr/0004-axe-check-per-component.md).
- axe cannot compute colour contrast in jsdom, so [`test/contrast.test.ts`](../test/contrast.test.ts) checks every text, accent and focus pair of both themes in light and dark against WCAG 2.1 AA.
- Names are required in the type where a control would otherwise have none: `IconButton.label`, `Tabs.label`, `Menu.label`, `SegmentedControl.label`, `Dialog.title`, `Input.label`.
- Keyboard behaviour follows the WAI-ARIA patterns (roving focus in tabs and segmented controls, arrow keys in menus, focus trap and Escape in dialogs).
- Status is never colour alone: `StatusIndicator` always shows text.
- Motion collapses to 1ms under `prefers-reduced-motion`.
- Selected, checked and pressed states survive forced-colors mode (Windows High Contrast), where background fills disappear: [`test/forcedColors.test.ts`](../test/forcedColors.test.ts) fails when a state selector in `components.css` has no `forced-colors` counterpart.

axe finds a subset of problems. Passing it is not a claim of full WCAG conformance; screen reader behaviour has not been tested manually in this repository.

## Few moving parts at runtime

The only runtime dependency is the `preact` peer dependency. `package.json` has no `dependencies`, and `test/build.test.ts` fails if `dist/` imports anything else or references a remote URL. Fonts and icons are bundled, so the library works offline.

## Theming through an attribute

Mode and palette are chosen by `data-theme` and `data-palette` on the root element and resolved by the CSS cascade. No provider component, no JavaScript, no flash while a runtime loads. See [ADR 0002](adr/0002-palette-via-data-attribute.md).

## Thin components

A component sets semantics and state and leaves looks to CSS. Props mirror native HTML where possible (`Button` and `Input` accept the native attributes), and behaviour that is shared (overlay stacking, scroll lock, roving focus) lives in small modules instead of being copied.

## Verifiable releases

A release is a tag plus a tarball whose sha512 integrity hash is published, so a consumer can prove what they installed. See [ADR 0003](adr/0003-release-as-tarball-with-integrity-hash.md) and [releases](releases.md).

## Honest documentation

Claims in the README link to the file or test that backs them. Where something is not covered (manual screen reader testing, dev-toolchain advisories), the docs say so.
