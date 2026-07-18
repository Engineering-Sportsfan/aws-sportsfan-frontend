import { useEffect, useRef, useState } from "react";

/**
 * Delays updating a value until the user has stopped typing.
 *
 * @param value - The input value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 *
 * @example
 * const debouncedQuery = useDebounce(searchQuery, 500);
 * useEffect(() => { fetchResults(debouncedQuery); }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timerRef.current);
  }, [value, delay]);

  return debouncedValue;
}
