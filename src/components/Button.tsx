import type { CSSProperties, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "link";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  // Figma-like customization props
  width?: number;
  height?: number;
  borderRadius?: number;
  borderRadiusTopLeft?: number;
  borderRadiusTopRight?: number;
  borderRadiusBottomLeft?: number;
  borderRadiusBottomRight?: number;
}

export default function Button({
  children,
  variant = "primary",
  size = "medium",
  onClick,
  disabled = false,
  type = "button",
  className = "",
  width,
  height,
  borderRadius,
  borderRadiusTopLeft,
  borderRadiusTopRight,
  borderRadiusBottomLeft,
  borderRadiusBottomRight,
}: ButtonProps) {
  const baseClasses =
    "font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

  const variantClasses = {
    primary:
      "bg-[#5BC0BE] text-[#0B132B] hover:bg-[#6FFFE9] focus:ring-[#6FFFE9]",
    secondary:
      "bg-[#1C2541] text-white hover:bg-[#3A506B] focus:ring-[#3A506B]",
    outline:
      "border-2 border-[#5BC0BE] text-[#5BC0BE] hover:bg-[#5BC0BE] hover:text-[#0B132B] focus:ring-[#6FFFE9]",
    // link variant uses the same color as the auth link (login href)
    link: "bg-[#C4FFF9] text-[#0B132B] hover:bg-[#CFFFEF] focus:ring-[#CFFFEF]",
  };

  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  };

  // Build custom styles
  const customStyle: CSSProperties = {};

  if (width !== undefined) customStyle.width = `${width}px`;
  if (height !== undefined) customStyle.height = `${height}px`;

  // Handle border radius - either uniform or per-corner
  if (borderRadius !== undefined) {
    customStyle.borderRadius = `${borderRadius}px`;
  } else if (
    borderRadiusTopLeft !== undefined ||
    borderRadiusTopRight !== undefined ||
    borderRadiusBottomLeft !== undefined ||
    borderRadiusBottomRight !== undefined
  ) {
    const tl = borderRadiusTopLeft || 0;
    const tr = borderRadiusTopRight || 0;
    const bl = borderRadiusBottomLeft || 0;
    const br = borderRadiusBottomRight || 0;
    customStyle.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
  }

  // If custom width/height are provided, don't use default size padding
  const shouldUseDefaultSize = width === undefined && height === undefined;
  const appliedSizeClass = shouldUseDefaultSize ? sizeClasses[size] : "";

  // Remove default rounded-full if custom border radius is provided
  const shouldUseDefaultRadius =
    borderRadius === undefined &&
    borderRadiusTopLeft === undefined &&
    borderRadiusTopRight === undefined &&
    borderRadiusBottomLeft === undefined &&
    borderRadiusBottomRight === undefined;
  const defaultRadiusClass = shouldUseDefaultRadius ? "rounded-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={customStyle}
      className={`${baseClasses} ${defaultRadiusClass} ${variantClasses[variant]} ${appliedSizeClass} ${className}`}
    >
      {children}
    </button>
  );
}
