import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { cx } from "./cx.js";
export function Badge({ tone = "neutral", className, children, ...rest }) {
    return (_jsx("span", { ...rest, class: cx("ds-badge", `ds-badge-${tone}`, className), children: children }));
}
export function Card({ title, raised = false, className, children, ...rest }) {
    return (_jsxs("article", { ...rest, class: cx("ds-card", raised && "ds-card-raised", className), children: [title && _jsx("h3", { class: "ds-card-title", children: title }), children] }));
}
export function EmptyState({ title, description, icon, actions, className, }) {
    return (_jsxs("div", { class: cx("ds-empty", className), children: [icon && _jsx("span", { "aria-hidden": "true", children: icon }), _jsx("p", { class: "ds-empty-title", children: title }), description && _jsx("p", { class: "ds-empty-description", children: description }), actions] }));
}
