import { useState, useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components";
import * as S from "../styles/AuthStyles";
import { useEffect } from "react";

export default function Signup() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [focus, setFocus] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const id = useId();

  // Detect browser autofill on mount and activate labels when fields are prefilled
  useEffect(() => {
    setTimeout(() => {
      const fields: Array<{ name: keyof typeof focus; el?: HTMLInputElement | null }> = [
        { name: "username", el: document.getElementById(`${id}-username`) as HTMLInputElement | null },
        { name: "email", el: document.getElementById(`${id}-email`) as HTMLInputElement | null },
        { name: "password", el: document.getElementById(`${id}-password`) as HTMLInputElement | null },
        { name: "confirmPassword", el: document.getElementById(`${id}-confirmPassword`) as HTMLInputElement | null },
      ];
      setFocus((prev) => {
        const updated = { ...prev } as typeof focus;
        fields.forEach((f) => {
          if (f.el && f.el.value) updated[f.name] = true;
        });
        return updated;
      });
    }, 150);
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = (name: keyof typeof focus) => {
    setFocus((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (name: keyof typeof focus) => {
    setFocus((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup:", formData);
  };

  return (
    <div style={S.authContainer}>
      <div style={S.authCard}>
        <div style={S.authHeader}>
          <h1 style={S.authTitle}>{t("auth.signup")}</h1>
          <p style={{ color: "#9CA3AF", marginTop: "8px" }}>
            {t("auth.joinCommunity")}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={S.authForm}>
          <div style={S.emailInputGroup}>
            <label
              htmlFor={`${id}-username`}
              style={
                formData.username || focus.username
                  ? S.inputLabelActive
                  : S.emailLabel
              }
            >
              {t("auth.username")}
            </label>
            <input
              type="text"
              id={`${id}-username`}
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onFocus={() => handleFocus("username")}
              onBlur={() => handleBlur("username")}
              style={
                formData.username || focus.username
                  ? S.inputFieldFocus
                  : S.inputField
              }
              aria-label={t("auth.username")}
              required
            />
          </div>

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
              type="email"
              id={`${id}-email`}
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              style={
                formData.email || focus.email ? S.inputFieldFocus : S.inputField
              }
              aria-label={t("auth.email")}
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
              type="password"
              id={`${id}-password`}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => handleFocus("password")}
              onBlur={() => handleBlur("password")}
              style={
                formData.password || focus.password
                  ? S.inputFieldFocus
                  : S.inputField
              }
              aria-label={t("auth.password")}
              required
            />
          </div>

          <div style={S.passwordInputGroup}>
            <label
              htmlFor={`${id}-confirmPassword`}
              style={
                formData.confirmPassword || focus.confirmPassword
                  ? S.inputLabelActive
                  : S.passwordLabel
              }
            >
              {t("auth.confirmPassword")}
            </label>
            <input
              type="password"
              id={`${id}-confirmPassword`}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onFocus={() => handleFocus("confirmPassword")}
              onBlur={() => handleBlur("confirmPassword")}
              style={
                formData.confirmPassword || focus.confirmPassword
                  ? S.inputFieldFocus
                  : S.inputField
              }
              aria-label={t("auth.confirmPassword")}
              required
            />
          </div>

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "18px",
            }}
          >
            <Button
              type="submit"
              variant="link"
              width={345}
              height={57}
              borderRadius={20}
            >
              {t("auth.signup")}
            </Button>
          </div>
        </form>

        <p style={S.authFooter}>
          {t("auth.alreadyHaveAccount")}{" "}
          <a
            style={S.authLink}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = "#login";
            }}
          >
            {t("auth.login")}
          </a>
        </p>
      </div>
    </div>
  );
}
