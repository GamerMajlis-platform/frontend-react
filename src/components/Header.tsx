import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher, ProfileDropdown } from "./index";
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
  const { t, i18n } = useTranslation();
  const { wishlist, logout } = useAppContext();
  const SHOW_LANG = import.meta.env.VITE_SHOW_LANG_SWITCHER === "true";
  const [isMessageHovered, setIsMessageHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape only (no scroll lock needed for dropdown)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    }
    if (isMobileMenuOpen || isProfileMenuOpen) {
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [isMobileMenuOpen, isProfileMenuOpen]);

  // Click outside to close profile dropdown
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", onClick);
    }
    return () => document.removeEventListener("mousedown", onClick);
  }, [isProfileMenuOpen]);
  return (
    <header
      className={`relative isolate bg-gradient-to-r from-slate-800/90 via-slate-700/90 to-slate-800/90 backdrop-blur-xl border-b border-slate-600/50 shadow-xl ${
        isMobileMenuOpen ? "z-[10000]" : "z-50"
      }`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-300/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center pl-4 pr-4 py-4 h-[80px] relative z-10">
        {/* Enhanced Logo */}
        <div className="flex-none">
          <div className="flex items-center gap-2 group">
            <span className="text-white text-[18px] tracking-wider font-[var(--font-alice)] bg-gradient-to-r from-white via-primary/80 to-white bg-clip-text text-transparent drop-shadow-lg relative">
              GamerMajlis
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            </span>
            <div className="relative">
              <img
                src="/brand/controller.png"
                alt="GamerMajlis controller icon"
                className="h-[24px] w-auto block drop-shadow-lg"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-3">
          {/* Profile Avatar button */}
          <button
            ref={profileButtonRef}
            onClick={() => setIsProfileMenuOpen((v) => !v)}
            aria-label="Open profile menu"
            className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-r from-primary to-cyan-300 shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="w-full h-full rounded-full bg-slate-800 border border-slate-600 overflow-hidden flex items-center justify-center text-white text-sm font-bold">
              U
            </span>
          </button>

          {/* Enhanced Hamburger Menu */}
          <button
            className="flex-none p-2 rounded-lg focus:outline-none transition-transform duration-200 hover:scale-105"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Toggle mobile menu"
            ref={menuButtonRef}
          >
            <div className="w-6 h-5 flex flex-col justify-between items-center">
              <div className="w-5 h-0.5 bg-white" />
              <div className="w-5 h-0.5 bg-white" />
              <div className="w-5 h-0.5 bg-white" />
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

      {/* Mobile profile dropdown anchored under header */}
      {isProfileMenuOpen && (
        <div
          ref={profileMenuRef}
          dir={i18n.dir()}
          className={`md:hidden absolute top-[80px] ${
            i18n.dir() === "rtl" ? "left-4" : "right-4"
          } w-56 bg-slate-800 border border-slate-600/50 rounded-lg shadow-2xl z-[10002] ${
            i18n.dir() === "rtl" ? "text-right" : "text-left"
          }`}
        >
          <div className="py-2">
            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                onSectionChange?.("profile");
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              <span
                className={`flex items-center gap-2 ${
                  i18n.dir() === "rtl" ? "flex-row-reverse" : ""
                } w-full`}
              >
                <span className="truncate">{t("nav.profile")}</span>
                <span aria-hidden className="shrink-0">
                  👤
                </span>
              </span>
            </button>

            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                onSectionChange?.("wishlist");
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              <span
                className={`flex items-center gap-2 ${
                  i18n.dir() === "rtl" ? "flex-row-reverse" : ""
                } w-full`}
              >
                <span className="truncate">{t("wishlist.title")}</span>
                <span aria-hidden className="shrink-0">
                  ❤️
                </span>
                {wishlist?.length ? (
                  <span
                    className={`${
                      i18n.dir() === "rtl" ? "mr-auto" : "ml-auto"
                    } text-xs bg-primary/30 text-primary px-2 py-0.5 rounded-full`}
                  >
                    {wishlist.length}
                  </span>
                ) : null}
              </span>
            </button>

            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                onSectionChange?.("settings");
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
            >
              <span
                className={`flex items-center gap-2 ${
                  i18n.dir() === "rtl" ? "flex-row-reverse" : ""
                } w-full`}
              >
                <span className="truncate">{t("settings.title")}</span>
                <span aria-hidden className="shrink-0">
                  ⚙️
                </span>
              </span>
            </button>

            <div className="my-2 border-t border-slate-600/50" />
            <button
              onClick={async () => {
                setIsProfileMenuOpen(false);
                try {
                  await logout();
                } catch (e) {
                  console.error(e);
                }
                window.location.hash = "#home";
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
            >
              <span
                className={`flex items-center gap-2 ${
                  i18n.dir() === "rtl" ? "flex-row-reverse" : ""
                } w-full`}
              >
                <span className="truncate">{t("auth.logout")}</span>
                <span aria-hidden className="shrink-0">
                  🚪
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden md:block relative w-full h-[64px] sm:h-[72px] md:h-[88px] px-4 sm:px-6 z-10">
        {/* Left: Enhanced Logo with custom text styling */}
        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10">
          <div className="flex items-center gap-3 group transform hover:scale-105 transition-transform duration-300">
            <span className="text-white text-[20px] sm:text-[22px] md:text-[24px] tracking-wider font-[var(--font-alice)] bg-gradient-to-r from-white via-primary/80 to-white bg-clip-text text-transparent drop-shadow-lg relative">
              GamerMajlis
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            </span>
            <div className="relative">
              <img
                src="/brand/controller.png"
                alt="GamerMajlis controller icon"
                className="h-[28px] sm:h-[30px] md:h-[32px] w-auto block drop-shadow-lg"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Desktop Navigation with clearer frame for evaluation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/60 backdrop-blur-md rounded-full px-6 py-2 border-2 border-cyan-300/40 shadow-lg">
          {navigationItems.map((item) => (
            <a
              key={item.key}
              href="#"
              className={`font-semibold text-lg lg:text-xl px-3 lg:px-4 py-2 rounded-full tracking-wide transition-all duration-300 transform hover:scale-105 ${
                activeSection === item.key
                  ? "bg-gradient-to-r from-primary to-cyan-300 text-slate-900 shadow-glow"
                  : "text-white hover:bg-white/10 hover:shadow-lg"
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

        {/* Desktop Controls with enhanced styling */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10">
          {SHOW_LANG && (
            <div className="transform hover:scale-105 transition-transform duration-200">
              <LanguageSwitcher variant="light" />
            </div>
          )}

          {/* Enhanced Messages Button */}
          <button
            onClick={() => onSectionChange?.("messages")}
            className={`
              relative flex items-center gap-2 h-10 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105
              border-2 border-cyan-300/30 backdrop-blur-md bg-slate-800/50
              ${
                isMessageHovered
                  ? "bg-gradient-to-r from-primary to-cyan-300 text-slate-900 shadow-glow border-transparent"
                  : "text-white hover:bg-slate-700/60"
              }
            `}
            onMouseEnter={() => setIsMessageHovered(true)}
            onMouseLeave={() => setIsMessageHovered(false)}
          >
            {/* Message Icon with enhanced styling */}
            <div className="relative">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {/* Enhanced notification badge */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-slate-800 shadow-lg animate-pulse" />
            </div>
            <span className="hidden lg:inline text-sm font-medium">
              {t("nav.messages")}
            </span>
          </button>

          <div className="transform hover:scale-105 transition-transform duration-200">
            <ProfileDropdown onSectionChange={onSectionChange} />
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (simple below header) */}
      {isMobileMenuOpen && (
        <div
          dir={i18n.dir()}
          className="md:hidden w-full bg-slate-800/95 border-t border-slate-600/50 relative z-[10001] pointer-events-auto"
        >
          <nav
            className={`relative z-10 pointer-events-auto flex flex-col gap-4 px-6 py-6 ${
              i18n.dir() === "rtl" ? "text-right" : "text-left"
            }`}
          >
            {navigationItems.map((item) => (
              <a
                key={item.key}
                href="#"
                className={`group flex items-center gap-3 font-medium text-lg transition-colors hover:bg-white/10 rounded-md px-2 py-2 cursor-pointer ${
                  i18n.dir() === "rtl" ? "flex-row-reverse" : ""
                } ${
                  activeSection === item.key
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onSectionChange?.(item.key);
                  setIsMobileMenuOpen(false);
                  menuButtonRef.current?.focus();
                }}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeSection === item.key
                      ? "bg-gradient-to-r from-primary to-cyan-300 shadow-glow"
                      : "bg-slate-600 group-hover:bg-slate-400"
                  }`}
                />
                {t(item.translationKey)}
              </a>
            ))}

            {/* Messages */}
            <button
              onClick={() => {
                onSectionChange?.("messages");
                setIsMobileMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              className={`group flex items-center gap-3 font-medium text-lg text-slate-300 hover:text-white ${
                i18n.dir() === "rtl"
                  ? "flex-row-reverse text-right"
                  : "text-left"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-slate-400" />
              <span
                className={`flex items-center gap-2 ${
                  i18n.dir() === "rtl" ? "flex-row-reverse" : ""
                }`}
              >
                {t("nav.messages")}
                <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse" />
              </span>
            </button>

            {/* Language Switcher */}
            {SHOW_LANG && (
              <div className="border-t border-slate-600/50 pt-5 mt-3">
                <div className="flex items-center gap-3 text-slate-300 mb-3">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  <span className="font-medium text-base">
                    {t("common.language", { defaultValue: "Language" })}
                  </span>
                </div>
                <div className={i18n.dir() === "rtl" ? "mr-5" : "ml-5"}>
                  <LanguageSwitcher variant="light" />
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
