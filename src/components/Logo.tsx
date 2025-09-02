interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  className?: string;
}

import { useState } from "react";

export default function Logo({
  size = "medium",
  showText = true,
  className = "",
}: LogoProps) {
  // Banner (with wordmark) versus standalone icon sizing
  const bannerHeights = {
    small: "h-7",
    medium: "h-9",
    large: "h-11",
  } as const;

  const iconHeights = {
    small: "h-8",
    medium: "h-10",
    large: "h-12",
  } as const;

  const [bannerError, setBannerError] = useState(false);
  const [iconError, setIconError] = useState(false);

  // When showText is true, render the full banner; otherwise render just the controller icon
  if (showText) {
    if (bannerError) {
      return (
        <div className={`flex items-center ${className}`}>
          <span
            className={`font-bold ${
              size === "large"
                ? "text-2xl"
                : size === "small"
                ? "text-lg"
                : "text-xl"
            }`}
          >
            GamerMajlis
          </span>
        </div>
      );
    }
    return (
      <img
        src="/brand/logo-banner.png"
        alt="GamerMajlis logo"
        className={`w-auto ${bannerHeights[size]} select-none ${className}`}
        draggable={false}
        onError={() => setBannerError(true)}
      />
    );
  }

  // Standalone controller icon
  if (iconError) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-lg bg-teal-600 ${
          size === "large"
            ? "w-12 h-12"
            : size === "small"
            ? "w-8 h-8"
            : "w-10 h-10"
        } ${className}`}
        aria-hidden
      >
        <span className="sr-only">GamerMajlis</span>
      </div>
    );
  }
  return (
    <img
      src="/brand/icon-controller.png"
      alt="GamerMajlis controller icon"
      className={`w-auto ${iconHeights[size]} select-none ${className}`}
      draggable={false}
      onError={() => setIconError(true)}
    />
  );
}
