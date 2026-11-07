import type { ComponentChildren, JSX } from "preact";
import { useRef } from "preact/hooks";
import { cx } from "./cx";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ComponentChildren;
}

export function Badge({
  tone = "neutral",
  className,
  children,
  ...rest
}: BadgeProps): JSX.Element {
  return (
    <span
      {...rest}
      class={cx("ds-badge", `ds-badge-${tone}`, className as string | undefined)}
    >
      {children}
    </span>
  );
}

export interface CardProps extends Omit<JSX.HTMLAttributes<HTMLElement>, "title"> {
  title?: ComponentChildren;
  /** Adds the low shadow. Off by default: a border is enough for most cards. */
  raised?: boolean;
  children?: ComponentChildren;
}

export function Card({
  title,
  raised = false,
  className,
  children,
  ...rest
}: CardProps): JSX.Element {
  return (
    <article
      {...rest}
      class={cx(
        "ds-card",
        raised && "ds-card-raised",
        className as string | undefined,
      )}
    >
      {title && <h3 class="ds-card-title">{title}</h3>}
      {children}
    </article>
  );
}

export type EmptyStateSize = "sm" | "md";

export interface EmptyStateProps {
  title: ComponentChildren;
  description?: ComponentChildren;
  /** Decorative glyph, hidden from assistive technology. */
  icon?: ComponentChildren;
  /** Free-form actions. Prefer the two bounded slots below. */
  actions?: ComponentChildren;
  /** At most one primary and one secondary action keep the hierarchy clear. */
  primaryAction?: ComponentChildren;
  secondaryAction?: ComponentChildren;
  size?: EmptyStateSize;
  className?: string;
}

let emptyStateCount = 0;

export function EmptyState({
  title,
  description,
  icon,
  actions,
  primaryAction,
  secondaryAction,
  size = "md",
  className,
}: EmptyStateProps): JSX.Element {
  const idRef = useRef<string | undefined>(undefined);
  if (!idRef.current) {
    emptyStateCount += 1;
    idRef.current = `ds-empty-${emptyStateCount}`;
  }
  const titleId = `${idRef.current}-title`;
  const descriptionId = description ? `${idRef.current}-description` : undefined;
  return (
    <section
      class={cx("ds-empty", `ds-empty-${size}`, className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {icon && (
        <span class="ds-empty-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <p id={titleId} class="ds-empty-title">
        {title}
      </p>
      {description && (
        <p id={descriptionId} class="ds-empty-description">
          {description}
        </p>
      )}
      {(primaryAction || secondaryAction) && (
        <div class="ds-empty-actions">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
      {actions}
    </section>
  );
}
