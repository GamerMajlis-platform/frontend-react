import React, { useState, useId } from "react";
import { useTranslation } from "react-i18next";

interface InputFieldProps {
  name: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  value: string;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  id?: string;
}

/**
 * Reusable InputField component that handles common input patterns
 * Used across Login/Signup forms with consistent styling and floating labels
 */
export default function InputField({
  name,
  type = "text",
  value,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  autoComplete,
  className = "",
  onChange,
  onFocus,
  onBlur,
  id: providedId,
}: InputFieldProps) {
  const { i18n } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const id = providedId || `${generatedId}-${name}`;

  const isRtl = !!(i18n.language && i18n.language.startsWith("ar"));
  const isPasswordType = type === "password";
  const hasValue = value && value.trim() !== "";
  const isFloatingLabel = hasValue || isFocused;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = isPasswordType && showPassword ? "text" : type;

  return (
    <div className={`relative w-full max-w-[720px] h-12 ${className}`}>
      {/* Floating Label */}
      {label && (
        <label
          htmlFor={id}
          className={`absolute ${
            isFloatingLabel
              ? `${
                  isRtl ? "right-[14px]" : "left-[14px]"
                } -top-[10px] transform-none text-sm leading-4 text-[#C4FFF9] px-[6px]`
              : `${
                  isRtl ? "right-4 sm:right-5" : "left-4 sm:left-5"
                } top-1/2 -translate-y-1/2 text-sm sm:text-base leading-[18px] text-[rgba(255,255,255,0.6)] px-2`
          } font-[Alice] font-normal pointer-events-none transition-all duration-200 bg-[rgba(11,19,43,0.95)]`}
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative w-full">
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          placeholder={!label ? placeholder : undefined}
          autoComplete={autoComplete}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={`w-full h-12 ${
            isFloatingLabel
              ? "border-[#6fffe9] shadow-[0_0_0_4px_rgba(111,255,233,0.06)]"
              : "border-[rgba(255,255,255,0.28)]"
          } border rounded-3xl bg-transparent text-white text-base sm:text-lg font-[Alice] px-4 sm:px-5 outline-none box-border transition-all duration-200 ${
            isRtl ? "text-right" : "text-left"
          } ${
            isPasswordType ? "pr-12" : ""
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={label}
        />

        {/* Password Toggle Button */}
        {isPasswordType && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            className={`absolute ${
              isRtl ? "left-3" : "right-3"
            } top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L17.94 17.94zM9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.72-6.72a5.29 5.29 0 0 0-4.02-.23l-1.91-1.91 2.81-2.09zm7.07 7.07l-3-3a5 5 0 0 1 3 3zm-4.72 4.72a5 5 0 0 1-3-3l3 3z" />
                <path d="m1 1 22 22-2 2L1 3l2-2z" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 mt-1 text-red-400 text-xs font-[Alice]">
          {error}
        </div>
      )}
    </div>
  );
}
