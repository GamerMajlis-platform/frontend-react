import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Logo, LanguageSwitcher, ProfileDropdown } from "./index";
import { navigationItems } from "../data";
import { messageButton } from "../styles/OptimizedStyles";

interface HeaderProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function Header({
  activeSection = "home",
  onSectionChange,
}: HeaderProps) {
  const { t } = useTranslation();
  const SHOW_LANG = import.meta.env.VITE_SHOW_LANG_SWITCHER === "true";
  const [isMessageHovered, setIsMessageHovered] = useState(false);

  return (
    <header className="bg-[#9CEAEF] backdrop-blur border-b border-[#6FFFE9]/60 relative z-50">
      <div className="relative w-full h-[72px] md:h-[88px] px-6">
        {/* Left: Logo */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Logo size="large" className="h-14 md:h-16" />
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-12 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navigationItems.map((item) => (
            <a
              key={item.key}
              href="#"
              className={`font-semibold text-[#1C2541] text-xl md:text-2xl px-3 py-1.5 rounded-md tracking-wide transition-colors ${
                activeSection === item.key
                  ? "text-[#0B132B]"
                  : "hover:text-white"
              }`}
              onClick={(e) => {
                e.preventDefault();
                onSectionChange?.(item.key);
              }}
            >
              {t(item.translationKey)}
            </a>
          ))}
        </nav>

        {/* Right: Controls */}
        <div className="flex items-center gap-4 absolute right-4 top-1/2 -translate-y-1/2 z-10">
          {SHOW_LANG && <LanguageSwitcher variant="light" />}
          <button
            onClick={() => onSectionChange?.("messages")}
            style={messageButton(isMessageHovered)}
            onMouseEnter={() => setIsMessageHovered(true)}
            onMouseLeave={() => setIsMessageHovered(false)}
          >
            {/* Message Icon */}
            <div style={{ position: "relative" }}>
              <svg
                style={{
                  width: "18px",
                  height: "18px",
                  color: "currentColor",
                }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {/* Simple notification badge */}
              <div
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                  border: "1px solid white",
                }}
              />
            </div>
            <span>{t("nav.messages")}</span>
          </button>
          <ProfileDropdown onSectionChange={onSectionChange} />
        </div>
      </div>
    </header>
  );
}
