# 0005. Preact as the only runtime dependency, as a peer

Status: Accepted

## Context

The apps that use Leoforma are written in Preact. A design system that bundles its own copy of Preact would run two copies in one app and break hooks; one that pulls in a utility or icon library enlarges every consumer and its audit surface.

## Decision

`preact` (`>=10.25.0 <12`) is a peer dependency and nothing is listed under `dependencies`. Class names are joined by a three-line helper (`cx.ts`), icons are inline SVG (`icons.tsx`), fonts are bundled files. `test/build.test.ts` fails if built JavaScript imports anything but `preact`, or if CSS references a remote resource.

## Consequences

- Consumers install and audit nothing beyond Preact; CI audits runtime dependencies and has nothing to report.
- Components cannot be used from React or another framework without a compat layer.
- Some small utilities are reimplemented in-repo instead of imported.
- Development tools (vite, vitest, eslint, Playwright, axe-core) are `devDependencies` only; their advisories do not reach the published output (see README, Dependencies and security).
