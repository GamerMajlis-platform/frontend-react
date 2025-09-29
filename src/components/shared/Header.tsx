import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher, ProfileDropdown } from "../index";
import AvatarImage from "../profile/AvatarImage";
import ProfileSearch from "../profile/ProfileSearch";
import { useAppContext } from "../../context/useAppContext";
import Notifications from "./Notifications";
import { useClickOutside } from "../../hooks";
import { navigationItems } from "../../data";

interface HeaderProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function Header({
  activeSection = "home",
  onSectionChange,
}: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { wishlist, logout, isAuthenticated, user } = useAppContext();
  const SHOW_LANG = import.meta.env.VITE_SHOW_LANG_SWITCHER === "true";
  const [isMessageHovered, setIsMessageHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchModalRef = useClickOutside<HTMLDivElement>(() =>
    setIsSearchOpen(false)
  );

  const profileMenuRef = useClickOutside<HTMLDivElement>(() =>
    setIsProfileMenuOpen(false)
  );
  const navigate = useNavigate();

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
        {/* Enhanced Logo (mobile) */}
        <div className="flex-none">
          <Link
            to="/"
            onClick={() => onSectionChange?.("home")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-white text-[18px] tracking-wider font-[var(--font-alice)] bg-gradient-to-r from-white via-primary/80 to-white bg-clip-text text-transparent drop-shadow-lg relative">
              GamerMajlis
            </span>
            <div className="relative">
              <img
                src="/brand/controller.png"
                alt="GamerMajlis controller icon"
                className="h-[24px] w-auto block drop-shadow-lg"
                draggable={false}
              />
            </div>
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile search button: opens full-screen search modal */}
          {isAuthenticated && (
            <button
              aria-label="Open profile search"
              onClick={() => {
                setIsSearchOpen(true);
                // make search the only open control on mobile
                setIsProfileMenuOpen(false);
                setIsMobileMenuOpen(false);
              }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          )}
          {/* Notifications placed between search and profile on mobile */}
          <div className="transform hover:scale-105 transition-transform duration-200">
            <Notifications />
          </div>
          {/* Profile Avatar button (show user's avatar if available) */}
          <button
            ref={profileButtonRef}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              const next = !isProfileMenuOpen;
              setIsProfileMenuOpen(next);
              if (next) {
                // close other mobile controls when opening profile
                setIsMobileMenuOpen(false);
                setIsSearchOpen(false);
              }
            }}
            aria-label="Open profile menu"
            className={`w-10 h-10 rounded-full p-0.5 shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden ${
              user && user.profilePictureUrl
                ? "bg-transparent border-0"
                : "bg-gradient-to-r from-primary to-cyan-300"
            }`}
          >
            {user && user.profilePictureUrl ? (
              <AvatarImage
                source={user.profilePictureUrl}
                alt={user.displayName || "Profile"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="w-full h-full rounded-full bg-slate-800 border border-slate-600 overflow-hidden flex items-center justify-center text-white text-sm font-bold">
                U
              </span>
            )}
          </button>

          {/* Enhanced Hamburger Menu */}
          <button
            className="flex-none p-2 rounded-lg focus:outline-none transition-transform duration-200 hover:scale-105"
            onClick={() => {
              const next = !isMobileMenuOpen;
              setIsMobileMenuOpen(next);
              if (next) {
                // when opening the mobile nav, close other popovers
                setIsProfileMenuOpen(false);
                setIsSearchOpen(false);
              }
            }}
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

        {/* (notifications now inline between search and profile) */}

        {/* (kept simplified hamburger above; alternative implementations removed) */}
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
                } catch {
                  // logout errors are non-fatal for UI; handled upstream if necessary
                }
                navigate("/");
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

      {/* Mobile profile search modal */}
      {isSearchOpen && isAuthenticated && (
        <div className="fixed inset-0 z-[10003] bg-black/40 flex items-start justify-center p-4">
          <div
            ref={searchModalRef}
            className="w-full max-w-2xl mt-20 bg-slate-900/95 border border-slate-700/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">
                {t("profile:browser.title") || "Discover Gamers"}
              </h3>
              <button
                aria-label="Close search"
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <ProfileSearch
              onProfileSelect={(p) => {
                setIsSearchOpen(false);
                const u = p as unknown;
                if (u && typeof u === "object") {
                  const obj = u as { [k: string]: unknown };
                  const id = (obj.id ?? obj.userId) as string | undefined;
                  if (id) onSectionChange?.(`profile/${id}`);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden md:block relative w-full h-[64px] sm:h-[72px] md:h-[88px] px-4 sm:px-6">
        {/* Left: Enhanced Logo with custom text styling */}
        <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10">
          <Link
            to="/"
            onClick={() => onSectionChange?.("home")}
            className="flex flex-row items-center gap-3 cursor-pointer"
            dir="ltr"
          >
            <div className="relative">
              <img
                src="/brand/controller.png"
                alt="GamerMajlis controller icon"
                className="h-[28px] sm:h-[30px] md:h-[32px] w-auto block drop-shadow-lg"
                draggable={false}
              />
            </div>
            <span className="text-white text-[20px] sm:text-[22px] md:text-[24px] tracking-wider font-[var(--font-alice)] bg-gradient-to-r from-white via-primary/80 to-white bg-clip-text text-transparent drop-shadow-lg relative">
              GamerMajlis
            </span>
          </Link>
        </div>

        {/* Desktop Navigation with clearer frame for evaluation */}
        <nav
          className={`hidden md:flex items-center ${
            i18n.dir() === "ltr" ? "gap-3 lg:gap-4" : "gap-6 lg:gap-8"
          } absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/60 backdrop-blur-md rounded-full px-6 py-2 border-2 border-cyan-300/40 shadow-lg`}
        >
          {navigationItems.map((item) => (
            <Link
              key={item.key}
              to={item.key === "home" ? "/" : `/${item.key}`}
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
            </Link>
          ))}
        </nav>

        {/* Desktop Controls with enhanced styling */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20">
          {SHOW_LANG && (
            <div className="transform hover:scale-105 transition-transform duration-200">
              <LanguageSwitcher variant="light" />
            </div>
          )}

          {/* Profile search (desktop only) - show only for authenticated users */}
          {isAuthenticated && (
            <div className="relative z-[100] flex-none w-[120px] lg:w-[140px]">
              <ProfileSearch
                dir={i18n.dir()}
                className="w-full"
                onProfileSelect={(profile) => {
                  // profile may be either a search result or suggestion; guard for id
                  const p = profile as unknown;
                  if (p && typeof p === "object") {
                    const obj = p as { [k: string]: unknown };
                    const id = (obj.id ?? obj.userId) as string | undefined;
                    if (id) onSectionChange?.(`profile/${id}`);
                  }
                }}
                compact
              />
            </div>
          )}

          {/* Messages - compact icon button */}
          <button
            onClick={() => onSectionChange?.("messages")}
            aria-label={t("nav.messages")}
            className={`
              relative flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200
              border-2 border-cyan-300/40 bg-slate-800/50 text-white
              hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
              ${isMessageHovered ? "ring-2 ring-primary/40" : ""}
            `}
            onMouseEnter={() => setIsMessageHovered(true)}
            onMouseLeave={() => setIsMessageHovered(false)}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H10l-5 4v-4H6a3 3 0 0 1-3-3V4z" />
            </svg>
            <span className="sr-only">{t("nav.messages")}</span>
            {/* Notification badge disabled until chat notifications are integrated */}
          </button>

          {/* Notifications */}
          <div className="transform hover:scale-105 transition-transform duration-200">
            <Notifications />
          </div>
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
              <button
                key={item.key}
                type="button"
                className={`group text-left flex items-center gap-3 font-medium text-lg transition-colors hover:bg-white/10 rounded-md px-2 py-2 cursor-pointer ${
                  i18n.dir() === "rtl" ? "flex-row-reverse" : ""
                } ${
                  activeSection === item.key
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                }`}
                onClick={() => {
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
              </button>
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
