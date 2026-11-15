/**
 * Whether a key press is the widget's own to interpret.
 *
 * Alt, Ctrl and Meta turn an arrow, Home or End into a chord that belongs to
 * the browser (Alt+Left is history back), the OS (Cmd+Down, Ctrl+Right) or the
 * host app's shortcuts. A widget that reads it as a plain arrow both moves its
 * own selection and cancels the chord through `preventDefault`. A key pressed
 * while an input method is composing (`isComposing`) belongs to the IME: Escape
 * cancels the composition and Tab or an arrow picks a candidate, so a dialog
 * must neither close nor move focus on it.
 *
 * Shift is allowed: no widget here gives it a different meaning.
 */
export function isPlainKeyPress(event: {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  isComposing: boolean;
}): boolean {
  return !(event.altKey || event.ctrlKey || event.metaKey || event.isComposing);
}
