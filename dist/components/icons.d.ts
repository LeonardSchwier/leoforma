import type { JSX } from "preact";
/** A typed set of inline SVG icons on a 24 by 24 canvas. Strokes use
 * `currentColor`, so an icon follows the text color of its surroundings. No
 * icon font, no remote fetch. */
export declare const ICON_NAMES: readonly ["close", "chevronDown", "chevronRight", "menu", "search", "plus", "moreHorizontal", "check", "folder", "fileText", "bookmark", "bookmarkFilled", "tag", "graph", "settings", "command", "helpCircle", "warningTriangle", "alertCircle", "spinner", "panelRight", "columns", "code", "eye", "task", "collections", "outline", "swapGroups"];
export type IconName = (typeof ICON_NAMES)[number];
export interface IconProps {
    name: IconName;
    size?: number;
    className?: string;
    /** Without a title the icon is decorative (`aria-hidden`), for use inside a
     * control that already has a name. With one it becomes an image with that
     * accessible name. */
    title?: string;
}
export declare function Icon({ name, size, className, title }: IconProps): JSX.Element;
