import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SmartLink from "./components/SmartLink";
import { BUSINESS_PAGES, PLAIN_LINKS, isCurrentPage } from "./data/navigation";
import type { MegaMenu, MenuKey } from "./data/navigation";

/* ── Fixed site header: logo, desktop nav + mega menus, mobile menu ──
   Matches https://hameemgroup-demo.reliabuilds.com (measured values in
   screenshots/demo-measurements.json). One breakpoint (1024px) swaps the
   desktop nav for the Menu button. Links are router links: choosing one
   closes the menu, and the shell scrolls to the page top or the #section.

   The desktop mega menu is one sheet that stays mounted and morphs: a
   ResizeObserver measures its content into --mega-h, so opening, closing and
   switching menus are all one height transition on the same surface. */

const MENU_KEYS: MenuKey[] = ["company", "businesses", "products"];
const DESKTOP_QUERY = "(min-width: 1024px)";
const OPEN_DELAY = 90;
const CLOSE_DELAY = 180;
const label = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

// Formal lockup: the round mark and the name, in currentColor like the nav
function Logo() {
  return (
    <Link to="/" className="site-logo flex shrink-0 items-center gap-3" aria-label="Ha-Meem Group — home">
      <img
        src="/group-logo-circle.png"
        alt=""
        className="size-10 rounded-full ring-1 ring-black/5 lg:size-11"
        draggable={false}
      />
      <span className="hidden font-['Fira_Sans_Condensed'] text-[17px] font-bold uppercase leading-none tracking-[0.06em] sm:block">
        Ha-Meem Group
      </span>
    </Link>
  );
}

function RowArrow({ className = "" }: { className?: string }) {
  return (
    <ArrowRight
      size={16}
      strokeWidth={1.75}
      aria-hidden="true"
      className={`shrink-0 text-(--mute) transition-[translate,color] duration-300 ${className}`}
    />
  );
}

export default function SiteHeader({ menus }: { menus: Record<MenuKey, MegaMenu> }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  // The menu whose content the sheet shows: it outlives activeMenu so the
  // content stays put while the sheet collapses.
  const [shownMenu, setShownMenu] = useState<MenuKey | null>(null);
  const [dir, setDir] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileShown, setMobileShown] = useState(false);
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Partial<Record<MenuKey, HTMLButtonElement | null>>>({});
  const lastPointer = useRef("mouse");
  const hoverTimer = useRef<number | null>(null);
  // Set while the pending timer is a close, so re-entering cancels only that
  const closing = useRef(false);
  // Mirrors shownMenu so openMenu can read it without re-creating the callback.
  const shownMenuRef = useRef<MenuKey | null>(null);

  const solid = scrolled || activeMenu !== null || mobileOpen;

  const clearHoverTimer = () => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    closing.current = false;
  };

  // Opening a menu records the direction of travel through the nav, so the
  // incoming content slides in from the side it came from.
  const openMenu = useCallback((key: MenuKey) => {
    clearHoverTimer();
    const prev = shownMenuRef.current;
    if (prev && prev !== key) setDir(MENU_KEYS.indexOf(key) > MENU_KEYS.indexOf(prev) ? 1 : -1);
    shownMenuRef.current = key;
    setShownMenu(key);
    setActiveMenu(key);
  }, []);

  const closeMenu = useCallback(() => {
    clearHoverTimer();
    setActiveMenu(null);
  }, []);

  // Scroll state; runs once on mount so a reload mid-page starts solid.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => clearHoverTimer, []);

  // Any navigation (link, Back, Forward) closes both menus.
  useEffect(() => {
    closeMenu();
    setMobileOpen(false);
  }, [location.key, closeMenu]);

  // Crossing the breakpoint closes whichever menu belongs to the other layout.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
      else closeMenu();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [closeMenu]);

  // The sheet's height follows its content, so a menu swap animates between sizes.
  useEffect(() => {
    const inner = innerRef.current;
    const sheet = sheetRef.current;
    if (!inner || !sheet) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      sheet.style.setProperty("--mega-h", `${Math.round(h)}px`);
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  // The observer fires after paint, so a first open would animate from 0 to a
  // stale height. Measure synchronously whenever the shown menu changes.
  useLayoutEffect(() => {
    const inner = innerRef.current;
    const sheet = sheetRef.current;
    if (!inner || !sheet || !shownMenu) return;
    sheet.style.setProperty("--mega-h", `${Math.round(inner.offsetHeight)}px`);
  }, [shownMenu]);

  // The sliding dashed indicator tracks the open trigger inside the nav.
  useEffect(() => {
    if (!activeMenu) return;
    const measure = () => {
      const el = triggerRefs.current[activeMenu];
      if (el) setIndicator({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeMenu]);

  // Escape closes the mega menu and returns focus to its trigger.
  useEffect(() => {
    if (!activeMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      triggerRefs.current[activeMenu]?.focus();
      closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeMenu, closeMenu]);

  // The mobile panel stays mounted for its close animation.
  useEffect(() => {
    if (mobileOpen) setMobileShown(true);
  }, [mobileOpen]);

  // Mobile menu: scroll lock, focus in, Escape, and a Tab trap over header + panel.
  useEffect(() => {
    if (!mobileOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    mobilePanelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !wrapperRef.current) return;
      const focusable = [...wrapperRef.current.querySelectorAll<HTMLElement>("a[href], button")].filter(
        (el) => el.offsetParent !== null,
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const onTriggerClick = (key: MenuKey, e: ReactMouseEvent) => {
    // Keyboard (detail 0) and touch toggle; a mouse click on a hovered item keeps it open.
    const toggles = e.detail === 0 || lastPointer.current !== "mouse";
    if (toggles && activeMenu === key) closeMenu();
    else openMenu(key);
  };

  // Hover intent: a short delay before the first open, a longer grace before
  // closing once the pointer leaves the header and sheet. Switching between
  // triggers while open is immediate.
  const onTriggerHover = (key: MenuKey) => {
    clearHoverTimer();
    if (activeMenu) {
      openMenu(key);
      return;
    }
    hoverTimer.current = window.setTimeout(() => {
      hoverTimer.current = null;
      openMenu(key);
    }, OPEN_DELAY);
  };

  const onAreaLeave = () => {
    clearHoverTimer();
    closing.current = true;
    hoverTimer.current = window.setTimeout(() => {
      hoverTimer.current = null;
      closing.current = false;
      setActiveMenu(null);
    }, CLOSE_DELAY);
  };

  const closeMenus = () => {
    closeMenu();
    setMobileOpen(false);
  };

  const menu = shownMenu ? menus[shownMenu] : null;

  // One header item carries the current-route stitch: the plain link for this
  // page, or else the first menu that lists it (Products repeats some business pages).
  const onPlainLink = PLAIN_LINKS.some((l) => isCurrentPage(l.href, location.pathname));
  const currentMenu = onPlainLink
    ? null
    : MENU_KEYS.find((key) => menus[key].links.some((l) => isCurrentPage(l.href, location.pathname)));
  const gridMenu = menu?.gridCols === 3;

  // The mobile menu lists the business pages once, under Businesses.
  const businessHrefs = new Set(BUSINESS_PAGES.map((p) => p.href));
  const mobileGroups = [
    { key: "company", links: menus.company.links },
    { key: "businesses", links: BUSINESS_PAGES },
    { key: "products", links: menus.products.links.filter((l) => !businessHrefs.has(l.href)) },
  ];

  // Rows stagger in when the sheet opens; the delay is capped so long menus
  // finish together.
  const rowDelay = (i: number) => `${120 + Math.min(i * 30, 300)}ms`;

  return (
    <>
      {/* The page dims behind the open sheet (desktop only) */}
      <div
        className="mega-scrim hidden lg:block"
        data-open={activeMenu ? "true" : "false"}
        aria-hidden="true"
        onClick={closeMenu}
      />

      <div
        ref={wrapperRef}
        className={`header-wrapper ${solid ? "is-solid" : ""} ${activeMenu ? "is-mega-open" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}
        onMouseLeave={onAreaLeave}
        onMouseEnter={() => {
          // mouseenter fires after a trigger's pointerenter: keep its open timer
          if (closing.current) clearHoverTimer();
        }}
        onBlur={(e) => {
          // Focus leaving the header closes the menu, but must not cancel a
          // pending hover timer: the pointer may still be inside.
          if (activeMenu && !e.currentTarget.contains(e.relatedTarget as Node | null)) setActiveMenu(null);
        }}
      >
        <div className="header-bar">
          <header className="site-header wrap flex items-center gap-8">
            <Logo />

            <nav ref={navRef} aria-label="Main" className="nav-rail ml-auto hidden lg:flex items-center gap-9">
              {MENU_KEYS.map((key) => (
                <button
                  key={key}
                  ref={(el) => {
                    triggerRefs.current[key] = el;
                  }}
                  type="button"
                  className={`nav-link is-mega-trigger flex items-center gap-1.5 ${activeMenu === key ? "is-active" : ""} ${
                    currentMenu === key ? "is-current" : ""
                  }`}
                  aria-expanded={activeMenu === key}
                  aria-controls="mega-sheet"
                  aria-haspopup="true"
                  onPointerDown={(e) => (lastPointer.current = e.pointerType)}
                  onPointerEnter={(e) => {
                    lastPointer.current = e.pointerType;
                    if (e.pointerType === "mouse") onTriggerHover(key);
                  }}
                  onFocus={() => {
                    if (activeMenu && activeMenu !== key) openMenu(key);
                  }}
                  onClick={(e) => onTriggerClick(key, e)}
                >
                  <span className="nav-text">{label(key)}</span>
                  <ChevronDown
                    size={14}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className={`nav-chevron ${activeMenu === key ? "is-open" : ""}`}
                  />
                </button>
              ))}
              {PLAIN_LINKS.map((link) => (
                <SmartLink
                  key={link.href}
                  href={link.href}
                  className="nav-link"
                  onPointerEnter={closeMenu}
                  onFocus={closeMenu}
                >
                  <span className="nav-text">{link.title}</span>
                </SmartLink>
              ))}
              {/* The sliding stitch under the open trigger */}
              <span
                className="nav-indicator"
                aria-hidden="true"
                data-open={activeMenu ? "true" : "false"}
                style={
                  indicator
                    ? { transform: `translateX(${indicator.x}px)`, width: `${indicator.w}px` }
                    : undefined
                }
              />
            </nav>

            <button
              ref={menuButtonRef}
              type="button"
              className="menu-btn ml-auto flex lg:hidden items-center gap-3 min-h-11 min-w-11 justify-end"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="nav-label">{mobileOpen ? "Close" : "Menu"}</span>
              <span className="burger" data-open={mobileOpen ? "true" : "false"} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </header>
        </div>

        {/* Mega menu: one white sheet that stays mounted and morphs with the header */}
        <div
          id="mega-sheet"
          ref={sheetRef}
          role="region"
          aria-label={shownMenu ? `${label(shownMenu)} menu` : "Menu"}
          className="mega-sheet hidden lg:block"
          data-open={activeMenu ? "true" : "false"}
          aria-hidden={!activeMenu}
          inert={!activeMenu || undefined}
          onTransitionEnd={(e) => {
            if (e.target === e.currentTarget && e.propertyName === "height" && !activeMenu) {
              shownMenuRef.current = null;
              setShownMenu(null);
            }
          }}
        >
          <div ref={innerRef} className="mega-inner" data-lenis-prevent>
            {menu && shownMenu && (
              <div
                key={shownMenu}
                className="mega-content wrap grid gap-10 py-10 lg:grid-cols-12"
                style={{ "--dir": dir } as CSSProperties}
                data-switch={activeMenu ? "true" : "false"}
              >
                <div className="mega-aside lg:col-span-3">
                  <p className="nav-label text-(--navy)">{menu.eyebrow}</p>
                  <div className="mt-3 max-w-[16ch] text-balance font-['Fira_Sans_Condensed'] text-[24px] font-bold leading-[1.375] tracking-[-0.01em] text-(--ink)">
                    {menu.headline}
                  </div>
                  {menu.cta && (
                    <SmartLink href={menu.cta.href} className="group mt-4 inline-flex items-center gap-1.5" onClick={closeMenus}>
                      <span className="text-[0.85rem] font-medium text-(--mute) transition-colors group-hover:text-(--navy)">
                        {menu.cta.text}
                      </span>
                      <RowArrow className="group-hover:translate-x-1 group-hover:text-(--navy) group-focus-visible:translate-x-1 group-focus-visible:text-(--navy)" />
                    </SmartLink>
                  )}
                </div>
                <ul
                  className={`grid content-start gap-x-10 sm:grid-cols-2 lg:col-span-9 ${gridMenu ? "gap-y-1 lg:grid-cols-3" : ""}`}
                >
                  {menu.links.map((link, i) => (
                    <li key={link.title} className="mega-item" style={{ animationDelay: rowDelay(i) }}>
                      {gridMenu ? (
                        <SmartLink
                          href={link.href}
                          onClick={closeMenus}
                          className="mega-row row-stitch group flex h-full flex-col justify-center border-b border-(--hair) py-3.5"
                        >
                          <span className="font-['Fira_Sans_Condensed'] text-[1.15rem] font-bold leading-tight text-(--ink) transition-colors group-hover:text-(--navy) group-focus-visible:text-(--navy) group-aria-[current=page]:text-(--navy)">
                            {link.title}
                          </span>
                          <span className="mt-0.5 text-[0.78rem] leading-relaxed text-(--mute)">{link.sub}</span>
                        </SmartLink>
                      ) : (
                        <SmartLink
                          href={link.href}
                          onClick={closeMenus}
                          className="mega-row row-stitch group flex items-center justify-between gap-6 border-b border-(--hair) py-4"
                        >
                          <span>
                            <span className="block text-[0.98rem] font-semibold leading-relaxed text-(--ink) transition-colors group-hover:text-(--navy) group-focus-visible:text-(--navy) group-aria-[current=page]:text-(--navy)">
                              {link.title}
                            </span>
                            <span className="mt-0.5 block text-[0.78rem] leading-relaxed text-(--mute)">
                              {link.sub}
                            </span>
                          </span>
                          <RowArrow className="group-hover:translate-x-1 group-hover:text-(--navy) group-focus-visible:translate-x-1 group-focus-visible:text-(--navy)" />
                        </SmartLink>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Mobile and tablet menu: stays mounted while it animates out */}
        {mobileShown && (
          <div
            id="mobile-menu"
            ref={mobilePanelRef}
            data-lenis-prevent
            data-open={mobileOpen ? "true" : "false"}
            className="mobile-menu lg:hidden"
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget && !mobileOpen) setMobileShown(false);
            }}
          >
            <nav aria-label="Mobile" className="wrap pt-6 pb-16">
              {[...PLAIN_LINKS, { title: "Businesses", href: "/#businesses" }].map((link, i) => (
                <SmartLink
                  key={link.href}
                  href={link.href}
                  onClick={closeMenus}
                  style={{ animationDelay: `${Math.min(i * 35, 400)}ms` }}
                  className="mobile-item row-stitch-tap flex items-center justify-between border-b border-(--hair) py-4"
                >
                  <span className="font-['Fira_Sans_Condensed'] text-[1.9rem] font-bold leading-[1.05] text-(--ink)">
                    {link.title}
                  </span>
                  <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-(--mute)" />
                </SmartLink>
              ))}
              {mobileGroups.map((group, gi) => (
                <div
                  key={group.key}
                  className="mobile-item mt-8"
                  style={{ animationDelay: `${Math.min((PLAIN_LINKS.length + 1 + gi) * 35, 400)}ms` }}
                >
                  <p className="nav-label text-(--mute)">{label(group.key)}</p>
                  <div className="mt-1">
                    {group.links.map((link) => (
                      <SmartLink
                        key={link.title}
                        href={link.href}
                        onClick={closeMenus}
                        className="row-stitch-tap group flex items-center justify-between border-b border-(--hair) py-3"
                      >
                        <span className="text-[1.1rem] font-medium leading-[1.6] text-(--ink) group-aria-[current=page]:text-(--navy)">
                          {link.title}
                        </span>
                        <ArrowRight
                          size={16}
                          strokeWidth={1.75}
                          aria-hidden="true"
                          className="shrink-0 text-(--mute)"
                        />
                      </SmartLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </>
  );
}
