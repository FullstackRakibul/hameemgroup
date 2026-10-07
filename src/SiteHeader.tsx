import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import SmartLink from "./components/SmartLink";
import { BUSINESS_PAGES, PLAIN_LINKS } from "./data/navigation";
import type { MegaMenu, MenuKey } from "./data/navigation";

/* ── Fixed site header: logo, desktop nav + mega menus, mobile menu ──
   Matches https://hameemgroup-demo.reliabuilds.com (measured values in
   screenshots/demo-measurements.json). One breakpoint (1024px) swaps the
   desktop nav for the Menu button. Links are router links: choosing one
   closes the menu, and the shell scrolls to the page top or the #section. */

const MENU_KEYS: MenuKey[] = ["company", "businesses", "products"];
const DESKTOP_QUERY = "(min-width: 1024px)";
const label = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      aria-hidden="true"
      className={`nav-chevron ${open ? "is-open" : ""}`}
    >
      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

// Logo in a pill: frosted glass over the hero, a quiet mist chip once the
// header turns solid, with a lift and a light sheen on hover.
function Logo() {
  return (
    <Link to="/" className="site-logo flex shrink-0 items-center" aria-label="Ha-Meem Group — home">
      <span className="logo-pill">
        <img
          src="/group-logo.png"
          alt=""
          className="h-10 w-auto rounded-sm object-contain"
          draggable={false}
        />
      </span>
    </Link>
  );
}

export default function SiteHeader({ menus }: { menus: Record<MenuKey, MegaMenu> }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Partial<Record<MenuKey, HTMLButtonElement | null>>>({});
  const lastPointer = useRef("mouse");

  const solid = scrolled || activeMenu !== null || mobileOpen;

  // Scroll state; runs once on mount so a reload mid-page starts solid.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation (link, Back, Forward) closes both menus.
  useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
  }, [location.key]);

  // Crossing the breakpoint closes whichever menu belongs to the other layout.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
      else setActiveMenu(null);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Escape closes the mega menu and returns focus to its trigger.
  useEffect(() => {
    if (!activeMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      triggerRefs.current[activeMenu]?.focus();
      setActiveMenu(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeMenu]);

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
    setActiveMenu((cur) => (toggles && cur === key ? null : key));
  };

  const closeMenus = () => {
    setActiveMenu(null);
    setMobileOpen(false);
  };

  const menu = activeMenu ? menus[activeMenu] : null;
  const gridMenu = menu?.gridCols === 3;

  // The mobile menu lists the business pages once, under Businesses.
  const businessHrefs = new Set(BUSINESS_PAGES.map((p) => p.href));
  const mobileGroups = [
    { key: "company", links: menus.company.links },
    { key: "businesses", links: BUSINESS_PAGES },
    { key: "products", links: menus.products.links.filter((l) => !businessHrefs.has(l.href)) },
  ];

  return (
    <div
      ref={wrapperRef}
      className={`header-wrapper ${solid ? "is-solid" : ""} ${activeMenu ? "is-mega-open" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}
      onMouseLeave={() => setActiveMenu(null)}
      onBlur={(e) => {
        if (activeMenu && !e.currentTarget.contains(e.relatedTarget as Node | null)) setActiveMenu(null);
      }}
    >
      <div className="header-bar">
        <header className="site-header wrap flex items-center gap-8">
          <Logo />

          <nav aria-label="Main" className="ml-auto hidden lg:flex items-center gap-9">
            {MENU_KEYS.map((key) => (
              <button
                key={key}
                ref={(el) => {
                  triggerRefs.current[key] = el;
                }}
                type="button"
                className={`nav-link flex items-center gap-1.5 ${activeMenu === key ? "is-active" : ""}`}
                aria-expanded={activeMenu === key}
                aria-controls={`mega-${key}`}
                aria-haspopup="true"
                onPointerDown={(e) => (lastPointer.current = e.pointerType)}
                onPointerEnter={(e) => {
                  lastPointer.current = e.pointerType;
                  if (e.pointerType === "mouse") setActiveMenu(key);
                }}
                onClick={(e) => onTriggerClick(key, e)}
              >
                {label(key)}
                <Chevron open={activeMenu === key} />
              </button>
            ))}
            {PLAIN_LINKS.map((link) => (
              <SmartLink
                key={link.href}
                href={link.href}
                className="nav-link"
                onPointerEnter={() => setActiveMenu(null)}
                onFocus={() => setActiveMenu(null)}
              >
                {link.title}
              </SmartLink>
            ))}
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
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
                <path d="M0 1h22M0 7h22M0 13h14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
          </button>
        </header>
      </div>

      {/* Mega menu: one white sheet with the header */}
      {activeMenu && menu && (
        <div
          key={activeMenu}
          id={`mega-${activeMenu}`}
          role="region"
          aria-label={`${label(activeMenu)} menu`}
          className="mega-panel hidden lg:block"
        >
          <div className="wrap grid gap-10 py-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="nav-label text-(--red)">{menu.eyebrow}</p>
              <div className="mt-3 max-w-[16ch] text-balance font-['Fira_Sans_Condensed'] text-[24px] font-bold leading-[1.375] tracking-[-0.01em] text-(--ink)">
                {menu.headline}
              </div>
              {menu.cta && (
                <SmartLink href={menu.cta.href} className="group mt-4 inline-block" onClick={closeMenus}>
                  <span className="text-[0.85rem] font-medium text-(--mute) transition-colors group-hover:text-(--red)">
                    {menu.cta.text} →
                  </span>
                </SmartLink>
              )}
            </div>
            <ul
              className={`grid content-start gap-x-10 sm:grid-cols-2 lg:col-span-9 ${gridMenu ? "gap-y-1 lg:grid-cols-3" : ""}`}
            >
              {menu.links.map((link) => (
                <li key={link.title}>
                  {gridMenu ? (
                    <SmartLink
                      href={link.href}
                      onClick={closeMenus}
                      className="mega-row group flex h-full flex-col justify-center border-b border-(--hair) py-3.5"
                    >
                      <span className="font-['Fira_Sans_Condensed'] text-[1.15rem] font-bold leading-tight text-(--ink) transition-colors group-hover:text-(--red) group-aria-[current=page]:text-(--red)">
                        {link.title}
                      </span>
                      <span className="mt-0.5 text-[0.78rem] leading-relaxed text-(--mute)">{link.sub}</span>
                    </SmartLink>
                  ) : (
                    <SmartLink
                      href={link.href}
                      onClick={closeMenus}
                      className="mega-row group flex items-center justify-between gap-6 border-b border-(--hair) py-4"
                    >
                      <span>
                        <span className="block text-[0.98rem] font-semibold leading-relaxed text-(--ink) transition-colors group-hover:text-(--red) group-aria-[current=page]:text-(--red)">
                          {link.title}
                        </span>
                        <span className="mt-0.5 block text-[0.78rem] leading-relaxed text-(--mute)">{link.sub}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-(--mute) transition-all duration-300 group-hover:translate-x-1 group-hover:text-(--red)"
                      >
                        →
                      </span>
                    </SmartLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Mobile and tablet menu */}
      {mobileOpen && (
        <div id="mobile-menu" ref={mobilePanelRef} className="mobile-menu lg:hidden">
          <nav aria-label="Mobile" className="wrap pt-6 pb-16">
            {[...PLAIN_LINKS, { title: "Businesses", href: "/#businesses" }].map((link) => (
              <SmartLink
                key={link.href}
                href={link.href}
                onClick={closeMenus}
                className="flex items-center justify-between border-b border-(--hair) py-4"
              >
                <span className="font-['Fira_Sans_Condensed'] text-[1.9rem] font-bold leading-[1.05] text-(--ink)">
                  {link.title}
                </span>
                <span aria-hidden="true" className="text-xl text-(--mute)">
                  →
                </span>
              </SmartLink>
            ))}
            {mobileGroups.map((group) => (
              <div key={group.key} className="mt-8">
                <p className="nav-label text-(--mute)">{label(group.key)}</p>
                <div className="mt-1">
                  {group.links.map((link) => (
                    <SmartLink
                      key={link.title}
                      href={link.href}
                      onClick={closeMenus}
                      className="group flex items-center justify-between border-b border-(--hair) py-3"
                    >
                      <span className="text-[1.1rem] font-medium leading-[1.6] text-(--ink) group-aria-[current=page]:text-(--red)">
                        {link.title}
                      </span>
                      <span aria-hidden="true" className="text-base text-(--mute)">
                        →
                      </span>
                    </SmartLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
