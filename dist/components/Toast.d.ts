import type { ComponentChildren, JSX } from "preact";
export type ToastTone = "neutral" | "success" | "warning" | "danger";
export interface ToastItem {
    id: string;
    message: ComponentChildren;
    tone?: ToastTone;
    /** Auto dismiss delay in ms. Omit for a toast that stays until closed, which
     * is the right choice for anything the user must not miss. */
    duration?: number;
}
export interface ToastRegionProps {
    toasts: readonly ToastItem[];
    onDismiss: (id: string) => void;
    /** Accessible name of the landmark. */
    label?: string;
    dismissLabel?: string;
}
/** Controlled: the host owns the list. Keep this mounted while empty, because
 * a live region must exist before its content changes to be announced. */
export declare function ToastRegion({ toasts, onDismiss, label, dismissLabel, }: ToastRegionProps): JSX.Element;
