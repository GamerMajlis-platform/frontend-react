import type { CSSProperties } from "react";

export const cardStyle: CSSProperties = {
  backgroundColor: "#1e293b",
  borderRadius: "16px",
  border: "1px solid #475569",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  height: "560px",
  minWidth: "380px",
  maxWidth: "420px",
  width: "100%",
  transition: "all 0.3s ease",
  cursor: "pointer",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

export const imageContainerStyle: CSSProperties = {
  position: "relative",
  height: "200px",
  backgroundColor: "#334155",
  flexShrink: 0,
};

export const imageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

export const noImageStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
  fontSize: "14px",
};

export const categoryBadgeStyle: CSSProperties = {
  position: "absolute",
  top: "12px",
  left: "12px",
  backgroundColor: "#6fffe9",
  color: "#0f172a",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "600",
  maxWidth: "120px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  direction: "inherit",
};

export const wishlistButtonStyle: CSSProperties = {
  position: "absolute",
  top: "12px",
  right: "12px",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.2)",
  backgroundColor: "rgba(0,0,0,0.3)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontSize: "16px",
};

export const contentStyle: CSSProperties = {
  flex: 1,
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

export const titleStyle: CSSProperties = {
  color: "white",
  fontSize: "17px",
  fontWeight: "600",
  marginBottom: "10px",
  lineHeight: "1.4",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-word",
  direction: "inherit",
  minHeight: "72px",
};

export const sellerStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: "14px",
  marginBottom: "14px",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-word",
  direction: "inherit",
  lineHeight: "1.4",
  minHeight: "40px",
};

export const sellerNameStyle: CSSProperties = {
  color: "#6fffe9",
  fontWeight: "500",
  direction: "inherit",
};

export const ratingContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "14px",
  direction: "inherit",
};

export const ratingBadgeStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  backgroundColor: "rgba(245, 158, 11, 0.2)",
  padding: "4px 8px",
  borderRadius: "6px",
  color: "#f59e0b",
  fontSize: "12px",
  fontWeight: "500",
  direction: "inherit",
};

export const reviewsStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  direction: "inherit",
};

export const priceContainerStyle: CSSProperties = {
  marginTop: "auto",
  paddingTop: "14px",
  paddingBottom: "4px",
};

export const priceStyle: CSSProperties = {
  color: "white",
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "4px",
  direction: "inherit",
};

export const freeShippingStyle: CSSProperties = {
  color: "#64748b",
  fontSize: "11px",
  marginBottom: "12px",
  direction: "inherit",
};

export const buttonsContainerStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  marginTop: "8px",
  direction: "inherit",
};

export const detailsButtonStyle: CSSProperties = {
  flex: 1,
  border: "1px solid #6fffe9",
  backgroundColor: "transparent",
  color: "#6fffe9",
  fontSize: "13px",
  fontWeight: "500",
  padding: "10px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  direction: "inherit",
};

export const buyButtonStyle: CSSProperties = {
  flex: 1,
  border: "none",
  backgroundColor: "#6fffe9",
  color: "#0f172a",
  fontSize: "13px",
  fontWeight: "600",
  padding: "10px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  direction: "inherit",
};

// Utility function to detect RTL text
export const isRTLText = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
};

// Dynamic styles for RTL support
export const getDynamicStyle = (
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

// RTL-aware badge positioning
export const getDynamicBadgeStyle = (isRTL: boolean): CSSProperties => {
  return {
    ...categoryBadgeStyle,
    [isRTL ? "right" : "left"]: "12px",
    [isRTL ? "left" : "right"]: "auto",
  };
};

// RTL-aware wishlist button positioning
export const getDynamicWishlistStyle = (isRTL: boolean): CSSProperties => {
  return {
    ...wishlistButtonStyle,
    [isRTL ? "left" : "right"]: "12px",
    [isRTL ? "right" : "left"]: "auto",
  };
};

// Responsive CSS for injection
export const responsiveCSS = `
  @media (max-width: 768px) {
    .product-card {
      min-width: 300px;
      max-width: 100%;
      height: 520px;
    }
    .product-card-content {
      padding: 16px;
    }
    .product-card-title {
      font-size: 16px;
      min-height: 64px;
    }
    .product-card-seller {
      font-size: 13px;
      min-height: 36px;
    }
    .product-card-price {
      font-size: 16px;
    }
    .product-card-buttons {
      gap: 8px;
    }
    .product-card-button {
      padding: 8px 12px;
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    .product-card {
      min-width: 280px;
      height: 480px;
    }
    .product-card-image {
      height: 180px;
    }
    .product-card-content {
      padding: 14px;
    }
    .product-card-title {
      min-height: 60px;
    }
    .product-card-seller {
      min-height: 32px;
    }
  }
`;
