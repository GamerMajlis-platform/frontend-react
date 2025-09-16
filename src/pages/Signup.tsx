import { useState, useId, useEffect } from "react";
import { useTranslation } from "react-i18next";
// import removed: using native button
import { useAppContext } from "../context/useAppContext";

export default function Signup() {
  const { t, i18n } = useTranslation();
  const { register } = useAppContext();
  const isRtl = !!(i18n.language && i18n.language.startsWith("ar"));

  // Form state
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

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const id = useId();

  // Detect browser autofill on mount and activate labels when fields are prefilled
  useEffect(() => {
    setTimeout(() => {
      const fields: Array<{
        name: keyof typeof focus;
        el?: HTMLInputElement | null;
      }> = [
        {
          name: "username",
          el: document.getElementById(
            `${id}-username`
          ) as HTMLInputElement | null,
        },
        {
          name: "email",
          el: document.getElementById(`${id}-email`) as HTMLInputElement | null,
        },
        {
          name: "password",
          el: document.getElementById(
            `${id}-password`
          ) as HTMLInputElement | null,
        },
        {
          name: "confirmPassword",
          el: document.getElementById(
            `${id}-confirmPassword`
          ) as HTMLInputElement | null,
        },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      // Redirect to home page after successful registration
      window.location.hash = "#home";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0B132B] flex items-center justify-center relative px-4 sm:px-6">
      <div className="relative w-full max-w-[500px] sm:max-w-[600px] lg:max-w-[802px] min-h-[500px] sm:min-h-[600px] my-6 sm:my-10 bg-[rgba(11,19,43,0.95)] shadow-[0_8px_30px_rgba(2,8,23,0.6)] rounded-xl px-6 sm:px-12 lg:px-16 pt-8 sm:pt-12 pb-12 sm:pb-[72px] flex flex-col items-center box-border backdrop-blur-[6px]">
        <div className="w-full flex flex-col items-center mb-6 sm:mb-10">
          <h1 className="font-[Alice] font-normal text-[24px] sm:text-[28px] lg:text-[32px] leading-tight text-center text-[#EEEEEE] m-0">
            {t("auth.signup")}
          </h1>
          <p className="text-[#9CA3AF] mt-2 text-sm sm:text-base text-center">
            {t("auth.joinCommunity")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          dir={isRtl ? "rtl" : "ltr"}
          className="w-full flex flex-col items-center gap-4 sm:gap-[22px]"
        >
          {/* Error Display */}
          {error && (
            <div className="w-full px-3 sm:px-4 py-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg text-[#ef4444] text-sm text-center mb-4 font-[Alice]">
              {error}
            </div>
          )}

          <div className="relative w-full max-w-[720px] h-12">
            <label
              htmlFor={`${id}-username`}
              className={`absolute ${
                formData.username || focus.username
                  ? `${
                      isRtl ? "right-[14px]" : "left-[14px]"
                    } -top-[10px] transform-none text-sm leading-4 text-[#C4FFF9] px-[6px]`
                  : `${
                      isRtl ? "right-4 sm:right-5" : "left-4 sm:left-5"
                    } top-1/2 -translate-y-1/2 text-sm sm:text-base leading-[18px] text-[rgba(255,255,255,0.6)] px-2`
              } font-[Alice] font-normal pointer-events-none transition-all duration-200 bg-[rgba(11,19,43,0.95)]`}
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
              className={`w-full h-12 ${
                formData.username || focus.username
                  ? "border-[#6fffe9] shadow-[0_0_0_4px_rgba(111,255,233,0.06)]"
                  : "border-[rgba(255,255,255,0.28)]"
              } border rounded-3xl bg-transparent text-white text-lg font-[Alice] px-5 outline-none box-border transition-all duration-200 ${
                isRtl ? "text-right" : "text-left"
              }`}
              aria-label={t("auth.username")}
              required
            />
          </div>

          <div className="relative w-full max-w-[720px] h-12">
            <label
              htmlFor={`${id}-email`}
              className={`absolute ${
                formData.email || focus.email
                  ? `${
                      isRtl ? "right-[14px]" : "left-[14px]"
                    } -top-[10px] transform-none text-sm leading-4 text-[#C4FFF9] px-[6px]`
                  : `${
                      isRtl ? "right-5" : "left-5"
                    } top-1/2 -translate-y-1/2 text-base leading-[18px] text-[rgba(255,255,255,0.6)] px-2`
              } font-[Alice] font-normal pointer-events-none transition-all duration-200 bg-[rgba(11,19,43,0.95)]`}
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
              className={`w-full h-12 ${
                formData.email || focus.email
                  ? "border-[#6fffe9] shadow-[0_0_0_4px_rgba(111,255,233,0.06)]"
                  : "border-[rgba(255,255,255,0.28)]"
              } border rounded-3xl bg-transparent text-white text-lg font-[Alice] px-5 outline-none box-border transition-all duration-200 ${
                isRtl ? "text-right" : "text-left"
              }`}
              aria-label={t("auth.email")}
              required
            />
          </div>

          <div className="relative w-full max-w-[720px] h-12">
            <label
              htmlFor={`${id}-password`}
              className={`absolute ${
                formData.password || focus.password
                  ? `${
                      isRtl ? "right-[14px]" : "left-[14px]"
                    } -top-[10px] transform-none text-sm leading-4 text-[#C4FFF9] px-[6px]`
                  : `${
                      isRtl ? "right-5" : "left-5"
                    } top-1/2 -translate-y-1/2 text-base leading-[18px] text-[rgba(255,255,255,0.6)] px-2`
              } font-[Alice] font-normal pointer-events-none transition-all duration-[180ms] bg-[rgba(11,19,43,0.95)]`}
            >
              {t("auth.password")}
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                id={`${id}-password`}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                className={`w-full h-12 ${
                  formData.password || focus.password
                    ? "border-[#6fffe9] shadow-[0_0_0_4px_rgba(111,255,233,0.06)]"
                    : "border-[rgba(255,255,255,0.28)]"
                } border rounded-3xl bg-transparent text-white text-lg font-[Alice] px-5 outline-none box-border transition-all duration-200 ${
                  isRtl ? "text-right" : "text-left"
                }`}
                aria-label={t("auth.password")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${
                  isRtl ? "left-3" : "right-3"
                } top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer p-1 text-[#9CA3AF] flex items-center justify-center`}
                aria-label={
                  showPassword
                    ? t("auth_extras.hidePassword")
                    : t("auth_extras.showPassword")
                }
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

          <div className="relative w-full max-w-[720px] h-12">
            <label
              htmlFor={`${id}-confirmPassword`}
              className={`absolute ${
                formData.confirmPassword || focus.confirmPassword
                  ? `${
                      isRtl ? "right-[14px]" : "left-[14px]"
                    } -top-[10px] transform-none text-sm leading-4 text-[#C4FFF9] px-[6px]`
                  : `${
                      isRtl ? "right-5" : "left-5"
                    } top-1/2 -translate-y-1/2 text-base leading-[18px] text-[rgba(255,255,255,0.6)] px-2`
              } font-[Alice] font-normal pointer-events-none transition-all duration-[180ms] bg-[rgba(11,19,43,0.95)]`}
            >
              {t("auth.confirmPassword")}
            </label>
            <div className="relative w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id={`${id}-confirmPassword`}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={() => handleFocus("confirmPassword")}
                onBlur={() => handleBlur("confirmPassword")}
                className={`w-full h-12 ${
                  formData.confirmPassword || focus.confirmPassword
                    ? "border-[#6fffe9] shadow-[0_0_0_4px_rgba(111,255,233,0.06)]"
                    : "border-[rgba(255,255,255,0.28)]"
                } border rounded-3xl bg-transparent text-white text-lg font-[Alice] px-5 outline-none box-border transition-all duration-200 ${
                  isRtl ? "text-right" : "text-left"
                }`}
                aria-label={t("auth.confirmPassword")}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute ${
                  isRtl ? "left-3" : "right-3"
                } top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer p-1 text-[#9CA3AF] flex items-center justify-center`}
                aria-label={
                  showConfirmPassword
                    ? t("auth_extras.hidePassword")
                    : t("auth_extras.showPassword")
                }
              >
                {showConfirmPassword ? (
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

          <div className="w-full flex justify-center mt-[18px]">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full max-w-[345px] h-[57px] rounded-[20px] font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-[#C4FFF9] text-[#0B132B] hover:bg-[#CFFFEF] focus:ring-[#CFFFEF]"
            >
              {isLoading
                ? t("common.loading") || t("auth.creatingAccount")
                : t("auth.signup")}
            </button>
          </div>
        </form>

        <p className="w-full font-[Alice] font-normal text-base leading-5 text-center text-[#EEEEEE] mt-[18px]">
          {t("auth.alreadyHaveAccount")}{" "}
          <a
            className="text-[#C4FFF9] underline cursor-pointer transition-opacity duration-200 hover:opacity-80"
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
