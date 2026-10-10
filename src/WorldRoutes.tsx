import { useId, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FlagDefs from "./flags";
import type { FlagCode } from "./flags";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

const media = "/media/";

/* ── Projection ──
   world-solid.svg is a plain equirectangular (plate carrée) map. Its 1500
   units span 180°W → 180°E and y = 0 is 90°N, so one degree is 1500 / 360
   units on both axes. The bottom edge (y = 675) sits at 72°S, which crops
   Antarctica. Checked against Cape Agulhas, southern Sri Lanka, Tasmania and
   northern Greenland: all land within 0.2 units of the coastline. */
const VB_W = 1500;
const VB_H = 675;
const UNITS_PER_DEG = VB_W / 360;

function project(lon: number, lat: number) {
  return { x: (lon + 180) * UNITS_PER_DEG, y: (90 - lat) * UNITS_PER_DEG };
}

/* ── Data ── */
type Kind = "home" | "sourcing" | "market";
type FlagSide = "below" | "left" | "left-up" | "above-left" | "above-right" | "right";

type Place = {
  id: string;
  name: string;
  kind: Kind;
  lon: number;
  lat: number;
  flag: FlagCode;
  flagSide: FlagSide;
  // Below md the Asian markers crowd together; some flags move out of the way.
  compactFlagSide?: FlagSide;
  detail: string;
};

// Bangladesh stays first: entrance staggers follow DOM order.
const places: Place[] = [
  { id: "bd", name: "Bangladesh (Dhaka)", kind: "home", lon: 90.41, lat: 23.81, flag: "bd", flagSide: "below", detail: "Head office · 26 factories" },
  { id: "us", name: "United States", kind: "market", lon: -98.5, lat: 39.5, flag: "us", flagSide: "left", detail: "Export market · ~95% of exports" },
  { id: "eu", name: "Europe", kind: "market", lon: 9.0, lat: 50.1, flag: "eu", flagSide: "above-left", detail: "Export market" },
  { id: "jp", name: "Japan", kind: "market", lon: 139.7, lat: 35.7, flag: "jp", flagSide: "right", detail: "Export market" },
  { id: "in", name: "India", kind: "market", lon: 77.2, lat: 23.0, flag: "in", flagSide: "left-up", detail: "Export market" },
  { id: "sh", name: "Shanghai office", kind: "sourcing", lon: 121.5, lat: 31.2, flag: "cn", flagSide: "above-right", detail: "Sourcing office" },
  { id: "hk", name: "Hong Kong office", kind: "sourcing", lon: 114.2, lat: 22.3, flag: "hk", flagSide: "right", compactFlagSide: "below", detail: "Sourcing office" },
];

// lift: how far the Bézier control point is pulled north, as a share of the
// route's length. duration: seconds the shipment dot takes to travel it.
const routes = [
  { to: "us", lift: 0.24, duration: 3.2 },
  { to: "eu", lift: 0.3, duration: 2.6 },
  { to: "jp", lift: 0.45, duration: 2.2 },
  { to: "in", lift: 0.3, duration: 1.4 },
];
const shipOrder = ["eu", "us", "in", "jp"];

const home = places[0];
const homePt = project(home.lon, home.lat);

function routePath(to: string, lift: number) {
  const target = places.find((p) => p.id === to)!;
  const b = project(target.lon, target.lat);
  const len = Math.hypot(b.x - homePt.x, b.y - homePt.y);
  const cx = (homePt.x + b.x) / 2;
  const cy = (homePt.y + b.y) / 2 - lift * len;
  return `M${homePt.x.toFixed(1)} ${homePt.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

/* ── Sizes (CSS px at desktop; scaled down below md) ── */
const MARKET_GREY = "#8a8b90";
const RADIUS: Record<Kind, number> = { home: 7, market: 5.5, sourcing: 5.5 };
const FILL: Record<Kind, string> = { home: "var(--red)", market: MARKET_GREY, sourcing: "var(--navy)" };
const HALO_R = 34;
const SHIP_R = 6.5;
const COMPACT_SCALE = 0.72;

function flagSize(kind: Kind) {
  return kind === "home" ? { w: 36, h: 24 } : { w: 30, h: 20 };
}

// Top-left corner of the flag, relative to the marker centre.
function flagOffset(side: FlagSide, w: number, h: number, r: number) {
  const gap = 6;
  switch (side) {
    case "below":
      return { x: -w / 2, y: r + gap };
    case "left":
      return { x: -(r + gap + w), y: -h / 2 };
    case "left-up":
      return { x: -(r + gap + w), y: -h / 2 - 6 };
    case "above-left":
      return { x: -w * 0.75, y: -(r + gap + h) };
    case "above-right":
      return { x: r * 0.5, y: -(r + gap + h) };
    case "right":
      return { x: r + gap, y: -h / 2 };
  }
}

export default function WorldRoutes({ className = "" }: { className?: string }) {
  const uid = `wr${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const pressing = useRef(false);
  const lastPointer = useRef("mouse");
  const [width, setWidth] = useState(1232);
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // Track rendered width (SVG units per CSS px) and the md breakpoint.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);

    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      setCompact(!mq.matches);
      if (!mq.matches) setActive(null);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onChange);
    };
  }, []);

  // Entrance, dash march and shipment loop.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Static map: routes fully drawn, no march, no shipment, no pulse.
      const reveals = root.querySelectorAll<SVGPathElement>(".wr-reveal");
      reveals.forEach((p) => (p.style.strokeDashoffset = "0"));
      return () => reveals.forEach((p) => (p.style.strokeDashoffset = ""));
    }

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const pins = q(".wr-pin");
      const flags = q(".wr-flag");
      const reveals = q(".wr-reveal");
      const dashes = q(".wr-dash");
      const halo = q(".wr-halo");
      const ship = q(".wr-ship");

      gsap.set([...pins, ...halo], { transformOrigin: "50% 50%" });
      gsap.set(pins, { scale: 0 });
      gsap.set(halo, { opacity: 0 });
      gsap.set(flags, { opacity: 0, y: 4 });

      const march = gsap.to(dashes, {
        strokeDashoffset: -8,
        duration: 0.7,
        ease: "none",
        repeat: -1,
        paused: true,
      });

      const loop = gsap.timeline({ repeat: -1, paused: true });
      let t = 0;
      for (const id of shipOrder) {
        const route = routes.find((r) => r.to === id)!;
        const path = root.querySelector<SVGPathElement>(`[data-route="${id}"]`)!;
        const pin = q(`.wr-pin[data-place="${id}"]`)[0];
        const flash = pin.querySelector(".wr-flash");
        const arrive = t + route.duration;

        loop.set(ship, { opacity: 1, immediateRender: false }, t);
        loop.to(
          ship,
          {
            duration: route.duration,
            ease: "power1.inOut",
            motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
          },
          t,
        );
        loop.fromTo(
          halo,
          { scale: 0.6, opacity: 0.35 },
          { scale: 1.15, opacity: 0, duration: 1.2, ease: "power2.out", immediateRender: false },
          t,
        );
        loop.to(halo, { scale: 1, opacity: 0.15, duration: 0.4, ease: "power1.out" }, t + 1.2);

        loop.to(ship, { opacity: 0, duration: 0.2 }, arrive);
        loop.to(pin, { scale: 1.6, duration: 0.2, ease: "power2.out" }, arrive);
        loop.to(pin, { scale: 1, duration: 0.3, ease: "power2.inOut" }, arrive + 0.2);
        loop.to(flash, { opacity: 1, duration: 0.15 }, arrive);
        loop.to(flash, { opacity: 0, duration: 0.35 }, arrive + 0.15);

        t = arrive + 0.5;
      }

      // Loops only run once the entrance is done and the map is on screen.
      let entered = false;
      let visible = false;
      const sync = () => {
        if (entered && visible) {
          loop.play();
          march.play();
        } else {
          loop.pause();
          march.pause();
        }
      };

      const intro = gsap.timeline({
        paused: true,
        onComplete: () => {
          entered = true;
          sync();
        },
      });
      intro.to(pins, { scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.05 }, 0);
      intro.to(halo, { opacity: 0.15, duration: 0.6 }, 0);
      intro.to(flags, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.05 }, 0.1);
      intro.to(reveals, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", stagger: 0.15 }, 0.35);

      ScrollTrigger.create({
        trigger: root,
        start: "top 75%",
        once: true,
        onEnter: () => intro.play(),
      });
      const onScreen = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          visible = self.isActive;
          sync();
        },
      });
      visible = onScreen.isActive;
    }, root);

    return () => ctx.revert();
  }, []);

  const unit = (VB_W / (width || 1232)) * (compact ? COMPACT_SCALE : 1);
  const sizeScale = compact ? COMPACT_SCALE : 1;
  const activePlace = places.find((p) => p.id === active);

  const routeState = (to: string) => {
    if (!activePlace) return "base";
    if (activePlace.kind === "home" || activePlace.id === to) return "on";
    return "dim";
  };

  const clearOnBackgroundTap = (e: ReactMouseEvent) => {
    if (!(e.target as Element).closest(".wr-place")) setActive(null);
  };

  return (
    <div
      ref={rootRef}
      className={`relative w-full ${className}`}
      style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
      onClick={clearOnBackgroundTap}
    >
      <img
        src={`${media}world-solid.svg`}
        alt="World map showing Ha-Meem export markets"
        draggable={false}
        className="absolute inset-0 w-full h-full opacity-95 select-none"
      />

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full overflow-visible"
        role="group"
        aria-label="Routes from Bangladesh to the United States, Europe, Japan and India; sourcing offices in Shanghai and Hong Kong"
      >
        <defs>
          <filter id={`${uid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.18" />
          </filter>
          <FlagDefs prefix={uid} />
          {routes.map((r) => (
            <mask
              key={r.to}
              id={`${uid}-reveal-${r.to}`}
              maskUnits="userSpaceOnUse"
              x={-50}
              y={-50}
              width={VB_W + 100}
              height={VB_H + 100}
            >
              {/* Solid stroke drawn in from Bangladesh; reveals the dashed route underneath */}
              <path
                className="wr-reveal"
                d={routePath(r.to, r.lift)}
                fill="none"
                stroke="#fff"
                strokeWidth={16}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1}
              />
            </mask>
          ))}
        </defs>

        {/* Bangladesh halo, under everything else */}
        <g transform={`translate(${homePt.x} ${homePt.y}) scale(${unit})`} pointerEvents="none">
          <circle className="wr-halo" r={HALO_R} fill="var(--red)" opacity={0.15} />
        </g>

        {/* Routes */}
        {routes.map((r) => {
          const state = routeState(r.to);
          return (
            <g
              key={r.to}
              mask={`url(#${uid}-reveal-${r.to})`}
              style={{
                strokeOpacity: state === "on" ? 1 : state === "dim" ? 0.2 : 0.5,
                strokeWidth: state === "on" ? 2 : 1.4,
                transition: "stroke-opacity 0.25s ease, stroke-width 0.25s ease",
              }}
              pointerEvents="none"
            >
              <path
                className="wr-dash"
                data-route={r.to}
                d={routePath(r.to, r.lift)}
                fill="none"
                stroke="var(--red)"
                strokeLinecap="round"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}

        {/* Shipment dot; leaves from under the Bangladesh marker */}
        <g className="wr-ship" style={{ opacity: 0 }} pointerEvents="none">
          <g transform={`scale(${unit})`}>
            <circle r={SHIP_R} fill="var(--red)" filter={`url(#${uid}-shadow)`} />
          </g>
        </g>

        {/* Markers and flags */}
        {places.map((p) => {
          const { x, y } = project(p.lon, p.lat);
          const r = RADIUS[p.kind];
          const { w, h } = flagSize(p.kind);
          const side = (compact && p.compactFlagSide) || p.flagSide;
          const off = flagOffset(side, w, h, r);
          const isActive = active === p.id;
          // Below md the pins sit 7–23px apart, too close for 44px touch
          // targets that do not overlap; there they are a picture, and what
          // the tooltips say is in the copy beside the map.
          const interactive = !compact;

          return (
            <g
              key={p.id}
              className="wr-place"
              transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${unit})`}
              {...(interactive
                ? { role: "button", tabIndex: 0, "aria-label": `${p.name}. ${p.detail}` }
                : { pointerEvents: "none" })}
              onPointerEnter={(e) => {
                lastPointer.current = e.pointerType;
                if (e.pointerType !== "touch") setActive(p.id);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType !== "touch") setActive((cur) => (cur === p.id ? null : cur));
              }}
              onPointerDown={(e) => {
                lastPointer.current = e.pointerType;
                pressing.current = true;
              }}
              onFocus={() => {
                if (!pressing.current) setActive(p.id);
              }}
              onBlur={() => setActive((cur) => (cur === p.id ? null : cur))}
              onClick={() => {
                pressing.current = false;
                if (lastPointer.current === "touch") setActive((cur) => (cur === p.id ? null : p.id));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive((cur) => (cur === p.id ? null : p.id));
                } else if (e.key === "Escape") {
                  setActive(null);
                }
              }}
            >
              {/* Generous hit area */}
              <circle r={14} fill="transparent" />

              <g className="wr-flag-pos" transform={`translate(${off.x} ${off.y})`}>
                <g className="wr-flag">
                  <rect x={-1} y={-1} width={w + 2} height={h + 2} fill="#fff" filter={`url(#${uid}-shadow)`} />
                  <use href={`#${uid}-flag-${p.flag}`} width={w} height={h} />
                </g>
              </g>

              <g style={{ transform: `scale(${isActive ? 1.3 : 1})`, transition: "transform 0.2s ease" }}>
                <circle className="wr-ring" r={r + 4} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
                <g className="wr-pin" data-place={p.id}>
                  <circle r={r} fill={FILL[p.kind]} stroke="#fff" strokeWidth={2} filter={`url(#${uid}-shadow)`} />
                  <circle className="wr-flash" r={r} fill="var(--red)" stroke="#fff" strokeWidth={2} opacity={0} />
                </g>
              </g>
            </g>
          );
        })}
      </svg>

      {activePlace && <Tooltip place={activePlace} sizeScale={sizeScale} />}
    </div>
  );
}

function Tooltip({ place, sizeScale }: { place: Place; sizeScale: number }) {
  const { x, y } = project(place.lon, place.lat);
  const left = (x / VB_W) * 100;
  const top = (y / VB_H) * 100;
  // Keep cards near the map edges inside the container.
  const tx = left < 20 ? "-16px" : left > 80 ? "calc(-100% + 16px)" : "-50%";
  const lift = RADIUS[place.kind] * 1.3 * sizeScale + 10;

  return (
    <div
      className="absolute z-10 pointer-events-none whitespace-nowrap bg-white border border-(--hair) rounded-md px-3 py-2 shadow-[0_6px_18px_rgba(17,20,24,0.12)]"
      style={{ left: `${left}%`, top: `${top}%`, transform: `translate(${tx}, calc(-100% - ${lift}px))` }}
      role="tooltip"
    >
      <div className="font-['Fira_Sans_Condensed'] font-semibold text-[13px] leading-tight text-(--ink)">
        {place.name}
      </div>
      <div className="text-[11px] leading-tight text-(--mute) mt-0.5">{place.detail}</div>
    </div>
  );
}
