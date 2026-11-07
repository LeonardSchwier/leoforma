import type { ComponentChildren, JSX } from "preact";
interface FieldProps {
    /** Visible label, associated with the control through `for`. */
    label: string;
    hint?: ComponentChildren;
    /** Marks the control invalid and connects this text as its description. */
    error?: ComponentChildren;
}
export type InputProps = FieldProps & JSX.InputHTMLAttributes<HTMLInputElement>;
export declare function Input({ label, hint, error, id, className, "aria-describedby": describedBy, ...rest }: InputProps): JSX.Element;
export type TextareaProps = FieldProps & JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;
export declare function Textarea({ label, hint, error, id, className, "aria-describedby": describedBy, ...rest }: TextareaProps): JSX.Element;
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export type SelectProps = FieldProps & Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
    options: readonly SelectOption[];
};
/** A native select: the platform's picker is the accessible one on every
 * target, including touch. */
export declare function Select({ label, hint, error, id, className, options, "aria-describedby": describedBy, ...rest }: SelectProps): JSX.Element;
export type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "label"> & {
    label: ComponentChildren;
};
export declare function Checkbox({ label, className, ...rest }: CheckboxProps): JSX.Element;
export type SwitchProps = CheckboxProps;
/** A checkbox input with `role="switch"`: keeps native Space handling, form
 * participation, and label association while announcing on and off. */
export declare function Switch({ label, className, ...rest }: SwitchProps): JSX.Element;
export {};
