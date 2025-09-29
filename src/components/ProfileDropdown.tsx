import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/useAppContext";
import { useTranslation } from "react-i18next";
import AvatarImage from "./profile/AvatarImage";
import { useClickOutside } from "../hooks";
import { DiscordService } from "../services/DiscordService";

interface ProfileDropdownProps {
  onSectionChange?: (section: string) => void;
  userInfo?: { name: string; email: string };
}

export default function ProfileDropdown({
  onSectionChange,
  userInfo,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
  const { wishlist, logout, user } = useAppContext();
  const navigate = useNavigate();
  const [discordUser, setDiscordUser] = useState<null | {
    username: string;
    discriminator?: string;
  }>(null);

  useEffect(() => {
    let mounted = true;
    if (user) {
      DiscordService.getUserInfo()
        .then((res) => {
          if (mounted && res.success && res.discordUser) {
            setDiscordUser({
              username: res.discordUser.username,
              discriminator: res.discordUser.discriminator,
            });
          }
        })
        .finally(() => {
          /* noop */
        });
    } else {
      setDiscordUser(null);
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  const displayUser = user
    ? { name: user.displayName, email: user.email }
    : userInfo || { name: "Guest User", email: "guest@example.com" };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout();
    } catch {
      // logout errors are handled by the auth service; UI can continue
    }
    navigate("/");
  };

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language && i18n.language.startsWith("ar");

  const menuItems = [
    { key: "profile", label: t("nav.profile"), icon: "👤" },
    {
      key: "wishlist",
      label: t("wishlist.title"),
      icon: "❤️",
      badge: wishlist.length,
    },
    { key: "settings", label: t("settings.title"), icon: "⚙️" },
  ];

  // Positioning: keep mobile (small) dropdown RTL-aware, but force desktop (md+) to be right-aligned
  // This prevents the dropdown from dropping outside the screen on desktop while preserving
  // RTL text/ordering inside the menu items.
  const dropdownPositionClass =
    typeof document !== "undefined" && document.documentElement.dir === "rtl"
      ? "left-4 md:left-auto md:right-0 right-4"
      : "right-4 md:right-0";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button (mobile: show avatar if available, otherwise hamburger) */}
      {user && user.profilePictureUrl ? (
        <>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsOpen((v) => !v)}
            className="flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-[#1C2541] text-white hover:bg-[#3A506B] transition"
            aria-label="Toggle menu"
          >
            <AvatarImage
              source={user.profilePictureUrl}
              alt={user.displayName || "Profile"}
              className="w-10 h-10 rounded-full object-cover"
            />
          </button>

          {/* Desktop Avatar Button (larger for better visibility) */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsOpen((v) => !v)}
            className="hidden md:flex items-center justify-center w-12 h-12 bg-[#1C2541] text-white rounded-full hover:bg-[#3A506B] shadow-md"
            aria-label="Profile Menu"
          >
            <AvatarImage
              source={user.profilePictureUrl}
              alt={user.displayName || "Profile"}
              className="w-10 h-10 rounded-full object-cover"
            />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="flex md:hidden flex-col justify-center items-center w-10 h-10 rounded-md bg-[#1C2541] text-white hover:bg-[#3A506B] transition"
            aria-label="Toggle menu"
          >
            {/* Hamburger / X animation */}
            <span
              className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${
                isOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white my-1 transition-opacity duration-300 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${
                isOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </button>

          {/* Desktop Avatar Button (fallback icon) */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="hidden md:flex items-center justify-center w-12 h-12 bg-[#1C2541] text-white rounded-full hover:bg-[#3A506B] shadow-md"
            aria-label="Profile Menu"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop (mobile only) */}
          <div
            className="fixed inset-0 bg-black/30 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`fixed md:absolute ${dropdownPositionClass} top-16 md:top-12 
                  w-[calc(100%-2rem)] md:w-56 bg-white rounded-lg shadow-lg 
                  border border-gray-100 py-3 z-[1000] grid gap-2 animate-in fade-in-10 max-h-[60vh] overflow-auto`}
          >
            {/* User Info */}
            <div
              className="px-4 pb-2 border-b text-sm text-gray-700 space-y-0.5"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <p className="font-semibold text-[#1C2541] break-all">
                {displayUser.name}
              </p>
              {/* Only show discord username when user has linked their Discord account; remove email and link option per UX request */}
              {discordUser ? (
                <div
                  className="mt-1 text-xs flex items-center gap-2 flex-wrap"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <span className="inline-flex items-center gap-1 bg-[#5865F2]/10 text-[#5865F2] px-2 py-0.5 rounded-md font-medium">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="currentColor"
                    >
                      <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.516.07.07 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                    </svg>
                    {discordUser.username}
                    {discordUser.discriminator
                      ? `#${discordUser.discriminator}`
                      : ""}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Menu Items */}
            <div
              className={`grid gap-1 px-2 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setIsOpen(false);
                    onSectionChange?.(item.key);
                  }}
                  className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-[#5BC0BE]/10 transition"
                >
                  <span
                    className={`flex items-center gap-2 ${
                      isRTL ? "ml-auto" : ""
                    }`}
                  >
                    {isRTL ? (
                      <>
                        {item.badge ? (
                          <span className="text-xs bg-[#6fffe9] px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        ) : null}
                        <span className="truncate">{item.label}</span>
                        <span>{item.icon}</span>
                      </>
                    ) : (
                      <>
                        <span>{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="text-xs bg-[#6fffe9] px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </span>
                </button>
              ))}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-between px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-md transition"
              >
                <span
                  className={`flex items-center gap-2 ${
                    isRTL ? "ml-auto" : ""
                  }`}
                >
                  {isRTL ? (
                    <>
                      <span className="truncate">{t("auth.logout")}</span>
                      <span aria-hidden>🚪</span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden>🚪</span>
                      <span className="truncate">{t("auth.logout")}</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
