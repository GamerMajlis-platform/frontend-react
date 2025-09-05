import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Logo, LanguageSwitcher, ProfileDropdown } from "./index";
import { navigationItems } from "../data";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#9CEAEF] backdrop-blur border-b border-[#6FFFE9]/60 relative z-50">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center px-5 py-5 h-[120px]">
        {/* Logo */}
        <div className="flex-none">
          <Logo size="large" className="w-[220px] h-[37px]" />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex-none w-10 h-6 bg-black"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-full h-full text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block relative w-full h-[64px] sm:h-[72px] md:h-[88px] px-4 sm:px-6">
        {/* Left: Logo */}
        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10">
          <Logo size="large" className="h-12 sm:h-14 md:h-16" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-12 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navigationItems.map((item) => (
            <a
              key={item.key}
              href="#"
              className={`font-semibold text-[#1C2541] text-lg lg:text-xl xl:text-2xl px-2 lg:px-3 py-1.5 rounded-md tracking-wide transition-colors ${
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

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10">
          {SHOW_LANG && <LanguageSwitcher variant="light" />}
          <button
            onClick={() => onSectionChange?.("messages")}
            className={`
              hidden sm:flex items-center gap-2 h-10 px-4 border-none rounded-lg 
              cursor-pointer text-sm font-medium transition-all duration-200 ease-in-out
              ${
                isMessageHovered
                  ? "bg-white/95 text-slate-800"
                  : "bg-white/85 text-slate-800"
              }
            `}
            onMouseEnter={() => setIsMessageHovered(true)}
            onMouseLeave={() => setIsMessageHovered(false)}
          >
            {/* Message Icon */}
            <div className="relative">
              <svg
                className="w-[18px] h-[18px]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {/* Simple notification badge */}
              <div className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </div>
            <span className="hidden lg:inline">{t("nav.messages")}</span>
          </button>
          <ProfileDropdown onSectionChange={onSectionChange} />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-0 z-40">
          <div className="absolute inset-0 w-full h-[267px] bg-[#9CEAEF]/50 backdrop-blur-[5px]">
            <nav className="flex flex-col justify-center items-start px-5 h-full">
              <div className="space-y-4">
                {navigationItems.map((item) => (
                  <a
                    key={item.key}
                    href="#"
                    className={`block font-alice text-2xl leading-7 text-white transition-colors ${
                      activeSection === item.key
                        ? "text-white font-semibold"
                        : "hover:text-white/80"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSectionChange?.(item.key);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t(item.translationKey)}
                  </a>
                ))}

                {/* Mobile Messages Button */}
                <button
                  onClick={() => {
                    onSectionChange?.("messages");
                    setIsMobileMenuOpen(false);
                  }}
                  className="block font-alice text-2xl leading-7 text-white transition-colors hover:text-white/80"
                >
                  {t("nav.messages")}
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
