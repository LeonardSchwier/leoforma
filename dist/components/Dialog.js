import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useEffect, useLayoutEffect, useRef } from "preact/hooks";
import { cx } from "./cx.js";
import { acquireScrollLock, focusableElements, isTopmostOverlay, nextOverlayId, pushOverlay, } from "./overlayStack.js";
/** A modal dialog with a focus trap, Escape handling that respects stacking,
 * focus restoration, and a body scroll lock. Mount to open, unmount to close. */
export function Dialog({ title, description, children, actions, role = "dialog", size = "md", className, backdropClassName, closeOnEscape = true, closeOnBackdrop = true, restoreFocus = true, initialFocusRef, onDismiss, }) {
    const surfaceRef = useRef(null);
    const dismissRef = useRef(onDismiss);
    dismissRef.current = onDismiss;
    const closeOnEscapeRef = useRef(closeOnEscape);
    closeOnEscapeRef.current = closeOnEscape;
    const restoreFocusRef = useRef(restoreFocus);
    restoreFocusRef.current = restoreFocus;
    const initialFocusTargetRef = useRef(initialFocusRef);
    initialFocusTargetRef.current = initialFocusRef;
    const idRef = useRef(undefined);
    if (!idRef.current)
        idRef.current = nextOverlayId("ds-dialog");
    const titleId = `${idRef.current}-title`;
    const descriptionId = description ? `${idRef.current}-description` : undefined;
    // Layout effect so focus moves before paint: a screen reader never lands on
    // the page behind the dialog.
    useLayoutEffect(() => {
        const surface = surfaceRef.current;
        if (!surface)
            return;
        const instanceId = idRef.current;
        const popOverlay = pushOverlay({
            id: instanceId,
            isDismissible: () => closeOnEscapeRef.current,
            dismiss: (reason) => dismissRef.current(reason),
        });
        const previouslyFocused = document.activeElement;
        const initial = initialFocusTargetRef.current?.current ??
            focusableElements(surface)[0] ??
            surface;
        initial.focus();
        function onDocumentKeyDown(event) {
            if (!isTopmostOverlay(instanceId))
                return;
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                if (closeOnEscapeRef.current)
                    dismissRef.current("escape");
                return;
            }
            const current = surfaceRef.current;
            if (event.key !== "Tab" || !current)
                return;
            const available = focusableElements(current);
            if (available.length === 0) {
                event.preventDefault();
                current.focus();
                return;
            }
            const first = available[0];
            const last = available[available.length - 1];
            const active = document.activeElement;
            if (event.shiftKey && (active === first || !current.contains(active))) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey &&
                (active === last || !current.contains(active))) {
                event.preventDefault();
                first.focus();
            }
        }
        document.addEventListener("keydown", onDocumentKeyDown, true);
        return () => {
            document.removeEventListener("keydown", onDocumentKeyDown, true);
            popOverlay();
            if (restoreFocusRef.current && previouslyFocused?.isConnected) {
                previouslyFocused.focus();
            }
        };
    }, []);
    useEffect(() => acquireScrollLock(), []);
    return (_jsx("div", { class: cx("ds-dialog-backdrop", backdropClassName), onMouseDown: (event) => {
            if (event.target !== event.currentTarget)
                return;
            if (closeOnBackdrop)
                dismissRef.current("backdrop");
        }, children: _jsxs("section", { ref: surfaceRef, class: cx("ds-dialog", `ds-dialog-${size}`, className), role: role, "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": descriptionId, tabIndex: -1, children: [_jsx("header", { class: "ds-dialog-header", children: _jsx("h2", { id: titleId, children: title }) }), _jsxs("div", { class: "ds-dialog-content", children: [description && (_jsx("div", { id: descriptionId, class: "ds-dialog-description", children: description })), children] }), actions && _jsx("footer", { class: "ds-dialog-actions", children: actions })] }) }));
}
