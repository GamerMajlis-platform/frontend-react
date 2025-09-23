import { useState, useCallback } from "react";
import type {
  ValidationRules,
  ValidationResult,
  FormState,
} from "../types/forms";
import { VALIDATION_RULES } from "../config/constants";

/**
 * Custom hook for form validation
 * @param initialValues - Initial form values
 * @param validationRules - Validation rules for each field
 * @returns Form state and helper functions
 */
export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  validationRules: ValidationRules<T> = {}
) {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
  });

  // Validate a single field
  const validateField = useCallback(
    (name: keyof T, value: unknown): string | undefined => {
      const rules = validationRules[name];
      if (!rules) return undefined;

      // Required validation
      if (
        rules.required &&
        (!value || (typeof value === "string" && value.trim() === ""))
      ) {
        return rules.message || `${String(name)} is required`;
      }

      // Skip other validations if value is empty and not required
      if (!value || (typeof value === "string" && value.trim() === "")) {
        return undefined;
      }

      const stringValue = String(value);

      // Min length validation
      if (rules.minLength && stringValue.length < rules.minLength) {
        return (
          rules.message ||
          `${String(name)} must be at least ${rules.minLength} characters`
        );
      }

      // Max length validation
      if (rules.maxLength && stringValue.length > rules.maxLength) {
        return (
          rules.message ||
          `${String(name)} must be no more than ${rules.maxLength} characters`
        );
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(stringValue)) {
        return rules.message || `${String(name)} has invalid format`;
      }

      // Custom validation
      if (rules.custom) {
        return rules.custom(value as T[keyof T]);
      }

      return undefined;
    },
    [validationRules]
  );

  // Validate all fields
  const validateForm = useCallback((): ValidationResult<T> => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(formState.values).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, formState.values[fieldName]);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });

    return { isValid, errors };
  }, [formState.values, validateField]);

  // Update field value
  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setFormState((prev) => ({
      ...prev,
      values: { ...prev.values, [name]: value },
      isDirty: true,
    }));
  }, []);

  // Update multiple values
  const setValues = useCallback((values: Partial<T>) => {
    setFormState((prev) => ({
      ...prev,
      values: { ...prev.values, ...values },
      isDirty: true,
    }));
  }, []);

  // Set field as touched
  const setTouched = useCallback((name: keyof T, touched = true) => {
    setFormState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  }, []);

  // Set error for field
  const setError = useCallback((name: keyof T, error: string | undefined) => {
    setFormState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      errors: {},
    }));
  }, []);

  // Handle field change with validation
  const handleChange = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setValue(name, value);

      // Validate field if it has been touched
      if (formState.touched[name]) {
        const error = validateField(name, value);
        setError(name, error);
      }
    },
    [formState.touched, setValue, validateField, setError]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched(name, true);
      const error = validateField(name, formState.values[name]);
      setError(name, error);
    },
    [formState.values, setTouched, validateField, setError]
  );

  // Set submitting state
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState((prev) => ({
      ...prev,
      isSubmitting,
    }));
  }, []);

  // Reset form
  const reset = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
    });
  }, [initialValues]);

  // Submit form with validation
  const submit = useCallback(
    async (onSubmit: (values: T) => Promise<void> | void) => {
      const validation = validateForm();

      setFormState((prev) => ({
        ...prev,
        errors: validation.errors,
        isValid: validation.isValid,
        isSubmitting: true,
      }));

      if (!validation.isValid) {
        setSubmitting(false);
        return false;
      }

      try {
        await onSubmit(formState.values);
        return true;
      } catch (error) {
        console.error("Form submission error:", error);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [validateForm, formState.values, setSubmitting]
  );

  return {
    // State
    ...formState,

    // Actions
    setValue,
    setValues,
    setTouched,
    setError,
    clearErrors,
    setSubmitting,
    reset,

    // Handlers
    handleChange,
    handleBlur,
    submit,

    // Validation
    validateField,
    validateForm,
  };
}

/**
 * Common validation rules for reuse
 */
export const commonValidationRules = {
  email: {
    required: true,
    pattern: VALIDATION_RULES.email.pattern,
    message: "Please enter a valid email address",
  },
  password: {
    required: true,
    minLength: VALIDATION_RULES.password.minLength,
    message: "Password must be at least 6 characters long",
  },
  username: {
    required: true,
    minLength: VALIDATION_RULES.username.minLength,
    maxLength: VALIDATION_RULES.username.maxLength,
    pattern: VALIDATION_RULES.username.pattern,
    message:
      "Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores",
  },
  displayName: {
    required: true,
    minLength: 3,
    maxLength: 30,
    message: "Display name must be 3-30 characters",
  },
  bio: {
    maxLength: 500,
    message: "Bio must not exceed 500 characters",
  },
} as const;
