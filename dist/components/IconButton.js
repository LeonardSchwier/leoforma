import { jsx as _jsx } from "preact/jsx-runtime";
import { Spinner } from "./Spinner.js";
import { cx } from "./cx.js";
export function IconButton({ icon, label, size = "sm", active = false, loading = false, disabled = false, type = "button", className, ...rest }) {
    return (_jsx("button", { ...rest, type: type, class: cx("ds-icon-btn", `ds-icon-btn-${size}`, active && "ds-icon-btn-active", className), "aria-label": label, title: label, "aria-pressed": active, "aria-busy": loading || undefined, disabled: Boolean(disabled) || loading, children: loading ? _jsx(Spinner, { size: size === "md" ? 20 : 16 }) : icon }));
}
