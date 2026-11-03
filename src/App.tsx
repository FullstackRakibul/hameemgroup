import { useState, useEffect, useLayoutEffect, useRef, useCallback, Suspense } from "react";
import { HashRouter, Outlet, useLocation, useRoutes } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import Preloader from "./Preloader";
import { whenHeroReady } from "./lib/heroReady";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./components/SiteFooter";
import GarmentBackdrop from "./components/GarmentBackdrop";
import useReveal from "./components/useReveal";
import SmoothScroll from "./components/SmoothScroll";
import { getLenis, scrollToTarget } from "./lib/scroll";
import { AiAssistant } from "./features/ai-assistant";
import { megaMenuData } from "./data/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import routes from "./router/routes";

gsap.registerPlugin(ScrollTrigger);

const PRELOADER_KEY = "hm-preloader-seen";

function preloaderSeen() {
  try {
    return sessionStorage.getItem(PRELOADER_KEY) === "1";
  } catch {
    return false;
  }
}

/* ── Stitch Scrollbar ── */
function StitchScrollbar({ progress }: { progress: number }) {
  const totalLength = 800;
  const offset = totalLength - totalLength * progress;
  return (
    <div className="stitch-track hidden md:block">
      <svg
        width="3"
        height="100%"
        viewBox="0 0 3 800"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <line x1="1.5" y1="0" x2="1.5" y2="800" className="stitch-bg" fill="none" strokeWidth="2" />
        <line
          x1="1.5"
          y1="0"
          x2="1.5"
          y2="800"
          className="stitch-progress"
          fill="none"
          strokeWidth="2"
          style={{ strokeDashoffset: offset }}
        />
      </svg>
    </div>
  );
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* On every navigation: a #section scrolls into view once it has rendered
   (smoothly within the same page); a new page starts at the top, instantly,
   with focus on its h1. The first load is left to the browser. Waits until
   the page for this location has rendered (ready). */
function RouteEffects({ ready }: { ready: boolean }) {
  const location = useLocation();
  const lastKey = useRef<string | null>(null);
  const lastPath = useRef(location.pathname);
  // A URL typed or opened directly (not a link click) arrives with the same
  // key, "default", as the one before it, so the key alone can't tell two
  // locations apart: the path and hash go into it too.
  const locationKey = `${location.key}:${location.pathname}${location.hash}`;
  const currentKey = useRef(locationKey);
  currentKey.current = locationKey;

  useLayoutEffect(() => {
    // StrictMode runs this twice for one location; act once.
    if (!ready || lastKey.current === locationKey) return;
    const firstLoad = lastKey.current === null;
    const samePage = !firstLoad && lastPath.current === location.pathname;
    lastKey.current = locationKey;
    lastPath.current = location.pathname;
    const key = locationKey;

    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      let frames = 0;
      const tryScroll = () => {
        if (currentKey.current !== key) return;
        const target = document.getElementById(id);
        if (!target) {
          if (frames++ < 60) requestAnimationFrame(tryScroll);
          return;
        }
        scrollToTarget(target, { immediate: !samePage || reducedMotion() });
        if (!firstLoad) {
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      };
      requestAnimationFrame(tryScroll);
      return;
    }

    if (firstLoad) return;
    scrollToTarget(0, { offset: 0, immediate: true });
    document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
  }, [ready, locationKey, location.hash, location.pathname]);

  return null;
}

/* Sits beside the lazy page inside its Suspense boundary, so its layout effect
   runs only once that page's DOM exists, and reports the path it rendered.
   Link clicks keep the old page up until the next chunk arrives, but a
   hashchange or back/forward to a page not yet loaded renders the fallback
   first; this is what tells the Shell when the page has caught up. */
function PageReady({ onReady }: { onReady: (pathname: string) => void }) {
  const { pathname } = useLocation();
  useLayoutEffect(() => onReady(pathname), [pathname, onReady]);
  return null;
}

/* ── Shell: preloader, header, page, footer, assistant ── */
function Shell() {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(() => !preloaderSeen());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [renderedPath, setRenderedPath] = useState<string | null>(null);
  const pageReady = renderedPath === pathname;

  // The preloader plays once per browser session, never on route changes. It
  // ends when its own timeline does (onDone) and the fonts are ready, whichever
  // is later, so the page appears already set; a 5s safety net ends it anyway.
  const finishedRef = useRef(false);
  const finishPreloader = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setLoading(false);
    try {
      sessionStorage.setItem(PRELOADER_KEY, "1");
    } catch {
      /* storage blocked: the preloader simply plays again next load */
    }
  }, []);


  useEffect(() => {
    if (!loading) return;
    const safety = setTimeout(finishPreloader, 5500);
    // Hold the page still under the overlay
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    getLenis()?.stop();
    return () => {
      clearTimeout(safety);
      root.style.overflow = prevOverflow;
      getLenis()?.start();
    };
  }, [loading, finishPreloader]);

  
  // onDone from the timeline, held until the fonts have loaded and, on the
  // home page, until the hero's first slide (a video) can paint. The 5.5s net
  // above still applies, so a slow or missing file only delays the reveal: it
  // can never strand the visitor on the overlay.
  const onPreloaderDone = useCallback(() => {
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const hero = pathname === "/" ? whenHeroReady() : Promise.resolve();
    Promise.all([fonts, hero]).then(finishPreloader).catch(finishPreloader);
  }, [finishPreloader, pathname]);

  // Scroll handler: back-to-top + scroll progress (header state lives in SiteHeader).
  // Re-measured on route change, since the new page has a different height.
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? window.scrollY / docHeight : 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Page entrance: on first load (once the preloader lifts) and on every route
  // change, the content under the header fades up. Nothing is left on the
  // element afterwards, so it creates no containing block once it lands.
  const pageRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (loading || !pageReady || reducedMotion() || !pageRef.current?.animate) return;
    const anim = pageRef.current.animate(
      [
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 450, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
    );
    return () => anim.cancel();
  }, [pathname, loading, pageReady]);

  useReveal(pathname, !loading && pageReady);

  const scrollToTop = () => scrollToTarget(0, { offset: 0, immediate: reducedMotion() });

  return (
    <>
      {loading && <Preloader onDone={onPreloaderDone} />}
      <SmoothScroll />
      <RouteEffects ready={pageReady} />

      <StitchScrollbar progress={scrollProgress} />

      {/* Back to top: the upper slot of the floating dock, right above the
          assistant's launcher. A thin navy ring shows how far down the page
          is. It steps aside while the assistant's greeting or panel is up, or
          a header menu is open, so the dock is never three items tall. */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        aria-hidden={!showBackToTop || undefined}
        tabIndex={showBackToTop ? 0 : -1}
        className={`group fixed right-(--dock-gap) bottom-[calc(var(--dock-gap)+var(--dock-size)+12px+env(safe-area-inset-bottom))] z-1000 grid size-(--dock-size) place-items-center rounded-full transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-opacity [body:has(.hm-assist-teaser,.hm-assist-panel,.is-mobile-open,.is-mega-open)_&]:pointer-events-none [body:has(.hm-assist-teaser,.hm-assist-panel,.is-mobile-open,.is-mega-open)_&]:opacity-0 focus-visible:outline-none ${
          showBackToTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0 motion-reduce:translate-y-0"
        }`}
      >
        <span className="grid size-11 place-items-center rounded-full border border-(--hair) bg-white text-(--ink) shadow-[0_4px_14px_-6px_rgba(17,20,24,0.25)] transition-transform duration-200 group-hover:-translate-y-0.5 group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-(--navy) motion-reduce:transition-none">
          <ArrowUp size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <svg aria-hidden="true" viewBox="0 0 52 52" className="pointer-events-none absolute size-13 -rotate-90">
          <circle
            cx="26"
            cy="26"
            r="25"
            fill="none"
            stroke="var(--navy)"
            strokeWidth="1.5"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - scrollProgress}
          />
        </svg>
      </button>
      {!loading && <AiAssistant />}

      <div
        data-loading={loading || undefined}
        style={{
          opacity: loading ? 0 : 1,
          transition: "opacity 0.45s ease-out",
        }}
      >
        <SiteHeader menus={megaMenuData} />
        <div ref={pageRef} className="page">
          <main>
            <GarmentBackdrop />
            <Suspense fallback={null}>
              <Outlet />
              <PageReady onReady={setRenderedPath} />
            </Suspense>
          </main>
          <SiteFooter />
        </div>
      </div>
    </>
  );
}

// Every page renders inside the Shell layout; built once, outside render.
const appRoutes = [{ element: <Shell />, children: routes }];

function AppRoutes() {
  return useRoutes(appRoutes);
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
