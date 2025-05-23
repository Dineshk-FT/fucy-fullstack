import { useRef, useCallback } from 'react';

function useThrottle(callback, delay) {
  const lastCall = useRef(0);

  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        callback(...args);
        lastCall.current = now;
      }
    },
    [callback, delay]
  );
}

export default useThrottle;
