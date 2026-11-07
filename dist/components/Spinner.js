import { jsx as _jsx } from "preact/jsx-runtime";
export function Spinner({ size = 16, label, className }) {
    return (_jsx("span", { class: ["ds-spinner", className].filter(Boolean).join(" "), role: label ? "status" : undefined, "aria-label": label, "aria-hidden": label ? undefined : true, children: _jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "aria-hidden": "true", children: _jsx("path", { d: "M21 12a9 9 0 1 1-6.2-8.56" }) }) }));
}
