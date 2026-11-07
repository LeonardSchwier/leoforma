import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useRef } from "preact/hooks";
import { cx } from "./cx.js";
let fieldCounter = 0;
function useFieldId(explicit) {
    const ref = useRef(undefined);
    if (!ref.current) {
        fieldCounter += 1;
        ref.current = `ds-field-${fieldCounter}`;
    }
    return explicit ?? ref.current;
}
function fieldIds(id, { hint, error }, extra) {
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = cx(typeof extra === "string" && extra, hint ? hintId : undefined, error ? errorId : undefined);
    return { id, describedBy: describedBy || undefined, hintId, errorId };
}
function Field({ label, hint, error, ids, children, }) {
    return (_jsxs("div", { class: "ds-field", children: [_jsx("label", { class: "ds-field-label", for: ids.id, children: label }), children, hint && (_jsx("span", { id: ids.hintId, class: "ds-field-hint", children: hint })), error && (_jsx("span", { id: ids.errorId, class: "ds-field-error", children: error }))] }));
}
export function Input({ label, hint, error, id, className, "aria-describedby": describedBy, ...rest }) {
    const resolved = useFieldId(id);
    const ids = fieldIds(resolved, { hint, error }, describedBy);
    return (_jsx(Field, { label: label, hint: hint, error: error, ids: ids, children: _jsx("input", { ...rest, id: ids.id, class: cx("ds-input", className), "aria-describedby": ids.describedBy, "aria-invalid": error ? true : undefined }) }));
}
export function Textarea({ label, hint, error, id, className, "aria-describedby": describedBy, ...rest }) {
    const resolved = useFieldId(id);
    const ids = fieldIds(resolved, { hint, error }, describedBy);
    return (_jsx(Field, { label: label, hint: hint, error: error, ids: ids, children: _jsx("textarea", { ...rest, id: ids.id, class: cx("ds-textarea", className), "aria-describedby": ids.describedBy, "aria-invalid": error ? true : undefined }) }));
}
/** A native select: the platform's picker is the accessible one on every
 * target, including touch. */
export function Select({ label, hint, error, id, className, options, "aria-describedby": describedBy, ...rest }) {
    const resolved = useFieldId(id);
    const ids = fieldIds(resolved, { hint, error }, describedBy);
    return (_jsx(Field, { label: label, hint: hint, error: error, ids: ids, children: _jsx("select", { ...rest, id: ids.id, class: cx("ds-select", className), "aria-describedby": ids.describedBy, "aria-invalid": error ? true : undefined, children: options.map((option) => (_jsx("option", { value: option.value, disabled: option.disabled, children: option.label }, option.value))) }) }));
}
export function Checkbox({ label, className, ...rest }) {
    return (_jsxs("label", { class: cx("ds-check", className), children: [_jsx("input", { ...rest, type: "checkbox", class: "ds-checkbox-input" }), _jsx("span", { children: label })] }));
}
/** A checkbox input with `role="switch"`: keeps native Space handling, form
 * participation, and label association while announcing on and off. */
export function Switch({ label, className, ...rest }) {
    return (_jsxs("label", { class: cx("ds-check", className), children: [_jsx("input", { ...rest, type: "checkbox", role: "switch", class: "ds-switch-input" }), _jsx("span", { children: label })] }));
}
