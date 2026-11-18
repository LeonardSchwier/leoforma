# Overlays

Source: [`Dialog.tsx`](../../src/components/Dialog.tsx), [`Sheet.tsx`](../../src/components/Sheet.tsx), [`Tooltip.tsx`](../../src/components/Tooltip.tsx), [`Toast.tsx`](../../src/components/Toast.tsx), [`overlayStack.ts`](../../src/components/overlayStack.ts).

| Component | Light | Dark |
| --- | --- | --- |
| Dialog | ![Dialog, light](../screenshots/dialog-light.png) | ![Dialog, dark](../screenshots/dialog-dark.png) |
| Sheet | ![Sheet, light](../screenshots/sheet-light.png) | ![Sheet, dark](../screenshots/sheet-dark.png) |
| Tooltip | ![Tooltip, light](../screenshots/tooltip-light.png) | ![Tooltip, dark](../screenshots/tooltip-dark.png) |
| ToastRegion | ![ToastRegion, light](../screenshots/toast-light.png) | ![ToastRegion, dark](../screenshots/toast-dark.png) |

## Dialog

Rendered when you render it: the host owns open state and decides what `onDismiss` does. Dismiss reasons are `escape`, `backdrop`, `backbutton` and `close-button`.

<!-- props:DialogProps -->
| Prop | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | `string` | yes |  |
| `description` | `ComponentChildren` | no |  |
| `children` | `ComponentChildren` | no |  |
| `actions` | `ComponentChildren` | no |  |
| `role` | `DialogRole` | no |  |
| `size` | `DialogSize` | no |  |
| `className` | `string` | no |  |
| `backdropClassName` | `string` | no | Extra class on the backdrop, for host-specific placement. |
| `closeOnEscape` | `boolean` | no |  |
| `closeOnBackdrop` | `boolean` | no |  |
| `restoreFocus` | `boolean` | no |  |
| `initialFocusRef` | `{ current: HTMLElement \| null }` | no |  |
| `onDismiss` | `(reason: DialogDismissReason) => void` | yes |  |
<!-- /props -->

Accessibility: `role` is `dialog` or `alertdialog` with `aria-modal`, named by `title` and described by `description`. Focus moves in before paint (to `initialFocusRef`, else the first focusable element), Tab is trapped among the real tab stops (not `tabindex="-1"` options, hidden inputs, or `hidden`, `inert` and `aria-hidden` subtrees), Escape closes only the topmost overlay (an open `Menu` inside the dialog takes the first Escape, the dialog the next), and focus returns to the previous element unless `restoreFocus` is false. Escape and Tab pressed while an input method is composing (CJK text entry) belong to the IME and are ignored by the dialog. Page scroll is locked while open, reference counted for stacked dialogs. A host with a native back button can call `dismissTopOverlay("backbutton")` and subscribe with `onOverlayPush`.

## Sheet

A bottom-anchored `Dialog` with a visible close button. It shares all Dialog behaviour above.

<!-- props:SheetProps -->
| Prop | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | `string` | yes |  |
| `description` | `ComponentChildren` | no |  |
| `children` | `ComponentChildren` | no |  |
| `actions` | `ComponentChildren` | no |  |
| `className` | `string` | no |  |
| `closeOnEscape` | `boolean` | no |  |
| `closeOnBackdrop` | `boolean` | no |  |
| `restoreFocus` | `boolean` | no |  |
| `initialFocusRef` | `{ current: HTMLElement \| null }` | no |  |
| `showCloseButton` | `boolean` | no | Default true. A sheet is often used on touch screens where hover or a keyboard is not available, so it ships a visible close control. |
| `closeLabel` | `string` | no | Accessible name of the close control; translate it in a localized host. |
| `onDismiss` | `(reason: SheetDismissReason) => void` | yes |  |
<!-- /props -->

## Tooltip

Supplementary description only, for a single focusable child.

<!-- props:TooltipProps -->
| Prop | Type | Required | Notes |
| --- | --- | --- | --- |
| `content` | `string` | yes |  |
| `placement` | `TooltipPlacement` | no |  |
| `delay` | `number` | no | Hover delay in ms. Keyboard focus shows it at once, since a keyboard user has no pointer path that could trigger it by accident. |
| `disabled` | `boolean` | no |  |
| `children` | `VNode<TriggerProps>` | yes | A single focusable element. |
<!-- /props -->

Accessibility: connected through `aria-describedby` while visible; shows at once on keyboard focus, after `delay` on hover. For WCAG 1.4.13 (content on hover or focus) it is dismissible (Escape, except while an input method is composing) and hoverable (leaving the trigger or the tooltip starts a 150 ms grace period, so the pointer can cross the gap and rest on the tooltip, and entering either one again cancels the close). A tooltip opened by hover stays until the pointer has left. One opened by keyboard focus stays while the trigger has keyboard focus (`:focus-visible`), even after the pointer has hovered the trigger or the tooltip and left, and closes on blur or Escape. A mouse click that only focuses the trigger does not pin it open: that tooltip still closes 150 ms after the pointer leaves, unless the user has pressed a key on the trigger before the pointer leaves. The tooltip takes pointer events, so while it is open it covers, and takes the clicks meant for, whatever is under it; move the pointer away and it closes. Place it away from neighbouring controls. Never put essential information only in a tooltip.

## ToastRegion

<!-- props:ToastRegionProps -->
| Prop | Type | Required | Notes |
| --- | --- | --- | --- |
| `toasts` | `readonly ToastItem[]` | yes |  |
| `onDismiss` | `(id: string) => void` | yes |  |
| `label` | `string` | no | Accessible name of the landmark. |
| `dismissLabel` | `string` | no |  |
<!-- /props -->

Each toast:

<!-- props:ToastItem -->
| Prop | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `string` | yes |  |
| `message` | `ComponentChildren` | yes |  |
| `tone` | `ToastTone` | no |  |
| `duration` | `number` | no | Auto dismiss delay in ms. Omit for a toast that stays until closed, which is the right choice for anything the user must not miss. |
<!-- /props -->

Accessibility: a labelled `region` landmark. Danger toasts use `role="alert"`, the others `role="status"`. Omit `duration` for messages the user must not miss.
