import { useState, useEffect, useCallback, useRef } from "react";
import { STORAGE_KEYS } from "../config/constants";

/**
 * Custom hook for managing localStorage with JSON serialization
 * @param key - The localStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: keyof typeof STORAGE_KEYS,
  defaultValue: T
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
  // Use ref to store defaultValue to prevent recreation
  const defaultValueRef = useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  const storageKey = STORAGE_KEYS[key];

  // Initialize state with value from localStorage or default
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") {
        return defaultValueRef.current;
      }

      const item = window.localStorage.getItem(storageKey);
      if (item === null) {
        return defaultValueRef.current;
      }

      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${storageKey}":`, error);
      return defaultValueRef.current;
    }
  });

  // Update localStorage when storedValue changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${storageKey}":`, error);
    }
  }, [storageKey, storedValue]);

  // Set value function with support for functional updates
  const setValue = useCallback((value: T | ((prevValue: T) => T)) => {
    setStoredValue((prevValue) => {
      const newValue =
        typeof value === "function"
          ? (value as (prevValue: T) => T)(prevValue)
          : value;
      return newValue;
    });
  }, []);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValueRef.current);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${storageKey}":`, error);
    }
  }, [storageKey]);

  return [storedValue, setValue, removeValue];
}

// Export type for use in other components
export type UseLocalStorageReturn<T> = ReturnType<typeof useLocalStorage<T>>;
