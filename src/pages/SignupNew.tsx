import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Logo } from "../components";
import {
  authContainer,
  authCard,
  authHeader,
  authLogo,
  authTitle,
  authSubtitle,
  authForm,
  inputGroup,
  inputLabel,
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

interface SignupProps {
  onNavigate?: (page: string) => void;
}

export default function Signup({ onNavigate }: SignupProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [isHoveringBack, setIsHoveringBack] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("Signup:", formData);
    // After successful signup, navigate to home
    if (onNavigate) {
      onNavigate("home");
    }
  };

  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate("home");
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate("login");
    }
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
          <div style={authLogo}>
            <Logo />
          </div>
          <h1 style={authTitle}>{t("auth.signup")}</h1>
          <p style={authSubtitle}>{t("auth.joinCommunity")}</p>
        </div>

        <form onSubmit={handleSubmit} style={authForm}>
          <div style={inputGroup}>
            <label htmlFor="username" style={inputLabel}>
              {t("auth.username")}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField(null)}
              style={focusedField === "username" ? inputFieldFocus : inputField}
              required
            />
          </div>

          <div style={inputGroup}>
            <label htmlFor="email" style={inputLabel}>
              {t("auth.email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={focusedField === "email" ? inputFieldFocus : inputField}
              required
            />
          </div>

          <div style={inputGroup}>
            <label htmlFor="password" style={inputLabel}>
              {t("auth.password")}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              style={focusedField === "password" ? inputFieldFocus : inputField}
              required
            />
          </div>

          <div style={inputGroup}>
            <label htmlFor="confirmPassword" style={inputLabel}>
              {t("auth.confirmPassword")}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
              style={focusedField === "confirmPassword" ? inputFieldFocus : inputField}
              required
            />
          </div>

          <button
            type="submit"
            style={isHoveringButton ? { ...authButton, ...authButtonHover } : authButton}
            onMouseEnter={() => setIsHoveringButton(true)}
            onMouseLeave={() => setIsHoveringButton(false)}
          >
            {t("auth.signup")}
          </button>
        </form>

        <p style={authFooter}>
          {t("auth.alreadyHaveAccount")}{" "}
          <a
            href="#"
            style={hoveredLink === "login" ? { ...authLink, ...authLinkHover } : authLink}
            onMouseEnter={() => setHoveredLink("login")}
            onMouseLeave={() => setHoveredLink(null)}
            onClick={handleLoginClick}
          >
            {t("auth.login")}
          </a>
        </p>
      </div>
    </div>
  );
}
