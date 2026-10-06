import { useEffect } from "react";
import type { RefObject } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** Keeps Tab / Shift+Tab inside `ref` while `active`. */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const root = ref.current;
      if (e.key !== "Tab" || !root) return;
      const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (!root.contains(current)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ref, active]);
}
