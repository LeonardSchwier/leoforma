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
  ...rest
}: IconButtonProps): JSX.Element {
  return (
    <button
      {...rest}
      type={type}
      class={cx(
        "ds-icon-btn",
        `ds-icon-btn-${size}`,
        active && "ds-icon-btn-active",
        className as string | undefined,
      )}
      aria-label={label}
      title={label}
      aria-pressed={active}
      aria-busy={loading || undefined}
      disabled={Boolean(disabled) || loading}
    >
      {loading ? <Spinner size={size === "md" ? 20 : 16} /> : icon}
    </button>
  );
}
