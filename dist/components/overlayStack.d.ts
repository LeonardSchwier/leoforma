/**
 * Shared bookkeeping for modal surfaces. Stacked overlays need one owner of
 * "who is on top", so Escape and a host's back gesture close only the topmost.
 * The module stays platform free: a host with a native back button subscribes
 * with `onOverlayPush` and calls `dismissTopOverlay`.
 */
export type OverlayDismissReason = "escape" | "backdrop" | "backbutton" | "close-button";
export interface OverlayStackEntry {
    id: string;
    isDismissible: () => boolean;
    dismiss: (reason: OverlayDismissReason) => void;
}
/** Called on each push, so a host can install its back handler lazily. */
export declare function onOverlayPush(listener: (() => void) | null): void;
export declare function pushOverlay(entry: OverlayStackEntry): () => void;
export declare function isTopmostOverlay(id: string): boolean;
/** Returns whether an overlay was open, whether or not it agreed to close: a
 * non-dismissible overlay still consumes the gesture. */
export declare function dismissTopOverlay(reason: OverlayDismissReason): boolean;
/** Reference counted, so closing one of two stacked dialogs keeps the lock. */
export declare function acquireScrollLock(): () => void;
export declare const FOCUSABLE_SELECTOR: string;
export declare function focusableElements(container: HTMLElement): HTMLElement[];
export declare function nextOverlayId(prefix: string): string;
export declare function resetOverlayStackForTests(): void;
