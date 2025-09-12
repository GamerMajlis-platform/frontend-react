import { useTranslation } from "react-i18next";
import { memo } from "react";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="w-full bg-[var(--color-dark)] border-t border-[var(--color-dark-secondary)]">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand and description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/brand/controller.png"
                alt="GamerMajlis controller icon"
                className="h-[24px] sm:h-[30px] w-auto block"
                draggable={false}
              />
              <span className="text-white font-[var(--font-alice)] text-[18px] sm:text-[22px]">
                GamerMajlis
              </span>
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm leading-[1.6] max-w-[400px]">
              {t("home.subtitle")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[var(--color-text)] mb-3 font-[var(--font-alice)] text-base sm:text-lg">
              {t("footer.quickLinks")}
            </h3>
            <ul className="list-none p-0 m-0 space-y-2">
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("nav.home")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("nav.tournaments")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("nav.marketplace")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("nav.events")}
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-[var(--color-text)] mb-3 font-[var(--font-alice)] text-base sm:text-lg">
              {t("footer.community")}
            </h3>
            <ul className="list-none p-0 m-0 space-y-2">
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("footer.forums")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("footer.support")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm hover:text-[var(--color-primary)] transition-colors"
                >
                  {t("footer.contact")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-[var(--color-dark-secondary)] mt-6 sm:mt-8 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[var(--color-text-secondary)] text-[13px] text-center sm:text-left">
            {t("footer.allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
