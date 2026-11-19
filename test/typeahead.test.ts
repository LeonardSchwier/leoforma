import { describe, expect, it } from "vitest";
import { findTypeaheadMatch } from "../src/components/typeahead";

const labels = ["Rename", "Move", "Duplicate", "Delete", "Archive", "Delete forever"];

describe("findTypeaheadMatch", () => {
  it("finds the first label that starts with a single typed character, case-insensitively", () => {
    expect(findTypeaheadMatch(labels, "m", 0)).toBe(1);
    expect(findTypeaheadMatch(labels, "M", 0)).toBe(1);
  });

  it("starts after the current item for a single character and cycles through the matches", () => {
    expect(findTypeaheadMatch(labels, "d", 0)).toBe(2);
    expect(findTypeaheadMatch(labels, "d", 2)).toBe(3);
    expect(findTypeaheadMatch(labels, "d", 3)).toBe(5);
    expect(findTypeaheadMatch(labels, "d", 5)).toBe(2);
  });

  it("stays on the only match when the current item is the only one that starts with the character", () => {
    expect(findTypeaheadMatch(labels, "r", 0)).toBe(0);
  });

  it("treats a repeated character as a single-character search (press D, D, D to cycle)", () => {
    expect(findTypeaheadMatch(labels, "dd", 2)).toBe(3);
    expect(findTypeaheadMatch(labels, "ddd", 3)).toBe(5);
  });

  it("matches a multi-character prefix, starting at the current item so a refinement does not skip it", () => {
    expect(findTypeaheadMatch(labels, "del", 0)).toBe(3);
    expect(findTypeaheadMatch(labels, "del", 3)).toBe(3);
    expect(findTypeaheadMatch(labels, "delete f", 3)).toBe(5);
    expect(findTypeaheadMatch(labels, "du", 3)).toBe(2);
  });

  it("returns -1 when nothing matches or the buffer is empty", () => {
    expect(findTypeaheadMatch(labels, "z", 0)).toBe(-1);
    expect(findTypeaheadMatch(labels, "mz", 0)).toBe(-1);
    expect(findTypeaheadMatch(labels, "", 0)).toBe(-1);
    expect(findTypeaheadMatch([], "a", 0)).toBe(-1);
  });

  it("starts from the first item when nothing is current (index -1)", () => {
    expect(findTypeaheadMatch(labels, "d", -1)).toBe(2);
    expect(findTypeaheadMatch(labels, "del", -1)).toBe(3);
  });

  it("ignores leading whitespace in a label and compares letters by Unicode, not bytes", () => {
    expect(findTypeaheadMatch(["  Öffnen", "Zurück"], "ö", 1)).toBe(0);
    // Same letter, composed and decomposed.
    expect(findTypeaheadMatch(["étoile", "Other"], "é", 1)).toBe(0);
    expect(findTypeaheadMatch(["étoile", "Other"], "é", 1)).toBe(0);
  });

  it("folds a character that lower-cases to more than one without breaking the repeat rule", () => {
    // "\u0130" lower-cases to "i" plus a combining dot: still one typed character.
    expect(findTypeaheadMatch(["\u0130zle", "\u0130nfo", "Zed"], "\u0130\u0130", 0)).toBe(1);
    expect(findTypeaheadMatch(["Info", "Install"], "i", -1)).toBe(0);
  });

  it("matches non-Latin scripts and characters outside the BMP", () => {
    expect(findTypeaheadMatch(["Открыть", "Закрыть"], "з", 0)).toBe(1);
    expect(findTypeaheadMatch(["Plain", "\u{1d4d0}pple"], "\u{1d4d0}", 0)).toBe(1);
  });
});
