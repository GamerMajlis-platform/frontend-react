// OptimizedStyles.ts - Consolidated styling system
import type { CSSProperties } from "react";

// === DESIGN SYSTEM CONSTANTS ===
const theme = {
  colors: {
    primary: "var(--color-primary)",
    primaryHover: "var(--color-primary-hover)",
    dark: "var(--color-dark)",
    darkSecondary: "var(--color-dark-secondary)",
    text: "var(--color-text)",
    textSecondary: "var(--color-text-secondary)",
  },
  spacing: {
    xs: "var(--spacing-xs)",
    sm: "var(--spacing-sm)",
    md: "var(--spacing-md)",
    lg: "var(--spacing-lg)",
    xl: "var(--spacing-xl)",
  },
  radius: {
    sm: "var(--border-radius-sm)",
    md: "var(--border-radius-md)",
    lg: "var(--border-radius-lg)",
    full: "var(--border-radius-full)",
  },
  transitions: {
    fast: "var(--transition-fast)",
    normal: "var(--transition-normal)",
  },
  fonts: {
    system: "Inter, system-ui, sans-serif",
    alice: "Alice-Regular, serif",
  },
} as const;

// === UTILITY FUNCTIONS ===
export const isRTL = (): boolean => {
  const htmlLang = document.documentElement.lang;
  const htmlDir = document.documentElement.dir;
  const rtlTest = /[\u0600-\u06FF\u0750-\u077F]/;

  return (
    htmlDir === "rtl" ||
    htmlLang === "ar" ||
    rtlTest.test(document.body.innerText || "")
  );
};

// === COMMON COMPONENT BUILDERS ===
export const button = (
  variant: "primary" | "secondary" = "primary",
  size: "sm" | "md" | "lg" = "md"
): CSSProperties => {
  const sizes = {
    sm: {
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      fontSize: "14px",
    },
    md: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: "16px",
    },
    lg: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      fontSize: "18px",
    },
  };

  return {
    fontFamily: theme.fonts.system,
    fontWeight: "500",
    border: "none",
    borderRadius: theme.radius.md,
    cursor: "pointer",
    transition: theme.transitions.normal,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    outline: "none",
    ...sizes[size],
    ...(variant === "primary"
      ? {
          backgroundColor: theme.colors.primary,
          color: theme.colors.dark,
        }
      : {
          backgroundColor: theme.colors.darkSecondary,
          color: theme.colors.text,
        }),
  };
};

export const card = (padding: "sm" | "md" | "lg" = "md"): CSSProperties => ({
  backgroundColor: theme.colors.darkSecondary,
  borderRadius: theme.radius.lg,
  transition: theme.transitions.normal,
  padding:
    padding === "sm"
      ? theme.spacing.sm
      : padding === "lg"
      ? theme.spacing.lg
      : theme.spacing.md,
});

export const input = (): CSSProperties => ({
  fontFamily: theme.fonts.system,
  fontSize: "16px",
  backgroundColor: theme.colors.darkSecondary,
  color: theme.colors.text,
  border: "1px solid transparent",
  borderRadius: theme.radius.md,
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  transition: theme.transitions.fast,
  outline: "none",
});

// === LAYOUT UTILITIES ===
export const flex = {
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as CSSProperties,
  between: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as CSSProperties,
  column: { display: "flex", flexDirection: "column" } as CSSProperties,
};

export const grid = (columns: number = 1): CSSProperties => ({
  display: "grid",
  gap: theme.spacing.md,
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
});

export const responsiveGrid = `
.responsive-grid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 640px) {
  .responsive-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .responsive-grid { grid-template-columns: repeat(3, 1fr); }  
}

@media (min-width: 1280px) {
  .responsive-grid { grid-template-columns: repeat(4, 1fr); }
}
`;

// === SPECIFIC COMPONENT STYLES ===
export const messageButton = (isHovered = false): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  height: "40px",
  padding: "0 16px",
  backgroundColor: isHovered
    ? "rgba(255, 255, 255, 0.95)"
    : "rgba(255, 255, 255, 0.85)",
  color: "#1C2541",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  transition: "all 0.2s ease",
});

export const wishlistPage: CSSProperties = {
  background: `linear-gradient(135deg, ${theme.colors.dark} 0%, ${theme.colors.darkSecondary} 100%)`,
  minHeight: "calc(100vh - 88px)",
  padding: `${theme.spacing.xl} ${theme.spacing.md}`,
  fontFamily: theme.fonts.alice,
};

export const wishlistTitle: CSSProperties = {
  fontSize: "3rem",
  fontWeight: "300",
  color: theme.colors.text,
  textAlign: "center",
  marginBottom: theme.spacing.md,
  fontFamily: theme.fonts.alice,
};

// === RTL FIXES ===
export const rtlFixes = `
[dir="rtl"] .header-controls,
.header-controls {
  direction: ltr !important;
}

[dir="rtl"] .header-controls > * {
  direction: ltr !important;
}
`;

export default theme;
