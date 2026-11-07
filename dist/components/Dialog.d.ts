import type { ComponentChildren, JSX } from "preact";
import { type OverlayDismissReason } from "./overlayStack.js";
export type DialogRole = "dialog" | "alertdialog";
export type DialogSize = "sm" | "md" | "lg";
export type DialogDismissReason = OverlayDismissReason;
export interface DialogProps {
    title: string;
    description?: ComponentChildren;
    children?: ComponentChildren;
    actions?: ComponentChildren;
    role?: DialogRole;
    size?: DialogSize;
    className?: string;
    /** Extra class on the backdrop, for host-specific placement. */
    backdropClassName?: string;
    closeOnEscape?: boolean;
    closeOnBackdrop?: boolean;
    restoreFocus?: boolean;
    initialFocusRef?: {
        current: HTMLElement | null;
    };
    onDismiss: (reason: DialogDismissReason) => void;
}
/** A modal dialog with a focus trap, Escape handling that respects stacking,
 * focus restoration, and a body scroll lock. Mount to open, unmount to close. */
export declare function Dialog({ title, description, children, actions, role, size, className, backdropClassName, closeOnEscape, closeOnBackdrop, restoreFocus, initialFocusRef, onDismiss, }: DialogProps): JSX.Element;
