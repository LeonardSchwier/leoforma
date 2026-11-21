/**
 * Shared bookkeeping for modal surfaces. Stacked overlays need one owner of
 * "who is on top", so Escape and a host's back gesture close only the topmost.
 * The module stays platform free: a host with a native back button subscribes
 * with `onOverlayPush` and calls `dismissTopOverlay`.
 */

export type OverlayDismissReason =
  | "escape"
  | "backdrop"
  | "backbutton"
  | "close-button";

export interface OverlayStackEntry {
  id: string;
  isDismissible: () => boolean;
  dismiss: (reason: OverlayDismissReason) => void;
}

const stack: OverlayStackEntry[] = [];
let scrollLockCount = 0;
let originalBodyOverflow = "";
let pushListener: (() => void) | null = null;

/** Called on each push, so a host can install its back handler lazily. */
export function onOverlayPush(listener: (() => void) | null): void {
  pushListener = listener;
}

export function pushOverlay(entry: OverlayStackEntry): () => void {
  stack.push(entry);
  pushListener?.();
  let removed = false;
  return () => {
    if (removed) return;
    removed = true;
    const index = stack.lastIndexOf(entry);
    if (index >= 0) stack.splice(index, 1);
  };
}

export function isTopmostOverlay(id: string): boolean {
  return stack.length > 0 && stack[stack.length - 1]!.id === id;
}

/** Returns whether an overlay was open, whether or not it agreed to close: a
 * non-dismissible overlay still consumes the gesture. */
export function dismissTopOverlay(reason: OverlayDismissReason): boolean {
  const top = stack[stack.length - 1];
  if (!top) return false;
  if (top.isDismissible()) top.dismiss(reason);
  return true;
}

/** Reference counted, so closing one of two stacked dialogs keeps the lock. */
export function acquireScrollLock(): () => void {
  if (scrollLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  scrollLockCount += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.body.style.overflow = originalBodyOverflow;
    }
  };
}

export const FOCUSABLE_SELECTOR = [
  "button:not(:disabled)",
  'input:not(:disabled):not([type="hidden"])',
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
  // The disclosure button of a <details> is a tab stop of its own: its first
  // <summary> child, the one a browser makes focusable. Any other <summary>
  // reports a negative tabIndex and is dropped by the tabIndex check below.
  "details > summary:first-of-type",
].join(",");

const HIDDEN_ANCESTOR_SELECTOR = '[hidden], [inert], [aria-hidden="true"]';

/** Whether `element` sits in the content of a closed `<details>` between it and
 * `container`: everything in a closed disclosure but its first `<summary>` is
 * not rendered, so a browser cannot focus it. Reads the markup only, so it holds
 * in an engine without `checkVisibility` and in jsdom. Looks no further up than
 * `container`, like the other hidden-ancestor checks. */
function insideClosedDetails(
  element: HTMLElement,
  container: HTMLElement,
): boolean {
  for (
    let node: HTMLElement | null = element;
    node && node !== container;
    node = node.parentElement
  ) {
    const parent: HTMLElement | null = node.parentElement;
    if (parent?.localName !== "details" || parent.hasAttribute("open")) continue;
    const summary: Element | undefined = Array.from(parent.children).find(
      (child: Element) => child.localName === "summary",
    );
    if (node !== summary) return true;
  }
  return false;
}

/** Whether a browser can put focus on `element` as far as CSS goes: it has a
 * box (no `display: none` on it or an ancestor, and not `display: contents` on
 * itself) and its `visibility` is not hidden or collapse. Read each time through
 * `checkVisibility`, so there is no cache to go stale. Opacity and
 * `content-visibility: auto` are left out on purpose: a transparent control and
 * an off-screen section that is skipped for rendering are both focusable. An
 * engine without `checkVisibility` (Chrome before 105, Firefox before 106,
 * Safari before 17.4) and jsdom keep the earlier answer for CSS: only the markup
 * (`hidden`, `inert`, `aria-hidden`, a closed `<details>`) is checked. Both
 * option names are passed because `checkVisibilityCSS` is the older spelling of
 * `visibilityProperty`. */
function isFocusableByCss(element: HTMLElement): boolean {
  if (typeof element.checkVisibility !== "function") return true;
  return element.checkVisibility({
    checkVisibilityCSS: true,
    visibilityProperty: true,
  });
}

/** The tab stops inside `container`, in DOM order. Roving tabindex items
 * (`tabindex="-1"`), hidden inputs, anything inside a hidden, inert or
 * aria-hidden subtree or in the content of a closed `<details>`, and, where the
 * browser has `checkVisibility`, anything CSS keeps from taking focus
 * (`display: none`, `visibility: hidden`) are not tab stops, so they must not
 * count as the first or last one. The disclosure `<summary>` of a `<details>`
 * is one. The markup checks stop at `container`: a host may mount a dialog under
 * an aria-hidden or inert root, which must not empty the list. The CSS check
 * cannot: a `container` that is not rendered (detached, or under `display: none`
 * or `visibility: hidden`) has no stops, since a browser can focus none of them. */
export function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    if (element.tabIndex < 0) return false;
    const hidden = element.closest(HIDDEN_ANCESTOR_SELECTOR);
    if (hidden && hidden !== container && container.contains(hidden)) {
      return false;
    }
    if (insideClosedDetails(element, container)) return false;
    return isFocusableByCss(element);
  });
}

let overlayIdCounter = 0;

export function nextOverlayId(prefix: string): string {
  overlayIdCounter += 1;
  return `${prefix}-${overlayIdCounter}`;
}

export function resetOverlayStackForTests(): void {
  stack.length = 0;
  scrollLockCount = 0;
  originalBodyOverflow = "";
  document.body.style.overflow = "";
  pushListener = null;
}
