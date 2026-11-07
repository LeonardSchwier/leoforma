import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
/** A typed set of inline SVG icons on a 24 by 24 canvas. Strokes use
 * `currentColor`, so an icon follows the text color of its surroundings. No
 * icon font, no remote fetch. */
export const ICON_NAMES = [
    "close", "chevronDown", "chevronRight", "menu", "search", "plus", "moreHorizontal", "check", "folder", "fileText", "bookmark", "bookmarkFilled", "tag", "graph", "settings", "command", "helpCircle", "warningTriangle", "alertCircle", "spinner", "panelRight", "columns", "code", "eye", "task", "collections", "outline", "swapGroups",
];
const STROKE_WIDTH = 1.8;
const ICON_SHAPES = {
    close: () => (_jsxs(_Fragment, { children: [_jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" }), _jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" })] })),
    chevronDown: () => _jsx("polyline", { points: "6 9 12 15 18 9" }),
    chevronRight: () => _jsx("polyline", { points: "9 6 15 12 9 18" }),
    menu: () => (_jsxs(_Fragment, { children: [_jsx("line", { x1: "4", y1: "6", x2: "20", y2: "6" }), _jsx("line", { x1: "4", y1: "12", x2: "20", y2: "12" }), _jsx("line", { x1: "4", y1: "18", x2: "20", y2: "18" })] })),
    search: () => (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "11", cy: "11", r: "7" }), _jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })] })),
    plus: () => (_jsxs(_Fragment, { children: [_jsx("line", { x1: "12", y1: "5", x2: "12", y2: "19" }), _jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" })] })),
    moreHorizontal: () => (_jsxs("g", { fill: "currentColor", stroke: "none", children: [_jsx("circle", { cx: "5", cy: "12", r: "1.6" }), _jsx("circle", { cx: "12", cy: "12", r: "1.6" }), _jsx("circle", { cx: "19", cy: "12", r: "1.6" })] })),
    check: () => _jsx("polyline", { points: "5 12 10 17 19 7" }),
    folder: () => (_jsx("path", { d: "M4 6.5C4 5.67 4.67 5 5.5 5H10L12 7.5H18.5C19.33 7.5 20 8.17 20 9V17.5C20 18.33 19.33 19 18.5 19H5.5C4.67 19 4 18.33 4 17.5V6.5Z" })),
    fileText: () => (_jsxs(_Fragment, { children: [_jsx("path", { d: "M7 3.5H14L18 7.5V20.5H7C6.45 20.5 6 20.05 6 19.5V4.5C6 3.95 6.45 3.5 7 3.5Z" }), _jsx("path", { d: "M14 3.5V7.5H18" }), _jsx("line", { x1: "9", y1: "12", x2: "15", y2: "12" }), _jsx("line", { x1: "9", y1: "15.5", x2: "15", y2: "15.5" })] })),
    bookmark: () => _jsx("path", { d: "M6.5 4H17.5V20L12 16.5L6.5 20V4Z" }),
    bookmarkFilled: () => _jsx("path", { d: "M6.5 4H17.5V20L12 16.5L6.5 20V4Z", fill: "currentColor" }),
    tag: () => (_jsxs(_Fragment, { children: [_jsx("path", { d: "M12.5 4H19C19.55 4 20 4.45 20 5V11.5L11 20.5L3.5 13L12.5 4Z" }), _jsx("circle", { cx: "16", cy: "8", r: "1.4", fill: "currentColor", stroke: "none" })] })),
    graph: () => (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "6", cy: "7", r: "2.3" }), _jsx("circle", { cx: "18", cy: "6", r: "2.3" }), _jsx("circle", { cx: "9", cy: "18", r: "2.3" }), _jsx("line", { x1: "7.8", y1: "8.3", x2: "16", y2: "6.7" }), _jsx("line", { x1: "7", y1: "9", x2: "8.5", y2: "16" })] })),
    settings: () => (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "3.2" }), _jsx("path", { d: "M12 3.5V6M12 18V20.5M20.5 12H18M6 12H3.5M17.6 6.4L15.9 8.1M8.1 15.9L6.4 17.6M17.6 17.6L15.9 15.9M8.1 8.1L6.4 6.4" })] })),
    command: () => (_jsxs(_Fragment, { children: [_jsx("polyline", { points: "4 17 10 11 4 5" }), _jsx("line", { x1: "12", y1: "19", x2: "20", y2: "19" })] })),
    helpCircle: () => (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M9.3 9.3C9.3 7.9 10.5 6.8 12 6.8C13.5 6.8 14.7 7.9 14.7 9.3C14.7 10.7 12 11.2 12 13.6" }), _jsx("circle", { cx: "12", cy: "16.8", r: "0.15", fill: "currentColor", stroke: "currentColor", "stroke-width": 1.4 })] })),
    warningTriangle: () => (_jsxs(_Fragment, { children: [_jsx("path", { d: "M12 4L21 19.5H3L12 4Z" }), _jsx("line", { x1: "12", y1: "10", x2: "12", y2: "14.5" }), _jsx("circle", { cx: "12", cy: "17", r: "0.15", fill: "currentColor", stroke: "currentColor", "stroke-width": 1.4 })] })),
    alertCircle: () => (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("line", { x1: "12", y1: "7.5", x2: "12", y2: "13" }), _jsx("circle", { cx: "12", cy: "16.2", r: "0.15", fill: "currentColor", stroke: "currentColor", "stroke-width": 1.4 })] })),
    spinner: () => _jsx("path", { d: "M12 3.5A8.5 8.5 0 1 1 3.5 12" }),
    panelRight: () => (_jsxs(_Fragment, { children: [_jsx("rect", { x: "3.5", y: "4.5", width: "17", height: "15", rx: "1.6" }), _jsx("line", { x1: "15", y1: "4.5", x2: "15", y2: "19.5" })] })),
    columns: () => (_jsxs(_Fragment, { children: [_jsx("rect", { x: "3.5", y: "4.5", width: "7.5", height: "15", rx: "1.4" }), _jsx("rect", { x: "13", y: "4.5", width: "7.5", height: "15", rx: "1.4" })] })),
    code: () => (_jsxs(_Fragment, { children: [_jsx("polyline", { points: "9 8 4.5 12 9 16" }), _jsx("polyline", { points: "15 8 19.5 12 15 16" })] })),
    eye: () => (_jsxs(_Fragment, { children: [_jsx("path", { d: "M2.5 12C2.5 12 6 5.5 12 5.5C18 5.5 21.5 12 21.5 12C21.5 12 18 18.5 12 18.5C6 18.5 2.5 12 2.5 12Z" }), _jsx("circle", { cx: "12", cy: "12", r: "2.6" })] })),
    task: () => (_jsxs(_Fragment, { children: [_jsx("rect", { x: "3.6", y: "3.6", width: "7.2", height: "7.2", rx: "1.2" }), _jsx("path", { d: "M5.4 7.2l1.2 1.2 2.4-2.4", "stroke-width": 1.44 }), _jsx("path", { d: "M14.4 7.2h6M3.6 16.8h7.2M14.4 16.8h6" })] })),
    collections: () => (_jsxs(_Fragment, { children: [_jsx("rect", { x: "3.6", y: "4.8", width: "16.8", height: "4.8", rx: "1.2" }), _jsx("rect", { x: "3.6", y: "12", width: "16.8", height: "4.8", rx: "1.2" }), _jsx("circle", { cx: "6.6", cy: "7.2", r: "0.72", fill: "currentColor", stroke: "none" }), _jsx("circle", { cx: "6.6", cy: "14.4", r: "0.72", fill: "currentColor", stroke: "none" })] })),
    outline: () => _jsx("path", { d: "M4.8 6h14.4M4.8 12h9.6M4.8 18h12" }),
    swapGroups: () => (_jsxs(_Fragment, { children: [_jsx("path", { d: "M3.6 8.4h13.2M13.2 4.2L17.4 8.4 13.2 12.6" }), _jsx("path", { d: "M20.4 15.6H7.2M10.8 11.4L6.6 15.6 10.8 19.8" })] })),
};
export function Icon({ name, size = 20, className, title }) {
    const Shape = ICON_SHAPES[name];
    return (_jsxs("svg", { class: className ? `ds-icon ${className}` : "ds-icon", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": STROKE_WIDTH, "stroke-linecap": "round", "stroke-linejoin": "round", role: title ? "img" : undefined, "aria-label": title, "aria-hidden": title ? undefined : "true", children: [title && _jsx("title", { children: title }), _jsx(Shape, {})] }));
}
