import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Spinner } from "./Spinner.js";
import { cx } from "./cx.js";
export function Button({ variant = "secondary", size = "md", loading = false, disabled = false, type = "button", className, children, ...rest }) {
    return (_jsxs("button", { ...rest, type: type, class: cx("ds-btn", `ds-btn-${variant}`, `ds-btn-${size}`, className), disabled: Boolean(disabled) || loading, "aria-busy": loading || undefined, children: [loading && (_jsx("span", { class: "ds-btn-spinner", children: _jsx(Spinner, { size: 16 }) })), children] }));
}
