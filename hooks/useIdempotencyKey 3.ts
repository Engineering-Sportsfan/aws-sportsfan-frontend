import { useRef } from 'react';

/**
 * Custom hook to generate a stable idempotency key (UUID v4) on component mount.
 * The key remains stable across re-renders and is only refreshed if explicitly requested or on remount.
 */
export function useIdempotencyKey() {
  const keyRef = useRef<string | null>(null);

  if (!keyRef.current) {
    // Basic RFC4122 compliant UUID v4 generator
    keyRef.current = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const refreshKey = () => {
    keyRef.current = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return keyRef.current;
  };

  return { key: keyRef.current, refreshKey };
}
