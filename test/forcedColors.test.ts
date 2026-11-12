import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Windows High Contrast (forced-colors) replaces every author color with a
 * system color and drops background images and shadows. A state that is only
 * shown by a background fill disappears: a Switch is an empty pill whether on or
 * off, a pressed toggle looks like an unpressed one, and every tab keeps an
 * underline. jsdom cannot render forced colors, so this test reads the
 * stylesheet and requires an explicit `forced-colors: active` rule, written with
 * system colors (which the browser keeps), for each state selector.
 */

const css = readFileSync(join(__dirname, "../src/styles/components.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

interface Rule {
  selectors: string[];
  declarations: Map<string, string>;
}

const normalize = (selector: string) => selector.replace(/\s+/g, " ").trim();

function parseRules(block: string): Rule[] {
  const rules: Rule[] = [];
  for (const match of block.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const declarations = new Map<string, string>();
    for (const declaration of match[2]!.split(";")) {
      const colon = declaration.indexOf(":");
      if (colon < 0) continue;
      declarations.set(
        declaration.slice(0, colon).trim().toLowerCase(),
        declaration.slice(colon + 1).trim(),
      );
    }
    rules.push({
      selectors: match[1]!.split(",").map(normalize),
      declarations,
    });
  }
  return rules;
}

/** The body of each `@media (forced-colors: active)` block, by brace matching. */
function mediaBlocks(source: string, query: RegExp): string[] {
  const blocks: string[] = [];
  for (const match of source.matchAll(query)) {
    let depth = 1;
    let index = match.index! + match[0].length;
    const start = index;
    while (depth > 0 && index < source.length) {
      if (source[index] === "{") depth += 1;
      else if (source[index] === "}") depth -= 1;
      index += 1;
    }
    blocks.push(source.slice(start, index - 1));
  }
  return blocks;
}

const forcedBlocks = mediaBlocks(css, /@media\s*\(\s*forced-colors\s*:\s*active\s*\)\s*\{/g);
const forcedRules = forcedBlocks.flatMap(parseRules);

// Everything outside the forced-colors blocks.
const baseCss = forcedBlocks.reduce((rest, block) => rest.replace(block, ""), css);
const baseRules = parseRules(baseCss);

/** [selector, property, system color keyword the rule must set]. */
const REQUIRED: [string, string, string][] = [
  // Switch: the knob, the checked track and the checked knob must all differ.
  [".ds-switch-input::before", "background", "CanvasText"],
  [".ds-switch-input:checked", "background", "Highlight"],
  [".ds-switch-input:checked", "border-color", "Highlight"],
  [".ds-switch-input:checked::before", "background", "HighlightText"],
  // Toggle IconButton: pressed must not look like unpressed. The fill carries
  // text, so the element opts out of forced-color-adjust (see the backplate
  // test below) and restates the focus ring, which then keeps its authored color.
  [".ds-icon-btn-active", "forced-color-adjust", "none"],
  [".ds-icon-btn-active", "background", "Highlight"],
  [".ds-icon-btn-active", "color", "HighlightText"],
  [".ds-icon-btn-active:focus-visible", "outline-color", "Highlight"],
  // Tabs: forced colors turn the transparent underline into a visible one, so
  // the unselected tab hides it and the selected tab shows it.
  [".ds-tab", "border-bottom-color", "Canvas"],
  ['.ds-tab[aria-selected="true"]', "border-bottom-color", "Highlight"],
  // SegmentedControl: selection otherwise rests on a background and weight.
  ['.ds-segmented-option[aria-checked="true"]', "forced-color-adjust", "none"],
  ['.ds-segmented-option[aria-checked="true"]', "background", "Highlight"],
  ['.ds-segmented-option[aria-checked="true"]', "color", "HighlightText"],
  ['.ds-segmented-option[aria-checked="true"]', "border-right-color", "CanvasText"],
  // The focus ring is inset (negative offset) and forced colors paint it in
  // Highlight, the same color as the selected fill, so it must switch.
  [
    '.ds-segmented-option[aria-checked="true"]:focus-visible',
    "outline-color",
    "HighlightText",
  ],
];

const SYSTEM_COLORS = new Set([
  "Canvas",
  "CanvasText",
  "Highlight",
  "HighlightText",
  "ButtonFace",
  "ButtonText",
  "ButtonBorder",
  "GrayText",
  "LinkText",
  "Mark",
  "MarkText",
  "Field",
  "FieldText",
  "transparent",
]);

const COLOR_PROPERTIES = new Set([
  "color",
  "background",
  "background-color",
  "border-color",
  "border-bottom-color",
  "border-right-color",
  "outline-color",
]);

/** Selectors that show a state (selected, checked, pressed, active) in the base
 * stylesheet. A new one must get a forced-colors rule too. */
const STATE_SELECTOR =
  /\[aria-(selected|checked|pressed)="true"\]|:checked|-active(?![\w-])/;

function forcedValue(selector: string, property: string): string | undefined {
  // The last matching rule wins, as in the cascade.
  return forcedRules
    .filter((rule) => rule.selectors.includes(selector))
    .map((rule) => rule.declarations.get(property))
    .filter((value): value is string => value !== undefined)
    .at(-1);
}

describe("forced-colors (Windows High Contrast)", () => {
  it("has a forced-colors block in the component stylesheet", () => {
    expect(forcedBlocks.length).toBeGreaterThan(0);
    expect(forcedRules.length).toBeGreaterThan(0);
  });

  it.each(REQUIRED)("%s sets %s to %s", (selector, property, value) => {
    expect(forcedValue(selector, property)).toBe(value);
  });

  it("covers every state selector in the base stylesheet", () => {
    const stateSelectors = [
      ...new Set(
        baseRules.flatMap((rule) => rule.selectors).filter((s) => STATE_SELECTOR.test(s)),
      ),
    ];
    // The guard is only meaningful if it sees the states that exist today.
    expect(stateSelectors).toEqual(
      expect.arrayContaining([
        ".ds-icon-btn-active",
        ".ds-switch-input:checked",
        ".ds-switch-input:checked::before",
        '.ds-tab[aria-selected="true"]',
        '.ds-segmented-option[aria-checked="true"]',
      ]),
    );
    // Covered means a forced-colors rule for the selector that actually sets a
    // color property: a rule that only changes the cursor restates nothing.
    const covered = new Set(
      forcedRules
        .filter((rule) => [...rule.declarations.keys()].some((p) => COLOR_PROPERTIES.has(p)))
        .flatMap((rule) => rule.selectors),
    );
    const missing = stateSelectors.filter((selector) => !covered.has(selector));
    expect(missing).toEqual([]);
  });

  it("opts out of forced-color-adjust wherever text sits on a Highlight fill", () => {
    // Chromium paints a Canvas-colored backplate behind text on an author fill
    // unless the element opts out, and HighlightText on that backplate is
    // white on white: the label vanishes. Verified in Chromium with
    // forcedColors: "active".
    const textOnFill = forcedRules.filter(
      (rule) => rule.declarations.get("color") === "HighlightText",
    );
    expect(textOnFill.length).toBeGreaterThan(0);
    for (const rule of textOnFill) {
      expect(rule.declarations.get("forced-color-adjust"), rule.selectors.join(", ")).toBe("none");
    }
  });

  it("uses only system colors, which forced-colors mode keeps", () => {
    for (const rule of forcedRules) {
      for (const [property, value] of rule.declarations) {
        if (!COLOR_PROPERTIES.has(property)) continue;
        expect(SYSTEM_COLORS, `${rule.selectors.join(", ")} { ${property}: ${value} }`).toContain(
          value,
        );
      }
    }
  });
});
