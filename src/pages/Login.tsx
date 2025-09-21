import React from "react";
import { useTranslation } from "react-i18next";
import { InputField } from "../components/shared";
import { useFormValidation, commonValidationRules } from "../hooks";
import { useAppContext } from "../context/useAppContext";
import type { LoginFormData } from "../types/auth";

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAppContext();
  const isRtl = !!(i18n.language && i18n.language.startsWith("ar"));

  const {
    values: formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    submit,
    setError,
  } = useFormValidation<LoginFormData>(
    { email: "", password: "", general: "" },
    {
      email: commonValidationRules.email,
      password: commonValidationRules.password,
    }
  );

  const isFormValid =
    isValid && formData.email.trim() !== "" && formData.password.trim() !== "";
  const isSubmitDisabled = isSubmitting || !isFormValid;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof LoginFormData, value);
  };

  const handleInputBlur = (name: keyof LoginFormData) => {
    handleBlur(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submit(async () => {
      await login(formData.email, formData.password);
      window.location.hash = "#home";
    });
    if (!success) {
      setError("general", "Login failed. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0B132B] flex items-center justify-center relative px-4 sm:px-6">
      <div className="relative w-full max-w-[500px] sm:max-w-[600px] lg:max-w-[802px] min-h-[400px] sm:min-h-[480px] my-6 sm:my-10 bg-[rgba(11,19,43,0.95)] shadow-[0_8px_30px_rgba(2,8,23,0.6)] rounded-xl px-6 sm:px-12 lg:px-16 pt-8 sm:pt-12 pb-12 sm:pb-[72px] flex flex-col items-center box-border backdrop-blur-[6px]">
        <div className="w-full flex flex-col items-center mb-6 sm:mb-10">
          <h1 className="font-[Alice] font-normal text-[24px] sm:text-[28px] lg:text-[32px] leading-tight text-center text-[#EEEEEE] m-0">
            {t("auth.login")}
          </h1>
          <p className="text-[#9CA3AF] mt-2 text-sm sm:text-base text-center">
            {t("auth.welcomeBack")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          dir={isRtl ? "rtl" : "ltr"}
          className="w-full flex flex-col items-center gap-4 sm:gap-[22px]"
        >
          {errors.general && (
            <div className="w-full px-3 sm:px-4 py-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg text-[#ef4444] text-sm text-center mb-4 font-[Alice]">
              {errors.general}
            </div>
          )}

          <InputField
            name="email"
            type="email"
            value={formData.email}
            label={t("auth.email")}
            error={touched.email ? errors.email : undefined}
            disabled={isSubmitting}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur("email")}
            required
          />

          <InputField
            name="password"
            type="password"
            value={formData.password}
            label={t("auth.password")}
            error={touched.password ? errors.password : undefined}
            disabled={isSubmitting}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur("password")}
            required
          />

          <div className="w-full flex justify-center mt-3">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-[345px] h-[57px] rounded-[20px] font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-[#C4FFF9] text-[#0B132B] hover:bg-[#CFFFEF] focus:ring-[#CFFFEF]"
            >
              {isSubmitting
                ? t("common.loading") || t("auth.signingIn")
                : t("auth.login")}
            </button>
          </div>
        </form>

        <p className="w-full font-[Alice] font-normal text-base leading-5 text-center text-[#EEEEEE] mt-[18px]">
          {t("auth.dontHaveAccount")}{" "}
          <a
            className="text-[#C4FFF9] underline cursor-pointer transition-opacity duration-200 hover:opacity-80"
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
