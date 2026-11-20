/**
 * The tooltips that are showing right now, so a modal surface can let Escape
 * dismiss a tooltip before it dismisses itself.
 *
 * A Dialog listens for Escape in the capture phase and stops the event, so the
 * Tooltip's own (bubble phase) listener never runs inside one: a keyboard user
 * who pressed Escape to hide a tooltip closed the whole dialog and lost what
 * they had typed (WCAG 1.4.13, dismissible). Internal on purpose: not exported
 * from the package index, so it is not public API.
 */

export interface ShowingTooltip {
  /** The wrapper around the trigger and the tooltip. */
  anchor: HTMLElement;
  /** Hide the tooltip now. */
  dismiss: () => void;
}

const showing = new Set<ShowingTooltip>();

/** Register a tooltip while it is showing. Returns the function that removes it. */
export function registerShowingTooltip(entry: ShowingTooltip): () => void {
  showing.add(entry);
  return () => {
    showing.delete(entry);
  };
}

/** Hides every showing tooltip whose anchor is inside `container`. Returns
 * whether there was one. A tooltip outside the container (one left open on the
 * page behind a modal) is not touched and does not count, so it cannot swallow
 * the Escape meant for the dialog. */
export function dismissShowingTooltipsWithin(container: HTMLElement): boolean {
  const inside = [...showing].filter((entry) => container.contains(entry.anchor));
  for (const entry of inside) entry.dismiss();
  return inside.length > 0;
}
