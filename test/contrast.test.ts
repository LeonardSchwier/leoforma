import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { themes, type ColorMode, type ColorRoles, type ThemeName } from "../src/tokens";
import { contrastRatio } from "../src/tokens/contrast";

type Role = keyof ColorRoles;
const SURFACES: Role[] = ["canvas", "panel", "raised", "sunken", "hover", "selected"];
const CONTROL_SURFACES: Role[] = ["canvas", "panel", "raised"];

/** [foreground, background, minimum ratio]. WCAG 2.1 AA: 4.5 for text, 3 for
 * focus indicators and control boundaries (1.4.3 and 1.4.11). */
const PAIRS: [Role, Role, number][] = [
  ...SURFACES.flatMap((s): [Role, Role, number][] => [
    ["text", s, 4.5],
    ["textSecondary", s, 4.5],
    ["textMuted", s, 4.5],
  ]),
  ...CONTROL_SURFACES.flatMap((s): [Role, Role, number][] => [
    ["accent", s, 4.5],
    ["success", s, 4.5],
    ["warning", s, 4.5],
    ["danger", s, 4.5],
    ["focus", s, 3],
    ["borderStrong", s, 3],
  ]),
  ["onAccent", "accent", 4.5],
  ["onAccent", "accentHover", 4.5],
  ["onDanger", "danger", 4.5],
  ["accent", "accentSoft", 4.5],
  ["text", "accentSoft", 4.5],
];

describe("WCAG AA contrast", () => {
  for (const themeName of Object.keys(themes) as ThemeName[]) {
    for (const mode of ["light", "dark"] as ColorMode[]) {
      const roles = themes[themeName].color[mode];
      describe(`${themeName} ${mode}`, () => {
        it.each(PAIRS)("%s on %s reaches %d:1", (fg, bg, min) => {
          expect(contrastRatio(roles[fg], roles[bg])).toBeGreaterThanOrEqual(min);
        });
      });
    }
  }
});

describe("contrastRatio", () => {
  it("matches the WCAG reference points", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  it("rejects anything but six digit hex, so a typo cannot pass silently", () => {
    expect(() => contrastRatio("red", "#ffffff")).toThrow(/six digit hex/);
  });
});

/** The color a foreground shows as when painted at `alpha` over `background`. */
function blend(foreground: string, background: string, alpha: number): string {
  const channel = (hex: string, index: number) => parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
  const mixed = [0, 1, 2].map((index) =>
    Math.round(alpha * channel(foreground, index) + (1 - alpha) * channel(background, index)),
  );
  return `#${mixed.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

describe("busy button focus ring", () => {
  // A loading Button or IconButton stays focusable and is dimmed with `opacity`,
  // which dims its focus outline too. At the :disabled value of 0.5 the ring fell
  // to about 2.3:1 on the light themes, below the 3:1 of WCAG 1.4.11.
  const css = readFileSync(join(__dirname, "../src/styles/components.css"), "utf8");
  const rule = /\.ds-btn\[aria-busy="true"\]:not\(:disabled\),\s*\.ds-icon-btn\[aria-busy="true"\]:not\(:disabled\)\s*\{([^}]*)\}/.exec(
    css,
  );
  const opacity = Number(/opacity:\s*([\d.]+)\s*;/.exec(rule?.[1] ?? "")?.[1]);

  it("dims a busy button by a number the stylesheet really sets", () => {
    expect(rule, "busy rule not found in components.css").not.toBeNull();
    expect(opacity).toBeGreaterThan(0.5);
    expect(opacity).toBeLessThanOrEqual(1);
  });

  for (const themeName of Object.keys(themes) as ThemeName[]) {
    for (const mode of ["light", "dark"] as ColorMode[]) {
      it.each(CONTROL_SURFACES)(`${themeName} ${mode}: dimmed ring on %s reaches 3:1`, (surface) => {
        const roles = themes[themeName].color[mode];
        const ring = blend(roles.focus, roles[surface], opacity);
        expect(contrastRatio(ring, roles[surface])).toBeGreaterThanOrEqual(3);
      });
    }
  }
});
