import { useEffect } from "react";

/* Pages whose opening band is light. The site header is transparent with white
   text until the page scrolls (see PageHero), which only reads over a dark
   hero; this flips it to ink for the pages that open light. Set on <html> so
   the header, which lives outside the routed page, can style itself from it. */
export default function useLightHero() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.lightHero = "";
    return () => {
      delete root.dataset.lightHero;
    };
  }, []);
}
