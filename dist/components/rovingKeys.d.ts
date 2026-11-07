/**
 * The arrow key movement shared by Tabs and SegmentedControl, both of which
 * use roving tabindex: one tab stop for the group, arrows inside it.
 * Returns the next index, or null when the key is not a movement key.
 */
export declare function nextRovingIndex(key: string, current: number, enabled: readonly boolean[]): number | null;
