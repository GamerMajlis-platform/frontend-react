import { useState, useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components";
import * as S from "../styles/AuthStyles";
import { useEffect } from "react";

export default function Login() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [focus, setFocus] = useState({ email: false, password: false });
  const id = useId();

  // Detect browser autofill on mount and activate labels for filled inputs
  useEffect(() => {
    // delay to allow browser autofill to populate fields
    setTimeout(() => {
      const elEmail = document.getElementById(`${id}-email`) as HTMLInputElement | null;
      const elPassword = document.getElementById(`${id}-password`) as HTMLInputElement | null;
      
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
    const element = document.getElementById(`${id}-${name}`) as HTMLInputElement | null;
    if (element && element.value && !formData[name]) {
      setFormData((p) => ({ ...p, [name]: element.value }));
    }
  };
  
  const handleBlur = (name: "email" | "password") =>
    setFocus((p) => ({ ...p, [name]: false }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", formData);
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
            <input
              id={`${id}-password`}
              name="password"
              type="password"
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
            >
              {t("auth.login")}
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
            <button style={S.discordButton} onClick={() => (window.location.href = "/auth/discord")}> 
              <span style={{ color: "#0B132B", fontFamily: "Alice", fontSize: 20 }}>
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
