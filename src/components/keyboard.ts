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
  keyCode: number;
}): boolean {
  return !(
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    isImeKeyPress(event)
  );
}

/**
 * Whether a key press types one character, for type-ahead search.
 *
 * It is stricter than `isPlainKeyPress` about what a key is (a single
 * character, not "Enter" or "F1") and looser about one modifier: Windows
 * reports AltGr, which many layouts type letters with (Polish "ą"), as Ctrl and
 * Alt together, so that pair counts when the platform also says AltGraph is
 * down. Any other Ctrl, Alt or Meta chord stays with the browser and the host.
 */
export function isTypingKeyPress(event: {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  isComposing: boolean;
  keyCode: number;
  getModifierState(key: string): boolean;
}): boolean {
  if (isImeKeyPress(event) || event.metaKey) return false;
  // Array.from counts code points, so a character outside the BMP is one key.
  if (Array.from(event.key).length !== 1) return false;
  if (event.altKey || event.ctrlKey) {
    return event.altKey && event.ctrlKey && event.getModifierState("AltGraph");
  }
  return true;
}

/** Whether an input method owns this key press. Safari reports the keydown
 * that ends a composition (Escape to cancel, Enter to commit) with
 * `isComposing` already false but `keyCode` 229, so both are checked. */
export function isImeKeyPress(event: {
  isComposing: boolean;
  keyCode: number;
}): boolean {
  return event.isComposing || event.keyCode === 229;
}
