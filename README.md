# Leoforma

*forma*, Latin for shape or form. Leoforma is the shared design system and UI library of the Leo apps (Leotheca, Leoposta and others): design tokens as CSS custom properties and JSON, plus thin, accessible Preact components with two themes, Folio and Nordic. Fonts are bundled (each with its licence), so building and using it needs no network.

## Use it from another repository

Install the built tarball of a release tag. Release tags point at a commit that includes the built `dist/`, so the install needs no build step and works offline from the npm cache, on Windows and in sandboxed packagers. The lockfile pins the tarball integrity:

```sh
npm install --save-exact https://codeload.github.com/LeonardSchwier/leoforma/tar.gz/refs/tags/v0.1.1
```

```ts
import { Button } from "@leonardschwier/leoforma";
import "@leonardschwier/leoforma/styles.css"; // tokens, fonts, component styles
```

Other entry points: `/tokens`, `/tokens.json`, `/tokens.css`, `/fonts.css`, `/components.css`. `preact` is a peer dependency. The package is not published to npm.

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
