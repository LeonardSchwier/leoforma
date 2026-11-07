import type { JSX, VNode } from "preact";
export type TooltipPlacement = "top" | "bottom" | "left" | "right";
type TriggerProps = JSX.HTMLAttributes<HTMLElement> & {
    "aria-describedby"?: string;
};
export interface TooltipProps {
    content: string;
    placement?: TooltipPlacement;
    /** Hover delay in ms. Keyboard focus shows it at once, since a keyboard user
     * has no pointer path that could trigger it by accident. */
    delay?: number;
    disabled?: boolean;
    /** A single focusable element. */
    children: VNode<TriggerProps>;
}
/** Supplementary description only: it connects through `aria-describedby`
 * while visible, and Escape dismisses it (WCAG 1.4.13). */
export declare function Tooltip({ content, placement, delay, disabled, children, }: TooltipProps): JSX.Element;
export {};
