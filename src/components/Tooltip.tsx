import { cloneElement, isValidElement } from "preact";
import type { JSX, VNode } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { isImeKeyPress } from "./keyboard";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

type TriggerProps = JSX.HTMLAttributes<HTMLElement> & {
  "aria-describedby"?: string;
};

export interface TooltipProps {
  content: string;
  placement?: TooltipPlacement;
  /** Hover delay in ms. Keyboard focus shows it at once, since a keyboard user
   * has no pointer path that could trigger it by accident. */
  delay?: number;
  disabled?: boolean;
  /** A single focusable element. */
  children: VNode<TriggerProps>;
}

let tooltipCounter = 0;

/** How long an open tooltip survives the pointer leaving the trigger or the
 * tooltip, so the pointer can cross the gap between them (WCAG 1.4.13). */
const HOVER_GRACE_MS = 150;

/** Supplementary description only: it connects through `aria-describedby`
 * while visible. For WCAG 1.4.13 it is dismissible (Escape), hoverable (the
 * pointer can move onto it without it closing) and persistent: a hover tooltip
 * stays until the pointer leaves, and one opened by focus stays while the
 * trigger has keyboard focus (`:focus-visible`), even after the pointer has
 * hovered it and left. A mouse click that merely focuses the trigger does not
 * pin it open. */
export function Tooltip({
  content,
  placement = "top",
  delay = 400,
  disabled = false,
  children,
}: TooltipProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const idRef = useRef<string | undefined>(undefined);
  if (!idRef.current) {
    tooltipCounter += 1;
    idRef.current = `ds-tooltip-${tooltipCounter}`;
  }
  const id = idRef.current;
  const active = !disabled && content !== "";
  const openRef = useRef(open);
  openRef.current = open;
  const triggerRef = useRef<HTMLElement | null>(null);
  // Set when focus opened (or re-opened) the tooltip; cleared whenever the
  // tooltip closes (blur, Escape, the grace period), so a tooltip the user
  // dismissed and then hovered open again does not stay pinned by the focus
  // that is still on the trigger.
  const focusOpenedRef = useRef(false);

  function clearTimer() {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }

  // True while the trigger has keyboard focus and that focus opened the
  // tooltip. `:focus-visible` is read when the pointer leaves, not when focus
  // arrives, so a click-focused trigger counts as soon as the user starts using
  // the keyboard. The pseudo-class matches only a focused element, so no
  // activeElement comparison is needed (that would break inside a shadow root).
  // A browser without `:focus-visible` throws here and keeps the old behaviour:
  // the tooltip closes once the pointer has left. So does a trigger that is a
  // custom element delegating focus, whose host may not match it.
  function heldOpenByKeyboardFocus(): boolean {
    const trigger = triggerRef.current;
    if (!focusOpenedRef.current || !trigger) return false;
    try {
      return trigger.matches(":focus-visible");
    } catch {
      return false;
    }
  }

  // The pointer left the trigger or the tooltip. An open tooltip waits a moment
  // so the pointer can reach the other one; a pending (not yet shown) one is
  // simply cancelled. A tooltip held open by keyboard focus is left alone: it
  // closes on blur or Escape.
  function leaveHover() {
    clearTimer();
    if (!openRef.current) return;
    if (heldOpenByKeyboardFocus()) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined;
      focusOpenedRef.current = false;
      setOpen(false);
    }, HOVER_GRACE_MS);
  }

  useEffect(() => clearTimer, []);

  useEffect(() => {
    function onDocumentKeyDown(event: KeyboardEvent) {
      // Escape during IME composition cancels the composition, not the tooltip.
      if (event.key === "Escape" && !isImeKeyPress(event) && openRef.current) {
        clearTimer();
        focusOpenedRef.current = false;
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => document.removeEventListener("keydown", onDocumentKeyDown);
  }, []);

  if (!isValidElement(children)) {
    return children as unknown as JSX.Element;
  }

  const showing = open && active;
  const childProps = children.props;
  const trigger = cloneElement(children, {
    "aria-describedby": showing
      ? [childProps["aria-describedby"], id].filter(Boolean).join(" ")
      : childProps["aria-describedby"],
    onMouseEnter: (event: JSX.TargetedMouseEvent<HTMLElement>) => {
      childProps.onMouseEnter?.(event);
      if (!active) return;
      triggerRef.current = event.currentTarget;
      clearTimer();
      // Already open (the pointer came back within the grace period): stay open.
      if (openRef.current) return;
      timerRef.current = setTimeout(() => {
        timerRef.current = undefined;
        setOpen(true);
      }, delay);
    },
    onMouseLeave: (event: JSX.TargetedMouseEvent<HTMLElement>) => {
      childProps.onMouseLeave?.(event);
      leaveHover();
    },
    onFocus: (event: JSX.TargetedFocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      if (!active) return;
      triggerRef.current = event.currentTarget;
      focusOpenedRef.current = true;
      clearTimer();
      setOpen(true);
    },
    onBlur: (event: JSX.TargetedFocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      clearTimer();
      focusOpenedRef.current = false;
      setOpen(false);
    },
  } as Partial<TriggerProps>);

  return (
    <span class="ds-tooltip-anchor">
      {trigger}
      {showing && (
        <span
          role="tooltip"
          id={id}
          class={`ds-tooltip ds-tooltip-${placement}`}
          onMouseEnter={clearTimer}
          onMouseLeave={leaveHover}
        >
          {content}
        </span>
      )}
    </span>
  );
}
