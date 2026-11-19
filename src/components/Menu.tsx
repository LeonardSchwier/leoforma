import type { ComponentChildren, JSX } from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { cx } from "./cx";
import { isPlainKeyPress, isTypingKeyPress } from "./keyboard";
import { findTypeaheadMatch, TYPEAHEAD_RESET_MS } from "./typeahead";

export type MenuAlign = "start" | "end";
export type MenuItemVariant = "default" | "danger";

export interface MenuItem {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: ComponentChildren;
  disabled?: boolean;
  /** Says why the item is unavailable, and connects to it for screen readers. */
  disabledReason?: string;
  variant?: MenuItemVariant;
}

export interface MenuProps {
  label: string;
  trigger: ComponentChildren;
  items: readonly MenuItem[];
  align?: MenuAlign;
  disabled?: boolean;
  title?: string;
  className?: string;
  triggerClassName?: string;
}

interface PopupPosition {
  left: number;
  top: number;
  maxHeight: number;
}

const VIEWPORT_GUTTER = 8;
const TRIGGER_GAP = 4;
let menuCounter = 0;

function enabledItems(menu: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'),
  );
}

/** WAI-ARIA menu button. Position is computed in a layout effect, hidden until
 * measured, so the menu never flashes in the wrong place or off screen. */
export function Menu({
  label,
  trigger,
  items,
  align = "end",
  disabled = false,
  title,
  className,
  triggerClassName,
}: MenuProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PopupPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusEdgeRef = useRef<"first" | "last">("first");
  // What was typed since the last pause, and when. A timestamp rather than a
  // timer: nothing to clean up, and a stale search can never outlive the menu.
  const typeaheadRef = useRef({ buffer: "", at: 0 });
  // A Space the search consumed must not also activate the focused item when it
  // is released.
  const swallowSpaceUpRef = useRef(false);
  const idRef = useRef<string | undefined>(undefined);
  if (!idRef.current) {
    menuCounter += 1;
    idRef.current = `ds-menu-${menuCounter}`;
  }

  function resetTypeahead() {
    typeaheadRef.current = { buffer: "", at: 0 };
    swallowSpaceUpRef.current = false;
  }

  function close(restoreFocus: boolean) {
    resetTypeahead();
    setOpen(false);
    setPosition(null);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function show(edge: "first" | "last" = "first") {
    if (disabled || items.length === 0) return;
    focusEdgeRef.current = edge;
    resetTypeahead();
    setOpen(true);
  }

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const maxHeight = Math.max(0, window.innerHeight - VIEWPORT_GUTTER * 2);
    const fittedHeight = Math.min(menuRect.height, maxHeight);

    const rawLeft =
      align === "end" ? triggerRect.right - menuRect.width : triggerRect.left;
    const left = Math.min(
      Math.max(VIEWPORT_GUTTER, rawLeft),
      Math.max(VIEWPORT_GUTTER, window.innerWidth - VIEWPORT_GUTTER - menuRect.width),
    );

    const belowTop = triggerRect.bottom + TRIGGER_GAP;
    const aboveTop = triggerRect.top - TRIGGER_GAP - fittedHeight;
    const roomBelow = window.innerHeight - VIEWPORT_GUTTER - belowTop;
    const roomAbove = triggerRect.top - VIEWPORT_GUTTER - TRIGGER_GAP;
    const preferredTop =
      roomBelow < fittedHeight && roomAbove > roomBelow ? aboveTop : belowTop;
    const top = Math.min(
      Math.max(VIEWPORT_GUTTER, preferredTop),
      Math.max(VIEWPORT_GUTTER, window.innerHeight - VIEWPORT_GUTTER - fittedHeight),
    );

    setPosition({ left, top, maxHeight });
  }, [align, open]);

  // Focus moves in only once the menu is visible. While it is being measured it
  // renders with visibility:hidden, and a browser refuses focus() on a hidden
  // element, so focusing in the measuring pass above left the keyboard on the
  // trigger (jsdom does not enforce this, which is how it went unnoticed). Keyed
  // on `positioned`, not on `position`, so re-positioning an open menu (an
  // `align` change) does not pull focus back to an edge item.
  const positioned = position !== null;
  useLayoutEffect(() => {
    if (!open || !positioned || !menuRef.current) return;
    const available = enabledItems(menuRef.current);
    const target =
      focusEdgeRef.current === "last"
        ? available[available.length - 1]
        : available[0];
    target?.focus();
  }, [open, positioned]);

  // A disabled trigger or an empty list cannot be reopened, so an already open
  // menu must not linger. Focus is not moved: the trigger cannot take it.
  const unavailable = disabled || items.length === 0;
  useEffect(() => {
    if (open && unavailable) close(false);
  }, [open, unavailable]);

  useEffect(() => {
    if (!open) return;
    function dismissOnPointer(event: PointerEvent) {
      const target = event.target as Node | null;
      if (
        target &&
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        close(false);
      }
    }
    function dismissOnBlur() {
      close(false);
    }
    document.addEventListener("pointerdown", dismissOnPointer);
    window.addEventListener("blur", dismissOnBlur);
    return () => {
      document.removeEventListener("pointerdown", dismissOnPointer);
      window.removeEventListener("blur", dismissOnBlur);
    };
  }, [open]);

  /** Type-ahead: characters typed in quick succession move focus to the next
   * enabled item whose label starts with them. The menu consumes every
   * character it reads, matched or not, so a host's single-key shortcut does
   * not fire for a key that was meant for the menu (Escape works the same way).
   * Space is the exception, because it also activates the focused item: it
   * joins a search only while one is under way and only when something starts
   * with the text so far, a space included ("Save as"). Pressed straight after
   * "d" that lands on "Delete", it still activates "Delete". */
  function typeAhead(
    event: JSX.TargetedKeyboardEvent<HTMLDivElement>,
    menu: HTMLElement,
  ) {
    const isSpace = event.key === " ";
    if (isSpace && event.repeat && swallowSpaceUpRef.current) {
      // A held Space repeats its keydown; the press the search took keeps it.
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const now = Date.now();
    const typed = typeaheadRef.current;
    const elapsed = now - typed.at;
    const searching = typed.buffer !== "" && elapsed >= 0 && elapsed < TYPEAHEAD_RESET_MS;
    if (isSpace && !searching) {
      swallowSpaceUpRef.current = false;
      return;
    }
    const buffer = (searching ? typed.buffer : "") + event.key;
    const rendered = Array.from(
      menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    );
    const available = rendered.filter((button) => !button.disabled);
    const labels = available.map(
      (button) => items[rendered.indexOf(button)]?.label ?? button.textContent ?? "",
    );
    const match = findTypeaheadMatch(
      labels,
      buffer,
      available.indexOf(document.activeElement as HTMLButtonElement),
    );
    if (isSpace && match < 0) {
      swallowSpaceUpRef.current = false;
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    // Set by this Space press only: other keys going down while it is still
    // held (fast typing rolls one key into the next) must not clear it, or its
    // key-up would reach the item the search just focused and click it.
    if (isSpace) swallowSpaceUpRef.current = true;
    typeaheadRef.current = { buffer, at: now };
    if (match >= 0) available[match]?.focus();
  }

  function onMenuKeyUp(event: JSX.TargetedKeyboardEvent<HTMLDivElement>) {
    if (event.key === " " && swallowSpaceUpRef.current) {
      swallowSpaceUpRef.current = false;
      event.preventDefault();
    }
  }

  function onMenuKeyDown(event: JSX.TargetedKeyboardEvent<HTMLDivElement>) {
    const menu = menuRef.current;
    if (!menu) return;
    if (event.key === "Escape") {
      // The menu consumes the key, so neither an enclosing Dialog nor a host's
      // document listener also reacts to the same press.
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key === "Tab") {
      close(false);
      return;
    }
    if (isTypingKeyPress(event)) {
      typeAhead(event, menu);
      return;
    }
    // Alt, Ctrl and Meta chords stay with the browser and the host.
    if (!isPlainKeyPress(event)) return;
    const available = enabledItems(menu);
    if (available.length === 0) return;
    const current = available.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    let next: number | null = null;
    if (event.key === "ArrowDown") {
      next = current < 0 ? 0 : (current + 1) % available.length;
    } else if (event.key === "ArrowUp") {
      next =
        current < 0
          ? available.length - 1
          : (current - 1 + available.length) % available.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = available.length - 1;
    }
    if (next !== null) {
      event.preventDefault();
      available[next]?.focus();
    }
  }

  return (
    <span class={cx("ds-menu-anchor", className)}>
      <button
        ref={triggerRef}
        type="button"
        class={triggerClassName}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? idRef.current : undefined}
        title={title}
        disabled={disabled || items.length === 0}
        onClick={(event) => {
          event.stopPropagation();
          if (open) close(true);
          else show();
        }}
        onKeyDown={(event) => {
          if (
            !open &&
            isPlainKeyPress(event) &&
            (event.key === "ArrowDown" || event.key === "ArrowUp")
          ) {
            event.preventDefault();
            show(event.key === "ArrowUp" ? "last" : "first");
          }
        }}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={idRef.current}
          class="ds-menu"
          data-ds-menu=""
          role="menu"
          aria-label={label}
          style={
            position
              ? {
                  left: `${position.left}px`,
                  top: `${position.top}px`,
                  maxHeight: `${position.maxHeight}px`,
                  visibility: "visible",
                }
              : { visibility: "hidden" }
          }
          onKeyDown={onMenuKeyDown}
          onKeyUp={onMenuKeyUp}
        >
          {items.map((item) => {
            const reasonId = item.disabledReason
              ? `${idRef.current}-${item.id}-reason`
              : undefined;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                class={cx(
                  "ds-menu-item",
                  item.variant === "danger" && "ds-menu-item-danger",
                )}
                disabled={item.disabled}
                aria-describedby={reasonId}
                tabIndex={-1}
                onClick={() => {
                  if (item.disabled) return;
                  close(true);
                  item.onSelect();
                }}
              >
                {item.icon}
                <span class="ds-menu-item-content">
                  <span>{item.label}</span>
                  {item.disabledReason && (
                    <span id={reasonId} class="ds-menu-item-reason">
                      {item.disabledReason}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
}
