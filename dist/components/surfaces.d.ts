import type { ComponentChildren, JSX } from "preact";
export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";
export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
    tone?: BadgeTone;
    children: ComponentChildren;
}
export declare function Badge({ tone, className, children, ...rest }: BadgeProps): JSX.Element;
export interface CardProps extends Omit<JSX.HTMLAttributes<HTMLElement>, "title"> {
    title?: ComponentChildren;
    /** Adds the low shadow. Off by default: a border is enough for most cards. */
    raised?: boolean;
    children?: ComponentChildren;
}
export declare function Card({ title, raised, className, children, ...rest }: CardProps): JSX.Element;
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
export declare function EmptyState({ title, description, icon, actions, primaryAction, secondaryAction, size, className, }: EmptyStateProps): JSX.Element;
