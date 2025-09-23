import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DiscordLoginButton } from "../components/discord";

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = !!(i18n.language && i18n.language.startsWith("ar"));

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md">
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-cyan-300 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-900"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.445.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.197.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418Z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t("auth.welcomeBack")}
            </h1>
            <p className="text-slate-400">{t("auth.discordOnlyDescription")}</p>
          </div>

          {/* Discord Login */}
          <div className="space-y-6">
            <DiscordLoginButton
              size="lg"
              variant="primary"
              className="w-full"
              onError={(error) => {
                console.error("Discord login error:", error);
              }}
            />

            {/* Security Notice */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-300 text-sm">
                    {t("auth.security.title")}
                  </h3>
                  <ul className="text-xs text-blue-200 mt-1 space-y-1">
                    <li>• {t("auth.security.passwordless")}</li>
                    <li>• {t("auth.security.sessionTimeout")}</li>
                    <li>• {t("auth.security.discordAuth")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm">
              {t("auth.dontHaveAccount")}{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t("auth.createAccount")}
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-xs">
            {t("auth.bySigningIn")}{" "}
            <a href="/terms" className="text-primary hover:underline">
              {t("auth.termsOfService")}
            </a>{" "}
            {t("common.and")}{" "}
            <a href="/privacy" className="text-primary hover:underline">
              {t("auth.privacyPolicy")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
