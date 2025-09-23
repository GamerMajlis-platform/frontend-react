import { useRef } from "react";

/**
 * useDeepStable
 * Returns a stable reference for an object/value unless its deep JSON structure changes.
 * Avoids effect churn when parents recreate object literals each render.
 */
export function useDeepStable<T>(value: T): T {
  const ref = useRef<{ json: string; value: T } | null>(null);
  const json = JSON.stringify(value ?? null);
  if (!ref.current || ref.current.json !== json) {
    ref.current = { json, value };
  }
  return ref.current.value;
}

/**
 * Returns a stable empty object reference (frozen) for default cases.
 */
export const useStableEmptyObject = <T extends object>(): T => {
  const ref = useRef<T | null>(null);
  if (!ref.current) {
    ref.current = Object.freeze({}) as T;
  }
  return ref.current;
};
