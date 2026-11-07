# Leoforma

*forma*, Latin for shape or form. Leoforma is the shared design system and UI library of the Leo apps (Leotheca, Leoposta and others): design tokens as CSS custom properties and JSON, plus thin, accessible Preact components with two themes, Folio and Nordic. Fonts are bundled (each with its licence), so building and using it needs no network.

## Use it from another repository

Install the built tarball of a release tag. Release tags point at a commit that includes the built `dist/`, so the install needs no build step and works offline from the npm cache, on Windows and in sandboxed packagers. The lockfile pins the tarball integrity:

```sh
npm install --save-exact https://codeload.github.com/LeonardSchwier/leoforma/tar.gz/refs/tags/v0.2.0
```

The release also attaches the packed tarball (`npm pack` output), which is byte-stable for a given tag. Pin its sha512 integrity in the consumer lockfile:

```sh
npm install --save-exact https://github.com/LeonardSchwier/leoforma/releases/download/v0.2.0/leonardschwier-leoforma-0.2.0.tgz
```

```ts
import { Button } from "@leonardschwier/leoforma";
import "@leonardschwier/leoforma/styles.css"; // tokens, fonts, component styles
```

Other entry points: `/tokens`, `/tokens.json`, `/tokens.css`, `/fonts.css`, `/components.css`. `preact` is a peer dependency. The package is not published to npm.

## Components

Button, IconButton, Spinner, SegmentedControl, Tabs, Menu, Tooltip, Dialog, ToastRegion, form fields, Badge, Card, plus:

- `Sheet`: a modal panel anchored to the bottom edge. It wraps `Dialog`, so it shares focus trapping, Escape and backdrop dismissal, scroll lock and overlay stacking, and adds a visible close button (`showCloseButton`, label `closeLabel`).
- `EmptyState`: a labelled region with title, description, decorative icon and at most one `primaryAction` and one `secondaryAction`; `size` is `sm` or `md`.
- `StatusIndicator`: short status text with variant `neutral`, `progress`, `success`, `warning` or `danger`. The text is always shown. `live` is `off`, `polite` (role status) or `assertive` (role alert).
- `Icon` and `ICON_NAMES`: a typed set of 28 inline SVG icons on a 24 by 24 canvas that follow `currentColor`. An icon is `aria-hidden` unless it gets a `title`, which makes it an image with that name.

## Develop

```sh
npm ci
npm run check   # tsc, eslint, vitest, build
```

`npm run build` writes `dist/` (gitignored): `index.js` and types, `tokens.css`, `tokens.json`, `fonts.css`, `components.css`, `styles.css`, and the font files with their licences. `npm install` from a git branch or commit runs the build through the `prepare` script; release tags (v0.1.1 and later) ship `dist/` instead, committed only on the tagged commit, never on main.

## Rules

- Tokens and components change here first; apps consume a tagged release. Do not fork component code into an app.
- Every component needs a test and an axe accessibility check. Contrast ratios are tested (WCAG AA).
- New fonts, icons or images need a licence file in `src/fonts` or next to the asset before they are merged.
- Licence: MIT (see `LICENSE`); fonts keep their own open licences.
