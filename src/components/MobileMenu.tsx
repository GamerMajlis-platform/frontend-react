import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { navigationItems } from "../data";
import { LanguageSwitcher } from "./index";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange?: (section: string) => void;
  showLanguage?: boolean;
}

export default function MobileMenu({
  open,
  onClose,
  activeSection,
  onSectionChange,
  showLanguage,
}: MobileMenuProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);

  // Create portal root lazily
  const portalRoot = useMemo(() => {
    let root = document.getElementById("gm-mobile-menu-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "gm-mobile-menu-root";
      document.body.appendChild(root);
    }
    return root;
  }, []);

  // Focus trap within the panel
  useEffect(() => {
    if (!open) return;

    // trigger slide-in on next frame
    requestAnimationFrame(() => setEntered(true));

    const panel = panelRef.current;
    if (!panel) return;

    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => el.offsetParent !== null);
    const focusables = getFocusable();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Focus first item
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && focusables.length > 0) {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Close on backdrop click
  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.menu", { defaultValue: "Menu" })}
      id="mobile-menu"
      className="fixed inset-0 z-[1000] md:hidden"
      onMouseDown={onBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Sliding panel */}
      <div
        ref={panelRef}
        className={`absolute top-0 ${
          isRTL ? "left-0" : "right-0"
        } h-full w-[85%] max-w-[360px] bg-gradient-to-b from-slate-800/95 via-slate-700/95 to-slate-800/95 backdrop-blur-xl ${
          isRTL ? "border-r" : "border-l"
        } border-slate-600/50 shadow-2xl
        ${
          entered
            ? "translate-x-0"
            : isRTL
            ? "-translate-x-full"
            : "translate-x-full"
        }
        transition-transform duration-300 ease-out will-change-transform`}
      >
        {/* Decorative */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-300/5 pointer-events-none" />
        <div
          className={`absolute top-0 ${
            isRTL ? "left-0" : "right-0"
          } w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-xl pointer-events-none`}
        />

        {/* Content */}
        <nav className="relative z-10 flex flex-col gap-6 px-6 pt-8 pb-6 h-full overflow-y-auto">
          {/* Close button (visually hidden for now; backdrop click works) */}
          <button onClick={onClose} className="sr-only">
            {t("common.close", { defaultValue: "Close" })}
          </button>

          {navigationItems.map((item) => (
            <a
              key={item.key}
              href="#"
              className={`group flex items-center gap-3 font-medium text-xl transition-all duration-300 ${
                activeSection === item.key
                  ? "text-white"
                  : "text-slate-300 hover:text-white"
              }`}
              onClick={(e) => {
                e.preventDefault();
                onSectionChange?.(item.key);
                onClose();
              }}
            >
              <span
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSection === item.key
                    ? "bg-gradient-to-r from-primary to-cyan-300 shadow-glow"
                    : "bg-slate-600 group-hover:bg-slate-400"
                }`}
              />
              {t(item.translationKey)}
            </a>
          ))}

          {/* Messages shortcut */}
          <a
            href="#"
            className="group flex items-center gap-3 font-medium text-xl text-slate-300 hover:text-white transition-all duration-300"
            onClick={(e) => {
              e.preventDefault();
              onSectionChange?.("messages");
              onClose();
            }}
          >
            <span className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-slate-400 transition-all duration-300" />
            <span className="flex items-center gap-2">
              {t("nav.messages")}
              <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse" />
            </span>
          </a>

          {/* Language */}
          {showLanguage && (
            <div className="border-t border-slate-600/50 pt-6 mt-2">
              <div className="flex items-center gap-3 text-slate-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="font-medium text-lg">
                  {t("common.language", { defaultValue: "Language" })}
                </span>
              </div>
              <div className={`${isRTL ? "mr-5" : "ml-5"}`}>
                <LanguageSwitcher variant="light" />
              </div>
            </div>
          )}

          {/* Spacer to avoid last item behind bottom notch */}
          <div className="mt-auto pb-6" />
        </nav>
      </div>
    </div>,
    portalRoot
  );
}
