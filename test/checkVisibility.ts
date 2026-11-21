/** jsdom has no `Element.checkVisibility` (it does no layout), so a test that
 * wants the browser's answer installs this stand-in. It follows the parts of the
 * spec the focus trap relies on: an element with no box (`display: none` on it or
 * an ancestor or `display: contents` on it, `[hidden]` through jsdom's own
 * stylesheet) is not visible, neither is content of a closed `<details>` other
 * than its first `<summary>` (Chromium gives it `content-visibility: hidden`),
 * and with `visibilityProperty` (or its older name `checkVisibilityCSS`) a
 * computed `visibility` of `hidden` or `collapse` counts too. Opacity and `content-visibility: auto` are never read,
 * which is what the trap asks for. `content-visibility: hidden` is modelled only
 * for a closed `<details>`. The real engine is not exercised by the suite: the
 * check against Chromium is recorded in ROADMAP.md. Returns the function that
 * removes the stand-in. */
export function installCheckVisibilityStub(): () => void {
  const had = Object.prototype.hasOwnProperty.call(
    Element.prototype,
    "checkVisibility",
  );
  const previous = Object.getOwnPropertyDescriptor(
    Element.prototype,
    "checkVisibility",
  );

  function isVisible(
    element: Element,
    options: CheckVisibilityOptions,
  ): boolean {
    if (!element.isConnected) return false;
    // `display: contents` leaves the element itself without a box (its
    // children still have one).
    if (getComputedStyle(element).display === "contents") return false;
    for (
      let node: Element | null = element;
      node;
      node = node.parentElement
    ) {
      if (getComputedStyle(node).display === "none") return false;
      const parent: Element | null = node.parentElement;
      if (
        parent instanceof HTMLDetailsElement &&
        !parent.open &&
        !(
          node instanceof HTMLElement &&
          node.localName === "summary" &&
          node === parent.querySelector(":scope > summary")
        )
      ) {
        return false;
      }
    }
    if (options.visibilityProperty || options.checkVisibilityCSS) {
      const visibility = getComputedStyle(element).visibility;
      if (visibility === "hidden" || visibility === "collapse") return false;
    }
    return true;
  }

  function checkVisibility(
    this: Element,
    options: CheckVisibilityOptions = {},
  ): boolean {
    return isVisible(this, options);
  }

  Object.defineProperty(Element.prototype, "checkVisibility", {
    configurable: true,
    writable: true,
    value: checkVisibility,
  });

  return () => {
    if (had && previous) {
      Object.defineProperty(Element.prototype, "checkVisibility", previous);
    } else {
      delete (Element.prototype as { checkVisibility?: unknown })
        .checkVisibility;
    }
  };
}
