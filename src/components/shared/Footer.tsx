import { useTranslation } from "react-i18next";
import { memo } from "react";
import { Link } from "react-router-dom";
import useIsMobile from "../../hooks/useIsMobile";

function Footer() {
  const { t } = useTranslation(["translation", "nav"]);
  const isMobile = useIsMobile();

  const scrollToTop = () => {
    if (isMobile) {
      // For mobile, use instant scroll to avoid potential issues
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50 backdrop-blur-xl">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-300/5" />
      <div className="absolute top-0 left-0 w-96 h-48 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-32 bg-gradient-to-tl from-cyan-300/10 to-transparent rounded-full blur-2xl" />

      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Enhanced Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-3 mb-4 cursor-pointer"
              aria-label="Home - GamerMajlis"
            >
              <div className="relative">
                <img
                  src="/brand/controller.png"
                  alt="GamerMajlis controller icon"
                  className="h-[28px] sm:h-[34px] w-auto block drop-shadow-lg"
                  draggable={false}
                />
              </div>
              <span className="text-white font-[var(--font-alice)] text-[20px] sm:text-[26px] bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                GamerMajlis
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-[1.7] max-w-[400px] backdrop-blur-sm">
              {t("home.subtitle")}
            </p>
          </div>

          {/* Enhanced Quick Links */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
            <h3 className="text-white mb-4 font-[var(--font-alice)] text-base sm:text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {t("footer.quickLinks")}
            </h3>
            <ul className="list-none p-0 m-0 space-y-3">
              <li>
                <Link
                  to="/"
                  onClick={scrollToTop}
                  className="group flex items-center gap-2 text-slate-400 no-underline text-sm hover:text-primary transition-all duration-300 transform hover:translate-x-1"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-primary transition-colors duration-300" />
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/tournaments"
                  onClick={scrollToTop}
                  className="group flex items-center gap-2 text-slate-400 no-underline text-sm hover:text-primary transition-all duration-300 transform hover:translate-x-1"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-primary transition-colors duration-300" />
                  {t("nav.tournaments")}
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace"
                  onClick={scrollToTop}
                  className="group flex items-center gap-2 text-slate-400 no-underline text-sm hover:text-primary transition-all duration-300 transform hover:translate-x-1"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-primary transition-colors duration-300" />
                  {t("nav.marketplace")}
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  onClick={scrollToTop}
                  className="group flex items-center gap-2 text-slate-400 no-underline text-sm hover:text-primary transition-all duration-300 transform hover:translate-x-1"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-primary transition-colors duration-300" />
                  {t("nav.events")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Enhanced Community Section */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
            <h3 className="text-white mb-4 font-[var(--font-alice)] text-base sm:text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {t("footer.community")}
            </h3>
            <ul className="list-none p-0 m-0 space-y-3">
              <li>
                <button
                  type="button"
                  onClick={() =>
                    alert(t("pages.comingSoon", { page: t("footer.forums") }))
                  }
                  className="group flex items-center gap-2 text-slate-400 no-underline text-sm hover:text-cyan-300 transition-all duration-300 transform hover:translate-x-1 cursor-pointer bg-transparent border-0"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-300 transition-colors duration-300" />
                  {t("footer.forums")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    alert(t("pages.comingSoon", { page: t("footer.support") }))
                  }
                  className="group flex items-center gap-2 text-slate-400 no-underline text-sm hover:text-cyan-300 transition-all duration-300 transform hover:translate-x-1 cursor-pointer bg-transparent border-0"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-300 transition-colors duration-300" />
                  {t("footer.support")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    alert(t("pages.comingSoon", { page: t("footer.contact") }))
                  }
                  className="group flex items-center gap-2 text-slate-400 no-underline text-sm hover:text-cyan-300 transition-all duration-300 transform hover:translate-x-1 cursor-pointer bg-transparent border-0"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-300 transition-colors duration-300" />
                  {t("footer.contact")}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="border-t border-slate-700/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[13px] text-center sm:text-left">
            {t("footer.allRightsReserved")}
          </p>

          {/* Social links removed for now; add back via Footer props if needed */}
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
