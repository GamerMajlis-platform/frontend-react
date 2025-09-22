import React from "react";
import { useTranslation } from "react-i18next";
import { InputField } from "../components/shared";
import { DiscordLoginButton } from "../components/discord";
import { useFormValidation, commonValidationRules } from "../hooks";
import { useAppContext } from "../context/useAppContext";
import type { SignupFormData } from "../types/auth";

export default function Signup() {
  const { t, i18n } = useTranslation();
  const { register } = useAppContext();
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
  } = useFormValidation<SignupFormData>(
    {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    },
    {
      displayName: {
        custom: (value: unknown) => {
          const stringValue = String(value || "");
          if (!stringValue || stringValue.trim().length < 2) {
            return "Display name must be at least 2 characters";
          }
          return undefined;
        },
      },
      email: commonValidationRules.email,
      password: commonValidationRules.password,
      confirmPassword: {
        custom: (value: unknown) => {
          const stringValue = String(value || "");
          if (stringValue !== formData.password) {
            return "Passwords do not match";
          }
          return undefined;
        },
      },
    }
  );

  const isFormValid =
    isValid &&
    formData.displayName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.trim() !== "" &&
    formData.confirmPassword.trim() !== "";

  const isSubmitDisabled = isSubmitting || !isFormValid;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof SignupFormData, value);
  };

  const handleInputBlur = (name: keyof SignupFormData) => {
    handleBlur(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submit(async () => {
      const message = await register(
        formData.displayName,
        formData.email,
        formData.password
      );
      // Show success message and redirect to login instead of home
      alert(message); // TODO: Replace with proper notification system
      window.location.hash = "#login";
    });
    if (!success) {
      setError("general", "Signup failed. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0B132B] flex items-center justify-center relative px-4 sm:px-6">
      <div className="relative w-full max-w-[500px] sm:max-w-[600px] lg:max-w-[802px] min-h-[400px] sm:min-h-[480px] my-6 sm:my-10 bg-[rgba(11,19,43,0.95)] shadow-[0_8px_30px_rgba(2,8,23,0.6)] rounded-xl px-6 sm:px-12 lg:px-16 pt-8 sm:pt-12 pb-12 sm:pb-[72px] flex flex-col items-center box-border backdrop-blur-[6px]">
        <div className="w-full flex flex-col items-center mb-6 sm:mb-10">
          <h1 className="font-[Alice] font-normal text-[24px] sm:text-[28px] lg:text-[32px] leading-tight text-center text-[#EEEEEE] m-0">
            {t("auth.signup")}
          </h1>
          <p className="text-[#9CA3AF] mt-2 text-sm sm:text-base text-center">
            {t("auth.createAccount")}
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
            name="displayName"
            type="text"
            value={formData.displayName}
            label={t("auth.displayName")}
            error={touched.displayName ? errors.displayName : undefined}
            disabled={isSubmitting}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur("displayName")}
            required
          />

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

          <InputField
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            label={t("auth.confirmPassword")}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
            disabled={isSubmitting}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur("confirmPassword")}
            required
          />

          <div className="w-full flex justify-center mt-3">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-[345px] h-[57px] rounded-[20px] font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-[#C4FFF9] text-[#0B132B] hover:bg-[#CFFFEF] focus:ring-[#CFFFEF]"
            >
              {isSubmitting
                ? t("common.loading") || t("auth.creatingAccount")
                : t("auth.signup")}
            </button>
          </div>
        </form>

        {/* Discord OAuth Section */}
        <div className="w-full mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1a1a1a] text-gray-400">
                {t("auth.or")}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <DiscordLoginButton
              size="lg"
              variant="outline"
              className="w-[345px] mx-auto"
              onError={(error) => {
                setError("general", error);
              }}
            />
          </div>
        </div>

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
