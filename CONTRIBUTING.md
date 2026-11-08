# Contributing

1. Install with `npm ci`.
2. Make a small, focused change. Every component needs a test and an axe accessibility check (`test/components.test.tsx`); colour changes must keep `test/contrast.test.ts` green (WCAG AA).
3. Run `npm run check` (typecheck, lint, tests, build). CI runs the same steps.
4. For visible changes run `npm run screenshots` (needs `npx playwright install chromium-headless-shell` once) and commit the updated `docs/screenshots`. Keep each image under 300 KB and use fictional content only.
5. Note user-facing changes in `CHANGELOG.md`. Do not change exported names or props without a major version (a minor version while below 1.0, called out as breaking).
6. New fonts, icons or images need a licence file next to the asset.

## Releasing

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Build, commit `dist/` on the release commit only (never on `main`) and tag `vX.Y.Z`.
3. Run `npm pack` and attach the tarball to the GitHub release. Consumers pin its sha512 integrity in their lockfile (`npm install` writes it).
