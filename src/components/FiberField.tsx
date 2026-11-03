import { useEffect, useRef, useState } from "react";

/* ── Cotton-fibre field ──
   Lint drifting up through the light: short curved fibres and a few dots on
   one canvas, rising slowly with a sway. Near a mouse pointer they ease away
   and spring back. One rAF loop, paused while the section is off screen or the
   tab is hidden; nothing at all with reduced motion. */

const REPEL = 90; // px around the pointer
const NAVY_COUNT = 4;

type Fibre = {
  x: number; // drift position, before sway and push
  y: number;
  ox: number; // spring offset from the pointer push
  oy: number;
  vx: number;
  vy: number;
  rise: number; // px/s
  sway: number; // px
  swayRate: number; // rad/s
  phase: number;
  rot: number;
  spin: number; // rad/s
  len: number; // 0 for a dot
  bend: number;
  size: number; // dot radius
  alpha: number;
  colour: string;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** "#5C2E23" or "rgb(92, 46, 35)" → "92, 46, 35" */
function rgbOf(value: string, fallback: string) {
  const v = value.trim();
  const hex = v.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(", ");
  }
  const rgb = v.match(/\d+(\.\d+)?/g);
  return rgb && rgb.length >= 3 ? rgb.slice(0, 3).join(", ") : fallback;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export default function FiberField() {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (reduced || !canvas || !host || !ctx) return;

    const root = getComputedStyle(document.documentElement);
    const ink = rgbOf(root.getPropertyValue("--ink"), "92, 46, 35");
    const navy = `rgb(${rgbOf(root.getPropertyValue("--navy"), "27, 50, 67")})`;
    const inkColour = `rgb(${ink})`;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let fibres: Fibre[] = [];
    let frame = 0;
    let last = 0;
    let visible = false;
    // Pointer in canvas pixels; far away when there is none
    let px = -1e4;
    let py = -1e4;

    const seed = (count: number) => {
      fibres = Array.from({ length: count }, (_, i) => {
        const isNavy = i < NAVY_COUNT;
        const isDot = !isNavy && Math.random() < 0.3;
        return {
          x: rand(0, w),
          y: rand(0, h),
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
          rise: rand(8, 20),
          sway: rand(4, 14),
          swayRate: rand(0.3, 0.8),
          phase: rand(0, Math.PI * 2),
          rot: rand(0, Math.PI * 2),
          spin: rand(-0.35, 0.35),
          len: isDot ? 0 : rand(6, 16),
          bend: rand(-4, 4),
          size: rand(0.5, 1),
          alpha: isNavy ? 0.25 : rand(0.08, 0.18),
          colour: isNavy ? navy : inkColour,
        };
      });
    };

    const resize = () => {
      const r = host.getBoundingClientRect();
      const nw = r.width;
      const nh = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(nw * dpr);
      canvas.height = Math.round(nh * dpr);
      const count = nw < 640 ? 28 : 60;
      if (fibres.length !== count) {
        w = nw;
        h = nh;
        seed(count);
      } else {
        // Keep the fibres where they are, scaled into the new box
        for (const f of fibres) {
          f.x = (f.x / (w || 1)) * nw;
          f.y = (f.y / (h || 1)) * nh;
        }
        w = nw;
        h = nh;
      }
      ctx.lineCap = "round";
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < fibres.length; i++) {
        const f = fibres[i];
        f.y -= f.rise * dt;
        f.rot += f.spin * dt;
        if (f.y < -20) {
          f.y = h + 20;
          f.x = Math.random() * w;
        }
        const bx = f.x + Math.sin(t * f.swayRate + f.phase) * f.sway;

        // Push away from the pointer, then a damped spring back home
        const dx = bx + f.ox - px;
        const dy = f.y + f.oy - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL * REPEL && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = (1 - d / REPEL) * 900;
          f.vx += (dx / d) * push * dt;
          f.vy += (dy / d) * push * dt;
        }
        f.vx += -f.ox * 18 * dt;
        f.vy += -f.oy * 18 * dt;
        const damp = Math.exp(-6 * dt);
        f.vx *= damp;
        f.vy *= damp;
        f.ox += f.vx * dt;
        f.oy += f.vy * dt;

        const x = bx + f.ox;
        const y = f.y + f.oy;
        ctx.globalAlpha = f.alpha;
        if (f.len === 0) {
          ctx.setTransform(dpr, 0, 0, dpr, x * dpr, y * dpr);
          ctx.fillStyle = f.colour;
          ctx.beginPath();
          ctx.arc(0, 0, f.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const c = Math.cos(f.rot) * dpr;
          const s = Math.sin(f.rot) * dpr;
          ctx.setTransform(c, s, -s, c, x * dpr, y * dpr);
          ctx.strokeStyle = f.colour;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-f.len / 2, 0);
          ctx.quadraticCurveTo(0, f.bend, f.len / 2, 0);
          ctx.stroke();
        }
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || !visible || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
    };
    const onPointerLeave = () => {
      px = -1e4;
      py = -1e4;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    // The 1px inset: a section merely touching the viewport's edge (the hero
    // is exactly one screen tall) counts as intersecting otherwise
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "-1px 0px" },
    );
    io.observe(host);
    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  if (reduced) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />;
}
