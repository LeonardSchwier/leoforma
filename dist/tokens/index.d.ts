/**
 * The single source of truth for every design token. `scripts/build.mjs`
 * turns this module into `tokens.css` and `tokens.json`, so a value changed
 * here reaches all three formats and the contrast test in the same step.
 */
/** Semantic color roles. Components read roles, never raw palette values. */
export interface ColorRoles {
    /** The page or application background. */
    canvas: string;
    /** Docked panels that sit on the canvas. */
    panel: string;
    /** Floating or lifted surfaces: menus, dialogs, cards. */
    raised: string;
    /** Recessed wells and code backgrounds. */
    sunken: string;
    hover: string;
    selected: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    /** Decorative separators. Exempt from non-text contrast by WCAG 1.4.11. */
    border: string;
    /** Boundaries of interactive controls. Must reach 3:1 on every surface. */
    borderStrong: string;
    accent: string;
    accentHover: string;
    accentSoft: string;
    onAccent: string;
    success: string;
    warning: string;
    danger: string;
    onDanger: string;
    focus: string;
    /** Marks and ornaments only, never text: gold or frost ribbon color. */
    ornament: string;
}
export type ThemeName = "folio" | "nordic";
export type ColorMode = "light" | "dark";
export interface Elevation {
    low: string;
    high: string;
}
export interface Theme {
    /** Display name. */
    label: string;
    description: string;
    color: Record<ColorMode, ColorRoles>;
    elevation: Record<ColorMode, Elevation>;
}
export declare const themes: Record<ThemeName, Theme>;
export declare const DEFAULT_THEME: ThemeName;
export declare const space: {
    readonly "0-5": "2px";
    readonly "1": "4px";
    readonly "1-5": "6px";
    readonly "2": "8px";
    readonly "3": "12px";
    readonly "4": "16px";
    readonly "5": "20px";
    readonly "6": "24px";
    readonly "8": "32px";
    readonly "10": "40px";
    readonly "12": "48px";
    readonly "16": "64px";
};
export declare const radius: {
    readonly sm: "4px";
    readonly md: "6px";
    readonly lg: "10px";
    readonly xl: "14px";
    readonly full: "999px";
};
export declare const font: {
    /** Figtree, bundled. System faces follow for glyphs outside its subsets. */
    readonly sans: "\"Figtree\", -apple-system, \"Segoe UI\", \"Noto Sans\", sans-serif";
    /** Literata, bundled, drawn for long reading. */
    readonly serif: "\"Literata\", ui-serif, Georgia, Cambria, \"Times New Roman\", serif";
    /** Source Code Pro, bundled. */
    readonly mono: "\"Source Code Pro\", ui-monospace, monospace";
};
export declare const fontSize: {
    readonly xs: "0.75rem";
    readonly sm: "0.8125rem";
    readonly md: "0.875rem";
    readonly lg: "1rem";
    readonly xl: "1.25rem";
    readonly "2xl": "1.625rem";
    readonly "3xl": "2.25rem";
};
export declare const fontWeight: {
    readonly regular: "400";
    readonly medium: "500";
    readonly semibold: "600";
};
export declare const lineHeight: {
    readonly tight: "1.25";
    readonly normal: "1.5";
    readonly reading: "1.7";
};
export declare const motion: {
    readonly fast: "100ms";
    readonly popover: "160ms";
    readonly sheet: "200ms";
    readonly saved: "1500ms";
};
export declare const easing: {
    readonly standard: "cubic-bezier(0.2, 0, 0, 1)";
};
/** Durations once `prefers-reduced-motion: reduce` applies. */
export declare const REDUCED_MOTION_DURATION = "1ms";
export declare const zIndex: {
    readonly popover: "1000";
    readonly dialog: "1100";
    readonly toast: "1200";
};
/** `canvasText` becomes `canvas-text`, matching the emitted CSS names. */
export declare function cssVarName(group: string, key: string): string;
/** A role's custom property, for code that needs a reference, not a value. */
export declare function colorVar(role: keyof ColorRoles): string;
export declare const tokens: {
    readonly themes: Record<ThemeName, Theme>;
    readonly defaultTheme: "folio";
    readonly space: {
        readonly "0-5": "2px";
        readonly "1": "4px";
        readonly "1-5": "6px";
        readonly "2": "8px";
        readonly "3": "12px";
        readonly "4": "16px";
        readonly "5": "20px";
        readonly "6": "24px";
        readonly "8": "32px";
        readonly "10": "40px";
        readonly "12": "48px";
        readonly "16": "64px";
    };
    readonly radius: {
        readonly sm: "4px";
        readonly md: "6px";
        readonly lg: "10px";
        readonly xl: "14px";
        readonly full: "999px";
    };
    readonly font: {
        /** Figtree, bundled. System faces follow for glyphs outside its subsets. */
        readonly sans: "\"Figtree\", -apple-system, \"Segoe UI\", \"Noto Sans\", sans-serif";
        /** Literata, bundled, drawn for long reading. */
        readonly serif: "\"Literata\", ui-serif, Georgia, Cambria, \"Times New Roman\", serif";
        /** Source Code Pro, bundled. */
        readonly mono: "\"Source Code Pro\", ui-monospace, monospace";
    };
    readonly fontSize: {
        readonly xs: "0.75rem";
        readonly sm: "0.8125rem";
        readonly md: "0.875rem";
        readonly lg: "1rem";
        readonly xl: "1.25rem";
        readonly "2xl": "1.625rem";
        readonly "3xl": "2.25rem";
    };
    readonly fontWeight: {
        readonly regular: "400";
        readonly medium: "500";
        readonly semibold: "600";
    };
    readonly lineHeight: {
        readonly tight: "1.25";
        readonly normal: "1.5";
        readonly reading: "1.7";
    };
    readonly motion: {
        readonly fast: "100ms";
        readonly popover: "160ms";
        readonly sheet: "200ms";
        readonly saved: "1500ms";
    };
    readonly easing: {
        readonly standard: "cubic-bezier(0.2, 0, 0, 1)";
    };
    readonly zIndex: {
        readonly popover: "1000";
        readonly dialog: "1100";
        readonly toast: "1200";
    };
};
