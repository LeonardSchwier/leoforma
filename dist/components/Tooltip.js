import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { cloneElement, isValidElement } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
let tooltipCounter = 0;
/** Supplementary description only: it connects through `aria-describedby`
 * while visible, and Escape dismisses it (WCAG 1.4.13). */
export function Tooltip({ content, placement = "top", delay = 400, disabled = false, children, }) {
    const [open, setOpen] = useState(false);
    const timerRef = useRef(undefined);
    const idRef = useRef(undefined);
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
    useEffect(() => clearTimer, []);
    useEffect(() => {
        function onDocumentKeyDown(event) {
            if (event.key === "Escape" && openRef.current) {
                clearTimer();
                setOpen(false);
            }
        }
        document.addEventListener("keydown", onDocumentKeyDown);
        return () => document.removeEventListener("keydown", onDocumentKeyDown);
    }, []);
    if (!isValidElement(children)) {
        return children;
    }
    const showing = open && active;
    const childProps = children.props;
    const trigger = cloneElement(children, {
        "aria-describedby": showing
            ? [childProps["aria-describedby"], id].filter(Boolean).join(" ")
            : childProps["aria-describedby"],
        onMouseEnter: (event) => {
            childProps.onMouseEnter?.(event);
            if (!active)
                return;
            clearTimer();
            timerRef.current = setTimeout(() => setOpen(true), delay);
        },
        onMouseLeave: (event) => {
            childProps.onMouseLeave?.(event);
            clearTimer();
            setOpen(false);
        },
        onFocus: (event) => {
            childProps.onFocus?.(event);
            if (!active)
                return;
            clearTimer();
            setOpen(true);
        },
        onBlur: (event) => {
            childProps.onBlur?.(event);
            clearTimer();
            setOpen(false);
        },
    });
    return (_jsxs("span", { class: "ds-tooltip-anchor", children: [trigger, showing && (_jsx("span", { role: "tooltip", id: id, class: `ds-tooltip ds-tooltip-${placement}`, children: content }))] }));
}
