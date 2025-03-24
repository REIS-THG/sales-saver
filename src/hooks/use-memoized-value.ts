
import { useRef, useEffect, useState } from 'react';

/**
 * Custom hook that memoizes a value and only triggers rerenders when
 * the value changes based on the provided comparison function.
 * 
 * @param value The value to memoize
 * @param compare Optional comparison function, defaults to strict equality
 * @returns The memoized value
 */
export function useMemoizedValue<T>(
  value: T, 
  compare: (prev: T, current: T) => boolean = (a, b) => a === b
): T {
  const [memoizedValue, setMemoizedValue] = useState<T>(value);
  const prevValueRef = useRef<T>(value);

  useEffect(() => {
    if (!compare(prevValueRef.current, value)) {
      setMemoizedValue(value);
      prevValueRef.current = value;
    }
  }, [value, compare]);

  return memoizedValue;
}
