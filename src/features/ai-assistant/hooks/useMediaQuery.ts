import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const MOBILE_QUERY = "(max-width: 639px)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);
export const usePrefersReducedMotion = () => useMediaQuery(REDUCED_MOTION_QUERY);
