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
  lg: "1024px",
  xl: "1280px",
} as const;

export const getResponsiveStyle = (
  base: CSSProperties,
  sm?: CSSProperties,
  lg?: CSSProperties
) => ({
  ...base,
  ...(sm && { [`@media (min-width: ${breakpoints.sm})`]: sm }),
  ...(lg && { [`@media (min-width: ${breakpoints.lg})`]: lg }),
});
