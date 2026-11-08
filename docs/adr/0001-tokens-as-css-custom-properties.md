# 0001. Tokens as CSS custom properties, generated from one module

Status: Accepted

## Context

Several apps share one visual language. Colours, spacing and type were previously defined next to each app. A shared language needs one source that both CSS and tools (design tooling, scripts, native shells) can read, and it must stay in sync without manual copying. The repository started as an import of the shared design system (commit `7a14027`).

## Decision

Tokens are plain TypeScript objects in `src/tokens/index.ts`. `scripts/build.mjs` imports the compiled module and writes `dist/tokens.css` (custom properties named `--ds-<group>-<key>`) and `dist/tokens.json`. Components and stylesheets use only semantic colour roles through `var(--ds-*)`.

## Consequences

- One edit changes CSS, JSON and TypeScript consumers; `test/build.test.ts` fails if the formats disagree.
- Themes switch at runtime through the cascade, with no JavaScript (see ADR 0002).
- Typed access (`colorVar`, `tokens`) exists for code that needs a reference.
- The generated files are build output, so `dist/` is gitignored on `main`; consumers use a release (ADR 0003).
- Custom properties need a modern browser; there is no fallback for browsers without them.
