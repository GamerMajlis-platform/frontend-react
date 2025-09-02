import type { CSSProperties } from "react";

// ===== AUTH PAGE STYLES - FIGMA DESIGN (FLEXBOX VERSION) =====

export const authContainer: CSSProperties = {
  width: "100%",
  minHeight: "100vh",
  backgroundColor: "#0B132B", // Swapped: now using card color
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
};

export const authCard: CSSProperties = {
  position: "absolute",
  width: "802px",
  height: "558px",
  left: "calc(50% - 802px/2 - 5px)",
  top: "calc(50% - 558px/2 + 26px)",
  background: "#0B132B",
  boxShadow: "2px 2px 10px #FFFFFF",
  borderRadius: "10px",
  padding: "48px 64px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxSizing: "border-box",
};

export const authHeader: CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "40px",
};

export const authTitle: CSSProperties = {
  fontFamily: "Alice",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "32px",
  lineHeight: "37px",
  textAlign: "center",
  color: "#EEEEEE",
  margin: 0,
};

export const authSubtitle: CSSProperties = {
  display: "none", // Not shown in figma design
};

export const authForm: CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "22px",
};

export const inputGroup: CSSProperties = {
  position: "relative",
  width: "720px",
  height: "48px",
};

export const emailInputGroup: CSSProperties = {
  ...inputGroup,
};

export const passwordInputGroup: CSSProperties = {
  ...inputGroup,
};

export const inputField: CSSProperties = {
  width: "720px",
  height: "48px",
  border: "1px solid rgba(255,255,255,0.28)",
  borderRadius: "24px",
  backgroundColor: "transparent",
  color: "#FFFFFF",
  fontSize: "18px",
  fontFamily: "Alice",
  padding: "0 20px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.15s ease",
};

export const inputFieldFocus: CSSProperties = {
  ...inputField,
  border: "1px solid #6fffe9",
  boxShadow: "0 0 0 4px rgba(111,255,233,0.06)",
};

export const inputLabel: CSSProperties = {
  position: "absolute",
  left: "20px",
  top: "50%",
  transform: "translateY(-50%)",
  fontFamily: "Alice",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "16px",
  lineHeight: "18px",
  color: "rgba(255,255,255,0.6)",
  pointerEvents: "none",
  transition: "all 0.2s ease",
  backgroundColor: "#0B132B",
  padding: "0 8px",
};

export const inputLabelActive: CSSProperties = {
  position: "absolute",
  left: "14px",
  top: "-10px",
  transform: "none",
  fontFamily: "Alice",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "14px",
  lineHeight: "16px",
  color: "#C4FFF9",
  pointerEvents: "none",
  transition: "all 0.18s ease",
  backgroundColor: "#0B132B",
  padding: "0 6px",
};

export const emailLabel: CSSProperties = {
  ...inputLabel,
};

export const passwordLabel: CSSProperties = {
  ...inputLabel,
};

export const authButton: CSSProperties = {
  position: "absolute",
  width: "345px",
  height: "57px",
  left: "calc(50% - 345px/2 - 1.5px)",
  top: "430px",
  background: "#C4FFF9",
  borderRadius: "20px",
  color: "#0B132B",
  fontFamily: "Alice",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "20px",
  lineHeight: "23px",
  cursor: "pointer",
  transition: "opacity 0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const authButtonHover: CSSProperties = {
  opacity: 0.9,
};

export const orText: CSSProperties = {
  fontFamily: "Alice",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "20px",
  lineHeight: "23px",
  textAlign: "center",
  color: "#FFFFFF",
  margin: "20px 0",
  width: "100%",
};

export const discordButton: CSSProperties = {
  width: "345px",
  height: "57px",
  background: "#C4FFF9",
  borderRadius: "20px",
  border: "none",
  color: "#000000", // Updated to match new card background
  fontFamily: "Alice",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "20px",
  lineHeight: "23px",
  cursor: "pointer",
  transition: "opacity 0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const discordButtonHover: CSSProperties = {
  opacity: 0.9,
};

export const authFooter: CSSProperties = {
  position: "absolute",
  width: "347px",
  height: "23px",
  left: "calc(50% - 347px/2 - 0.5px)",
  bottom: "9px",
  fontFamily: "Alice",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "20px",
  lineHeight: "23px",
  textAlign: "center",
  color: "#EEEEEE",
  margin: 0,
};

export const authLink: CSSProperties = {
  color: "#C4FFF9",
  textDecoration: "underline",
  cursor: "pointer",
  transition: "opacity 0.2s ease",
};

export const authLinkHover: CSSProperties = {
  opacity: 0.8,
};

export const backButton: CSSProperties = {
  position: "absolute",
  top: "24px",
  left: "24px",
  padding: "12px 20px",
  backgroundColor: "rgba(75, 85, 99, 0.3)",
  color: "#ffffff",
  border: "2px solid rgba(75, 85, 99, 0.5)",
  borderRadius: "24px",
  cursor: "pointer",
  transition: "opacity 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  backdropFilter: "blur(10px)",
  fontWeight: "500",
};

export const backButtonHover: CSSProperties = {
  opacity: 0.8,
};

// Legacy styles for compatibility
export const authLogo: CSSProperties = {
  display: "none",
};

export const checkboxContainer: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "14px",
  marginTop: "8px",
};

export const checkboxLabel: CSSProperties = {
  display: "flex",
  alignItems: "center",
  color: "#9ca3af",
  cursor: "pointer",
  fontSize: "14px",
};

export const checkbox: CSSProperties = {
  marginRight: "8px",
  accentColor: "#6fffe9",
  width: "16px",
  height: "16px",
};
