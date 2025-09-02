import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  authContainer,
  authCard,
  authHeader,
  authTitle,
  authSubtitle,
  authForm,
  inputGroup,
  inputField,
  inputFieldFocus,
  authButton,
  authButtonHover,
  authFooter,
  authLink,
  authLinkHover,
  backButton,
  backButtonHover,
} from "../styles/AuthStyles";

interface LoginProps {
  onNavigate?: (page: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [isHoveringDiscordButton, setIsHoveringDiscordButton] = useState(false);
  const [isHoveringBack, setIsHoveringBack] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login:", formData);
    // After successful login, navigate to home
    if (onNavigate) {
      onNavigate("home");
    }
  };

  const handleDiscordLogin = () => {
    // Handle Discord login logic here
    console.log("Discord login");
    if (onNavigate) {
      onNavigate("home");
    }
  };

  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate("home");
    }
  };

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate("signup");
    }
  };

  // Discord button style (same as auth button but with different colors)
  const discordButton = {
    ...authButton,
    backgroundColor: "#5865F2", // Discord brand color
    marginTop: "0px",
  };

  const discordButtonHover = {
    ...authButtonHover,
    backgroundColor: "#4752C4",
  };

  // "Or" text style
  const orTextStyle = {
    textAlign: "center" as const,
    color: "#9ca3af",
    fontSize: "16px",
    margin: "20px 0",
    fontWeight: "500",
  };

  return (
    <div style={authContainer}>
      {/* Back Button */}
      <button
        style={isHoveringBack ? { ...backButton, ...backButtonHover } : backButton}
        onClick={handleBackToHome}
        onMouseEnter={() => setIsHoveringBack(true)}
        onMouseLeave={() => setIsHoveringBack(false)}
        type="button"
      >
        ← {t("common.back")}
      </button>

      <div style={authCard}>
        <div style={authHeader}>
          <h1 style={authTitle}>{t("auth.login")}</h1>
          <p style={authSubtitle}>{t("auth.welcomeBack")}</p>
        </div>

        <form onSubmit={handleSubmit} style={authForm}>
          <div style={inputGroup}>
            <input
              type="email"
              id="email"
              name="email"
              placeholder={t("auth.email")}
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={focusedField === "email" ? inputFieldFocus : inputField}
              required
            />
          </div>

          <div style={inputGroup}>
            <input
              type="password"
              id="password"
              name="password"
              placeholder={t("auth.password")}
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              style={focusedField === "password" ? inputFieldFocus : inputField}
              required
            />
          </div>

          <button
            type="submit"
            style={isHoveringButton ? { ...authButton, ...authButtonHover } : authButton}
            onMouseEnter={() => setIsHoveringButton(true)}
            onMouseLeave={() => setIsHoveringButton(false)}
          >
            {t("auth.login")}
          </button>
        </form>

        {/* Or divider */}
        <div style={orTextStyle}>{t("auth.or")}</div>

        {/* Discord Login Button */}
        <button
          type="button"
          onClick={handleDiscordLogin}
          style={
            isHoveringDiscordButton
              ? { ...discordButton, ...discordButtonHover }
              : discordButton
          }
          onMouseEnter={() => setIsHoveringDiscordButton(true)}
          onMouseLeave={() => setIsHoveringDiscordButton(false)}
        >
          {t("auth.loginWithDiscord")}
        </button>

        <p style={authFooter}>
          {t("auth.dontHaveAccount")}{" "}
          <a
            href="#"
            style={hoveredLink === "signup" ? { ...authLink, ...authLinkHover } : authLink}
            onMouseEnter={() => setHoveredLink("signup")}
            onMouseLeave={() => setHoveredLink(null)}
            onClick={handleSignupClick}
          >
            {t("auth.registerNow")}
          </a>
        </p>
      </div>
    </div>
  );
}
