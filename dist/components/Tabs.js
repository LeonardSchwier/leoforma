import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useRef } from "preact/hooks";
import { cx } from "./cx.js";
import { nextRovingIndex } from "./rovingKeys.js";
let tabsCounter = 0;
/** WAI-ARIA tabs with automatic activation: an arrow key both moves focus and
 * selects, because panels here render without a network or heavy load. */
export function Tabs({ label, items, value, onChange, className }) {
    const idRef = useRef(undefined);
    if (!idRef.current) {
        tabsCounter += 1;
        idRef.current = `ds-tabs-${tabsCounter}`;
    }
    const baseId = idRef.current;
    const listRef = useRef(null);
    const selectedIndex = Math.max(0, items.findIndex((item) => item.id === value));
    const selected = items[selectedIndex];
    function onKeyDown(event) {
        const next = nextRovingIndex(event.key, selectedIndex, items.map((item) => !item.disabled));
        if (next === null)
            return;
        event.preventDefault();
        onChange(items[next].id);
        const tabs = listRef.current?.querySelectorAll('[role="tab"]');
        tabs?.[next]?.focus();
    }
    return (_jsxs("div", { class: className, children: [_jsx("div", { ref: listRef, class: "ds-tablist", role: "tablist", "aria-label": label, onKeyDown: onKeyDown, children: items.map((item, index) => (_jsx("button", { type: "button", role: "tab", id: `${baseId}-tab-${item.id}`, class: "ds-tab", "aria-selected": index === selectedIndex, "aria-controls": index === selectedIndex ? `${baseId}-panel-${item.id}` : undefined, tabIndex: index === selectedIndex ? 0 : -1, disabled: item.disabled, onClick: () => onChange(item.id), children: item.label }, item.id))) }), selected && (_jsx("div", { id: `${baseId}-panel-${selected.id}`, class: cx("ds-tabpanel"), role: "tabpanel", "aria-labelledby": `${baseId}-tab-${selected.id}`, tabIndex: 0, children: selected.panel }))] }));
}
