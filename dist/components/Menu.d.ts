import type { ComponentChildren, JSX } from "preact";
export type MenuAlign = "start" | "end";
export type MenuItemVariant = "default" | "danger";
export interface MenuItem {
    id: string;
    label: string;
    onSelect: () => void;
    icon?: ComponentChildren;
    disabled?: boolean;
    /** Says why the item is unavailable, and connects to it for screen readers. */
    disabledReason?: string;
    variant?: MenuItemVariant;
}
export interface MenuProps {
    label: string;
    trigger: ComponentChildren;
    items: readonly MenuItem[];
    align?: MenuAlign;
    disabled?: boolean;
    title?: string;
    className?: string;
    triggerClassName?: string;
}
/** WAI-ARIA menu button. Position is computed in a layout effect, hidden until
 * measured, so the menu never flashes in the wrong place or off screen. */
export declare function Menu({ label, trigger, items, align, disabled, title, className, triggerClassName, }: MenuProps): JSX.Element;
