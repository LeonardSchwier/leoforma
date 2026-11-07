import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useEffect, useRef, useState } from "preact/hooks";
import { Button } from "./Button.js";
function Toast({ toast, onDismiss, dismissLabel, }) {
    const tone = toast.tone ?? "neutral";
    const dismissRef = useRef(onDismiss);
    dismissRef.current = onDismiss;
    const [paused, setPaused] = useState(false);
    // Hover and focus pause the timer, so a slow reader or a keyboard user on
    // the close button does not lose the message (WCAG 2.2.1).
    useEffect(() => {
        if (toast.duration === undefined || paused)
            return;
        const timer = setTimeout(() => dismissRef.current(toast.id), toast.duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, paused]);
    return (_jsxs("div", { class: `ds-toast ds-toast-${tone}`, 
        // Errors interrupt; everything else waits for a pause in speech.
        role: tone === "danger" ? "alert" : "status", onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false), onFocusIn: () => setPaused(true), onFocusOut: () => setPaused(false), children: [_jsx("div", { class: "ds-toast-message", children: toast.message }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => onDismiss(toast.id), children: dismissLabel })] }));
}
/** Controlled: the host owns the list. Keep this mounted while empty, because
 * a live region must exist before its content changes to be announced. */
export function ToastRegion({ toasts, onDismiss, label = "Notifications", dismissLabel = "Dismiss", }) {
    return (_jsx("div", { class: "ds-toast-region", role: "region", "aria-label": label, children: toasts.map((toast) => (_jsx(Toast, { toast: toast, onDismiss: onDismiss, dismissLabel: dismissLabel }, toast.id))) }));
}
