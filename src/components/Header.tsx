import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Logo, LanguageSwitcher, ProfileDropdown } from "./index";
import { useAppContext } from "../context/useAppContext";
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
  const { logout } = useAppContext();
  const SHOW_LANG = import.meta.env.VITE_SHOW_LANG_SWITCHER === "true";
  const [isMessageHovered, setIsMessageHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close on Escape and lock background scroll when mobile menu is open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    }

    if (isMobileMenuOpen) {
      document.body.classList.add("overflow-hidden");
      document.addEventListener("keydown", onKey);
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
      document.removeEventListener("keydown", onKey);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="bg-[#9CEAEF] backdrop-blur border-b border-[#6FFFE9]/60 relative z-50">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center pl-0 pr-15 py-5 h-[80px]">
        {/* Logo */}
        <div className="flex-none">
          <Logo size="large" className="w-[220px] h-[70px]" />
        </div>

        {/* Mobile Controls - Option 1: Profile + Hamburger side by side */}
        <div className="flex items-center gap-3">
          {/* Profile Image/Avatar - Option 1: Show small profile pic */}
          <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-white overflow-hidden">
            {/* Replace with actual profile image */}
            <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
          </div>

          {/* Hamburger Menu - improved visual: rounded, subtle bg, accessible */}
          <button
            className={`flex-none p-2 rounded-md focus:outline-none transition-colors z-50 pointer-events-auto ${
              isMobileMenuOpen ? "bg-white/20" : "bg-white/10"
            }`}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between items-center">
              <div
                className={`w-5 h-0.5 bg-black transform origin-center transition-transform duration-200 ${
                  isMobileMenuOpen
                    ? "translate-y-1 rotate-45"
                    : "translate-y-0 rotate-0"
                }`}
              />
              <div
                className={`w-5 h-0.5 bg-black transform origin-center transition-opacity duration-200 ${
                  isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <div
                className={`w-5 h-0.5 bg-black transform origin-center transition-transform duration-200 ${
                  isMobileMenuOpen
                    ? "-translate-y-1 -rotate-45"
                    : "translate-y-0 rotate-0"
                }`}
              />
            </div>
          </button>
        </div>

        {/* 
        Alternative Option 2: Only Hamburger, Profile in dropdown
        <button
          className="flex-none p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            {isMobileMenuOpen ? (
              <div className="relative w-6 h-5">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black transform -translate-y-1/2 rotate-45"></div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black transform -translate-y-1/2 -rotate-45"></div>
              </div>
            ) : (
              <>
                <div className="w-full h-0.5 bg-black"></div>
                <div className="w-full h-0.5 bg-black"></div>
                <div className="w-full h-0.5 bg-black"></div>
              </>
            )}
          </div>
        </button>
        */}
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
          {/* Backdrop - click to close */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 w-full min-h-[50vh] bg-[#9CEAEF]/60 backdrop-blur-[5px]">
            <nav className="flex flex-col justify-center items-start px-5 py-6">
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

                {/* Mobile Profile Options - Option A: Include in main dropdown */}
                <div className="border-t border-white/20 pt-4 mt-4">
                  <button
                    onClick={() => {
                      onSectionChange?.("profile");
                      setIsMobileMenuOpen(false);
                    }}
                    className="block font-alice text-2xl leading-7 text-white transition-colors hover:text-white/80 mb-2"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      onSectionChange?.("settings");
                      setIsMobileMenuOpen(false);
                    }}
                    className="block font-alice text-2xl leading-7 text-white transition-colors hover:text-white/80 mb-2"
                  >
                    Settings
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setIsMobileMenuOpen(false);
                        await logout();
                        window.location.hash = "#home";
                      } catch (e) {
                        console.error(e);
                        setIsMobileMenuOpen(false);
                        window.location.hash = "#home";
                      }
                    }}
                    className="block font-alice text-2xl leading-7 text-red-600 transition-colors hover:text-red-700"
                  >
                    Logout
                  </button>
                </div>

                {/* 
                Alternative Option B: Language switcher in mobile
                {SHOW_LANG && (
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <LanguageSwitcher variant="light" />
                  </div>
                )}
                */}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
