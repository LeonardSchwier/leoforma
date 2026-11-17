import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * WCAG 1.4.13 (hoverable): the pointer must be able to move onto a tooltip
 * without it disappearing. `pointer-events: none` on the tooltip would make the
 * hover handlers in `Tooltip.tsx` unreachable in a real browser, and jsdom does
 * not hit-test, so the component tests alone cannot catch it. This test reads
 * the stylesheet instead.
 */
const css = readFileSync(join(__dirname, "../src/styles/components.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

describe("Tooltip styles", () => {
  it("never switch pointer events off on the tooltip", () => {
    const tooltipRules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, selectors]) =>
      selectors!.split(",").some((selector) => /^\.ds-tooltip(-(top|bottom|left|right))?$/.test(selector.trim())),
    );
    expect(tooltipRules.length).toBeGreaterThanOrEqual(5);
    for (const [, selectors, body] of tooltipRules) {
      expect(body, selectors!.trim()).not.toMatch(/pointer-events\s*:\s*none/i);
    }
  });
});
