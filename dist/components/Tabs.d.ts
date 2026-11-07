import type { ComponentChildren, JSX } from "preact";
export interface TabItem {
    id: string;
    label: ComponentChildren;
    panel: ComponentChildren;
    disabled?: boolean;
}
export interface TabsProps {
    /** Accessible name of the tab list. */
    label: string;
    items: readonly TabItem[];
    value: string;
    onChange: (id: string) => void;
    className?: string;
}
/** WAI-ARIA tabs with automatic activation: an arrow key both moves focus and
 * selects, because panels here render without a network or heavy load. */
export declare function Tabs({ label, items, value, onChange, className }: TabsProps): JSX.Element;
