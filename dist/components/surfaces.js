import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useRef } from "preact/hooks";
import { cx } from "./cx.js";
export function Badge({ tone = "neutral", className, children, ...rest }) {
    return (_jsx("span", { ...rest, class: cx("ds-badge", `ds-badge-${tone}`, className), children: children }));
}
export function Card({ title, raised = false, className, children, ...rest }) {
    return (_jsxs("article", { ...rest, class: cx("ds-card", raised && "ds-card-raised", className), children: [title && _jsx("h3", { class: "ds-card-title", children: title }), children] }));
}
let emptyStateCount = 0;
export function EmptyState({ title, description, icon, actions, primaryAction, secondaryAction, size = "md", className, }) {
    const idRef = useRef(undefined);
    if (!idRef.current) {
        emptyStateCount += 1;
        idRef.current = `ds-empty-${emptyStateCount}`;
    }
    const titleId = `${idRef.current}-title`;
    const descriptionId = description ? `${idRef.current}-description` : undefined;
    return (_jsxs("section", { class: cx("ds-empty", `ds-empty-${size}`, className), "aria-labelledby": titleId, "aria-describedby": descriptionId, children: [icon && (_jsx("span", { class: "ds-empty-icon", "aria-hidden": "true", children: icon })), _jsx("p", { id: titleId, class: "ds-empty-title", children: title }), description && (_jsx("p", { id: descriptionId, class: "ds-empty-description", children: description })), (primaryAction || secondaryAction) && (_jsxs("div", { class: "ds-empty-actions", children: [primaryAction, secondaryAction] })), actions] }));
}
