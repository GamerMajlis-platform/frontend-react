import { useState, useId, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components";
import * as S from "../styles/AuthStyles";
import { useAppContext } from "../context/useAppContext";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAppContext();

  // Form state
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [focus, setFocus] = useState({ email: false, password: false });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const id = useId();

  // Detect browser autofill on mount and activate labels for filled inputs
  useEffect(() => {
    // delay to allow browser autofill to populate fields
    setTimeout(() => {
      const elEmail = document.getElementById(
        `${id}-email`
      ) as HTMLInputElement | null;
      const elPassword = document.getElementById(
        `${id}-password`
      ) as HTMLInputElement | null;

      // Update both focus state and form data for autofilled inputs
      if (elEmail && elEmail.value) {
        setFocus((p) => ({ ...p, email: true }));
        setFormData((p) => ({ ...p, email: elEmail.value }));
      }
      if (elPassword && elPassword.value) {
        setFocus((p) => ({ ...p, password: true }));
        setFormData((p) => ({ ...p, password: elPassword.value }));
      }
    }, 150);
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = (name: "email" | "password") => {
    setFocus((p) => ({ ...p, [name]: true }));

    // Additional check for autofilled values when user focuses
    const element = document.getElementById(
      `${id}-${name}`
    ) as HTMLInputElement | null;
    if (element && element.value && !formData[name]) {
      setFormData((p) => ({ ...p, [name]: element.value }));
    }
  };

  const handleBlur = (name: "email" | "password") =>
    setFocus((p) => ({ ...p, [name]: false }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      // Only redirect if component is still mounted
      window.location.hash = "#home";
    } catch (err) {
      // Only update error state if component is still mounted
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      // Only update loading state if component is still mounted
      setIsLoading(false);
    }
  };

  return (
    <div style={S.authContainer}>
      <div style={S.authCard}>
        <div style={S.authHeader}>
          <h1 style={S.authTitle}>{t("auth.login")}</h1>
          <p style={{ color: "#9CA3AF", marginTop: "8px" }}>
            {t("auth.welcomeBack")}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={S.authForm}>
          {/* Error Display */}
          {error && (
            <div
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                color: "#ef4444",
                fontSize: "14px",
                textAlign: "center",
                marginBottom: "16px",
                fontFamily: "Alice",
              }}
            >
              {error}
            </div>
          )}

          <div style={S.emailInputGroup}>
            <label
              htmlFor={`${id}-email`}
              style={
                formData.email || focus.email
                  ? S.inputLabelActive
                  : S.emailLabel
              }
            >
              {t("auth.email")}
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              style={
                formData.email || focus.email ? S.inputFieldFocus : S.inputField
              }
              required
            />
          </div>

          <div style={S.passwordInputGroup}>
            <label
              htmlFor={`${id}-password`}
              style={
                formData.password || focus.password
                  ? S.inputLabelActive
                  : S.passwordLabel
              }
            >
              {t("auth.password")}
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                id={`${id}-password`}
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                style={
                  formData.password || focus.password
                    ? S.inputFieldFocus
                    : S.inputField
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  color: "#9CA3AF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div
            style={{
              width: "720px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label
              style={{
                color: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input type="checkbox" />
              <span>{t("auth.rememberMe")}</span>
            </label>
            <a style={S.authLink as React.CSSProperties} href="#">
              {t("auth.forgotPassword")}
            </a>
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "12px", // Reduced from "18px"
            }}
          >
            <Button
              type="submit"
              variant="link"
              width={345}
              height={57}
              borderRadius={20}
              disabled={isLoading}
            >
              {isLoading
                ? t("common.loading") || "Signing In..."
                : t("auth.login")}
            </Button>
          </div>

          <div style={S.orText}>{t("auth.or")}</div>

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              style={S.discordButton}
              onClick={() => (window.location.href = "/auth/discord")}
            >
              <span
                style={{ color: "#0B132B", fontFamily: "Alice", fontSize: 20 }}
              >
                {t("auth.loginWithDiscord")}
              </span>
            </button>
          </div>
        </form>

        <p style={S.authFooter}>
          {t("auth.dontHaveAccount")}{" "}
          <a
            style={S.authLink as React.CSSProperties}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = "#signup";
            }}
          >
            {t("auth.signup")}
          </a>
        </p>
      </div>
    </div>
  );
}
