import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

interface ProfileDropdownProps {
  onSectionChange?: (section: string) => void;
  userInfo?: {
    name: string;
    email: string;
  };
}

export default function ProfileDropdown({
  onSectionChange,
  userInfo = {
    name: "John Gamer",
    email: "john.gamer@example.com",
  },
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { wishlist } = useAppContext();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (section: string) => {
    setIsOpen(false);
    onSectionChange?.(section);
  };

  const toggle = () => setIsOpen((v) => !v);
  const close = () => setIsOpen(false);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <div className="flex items-center gap-2">
        {/* Avatar button (click toggles) */}
        <button
          className="w-10 h-10 bg-[#1C2541] text-white rounded-full hover:bg-[#3A506B] transition-colors flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6fffe9]"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label="Profile Menu"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Dropdown indicator button */}
        <button
          className="w-8 h-8 bg-[#1C2541] text-white rounded-md hover:bg-[#3A506B] transition-colors flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6fffe9]"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label="Open profile dropdown"
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={close}
          />

          <div
            role="menu"
            aria-label="Profile menu"
            className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-gray-100/50 py-2 z-50 animate-in slide-in-from-top-2 duration-200 backdrop-blur-sm"
          >
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1C2541] text-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="[font-family:'Alice-Regular',Helvetica] font-semibold text-[#1C2541] text-lg">
                    {userInfo.name}
                  </div>
                  <div className="[font-family:'Alice-Regular',Helvetica] font-normal text-gray-600 text-sm">
                    {userInfo.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => handleMenuClick("profile")}
                className="w-full px-4 py-3 text-left [font-family:'Alice-Regular',Helvetica] font-normal text-[#1C2541] hover:bg-[#5BC0BE]/10 hover:text-[#1C2541] focus:bg-[#5BC0BE]/20 focus:outline-none transition-all duration-200 flex items-center gap-3 group"
                role="menuitem"
              >
                <svg
                  className="w-5 h-5 text-gray-600 group-hover:text-[#5BC0BE] transition-colors duration-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Profile</span>
              </button>

              <button
                onClick={() => handleMenuClick("wishlist")}
                className="w-full px-4 py-3 text-left [font-family:'Alice-Regular',Helvetica] font-normal text-[#1C2541] hover:bg-[#5BC0BE]/10 hover:text-[#1C2541] focus:bg-[#5BC0BE]/20 focus:outline-none transition-all duration-200 flex items-center gap-3 group"
                role="menuitem"
              >
                <svg
                  className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors duration-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="flex-1">Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="text-xs bg-[#6fffe9] text-black px-2 py-0.5 rounded-full group-hover:bg-[#5BC0BE] group-hover:text-white transition-colors duration-200">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleMenuClick("settings")}
                className="w-full px-4 py-3 text-left [font-family:'Alice-Regular',Helvetica] font-normal text-[#1C2541] hover:bg-[#5BC0BE]/10 hover:text-[#1C2541] focus:bg-[#5BC0BE]/20 focus:outline-none transition-all duration-200 flex items-center gap-3 group"
                role="menuitem"
              >
                <svg
                  className="w-5 h-5 text-gray-600 group-hover:text-[#5BC0BE] transition-colors duration-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Settings</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
