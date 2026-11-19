/** How long a pause ends a type-ahead search, as in the WAI-ARIA Authoring
 * Practices examples. Each key press restarts the wait. */
export const TYPEAHEAD_RESET_MS = 500;

function fold(text: string): string {
  // NFC so a letter typed composed ("é") matches a label that stores it
  // decomposed ("e" and a combining accent), and the other way round. Lower case
  // is not locale-dependent: the browser's locale says nothing about the
  // language of a label, and a Turkish browser must still match "i" to "Info".
  return text.normalize("NFC").toLowerCase();
}

/**
 * The index of the label a type-ahead search lands on, or -1.
 *
 * `labels` are the labels of the items that can take focus, in order, and
 * `currentIndex` is the focused one (-1 for none). `buffer` is everything typed
 * since the last pause.
 *
 * - One character, or the same character repeated ("dd"): the next label after
 *   the current one that starts with it, wrapping around, so pressing the key
 *   again steps through the labels that share a first letter.
 * - Several different characters: the first label from the current one onwards
 *   that starts with the whole buffer. The current label is included so that
 *   typing "de" after landing on "Delete" by "d" stays on it.
 *
 * Case and leading white space are ignored.
 */
export function findTypeaheadMatch(
  labels: readonly string[],
  buffer: string,
  currentIndex: number,
): number {
  const count = labels.length;
  if (count === 0 || buffer === "") return -1;
  // Folded one character at a time: some fold to more than one ("İ" becomes
  // "i" and a combining dot), and a repeated one must still count as repeated.
  const characters = Array.from(buffer.normalize("NFC"), fold);
  const first = characters[0] ?? "";
  const cycling =
    characters.length === 1 ||
    (first.trim() !== "" && characters.every((character) => character === first));
  const query = cycling ? first : characters.join("");
  const start = cycling ? currentIndex + 1 : Math.max(currentIndex, 0);
  for (let step = 0; step < count; step += 1) {
    const index = (((start + step) % count) + count) % count;
    if (fold((labels[index] ?? "").trimStart()).startsWith(query)) return index;
  }
  return -1;
}
