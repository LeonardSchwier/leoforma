import type { ComponentChildren, JSX } from "preact";
import { Spinner } from "./Spinner";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "size" | "loading"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks activation. The label stays in the DOM so the
   * accessible name does not change while busy, and the button stays focusable
   * (`aria-disabled`, not `disabled`), so a keyboard user who pressed it keeps
   * their place. A host `disabled` still disables it natively, and then focus
   * is lost as before: do not pass `disabled` together with `loading`. */
  loading?: boolean;
  children: ComponentChildren;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className,
  class: classAttr,
  onClick,
  "aria-disabled": ariaDisabled,
  children,
  ...rest
}: ButtonProps): JSX.Element {
  // A busy button must not be natively disabled: a focused button that becomes
  // disabled loses focus (to the body in Chromium), so every keyboard user who
  // pressed "Save" would lose their place. It stays focusable and swallows
  // activation instead. An explicit `disabled` still wins and stays native.
  const busy = loading && !disabled;
  return (
    <button
      {...rest}
      type={type}
      class={cx(
        "ds-btn",
        `ds-btn-${variant}`,
        `ds-btn-${size}`,
        className as string | undefined,
        classAttr as string | undefined,
      )}
      disabled={Boolean(disabled)}
      aria-disabled={busy ? "true" : ariaDisabled}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (busy) {
          // Enter and Space reach here as a click too. preventDefault also stops
          // a submit or reset button from acting, and stopPropagation keeps the
          // click away from ancestors, as a natively disabled button did.
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
    >
      {loading && (
        <span class="ds-btn-spinner">
          <Spinner size={16} />
        </span>
      )}
      {children}
    </button>
  );
}
