// Form-related types and validation

import type { ChangeEvent, FocusEvent, FormEvent } from "react";

// Generic form field types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  disabled?: boolean;
}

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// Form event handlers
export type FormFieldChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void;
export type FormFieldFocusHandler = (
  e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void;
export type FormSubmitHandler = (
  e: FormEvent<HTMLFormElement>
) => void | Promise<void>;

// Validation types
export interface ValidationRule<T = unknown> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | undefined;
  message?: string;
}

export type ValidationRules<T = Record<string, unknown>> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export interface ValidationResult<T = Record<string, unknown>> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

// Common form component props
export interface InputFieldProps {
  id?: string;
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
  onChange: FormFieldChangeHandler;
  onFocus?: FormFieldFocusHandler;
  onBlur?: FormFieldFocusHandler;
}

export interface TextAreaFieldProps extends Omit<InputFieldProps, "type"> {
  rows?: number;
  cols?: number;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

export interface SelectFieldProps
  extends Omit<InputFieldProps, "type" | "placeholder"> {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  multiple?: boolean;
}

export interface CheckboxFieldProps {
  id?: string;
  name: string;
  checked: boolean;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onChange: (checked: boolean) => void;
}

export interface RadioFieldProps {
  id?: string;
  name: string;
  value: string;
  selectedValue: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
}

// Form component types
export interface FormFieldWrapperProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface FormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  isValid?: boolean;
  onCancel?: () => void;
  className?: string;
}
