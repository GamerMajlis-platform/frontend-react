import { useTranslation } from "react-i18next";
import * as S from "../styles/FooterStyles";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer style={S.footer}>
      <div style={S.container}>
        <div style={S.grid}>
          {/* Brand and description */}
          <div>
            <div style={S.brandRow}>
              <img
                src="/brand/controller.png"
                alt="GamerMajlis controller icon"
                style={S.brandImage}
                draggable={false}
              />
              <span style={S.brandText}>GamerMajlis</span>
            </div>
            <p style={S.description}>{t("home.subtitle")}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={S.sectionTitle}>{t("footer.quickLinks")}</h3>
            <ul style={S.list}>
              <li>
                <a href="#" style={S.link}>
                  {t("nav.home")}
                </a>
              </li>
              <li>
                <a href="#" style={S.link}>
                  {t("nav.tournaments")}
                </a>
              </li>
              <li>
                <a href="#" style={S.link}>
                  {t("nav.marketplace")}
                </a>
              </li>
              <li>
                <a href="#" style={S.link}>
                  {t("nav.events")}
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 style={S.sectionTitle}>{t("footer.community")}</h3>
            <ul style={S.list}>
              <li>
                <a href="#" style={S.link}>
                  {t("footer.forums")}
                </a>
              </li>
              <li>
                <a href="#" style={S.link}>
                  {t("footer.support")}
                </a>
              </li>
              <li>
                <a href="#" style={S.link}>
                  {t("footer.contact")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div style={S.bottomBar}>
          <p style={S.rights}>{t("footer.allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
}
