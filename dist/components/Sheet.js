import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { cx } from "./cx.js";
import { Dialog } from "./Dialog.js";
import { Icon } from "./icons.js";
import { IconButton } from "./IconButton.js";
/** A modal panel anchored to the bottom edge: the touch-first counterpart to
 * Dialog. It reuses Dialog's contract (focus trap and restoration, Escape,
 * backdrop dismissal, scroll lock, overlay stacking). Mount to open, unmount
 * to close. */
export function Sheet({ className, showCloseButton = true, closeLabel = "Close", onDismiss, children, ...rest }) {
    return (_jsxs(Dialog, { ...rest, className: cx("ds-sheet", className), backdropClassName: "ds-sheet-backdrop", onDismiss: onDismiss, children: [showCloseButton && (_jsx(IconButton, { className: "ds-sheet-close", icon: _jsx(Icon, { name: "close", size: 20 }), label: closeLabel, size: "md", onClick: () => onDismiss("close-button") })), children] }));
}
