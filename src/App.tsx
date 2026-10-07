import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Preloader from "./Preloader";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./components/SiteFooter";
import { AiAssistant } from "./features/ai-assistant";
import { megaMenuData } from "./data/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import MerchandisingPage from "./pages/MerchandisingPage";
import CustomersPage from "./pages/CustomersPage";
import ContactPage from "./pages/ContactPage";
import WovenPage from "./pages/WovenPage";
import DenimMillPage from "./pages/DenimMillPage";
import LaundryPage from "./pages/LaundryPage";
import SweaterPage from "./pages/SweaterPage";
import DesignStudioPage from "./pages/DesignStudioPage";
import EmbroideryPage from "./pages/EmbroideryPage";
import AncillaryPage from "./pages/AncillaryPage";
import NotFoundPage from "./pages/NotFoundPage";

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
   with focus on its h1. The first load is left to the browser. */
function RouteEffects() {
  const location = useLocation();
  const lastKey = useRef<string | null>(null);
  const lastPath = useRef(location.pathname);
  const currentKey = useRef(location.key);
  currentKey.current = location.key;

  useLayoutEffect(() => {
    // StrictMode runs this twice for one location; act once.
    if (lastKey.current === location.key) return;
    const firstLoad = lastKey.current === null;
    const samePage = !firstLoad && lastPath.current === location.pathname;
    lastKey.current = location.key;
    lastPath.current = location.pathname;
    const key = location.key;

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
        target.scrollIntoView({ behavior: samePage && !reducedMotion() ? "smooth" : "instant" });
        if (!firstLoad) {
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      };
      requestAnimationFrame(tryScroll);
      return;
    }

    if (firstLoad) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
  }, [location.key, location.hash, location.pathname]);

  return null;
}

/* ── Shell: preloader, header, page, footer, assistant ── */
function Shell() {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(() => !preloaderSeen());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // The preloader plays once per browser session, never on route changes.
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      try {
        sessionStorage.setItem(PRELOADER_KEY, "1");
      } catch {
        /* storage blocked: the preloader simply plays again next load */
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [loading]);

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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: reducedMotion() ? "instant" : "smooth" });

  return (
    <>
      {loading && <Preloader />}
      <RouteEffects />

      <StitchScrollbar progress={scrollProgress} />

      <button
        className={`back-to-top ${showBackToTop ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
        tabIndex={showBackToTop ? 0 : -1}
      >
        ↑
      </button>
      {!loading && <AiAssistant />}

      <div
        style={{
          opacity: loading ? 0 : 1,
          transition: "opacity 0.6s ease-in-out",
        }}
      >
        <SiteHeader menus={megaMenuData} />
        <main>
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="merchandising" element={<MerchandisingPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="businesses/woven" element={<WovenPage />} />
          <Route path="businesses/denim-mill" element={<DenimMillPage />} />
          <Route path="businesses/laundry" element={<LaundryPage />} />
          <Route path="businesses/sweater" element={<SweaterPage />} />
          <Route path="businesses/design-studio" element={<DesignStudioPage />} />
          <Route path="businesses/embroidery-printing-accessories" element={<EmbroideryPage />} />
          <Route path="businesses/ancillary" element={<AncillaryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
