import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="w-full bg-[var(--color-dark)] border-t border-[var(--color-dark-secondary)]">
      <div className="w-full max-w-screen-xl mx-auto px-6 py-12">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
          {/* Brand and description */}
          <div>
            <div className="grid grid-cols-[auto_1fr] items-center gap-3 mb-3">
              <img
                src="/brand/controller.png"
                alt="GamerMajlis controller icon"
                className="h-[30px] w-auto block mb-1"
                draggable={false}
              />
              <span className="text-white font-[var(--font-alice)] text-[22px] font-semibold">
                GamerMajlis
              </span>
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm max-w-[540px] leading-[1.6]">
              {t("home.subtitle")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[var(--color-text)] font-semibold mb-3 font-[var(--font-alice)]">
              {t("footer.quickLinks")}
            </h3>
            <ul className="list-none p-0 m-0 grid gap-2">
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm"
                >
                  {t("nav.home")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm"
                >
                  {t("nav.tournaments")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm"
                >
                  {t("nav.marketplace")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm"
                >
                  {t("nav.events")}
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-[var(--color-text)] font-semibold mb-3 font-[var(--font-alice)]">
              {t("footer.community")}
            </h3>
            <ul className="list-none p-0 m-0 grid gap-2">
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm"
                >
                  {t("footer.forums")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm"
                >
                  {t("footer.support")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--color-text-secondary)] no-underline text-sm"
                >
                  {t("footer.contact")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-[var(--color-dark-secondary)] mt-8 pt-6 flex items-center justify-between flex-wrap gap-y-3">
          <p className="text-[var(--color-text-secondary)] text-[13px]">
            {t("footer.allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
