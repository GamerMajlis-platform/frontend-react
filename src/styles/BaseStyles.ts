import type { CSSProperties } from "react";

// ===== COMMON COLORS =====
export const colors = {
  primary: "var(--color-primary)",
  primaryHover: "var(--color-primary-hover)",
  dark: "var(--color-dark)",
  darkSecondary: "var(--color-dark-secondary)",
  text: "var(--color-text)",
  textSecondary: "var(--color-text-secondary)",
  // Keep specific colors that aren't in CSS variables
  darkLight: "#3a506b",
  textMuted: "#64748b",
  accent: "#5BC0BE",
  accentSecondary: "#1C2541",
  // Sort by dropdown colors
  sortButtonBg: "#6fffe9", // Current sort by color (cyan-300)
  sortButtonHover: "#5ee6d3", // Sort button hover color
  sortButtonText: "#0f172a", // Sort button text color (slate-900)
  // Product card buy button colors
  buyButtonBg: "#6fffe9", // Product card buy button color
  buyButtonHover: "#5ee6d3", // Product card buy button hover
  buyButtonText: "#0f172a", // Product card buy button text
  // Header background color
  headerBg: "#9ceaef", // Header background color
} as const;

// ===== COMMON FONTS =====
export const fonts = {
  system: "system-ui, -apple-system, sans-serif",
  alice: "Alice-Regular, Helvetica, sans-serif",
  arabic: "Tahoma, Arial, sans-serif",
} as const;

// ===== COMMON TRANSITIONS =====
export const transitions = {
  fast: "var(--transition-fast)",
  normal: "var(--transition-normal)",
  slow: "0.4s ease",
  smooth: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;

// ===== REUSABLE SHADOW EFFECTS =====
export const shadows = {
  small: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  medium:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  large:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  glow: "0 0 20px rgba(111, 255, 233, 0.3)", // primary glow
  glowCyan: "0 0 20px rgba(103, 232, 249, 0.3)", // cyan glow
  innerGlow: "inset 0 2px 4px 0 rgba(111, 255, 233, 0.1)",
} as const;

// ===== BASE COMPONENT STYLES =====
export const baseButton: CSSProperties = {
  border: "none",
  cursor: "pointer",
  transition: transitions.fast,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  outline: "none",
};

export const baseContainer: CSSProperties = {
  width: "100%",
  margin: "0 auto",
  padding: "0 16px",
};

export const baseGradientBackground: CSSProperties = {
  background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkSecondary} 100%)`,
};

export const basePageLayout: CSSProperties = {
  ...baseContainer,
  ...baseGradientBackground,
  minHeight: "calc(100vh - 88px)",
  padding: "32px 16px",
};

export const baseTitle: CSSProperties = {
  fontFamily: fonts.alice,
  fontWeight: "400",
  color: colors.text,
  textAlign: "center",
  lineHeight: "1.2",
  marginBottom: "16px",
};

// ===== COMMON BUTTON VARIANTS =====
export const primaryButton: CSSProperties = {
  ...baseButton,
  backgroundColor: colors.primary,
  color: colors.dark,
  borderRadius: "8px",
  padding: "12px 24px",
  fontWeight: "600",
};

export const primaryButtonHover: CSSProperties = {
  backgroundColor: colors.primaryHover,
};

// ===== RTL UTILITIES =====
export const isRTLText = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
};

export const getRTLStyles = (text: string): CSSProperties => {
  const isRTL = isRTLText(text);
  return {
    direction: isRTL ? "rtl" : "ltr",
    textAlign: isRTL ? "right" : "left",
    fontFamily: isRTL ? fonts.arabic : fonts.system,
  };
};

// ===== RESPONSIVE UTILITIES =====
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

export const getResponsiveStyle = (
  base: CSSProperties,
  sm?: CSSProperties,
  md?: CSSProperties,
  lg?: CSSProperties,
  xl?: CSSProperties
) => ({
  ...base,
  ...(sm && { [`@media (min-width: ${breakpoints.sm})`]: sm }),
  ...(md && { [`@media (min-width: ${breakpoints.md})`]: md }),
  ...(lg && { [`@media (min-width: ${breakpoints.lg})`]: lg }),
  ...(xl && { [`@media (min-width: ${breakpoints.xl})`]: xl }),
});
