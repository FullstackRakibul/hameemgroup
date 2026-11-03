import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { DRESS_FORM } from "../data/media";
import { FLOOR } from "./dressFormFrame";
import useInViewOnce from "./useInViewOnce";
import type { DressFormScene } from "./dressFormScene";

/* ── The denim dress form ──
   A sampling dress form on a small stage beside the About statement, with
   denim flecks and cotton fibres orbiting it and a thread stitching its way
   up around it. With the GLB present (and WebGL, from lg) it is the real 3D
   model turning 360° (three.js, loaded on demand); without it, the cut-out
   sways on a 2.5D turntable. One rAF loop drives the model and both particle
   canvases, and runs only while the form is on screen and the tab visible.
   With reduced motion it is a still. */

type Mode = "pending" | "3d" | "2.5d" | "none";

const TAU = Math.PI * 2;
const SPIN = 0.25; // rad/s, the 3D turntable
const HOLD_MS = 800; // the pause each turn, facing the viewer
const SWAY_S = 9; // the 2.5D sway, one full -28° → 28° → -28° cycle
const BREATHE_S = 6;
const START_DELAY_MS = 1300; // after the entrance (600ms delay + 700ms rise)

// One check per page load
let modelCheck: Promise<boolean> | null = null;
const modelExists = () =>
  (modelCheck ??= fetch(DRESS_FORM.model, { method: "HEAD" })
    .then((r) => r.ok && !(r.headers.get("content-type") ?? "").includes("text/html"))
    .catch(() => false));
const webglWorks = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
};
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Particles ──
   Kept in typed arrays and drawn without allocating per frame. Each one
   rides one of two tilted ellipses (the waist and the hem); the half of the
   ellipse behind the form goes on the back canvas, under the model. */
const P_RING = 0, P_THETA = 1, P_SPEED = 2, P_R = 3, P_Y = 4, P_SIZE = 5, P_KIND = 6, P_ALPHA = 7, P_ROT = 8, P_BEND = 9;
const STRIDE = 10;
// Ring geometry, as fractions: [height up the form, radius across the stage, flatness, tilt]
const RINGS = [
  [0.6, 0.36, 0.2, -0.12],
  [0.14, 0.44, 0.24, 0.08],
] as const;
const INDIGO = "47, 74, 122"; // #2f4a7a

function seedParticles(count: number) {
  const a = new Float32Array(count * STRIDE);
  for (let i = 0; i < count; i++) {
    const o = i * STRIDE;
    a[o + P_RING] = i % 2;
    a[o + P_THETA] = Math.random() * TAU;
    a[o + P_SPEED] = (0.18 + Math.random() * 0.22) * (Math.random() < 0.5 ? 1 : 1.15);
    a[o + P_R] = 0.85 + Math.random() * 0.3;
    a[o + P_Y] = (Math.random() - 0.5) * 0.06;
    a[o + P_SIZE] = 1 + Math.random();
    a[o + P_KIND] = Math.random() < 0.55 ? 0 : 1; // 0 a denim fleck, 1 a cotton fibre
    a[o + P_ALPHA] = 0.25 + Math.random() * 0.2;
    a[o + P_ROT] = Math.random() * TAU;
    a[o + P_BEND] = (Math.random() - 0.5) * 6;
  }
  return a;
}

export default function DressForm3D({ className = "" }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const turnRef = useRef<HTMLDivElement>(null); // 2.5D turntable
  const rimRef = useRef<HTMLSpanElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);

  const [entryRef, entered] = useInViewOnce<HTMLDivElement>(0.3);
  const [near, setNear] = useState(false);
  const [live, setLive] = useState(false);
  const [mode, setMode] = useState<Mode>("pending");
  const [imageOk, setImageOk] = useState(true);
  const [firstFrame, setFirstFrame] = useState(false);
  const sceneRef = useRef<DressFormScene | null>(null);
  const [reduced] = useState(() => typeof window !== "undefined" && reducedMotion());

  // Shared, mutable animation state: read and written by the loop and the pointer
  const s = useRef({
    angle: 0, // 3D turn
    autoV: 0,
    holdUntil: 0,
    dragging: false,
    dragX: 0,
    inertia: 0,
    releasedAt: -1e9,
    hover: 0,
    hoverTarget: 0,
    tiltX: 0,
    tiltY: 0,
    tiltTX: 0,
    tiltTY: 0,
    startAt: 0,
    w: 0,
    h: 0,
    dpr: 1,
    particles: new Float32Array(0),
    threadPhase: 0,
  });

  // Mount nothing heavy until the form is within 200px of the screen
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "200px" },
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);

  // Live: on screen and the tab visible
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let onScreen = false;
    const update = () => setLive(onScreen && !document.hidden);
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        update();
      },
      { rootMargin: "-1px 0px" },
    );
    io.observe(box);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Choose the mode once near: 3D when the model file is there, WebGL works and the screen is lg+
  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    const wide = window.matchMedia("(min-width: 64rem)").matches;
    void modelExists().then((ok) => {
      if (cancelled) return;
      setMode(ok && wide && webglWorks() ? "3d" : imageOk ? "2.5d" : "none");
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near]);

  // 3D: load three and the model; show the cut-out poster until the first frame
  useEffect(() => {
    if (mode !== "3d") return;
    const canvas = glRef.current;
    if (!canvas) return;
    let cancelled = false;
    let scene: DressFormScene | null = null;
    void import("./dressFormScene")
      .then(({ createDressFormScene }) => {
        if (cancelled) return;
        scene = createDressFormScene(canvas, DRESS_FORM.model);
        const st = s.current;
        if (st.w) scene.resize(st.w, st.h, window.devicePixelRatio || 1);
        return scene.ready.then(() => {
          if (cancelled || !scene) return;
          sceneRef.current = scene;
          scene.render(st.angle);
          setFirstFrame(true);
        });
      })
      .catch(() => !cancelled && setMode(imageOk ? "2.5d" : "none"));
    return () => {
      cancelled = true;
      sceneRef.current = null;
      scene?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Size every canvas to the stage, and seed the particles (half as many below xl)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || mode === "pending") return;
    const fit = () => {
      const r = stage.getBoundingClientRect();
      const st = s.current;
      st.w = r.width;
      st.h = r.height;
      st.dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [backRef.current, frontRef.current]) {
        if (!c) continue;
        c.width = Math.round(r.width * st.dpr);
        c.height = Math.round(r.height * st.dpr);
      }
      const count = window.matchMedia("(min-width: 80rem)").matches ? 40 : 20;
      if (st.particles.length !== count * STRIDE) st.particles = seedParticles(count);
      const scene = sceneRef.current;
      if (scene) {
        scene.resize(r.width, r.height, window.devicePixelRatio || 1);
        if (reduced) scene.render(0);
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [mode, firstFrame, reduced]);

  // Pointer on the section: the 2.5D form leans ±8° toward it (lg, a mouse)
  useEffect(() => {
    const section = boxRef.current?.closest("section");
    if (!section || reduced) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = boxRef.current!.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 1.5)));
      s.current.tiltTY = nx * 8;
      s.current.tiltTX = -ny * 8;
    };
    const onLeave = () => {
      s.current.tiltTX = 0;
      s.current.tiltTY = 0;
    };
    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  // The one loop: the model (3D turn or 2.5D sway) and both particle canvases
  useEffect(() => {
    if (!live || !entered || reduced || mode === "pending" || mode === "none") return;
    const back = backRef.current?.getContext("2d");
    const front = frontRef.current?.getContext("2d");
    if (!back || !front) return;
    const st = s.current;
    if (!st.startAt) st.startAt = performance.now() + START_DELAY_MS;
    let last = performance.now();
    let frame = 0;

    const drawFleck = (ctx: CanvasRenderingContext2D, o: number, x: number, y: number, depth: number) => {
      const p = st.particles;
      const a = p[o + P_ALPHA] * (0.55 + 0.45 * depth);
      if (p[o + P_KIND] === 0) {
        ctx.globalAlpha = a + 0.1;
        ctx.fillStyle = `rgb(${INDIGO})`;
        ctx.setTransform(st.dpr, 0, 0, st.dpr, x * st.dpr, y * st.dpr);
        ctx.beginPath();
        ctx.arc(0, 0, (p[o + P_SIZE] / 2) * (0.8 + 0.4 * depth), 0, TAU);
        ctx.fill();
      } else {
        // A cotton fibre: a short curve, white over a faint ink edge so it reads on mist and on denim
        const c = Math.cos(p[o + P_ROT]) * st.dpr;
        const sn = Math.sin(p[o + P_ROT]) * st.dpr;
        ctx.setTransform(c, sn, -sn, c, x * st.dpr, y * st.dpr);
        const len = 5 + p[o + P_SIZE] * 3;
        ctx.beginPath();
        ctx.moveTo(-len / 2, 0);
        ctx.quadraticCurveTo(0, p[o + P_BEND], len / 2, 0);
        ctx.globalAlpha = 0.14 * (0.6 + 0.4 * depth);
        ctx.strokeStyle = "rgb(17, 20, 24)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 0.7 * (0.6 + 0.4 * depth);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // Motion eases in once the entrance has played
      const ramp = Math.min(1, Math.max(0, (now - st.startAt) / 1000));
      st.hover += (st.hoverTarget - st.hover) * Math.min(1, dt * 5);
      st.tiltX += (st.tiltTX - st.tiltX) * Math.min(1, dt * 4);
      st.tiltY += (st.tiltTY - st.tiltY) * Math.min(1, dt * 4);
      const t = now / 1000;

      // ── The model ──
      if (mode === "3d") {
        const scene = sceneRef.current;
        if (st.dragging) {
          // the pointer turns it
        } else if (now - st.releasedAt < 2000) {
          st.angle += st.inertia * dt;
          st.inertia *= Math.exp(-3 * dt);
          st.autoV = 0;
        } else if (now >= st.holdUntil && now >= st.startAt) {
          // A steady turn that eases into a short pause each time the front comes round
          const m = ((st.angle % TAU) + TAU) % TAU;
          const rem = TAU - m;
          const target = rem < 0.5 ? SPIN * Math.max(rem / 0.5, 0.06) : SPIN;
          st.autoV += (target - st.autoV) * Math.min(1, dt * 3);
          const step = st.autoV * dt;
          if (rem < 0.5 && step >= rem) {
            st.angle = Math.round((st.angle + rem) / TAU) * TAU;
            st.holdUntil = now + HOLD_MS;
            st.autoV = 0;
          } else st.angle += step;
        }
        scene?.render(st.angle, (st.tiltX * Math.PI) / 180 / 3);
      } else if (turnRef.current) {
        // 2.5D: a turntable sway, never past ±30° (a flat cut-out looks wrong edge-on)
        const sway = Math.sin((TAU * t) / SWAY_S) * ramp;
        const rotY = Math.max(-30, Math.min(30, 28 * sway + st.tiltY));
        const breathe = -6 * (0.5 - 0.5 * Math.cos((TAU * t) / BREATHE_S)) * ramp;
        turnRef.current.style.transform = `translateY(${breathe}px) rotateX(${st.tiltX}deg) rotateY(${rotY}deg) scaleX(${1 - 0.06 * Math.abs(sway)})`;
        if (rimRef.current) rimRef.current.style.backgroundPosition = `${50 - sway * 45}% 0`;
        if (shadowRef.current)
          shadowRef.current.style.transform = `translateX(${-sway * 10}px) scaleX(${1 - 0.08 * Math.abs(sway)})`;
      }

      // ── The particles ──
      const { w, h, dpr, particles: p } = st;
      back.setTransform(1, 0, 0, 1, 0, 0);
      back.clearRect(0, 0, w * dpr, h * dpr);
      front.setTransform(1, 0, 0, 1, 0, 0);
      front.clearRect(0, 0, w * dpr, h * dpr);
      const floorY = h * (1 - FLOOR);
      const formH = h * (1 - 2 * FLOOR);
      const cx = w / 2;
      const speed = (1 + 0.5 * st.hover) * ramp;
      const out = 8 * st.hover;
      for (let o = 0; o < p.length; o += STRIDE) {
        const ring = RINGS[p[o + P_RING]];
        p[o + P_THETA] += p[o + P_SPEED] * speed * dt;
        p[o + P_ROT] += 0.4 * dt;
        const th = p[o + P_THETA];
        const rx = ring[1] * w * p[o + P_R] + out;
        const ry = rx * ring[2];
        let x = Math.cos(th) * rx;
        let y = Math.sin(th) * ry;
        // tilt the ellipse
        const ct = Math.cos(ring[3]);
        const sn = Math.sin(ring[3]);
        const tx = x * ct - y * sn;
        y = x * sn + y * ct;
        x = tx;
        const depth = (Math.sin(th) + 1) / 2; // 1 nearest
        const py = floorY - ring[0] * formH + y + p[o + P_Y] * formH;
        drawFleck(Math.sin(th) > 0 ? front : back, o, cx + x, py, depth);
      }

      // ── The thread: a dashed white line spiralling up and around, fading at its ends ──
      st.threadPhase += 0.35 * speed * dt;
      const SEG = 120;
      const turns = 3.2;
      let px = 0, py = 0, pz = 0, run = 0;
      for (let k = 0; k <= SEG; k++) {
        const u = k / SEG;
        const ang = u * turns * TAU - st.threadPhase * 2;
        const r = (0.42 - 0.22 * u) * w + out;
        const x = cx + Math.cos(ang) * r;
        const y = floorY - (0.04 + 0.86 * u) * formH + Math.sin(ang) * r * 0.2;
        const z = Math.sin(ang);
        if (k > 0) {
          const ctx = (z + pz) / 2 > 0 ? front : back;
          const seg = Math.hypot(x - px, y - py);
          const fade = Math.sin(Math.PI * u) * (0.55 + 0.45 * ((z + 1) / 2));
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = -run + st.threadPhase * 20;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.globalAlpha = 0.16 * fade;
          ctx.strokeStyle = "rgb(17, 20, 24)";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 0.85 * fade;
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
          run += seg;
        }
        px = x;
        py = y;
        pz = z;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [live, entered, reduced, mode]);

  // 3D: drag to turn (with inertia); auto-spin returns 2s after release
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (mode !== "3d" || reduced) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const st = s.current;
    st.dragging = true;
    st.dragX = e.clientX;
    st.inertia = 0;
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = s.current;
    if (!st.dragging) return;
    const d = (e.clientX - st.dragX) * 0.012;
    st.dragX = e.clientX;
    st.angle += d;
    st.inertia = st.inertia * 0.6 + (d / (1 / 60)) * 0.4;
    if (reduced) sceneRef.current?.render(st.angle);
  };
  const onUp = () => {
    const st = s.current;
    if (!st.dragging) return;
    st.dragging = false;
    st.releasedAt = performance.now();
  };

  const showPoster = imageOk && (mode === "2.5d" || (mode === "3d" && !firstFrame));

  return (
    <div
      ref={(el) => {
        boxRef.current = el;
        entryRef.current = el!;
      }}
      role="img"
      aria-label="Denim dress form used for product sampling, rotating"
      className={`flex flex-col ${
        entered ? "animate-[awardIn_700ms_cubic-bezier(.22,1,.36,1)_600ms_both] [--award-from:translateY(24px)]" : "opacity-0"
      } motion-reduce:animate-none motion-reduce:opacity-100 ${className}`}
    >
      <div
        ref={stageRef}
        aria-hidden="true"
        onPointerEnter={() => (s.current.hoverTarget = 1)}
        onPointerLeave={() => {
          s.current.hoverTarget = 0;
          onUp();
        }}
        className="relative min-h-0 flex-1"
      >
        {/* 1) The stage floor: a soft shadow, and a stitched ring turning slowly under the form */}
        <span
          ref={shadowRef}
          className="pointer-events-none absolute left-1/2 h-7 w-[58%] -translate-x-1/2 translate-y-1/2 bg-[radial-gradient(closest-side,rgb(0_0_0/0.2),transparent)]"
          style={{ bottom: `${FLOOR * 100}%` }}
        />
        <span
          className="pointer-events-none absolute left-1/2 aspect-square w-[78%] -translate-x-1/2 translate-y-1/2 [transform:rotateX(76deg)]"
          style={{ bottom: `${FLOOR * 100}%` }}
        >
          <svg viewBox="0 0 100 100" className="orbit-spin size-full overflow-visible motion-reduce:animate-none">
            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--hair)" strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--ink)" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="5 4" />
          </svg>
        </span>

        {/* Particles behind the form */}
        <canvas ref={backRef} className="pointer-events-none absolute inset-0 size-full" />

        {/* 2) The model: the cut-out (2.5D, and the 3D poster) and the 3D canvas */}
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={`absolute inset-0 [perspective:1000px] ${mode === "3d" && !reduced ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""}`}
        >
          {showPoster && (
            <div
              className={`absolute inset-x-0 flex justify-center transition-opacity duration-700 ${mode === "3d" && firstFrame ? "opacity-0" : "opacity-100"}`}
              style={{ top: `${FLOOR * 100}%`, bottom: `${FLOOR * 100}%` }}
            >
              <div ref={turnRef} className="relative h-full [transform-style:preserve-3d] will-change-transform">
                <img
                  src={DRESS_FORM.image}
                  alt=""
                  draggable={false}
                  onError={() => {
                    setImageOk(false);
                    if (mode === "2.5d") setMode("none");
                  }}
                  className="block h-full w-auto select-none object-contain"
                />
                {/* A soft rim light, cut to the form's own outline, crossing as it turns */}
                {mode === "2.5d" && (
                  <span
                    ref={rimRef}
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,transparent_38%,rgb(255_255_255/0.45)_50%,transparent_62%)] bg-size-[260%_100%] mix-blend-soft-light motion-reduce:hidden"
                    style={{ maskImage: `url(${DRESS_FORM.image})`, maskSize: "100% 100%" }}
                  />
                )}
              </div>
            </div>
          )}
          {mode === "3d" && (
            <canvas
              ref={glRef}
              className={`absolute inset-0 size-full transition-opacity duration-700 ${firstFrame ? "opacity-100" : "opacity-0"}`}
            />
          )}
        </div>

        {/* 3) Particles in front of the form */}
        <canvas ref={frontRef} className="pointer-events-none absolute inset-0 size-full" />
      </div>

      <p aria-hidden="true" className="m-0 mt-3 flex items-center justify-center gap-3 text-[11px] tracking-[0.2em] text-(--mute)">
        <span className="h-px w-6 bg-(--navy)" />
        SAMPLING · DENIM DRESS FORM
      </p>
    </div>
  );
}
