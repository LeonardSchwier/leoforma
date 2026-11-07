import type { ComponentChildren, JSX } from "preact";
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";
export interface ButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "size" | "loading"> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Shows a spinner and blocks activation. The label stays in the DOM so the
     * accessible name does not change while busy. */
    loading?: boolean;
    children: ComponentChildren;
}
export declare function Button({ variant, size, loading, disabled, type, className, children, ...rest }: ButtonProps): JSX.Element;
