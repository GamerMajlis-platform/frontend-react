import React, { useState, useId } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "../../lib/icons";

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
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
