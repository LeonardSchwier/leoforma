import type { ComponentChildren, JSX } from "preact";
import { cx } from "./cx";
import { Icon, type IconName } from "./icons";
import { Spinner } from "./Spinner";

export type StatusIndicatorVariant = "neutral" | "progress" | "success" | "warning" | "danger";
export type StatusIndicatorSize = "sm" | "md";
export type StatusIndicatorLive = "off" | "polite" | "assertive";

const DEFAULT_ICONS: Partial<Record<StatusIndicatorVariant, IconName>> = {
  success: "check",
  warning: "warningTriangle",
  danger: "alertCircle",
};

export interface StatusIndicatorProps {
  children: ComponentChildren;
  variant?: StatusIndicatorVariant;
  size?: StatusIndicatorSize;
  /** Makes changes to the text announced: "polite" as a status, "assertive"
   * as an alert. */
  live?: StatusIndicatorLive;
  /** Overrides the variant's icon; `false` shows none. */
  icon?: IconName | false;
  title?: string;
  className?: string;
}

/** Compact operational status. The text is always visible; icon and color only
 * reinforce it. */
export function StatusIndicator({
  children,
  variant = "neutral",
  size = "md",
  live = "off",
  icon,
  title,
  className,
}: StatusIndicatorProps): JSX.Element {
  const resolvedIcon = icon === false ? undefined : (icon ?? DEFAULT_ICONS[variant]);
  const px = size === "sm" ? 16 : 20;
  return (
    <span
      class={cx(
        "ds-status",
        `ds-status-${variant}`,
        `ds-status-${size}`,
        className,
      )}
      role={live === "assertive" ? "alert" : live === "polite" ? "status" : undefined}
      aria-atomic={live === "off" ? undefined : "true"}
      aria-busy={variant === "progress" ? "true" : undefined}
      title={title}
    >
      {variant === "progress" ? (
        <Spinner size={px} />
      ) : (
        resolvedIcon && <Icon name={resolvedIcon} size={px} />
      )}
      <span class="ds-status-label">{children}</span>
    </span>
  );
}
