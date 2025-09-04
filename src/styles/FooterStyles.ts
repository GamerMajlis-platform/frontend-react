import type { CSSProperties } from "react";
import { colors, fonts } from "./BaseStyles";

export const footer: CSSProperties = {
  width: "100%",
  backgroundColor: colors.dark,
  borderTop: `1px solid ${colors.darkSecondary}`,
};

export const container: CSSProperties = {
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "48px 24px",
};

export const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "32px",
};

export const brandRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px",
};

export const brandImage: CSSProperties = {
  height: "30px",
  width: "auto",
  display: "block",
  marginBottom: "4px",
};

export const brandText: CSSProperties = {
  color: "#ffffff",
  fontFamily: fonts.alice,
  fontSize: "22px",
  fontWeight: 600,
};

export const description: CSSProperties = {
  color: colors.textSecondary,
  fontSize: "14px",
  maxWidth: "540px",
  lineHeight: 1.6,
};

export const sectionTitle: CSSProperties = {
  color: colors.text,
  fontWeight: 600,
  marginBottom: "12px",
  fontFamily: fonts.alice,
};

export const list: CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

export const link: CSSProperties = {
  color: colors.textSecondary,
  textDecoration: "none",
  fontSize: "14px",
};

export const bottomBar: CSSProperties = {
  borderTop: `1px solid ${colors.darkSecondary}`,
  marginTop: "32px",
  paddingTop: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  rowGap: "12px",
};

export const rights: CSSProperties = {
  color: colors.textSecondary,
  fontSize: "13px",
};
