# 0002. Mode and palette through data attributes

Status: Accepted

## Context

The library ships two themes, Folio (default) and Nordic, each in light and dark. Apps must follow the operating system by default, let the user override it, and switch themes without re-rendering or loading extra CSS.

## Decision

The generated `tokens.css` contains, for every theme, a light block, a `prefers-color-scheme: dark` block guarded by `:not([data-theme="light"])`, and a forced `[data-theme="dark"]` block. The default theme sits on `:root`; other themes add `[data-palette="<name>"]` (see `renderTokensCss` in `scripts/build.mjs`). `data-theme` selects the mode, `data-palette` selects the theme.

## Consequences

- Switching is one `setAttribute` call on `<html>`; both attributes are independent.
- Absent attributes mean sensible defaults (OS mode, Folio).
- Adding a theme means adding an entry to `themes` in `src/tokens/index.ts`; the build emits its blocks and `test/contrast.test.ts` covers it automatically because it iterates over all themes.
- All themes' values are in one stylesheet, so unused themes cost bytes. Accepted because the token file is small.
- Specificity is by attribute selector, so an app overriding a role must match or exceed it.
