import type { ComponentChildren, JSX } from "preact";
import { Spinner } from "./Spinner";
import { cx } from "./cx";

export type IconButtonSize = "sm" | "md";

export interface IconButtonProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "size" | "label" | "aria-label" | "title" | "loading" | "icon"
> {
  /** The glyph, for example an `Icon`. */
  icon: ComponentChildren;
  /** Required: an icon alone gives assistive technology nothing to announce.
   * Also used as the native tooltip. */
  label: string;
  size?: IconButtonSize;
  /** Makes this a toggle button and exposes its state through `aria-pressed`.
   * Leave it out for an ordinary action: passing nothing renders no
   * `aria-pressed`, so a screen reader does not announce a toggle. */
  active?: boolean;
  /** Replaces the glyph with a spinner and blocks activation. The button stays
   * focusable (`aria-disabled`, not `disabled`), so a keyboard user who pressed
   * it keeps their place. A host `disabled` still disables it natively, and then
   * focus is lost as before: do not pass `disabled` together with `loading`. */
  loading?: boolean;
}

export function IconButton({
  icon,
  label,
  size = "sm",
  active,
  loading = false,
  disabled = false,
  type = "button",
  className,
  class: classAttr,
  onClick,
  "aria-disabled": ariaDisabled,
  ...rest
}: IconButtonProps): JSX.Element {
  // See Button: a busy button stays focusable instead of becoming disabled.
  const busy = loading && !disabled;
  return (
    <button
      {...rest}
      type={type}
      class={cx(
        "ds-icon-btn",
        `ds-icon-btn-${size}`,
        active && "ds-icon-btn-active",
        className as string | undefined,
        classAttr as string | undefined,
      )}
      aria-label={label}
      title={label}
      aria-pressed={active}
      aria-busy={loading || undefined}
      aria-disabled={busy ? "true" : ariaDisabled}
      disabled={Boolean(disabled)}
      onClick={(event) => {
        if (busy) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
    >
      {loading ? <Spinner size={size === "md" ? 20 : 16} /> : icon}
    </button>
  );
}
