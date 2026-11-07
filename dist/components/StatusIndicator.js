import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { cx } from "./cx.js";
import { Icon } from "./icons.js";
import { Spinner } from "./Spinner.js";
const DEFAULT_ICONS = {
    success: "check",
    warning: "warningTriangle",
    danger: "alertCircle",
};
/** Compact operational status. The text is always visible; icon and color only
 * reinforce it. */
export function StatusIndicator({ children, variant = "neutral", size = "md", live = "off", icon, title, className, }) {
    const resolvedIcon = icon === false ? undefined : (icon ?? DEFAULT_ICONS[variant]);
    const px = size === "sm" ? 16 : 20;
    return (_jsxs("span", { class: cx("ds-status", `ds-status-${variant}`, `ds-status-${size}`, className), role: live === "assertive" ? "alert" : live === "polite" ? "status" : undefined, "aria-atomic": live === "off" ? undefined : "true", "aria-busy": variant === "progress" ? "true" : undefined, title: title, children: [variant === "progress" ? (_jsx(Spinner, { size: px })) : (resolvedIcon && _jsx(Icon, { name: resolvedIcon, size: px })), _jsx("span", { class: "ds-status-label", children: children })] }));
}
