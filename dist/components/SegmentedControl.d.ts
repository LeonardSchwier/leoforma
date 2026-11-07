import type { ComponentChildren, JSX } from "preact";
export interface SegmentedOption<V extends string> {
    value: V;
    label: ComponentChildren;
    disabled?: boolean;
}
export interface SegmentedControlProps<V extends string> {
    /** Accessible name of the group. */
    label: string;
    options: readonly SegmentedOption<V>[];
    value: V;
    onChange: (value: V) => void;
    className?: string;
}
/** A single-select radio group: selection shows through weight and surface,
 * not color alone. */
export declare function SegmentedControl<V extends string>({ label, options, value, onChange, className, }: SegmentedControlProps<V>): JSX.Element;
