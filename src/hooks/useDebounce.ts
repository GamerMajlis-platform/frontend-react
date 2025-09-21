import { useState, useEffect, useRef, useCallback } from "react";
import { DELAYS } from "../config/constants";

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (defaults to search debounce)
 * @returns debouncedValue - The debounced value
 */
export function useDebounce<T>(
  value: T,
  delay: number = DELAYS.debounce.search
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook that debounces a callback function
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns debouncedCallback - The debounced function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
