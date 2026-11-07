import type { ComponentChildren, JSX } from "preact";
export type IconButtonSize = "sm" | "md";
export interface IconButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "size" | "label" | "aria-label" | "title" | "loading" | "icon"> {
    /** The glyph. The system ships no icon set, so hosts keep their own. */
    icon: ComponentChildren;
    /** Required: an icon alone gives assistive technology nothing to announce.
     * Also used as the native tooltip. */
    label: string;
    size?: IconButtonSize;
    /** Exposes a toggle's on state through `aria-pressed`. */
    active?: boolean;
    loading?: boolean;
}
export declare function IconButton({ icon, label, size, active, loading, disabled, type, className, ...rest }: IconButtonProps): JSX.Element;
