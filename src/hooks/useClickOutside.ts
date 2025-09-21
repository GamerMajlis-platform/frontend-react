import { useEffect, useRef, type RefObject } from "react";

/**
 * Custom hook that triggers a callback when clicking outside the referenced element
 * @param callback - Function to call when clicking outside
 * @returns ref - Ref to attach to the element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClick);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [callback]);

  return ref;
}

/**
 * Alternative version that accepts an external ref
 * @param ref - External ref to the element
 * @param callback - Function to call when clicking outside
 */
export function useClickOutsideRef<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  callback: () => void
): void {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, callback]);
}
