# 0004. An axe-core test per component, and contrast as a failing test

Status: Accepted

## Context

Accessibility claims in a design system are cheap to make and easy to regress. Two things cannot be left to review: structural problems (missing names, wrong roles) and colour contrast of the tokens.

## Decision

Each component group in `test/components.test.tsx` renders its variants and runs `expectNoAxeViolations` (`test/axeCheck.ts`) in jsdom. Because axe cannot compute contrast without layout, `test/contrast.test.ts` instead computes WCAG ratios for every text, accent, focus and border pair of every theme in both modes, using `src/tokens/contrast.ts`, and requires 4.5:1 for text and 3:1 for focus rings and control borders. Adding a component requires both a behaviour test and an axe test (see `CONTRIBUTING.md`).

## Consequences

- A token edit that breaks AA contrast fails the build before it ships.
- Component markup regressions that axe can detect fail in CI.
- axe covers only part of WCAG, and jsdom has no layout. Screen reader behaviour and visual focus order are not tested automatically; this is stated in the docs.
- Overlay tests that use fake timers must switch to real timers before calling axe, because axe schedules its own timers.
- The contrast pair list is maintained by hand in `test/contrast.test.ts`; a new colour role needs a new pair.
