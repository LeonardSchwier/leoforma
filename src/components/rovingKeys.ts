/**
 * The arrow key movement shared by Tabs and SegmentedControl, both of which
 * use roving tabindex: one tab stop for the group, arrows inside it.
 * Returns the next index, or null when the key is not a movement key.
 */
export function nextRovingIndex(
  key: string,
  current: number,
  enabled: readonly boolean[],
): number | null {
  const count = enabled.length;
  const firstEnabled = enabled.indexOf(true);
  if (firstEnabled < 0) return null;
  if (key === "Home") return firstEnabled;
  if (key === "End") return enabled.lastIndexOf(true);

  let step: number;
  if (key === "ArrowRight" || key === "ArrowDown") step = 1;
  else if (key === "ArrowLeft" || key === "ArrowUp") step = -1;
  else return null;

  for (let i = 1; i <= count; i += 1) {
    const candidate = (current + step * i + count * i) % count;
    if (enabled[candidate]) return candidate;
  }
  return null;
}

/**
 * The index that owns the group's single tab stop: the selected item, or the
 * first enabled one when the selection is disabled or missing. A disabled
 * button cannot take focus, so leaving the stop on it would make the whole
 * group unreachable by keyboard. When nothing is enabled the stop stays on the
 * selected item (or the first), since there is nothing better to point at.
 */
export function rovingTabStop(
  selected: number,
  enabled: readonly boolean[],
): number {
  if (selected >= 0 && enabled[selected]) return selected;
  const firstEnabled = enabled.indexOf(true);
  return firstEnabled >= 0 ? firstEnabled : Math.max(0, selected);
}
