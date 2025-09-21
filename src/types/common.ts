import type { ReactNode } from "react";

// Base component props that most components extend
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Common option type for dropdowns and selectors
export interface Option {
  value: string;
  label: string;
  labelKey?: string;
}

// Generic callback types
export type VoidCallback = () => void;
export type StringCallback = (value: string) => void;
export type NumberCallback = (value: number) => void;
export type BooleanCallback = (value: boolean) => void;

// Common size variants
export type Size = "sm" | "md" | "lg" | "xl";

// Common color variants
export type ColorVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "danger"
  | "success"
  | "warning";

// Direction types for RTL support
export type Direction = "ltr" | "rtl";

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}
