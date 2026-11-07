import type { JSX } from "preact";
export interface SpinnerProps {
    size?: number;
    /** Announced text. Without it the spinner is decorative, for cases where a
     * surrounding control already says that it is busy. */
    label?: string;
    className?: string;
}
export declare function Spinner({ size, label, className }: SpinnerProps): JSX.Element;
