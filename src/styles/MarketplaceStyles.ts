import type { CSSProperties } from "react";

export const containerStyle: CSSProperties = {
  width: "100%",
  minHeight: "calc(100vh - 88px)",
  padding: "32px 16px",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
};

export const maxWidthContainerStyle: CSSProperties = {
  width: "100%",
  maxWidth: "1400px",
  margin: "0 auto",
};

export const headerStyle: CSSProperties = {
  textAlign: "center",
  marginBottom: "48px",
};

export const titleStyle: CSSProperties = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontWeight: "700",
  color: "white",
  fontSize: "48px",
  lineHeight: "1.2",
  marginBottom: "16px",
  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  direction: "inherit",
};

export const subtitleStyle: CSSProperties = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontWeight: "400",
  color: "#6fffe9",
  fontSize: "20px",
  lineHeight: "1.4",
  maxWidth: "600px",
  margin: "0 auto",
  direction: "inherit",
};

export const searchSectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  marginBottom: "48px",
  alignItems: "center",
};

export const searchControlsStyle: CSSProperties = {
  display: "flex",
  gap: "20px",
  alignItems: "center",
  width: "100%",
  maxWidth: "700px",
  flexWrap: "wrap",
  justifyContent: "center",
};

export const searchInputStyle: CSSProperties = {
  flex: 1,
  minWidth: "300px",
  padding: "16px 20px",
  backgroundColor: "#1e293b",
  border: "1px solid #475569",
  borderRadius: "12px",
  color: "white",
  fontSize: "16px",
  outline: "none",
  transition: "all 0.3s ease",
  direction: "inherit",
};

export const sortContainerStyle: CSSProperties = {
  position: "relative",
};

export const sortButtonStyle: CSSProperties = {
  padding: "16px 20px",
  backgroundColor: "#6fffe9",
  color: "#0f172a",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  minWidth: "180px",
  justifyContent: "space-between",
  direction: "inherit",
};

export const sortDropdownStyle: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  backgroundColor: "#1e293b",
  border: "1px solid #475569",
  borderRadius: "12px",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
  zIndex: 10,
  overflow: "hidden",
  direction: "inherit",
};

export const sortOptionStyle: CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  backgroundColor: "transparent",
  color: "#ffffff",
  border: "none",
  textAlign: "left",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  fontSize: "16px",
  direction: "inherit",
};

export const filterButtonsStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  justifyContent: "center",
};

export const filterButtonStyle: CSSProperties = {
  padding: "8px 16px",
  backgroundColor: "transparent",
  border: "1px solid #6fffe9",
  borderRadius: "20px",
  color: "#6fffe9",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s ease",
  direction: "inherit",
};

export const gridContainerStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: "32px",
  justifyContent: "center",
  maxWidth: "1400px",
  margin: "0 auto",
};

// Utility function to detect RTL text
export const isRTLText = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
};

// Dynamic styles for RTL support
export const getDynamicTextStyle = (
  text: string,
  baseStyle: CSSProperties
): CSSProperties => {
  const isRTL = isRTLText(text);
  return {
    ...baseStyle,
    direction: isRTL ? "rtl" : "ltr",
    textAlign: isRTL ? "right" : "left",
    fontFamily: isRTL
      ? "Tahoma, Arial, sans-serif"
      : "system-ui, -apple-system, sans-serif",
  };
};

// Responsive CSS for injection
export const responsiveCSS = `
  @media (max-width: 768px) {
    .marketplace-container { padding: 20px 12px; }
    .marketplace-header { margin-bottom: 32px; }
    .marketplace-title { font-size: 36px; }
    .marketplace-subtitle { font-size: 18px; max-width: 90%; }
    .search-section { margin-bottom: 32px; gap: 16px; }
    .search-controls { gap: 16px; flex-direction: column; }
    .search-input { min-width: 100%; width: 100%; padding: 14px 18px; }
    .sort-container { width: 100%; }
    .sort-button { width: 100%; min-width: unset; padding: 14px 18px; }
    .filter-buttons { gap: 8px; }
    .filter-button { padding: 6px 12px; font-size: 13px; }
    .products-grid { 
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
      gap: 20px; 
    }
  }
  
  @media (max-width: 480px) {
    .marketplace-title { font-size: 28px; }
    .products-grid { 
      grid-template-columns: 1fr; 
      gap: 16px; 
    }
  }
  
  @media (max-width: 1200px) {
    .products-grid { 
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
      gap: 24px; 
    }
  }
`;
