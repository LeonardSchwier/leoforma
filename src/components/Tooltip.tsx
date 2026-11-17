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
 * while visible. For WCAG 1.4.13 it is dismissible (Escape) and hoverable (the
 * pointer can move onto it without it closing). A hover tooltip persists until
 * the pointer leaves; one opened by focus also closes when the pointer has
 * hovered it and left, even though focus is still on the trigger. */
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

  function clearTimer() {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }

  // The pointer left the trigger or the tooltip. An open tooltip waits a moment
  // so the pointer can reach the other one; a pending (not yet shown) one is
  // simply cancelled.
  function leaveHover() {
    clearTimer();
    if (!openRef.current) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined;
      setOpen(false);
    }, HOVER_GRACE_MS);
  }

  useEffect(() => clearTimer, []);

  useEffect(() => {
    function onDocumentKeyDown(event: KeyboardEvent) {
      // Escape during IME composition cancels the composition, not the tooltip.
      if (event.key === "Escape" && !isImeKeyPress(event) && openRef.current) {
        clearTimer();
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
      clearTimer();
      setOpen(true);
    },
    onBlur: (event: JSX.TargetedFocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      clearTimer();
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
