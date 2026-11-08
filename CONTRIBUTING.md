# Contributing

## Set up

```sh
git clone https://github.com/LeonardSchwier/leoforma && cd leoforma && npm ci && npm run check
```

`npm run check` runs typecheck, lint, tests, the props docs check and the build, exactly as CI does. Node 20 or newer. Screenshots additionally need `npx playwright install chromium-headless-shell` once.

## Layout and naming

| Path | Content | Naming |
| --- | --- | --- |
| `src/components/` | Components and their helpers | Component files `PascalCase.tsx` (a file may group related components, like `fields.tsx`, `surfaces.tsx`: lower camel case); helpers `camelCase.ts` |
| `src/tokens/` | Token source and contrast maths | lower camel case |
| `src/styles/` | Hand-written CSS | lower case |
| `test/` | Tests and helpers | `*.test.ts(x)`, helpers camel case |
| `site/` | Gallery page the screenshots are taken from | as in `src` |
| `scripts/` | Build, docs and screenshot scripts | `kebab-case.mjs` |
| `docs/` | Documentation | `kebab-case.md`, screenshots `<component>-light.png`, `<component>-dark.png` |
| CSS classes and variables | | `ds-` prefix, `--ds-<group>-<key>` |

Editor settings are in `.editorconfig`.

## Add a component

1. Tokens: use existing roles and scales (`var(--ds-*)`). A new colour role goes in `ColorRoles` and both themes in `src/tokens/index.ts`, plus its pairs in `test/contrast.test.ts`. No literal colours in CSS.
2. Implement in `src/components/<Name>.tsx` with a typed `<Name>Props` interface. Document props with `/** */` comments (they appear in the docs). Make accessible names required in the type where a control would have none. Add styles to `src/styles/components.css` using `ds-` classes.
3. Export it from `src/index.ts`. Do not rename or remove existing exports.
4. Test: a `describe` block in `test/components.test.tsx` for behaviour and keyboard handling.
5. Axe test: call `expectNoAxeViolations` (`test/axeCheck.ts`) in that block. If it uses fake timers, call `vi.useRealTimers()` before axe.
6. Docs: add the component and a `<!-- props:<Name>Props --><!-- /props -->` marker to the right page in `docs/components/` (or a new group page listed in `docs/components/README.md`), with accessibility notes. Run `npm run docs`.
7. Screenshot: add a demo to `site/main.tsx`, list it in `scripts/screenshots.mjs`, run `npm run screenshots`, commit the images (under 300 KB each, fictional content only) and link them from the component page and the README gallery.
8. Add a line to `CHANGELOG.md`; run `npm run check`.

## Other rules

- Keep changes small and focused. Do not change exported names or props without a major version (a minor version while below 1.0, called out as breaking).
- Colour changes must keep `test/contrast.test.ts` green (WCAG AA).
- New fonts, icons or images need a licence file next to the asset.
- A decision that is hard to reverse gets an ADR in `docs/adr/`.

## Releasing

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Build, commit `dist/` on the release commit only (never on `main`) and tag `vX.Y.Z`.
3. Run `npm pack` and attach the tarball to the GitHub release.
4. Record the tarball's sha512 and sha256 in `docs/releases.md` (commands are on that page). Consumers pin the sha512 integrity in their lockfile (`npm install` writes it).
