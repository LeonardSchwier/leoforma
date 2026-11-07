import { jsx as _jsx } from "preact/jsx-runtime";
import { useRef } from "preact/hooks";
import { cx } from "./cx.js";
import { nextRovingIndex } from "./rovingKeys.js";
/** A single-select radio group: selection shows through weight and surface,
 * not color alone. */
export function SegmentedControl({ label, options, value, onChange, className, }) {
    const groupRef = useRef(null);
    const selectedIndex = options.findIndex((option) => option.value === value);
    const tabStop = selectedIndex >= 0 ? selectedIndex : 0;
    function onKeyDown(event) {
        const next = nextRovingIndex(event.key, tabStop, options.map((option) => !option.disabled));
        if (next === null)
            return;
        event.preventDefault();
        onChange(options[next].value);
        const radios = groupRef.current?.querySelectorAll('[role="radio"]');
        radios?.[next]?.focus();
    }
    return (_jsx("div", { ref: groupRef, class: cx("ds-segmented", className), role: "radiogroup", "aria-label": label, onKeyDown: onKeyDown, children: options.map((option, index) => (_jsx("button", { type: "button", role: "radio", class: "ds-segmented-option", "aria-checked": option.value === value, tabIndex: index === tabStop ? 0 : -1, disabled: option.disabled, onClick: () => onChange(option.value), children: option.label }, option.value))) }));
}
