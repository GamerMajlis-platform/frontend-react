import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/useAppContext";
import { useTranslation } from "react-i18next";

interface ProfileDropdownProps {
  onSectionChange?: (section: string) => void;
  userInfo?: { name: string; email: string };
}

export default function ProfileDropdown({
  onSectionChange,
  userInfo,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { wishlist, logout, user } = useAppContext();

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
    window.location.hash = "#home";
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button (desktop avatar, mobile hamburger) */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex md:hidden flex-col justify-center items-center w-10 h-10 
                   rounded-md bg-[#1C2541] text-white hover:bg-[#3A506B] transition"
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

      {/* Desktop Avatar Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="hidden md:flex items-center justify-center w-9 h-9 
                   bg-[#1C2541] text-white rounded-full hover:bg-[#3A506B] shadow-md"
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

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop (mobile only) */}
          <div
            className="fixed inset-0 bg-black/30 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="fixed md:absolute right-4 md:right-0 top-16 md:top-12 
                  w-[calc(100%-2rem)] md:w-56 bg-white rounded-lg shadow-lg 
                  border border-gray-100 py-3 z-[1000] grid gap-2 animate-in fade-in-10 max-h-[60vh] overflow-auto"
          >
            {/* User Info */}
            <div className="px-4 pb-2 border-b text-sm text-gray-700">
              <p className="font-semibold text-[#1C2541]">{displayUser.name}</p>
              <p className="text-gray-500">{displayUser.email}</p>
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
