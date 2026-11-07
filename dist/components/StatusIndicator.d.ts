import type { ComponentChildren, JSX } from "preact";
import { type IconName } from "./icons.js";
export type StatusIndicatorVariant = "neutral" | "progress" | "success" | "warning" | "danger";
export type StatusIndicatorSize = "sm" | "md";
export type StatusIndicatorLive = "off" | "polite" | "assertive";
export interface StatusIndicatorProps {
    children: ComponentChildren;
    variant?: StatusIndicatorVariant;
    size?: StatusIndicatorSize;
    /** Makes changes to the text announced: "polite" as a status, "assertive"
     * as an alert. */
    live?: StatusIndicatorLive;
    /** Overrides the variant's icon; `false` shows none. */
    icon?: IconName | false;
    title?: string;
    className?: string;
}
/** Compact operational status. The text is always visible; icon and color only
 * reinforce it. */
export declare function StatusIndicator({ children, variant, size, live, icon, title, className, }: StatusIndicatorProps): JSX.Element;
