import type { ComponentChildren, JSX } from "preact";
import { type DialogDismissReason } from "./Dialog.js";
export type SheetDismissReason = DialogDismissReason;
export interface SheetProps {
    title: string;
    description?: ComponentChildren;
    children?: ComponentChildren;
    actions?: ComponentChildren;
    className?: string;
    closeOnEscape?: boolean;
    closeOnBackdrop?: boolean;
    restoreFocus?: boolean;
    initialFocusRef?: {
        current: HTMLElement | null;
    };
    /** Default true. A sheet is often used on touch screens where hover or a
     * keyboard is not available, so it ships a visible close control. */
    showCloseButton?: boolean;
    /** Accessible name of the close control; translate it in a localized host. */
    closeLabel?: string;
    onDismiss: (reason: SheetDismissReason) => void;
}
/** A modal panel anchored to the bottom edge: the touch-first counterpart to
 * Dialog. It reuses Dialog's contract (focus trap and restoration, Escape,
 * backdrop dismissal, scroll lock, overlay stacking). Mount to open, unmount
 * to close. */
export declare function Sheet({ className, showCloseButton, closeLabel, onDismiss, children, ...rest }: SheetProps): JSX.Element;
