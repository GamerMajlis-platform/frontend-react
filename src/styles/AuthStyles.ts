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
  width: "802px",
  height: "552px",
  background: "#000000", // Swapped: now using page color
  boxShadow: "2px 2px 10px #FFFFFF",
  borderRadius: "10px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  padding: "20px",
  boxSizing: "border-box",
};

export const authHeader: CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "60px",
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
  marginTop: "0px", // Positioned from top
};

export const authSubtitle: CSSProperties = {
  display: "none", // Not shown in figma design
};

export const authForm: CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "40px", // Space between email and password
};

export const inputGroup: CSSProperties = {
  position: "relative",
  width: "720px",
  height: "57px",
};

export const emailInputGroup: CSSProperties = {
  ...inputGroup,
};

export const passwordInputGroup: CSSProperties = {
  ...inputGroup,
};

export const inputField: CSSProperties = {
  width: "100%",
  height: "57px",
  border: "1px solid #FFFFFF",
  borderRadius: "20px",
  backgroundColor: "#000000",
  color: "#FFFFFF",
  fontSize: "20px",
  fontFamily: "Alice",
  padding: "16px 20px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
};

export const inputFieldFocus: CSSProperties = {
  ...inputField,
  border: "2px solid #6fffe9",
};

export const inputLabel: CSSProperties = {
  position: "absolute",
  left: "20px",
  top: "50%",
  transform: "translateY(-50%)",
  fontFamily: "Alice",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "20px",
  lineHeight: "23px",
  color: "#FFFFFF",
  pointerEvents: "none",
  transition: "all 0.2s ease",
  backgroundColor: "#000000", // Updated to match new card background
  padding: "0 8px",
};

export const emailLabel: CSSProperties = {
  ...inputLabel,
};

export const passwordLabel: CSSProperties = {
  ...inputLabel,
};

export const authButton: CSSProperties = {
  width: "345px",
  height: "57px",
  background: "#C4FFF9",
  border: "1px solid #000000",
  borderRadius: "20px",
  color: "#000000", // Updated to match new card background
  fontFamily: "Alice",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "20px",
  lineHeight: "23px",
  cursor: "pointer",
  transition: "opacity 0.2s ease",
  marginTop: "20px",
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
  fontFamily: "Alice",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "20px",
  lineHeight: "23px",
  textAlign: "center",
  color: "#EEEEEE",
  margin: 0,
  marginTop: "auto", // Push to bottom
  paddingBottom: "10px",
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
