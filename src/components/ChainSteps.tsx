import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import CountUp from "./CountUp";
import { CHAIN_STEPS, type ChainStep } from "../data/chain";

const media = "/media/";
const EASE = "ease-[cubic-bezier(.22,1,.36,1)]";
const N = CHAIN_STEPS.length;
const pad = (n: number) => String(n).padStart(2, "0");
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The open step's text rises in line by line once the panel has started to
   widen; closing, it simply fades, fast, so it never lingers in a narrowing
   panel. `k` is the line's place in that order. */
const rise = (open: boolean) =>
  `transition-[opacity,translate] ${EASE} motion-reduce:transition-none ${
    open ? "translate-y-0 opacity-100 duration-500" : "translate-y-3 opacity-0 duration-150"
  }`;
const delay = (open: boolean, k: number): CSSProperties => ({ transitionDelay: open ? `${220 + k * 70}ms` : "0ms" });

/** The step's figure: counts up each time the step opens, if it has digits */
function Stat({ step, open }: { step: ChainStep; open: boolean }) {
  return (
    <b className="font-['Fira_Sans_Condensed'] text-[28px] font-semibold leading-none tabular-nums">
      {open && /\d/.test(step.stat) ? <CountUp text={step.stat} /> : step.stat}{" "}
      <small className="font-['Fira_Sans'] text-[10px] font-medium tracking-[0.15em] text-white/70">{step.unit}</small>
    </b>
  );
}

/* ── 768px and up: a horizontal accordion ──
   Panels share one row by flex-grow alone (1 closed, 5 open, from a zero
   basis), so the width change is one smooth, proportional move. Pointing at
   a panel opens it after a short intent, so sweeping across the row doesn't
   flicker; focus and click open it at once, and ArrowLeft/ArrowRight move
   along the row. */
function Row({ step, setStep }: { step: number; setStep: (i: number) => void }) {
  const intent = useRef<number | undefined>(undefined);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => () => window.clearTimeout(intent.current), []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    buttons.current[(step + (e.key === "ArrowRight" ? 1 : -1) + N) % N]?.focus();
  };

  return (
    <div
      data-reveal
      role="group"
      aria-label="Production steps"
      onKeyDown={onKeyDown}
      className="relative isolate hidden h-[clamp(520px,78svh,672px)] bg-(--ink) text-white md:flex"
    >
      {CHAIN_STEPS.map((item, i) => {
        const open = step === i;
        return (
          <button
            key={item.title}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            aria-expanded={open}
            onClick={() => setStep(i)}
            onFocus={() => setStep(i)}
            onPointerEnter={(e) => {
              if (e.pointerType !== "mouse" || open) return;
              window.clearTimeout(intent.current);
              intent.current = window.setTimeout(() => setStep(i), 140);
            }}
            onPointerLeave={() => window.clearTimeout(intent.current)}
            className={`group relative min-w-0 basis-0 overflow-hidden border-r border-dashed border-white/20 text-left transition-[flex-grow] duration-700 ${EASE} last:border-r-0 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white motion-reduce:transition-none ${
              open ? "grow-5 cursor-default" : "grow cursor-pointer"
            }`}
          >
            {/* The photo: a slow push-in when open, a quicker one on hover */}
            <img
              src={`${media}${item.image}`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 size-full max-w-none object-cover transition-[scale] duration-1200 ${EASE} motion-reduce:transition-none ${
                open ? "scale-105" : "scale-100 group-hover:scale-110"
              }`}
            />
            {/* Closed: a flat shade that lifts on hover */}
            <span
              aria-hidden="true"
              className={`absolute inset-0 bg-[rgba(17,20,24,0.62)] transition-opacity duration-500 motion-reduce:transition-none ${
                open ? "opacity-0" : "opacity-100 group-hover:opacity-60"
              }`}
            />
            {/* Open: clear at the top, deep at the foot where the text sits */}
            <span
              aria-hidden="true"
              className={`absolute inset-0 bg-linear-to-t from-[rgba(17,20,24,0.9)] via-[rgba(17,20,24,0.35)] to-[rgba(17,20,24,0.12)] transition-opacity duration-700 motion-reduce:transition-none ${
                open ? "opacity-100" : "opacity-0"
              }`}
            />
            {/* A white rule along the foot: drawn on the open step, growing in on hover */}
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 bottom-0 h-0.5 origin-left transition-[scale,opacity] duration-500 ${EASE} motion-reduce:transition-none ${
                open ? "scale-x-100 bg-white" : "scale-x-0 bg-white/60 group-hover:scale-x-100"
              }`}
            />

            {/* Closed: the number at the top, the title up the panel */}
            <span
              aria-hidden={open}
              className={`absolute left-1/2 top-6 -translate-x-1/2 text-xs font-semibold tabular-nums tracking-widest transition-[opacity,color] duration-300 motion-reduce:transition-none ${
                open ? "opacity-0" : "text-white/60 group-hover:text-white"
              }`}
            >
              {pad(i + 1)}
            </span>
            <strong
              aria-hidden={open}
              className={`absolute bottom-10 left-1/2 -translate-x-1/2 rotate-180 whitespace-nowrap font-['Fira_Sans_Condensed'] text-[19px] font-semibold [writing-mode:vertical-rl] transition-[opacity,translate] duration-300 ${EASE} motion-reduce:transition-none ${
                open ? "opacity-0" : "opacity-85 group-hover:-translate-y-2 group-hover:opacity-100"
              }`}
            >
              {item.title}
            </strong>

            {/* Open: the step's story. Always mounted at a fixed width (about
                the open panel's), so it fades rather than pops and never
                reflows while the panel widens. */}
            <span
              aria-hidden={!open}
              className="absolute bottom-10 left-10 flex w-[min(30rem,calc(50vw-6rem))] flex-col"
            >
              <span
                className={`flex items-center gap-3 text-[11px] font-semibold tracking-widest text-white/70 ${rise(open)}`}
                style={delay(open, 0)}
              >
                <span aria-hidden="true" className="w-8 border-t border-dashed border-white/60" />
                STEP {pad(i + 1)} OF {pad(N)}
              </span>
              <span
                className={`mt-4 font-['Fira_Sans_Condensed'] text-[32px] font-semibold leading-none lg:text-[44px] ${rise(open)}`}
                style={delay(open, 1)}
              >
                {item.title}
              </span>
              <span className={`mt-4 max-w-[44ch] leading-relaxed text-white/80 ${rise(open)}`} style={delay(open, 2)}>
                {item.text}
              </span>
              <span className={`mt-6 border-t border-white/15 pt-5 ${rise(open)}`} style={delay(open, 3)}>
                <Stat step={item} open={open} />
              </span>
            </span>
          </button>
        );
      })}
      {/* The hero's denim twill over the whole row */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-1 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.045)_0_1px,transparent_1px_5px)]"
      />
    </div>
  );
}

/* ── Phones: the same six steps as a vertical accordion ──
   Closed steps are photo strips; the open step shows its photo uncropped
   above the text, which rises in line by line. */
function Stack({ step, setStep }: { step: number; setStep: (i: number) => void }) {
  return (
    <ol data-reveal className="m-0 list-none bg-(--ink) p-0 text-white md:hidden">
      {CHAIN_STEPS.map((item, i) => {
        const open = step === i;
        return (
          <li key={item.title} className="scroll-mt-24 border-b border-dashed border-white/20 last:border-b-0">
            <button
              type="button"
              id={`chain-step-${i}`}
              aria-expanded={open}
              aria-controls={`chain-panel-${i}`}
              className="relative flex min-h-18 w-full items-center gap-4 overflow-hidden px-5 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
              onClick={(e) => {
                const row = e.currentTarget.parentElement;
                setStep(i);
                // Without the height animation there is no transitionend to wait for
                if (reducedMotion()) requestAnimationFrame(() => row?.scrollIntoView({ block: "nearest", behavior: "instant" }));
              }}
            >
              {/* The strip photo fades out once the step is open: the full photo sits below */}
              <span
                aria-hidden="true"
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 motion-reduce:transition-none ${
                  open ? "opacity-0" : "opacity-100"
                }`}
                style={{ backgroundImage: `url("${media}${item.image}")` }}
              />
              <span aria-hidden="true" className="absolute inset-0 bg-[rgba(17,20,24,0.62)]" />
              <span
                className={`relative z-1 w-6 shrink-0 text-sm font-semibold tabular-nums transition-colors duration-300 ${
                  open ? "text-white" : "text-white/60"
                }`}
              >
                {pad(i + 1)}
              </span>
              <span className="relative z-1 flex-1 font-['Fira_Sans_Condensed'] text-[22px] font-semibold leading-tight">
                {item.title}
              </span>
              <span
                aria-hidden="true"
                className={`relative z-1 grid size-8 shrink-0 place-items-center rounded-full border transition-colors duration-300 motion-reduce:transition-none ${
                  open ? "border-white bg-white text-(--ink)" : "border-white/40 text-white"
                }`}
              >
                <ChevronDown
                  size={18}
                  strokeWidth={1.75}
                  className={`transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {/* Grid rows 0fr → 1fr animates to the content's natural height */}
            <div
              id={`chain-panel-${i}`}
              role="region"
              aria-labelledby={`chain-step-${i}`}
              inert={!open}
              className={`grid transition-[grid-template-rows] duration-500 ${EASE} motion-reduce:transition-none ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
              onTransitionEnd={(e) => {
                // Once open, bring the whole step into view: the step that
                // closed above it may have pulled it off-screen.
                if (open && e.target === e.currentTarget && e.propertyName === "grid-template-rows") {
                  e.currentTarget.parentElement?.scrollIntoView({ block: "nearest" });
                }
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <img
                  src={`${media}${item.image}`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="block aspect-16/10 w-full object-cover"
                />
                <div className="flex flex-col gap-3 px-5 pb-7 pt-5">
                  <span
                    className={`flex items-center gap-3 text-[11px] font-semibold tracking-widest text-white/70 ${rise(open)}`}
                    style={delay(open, 0)}
                  >
                    <span aria-hidden="true" className="w-6 border-t border-dashed border-white/60" />
                    STEP {pad(i + 1)} OF {pad(N)}
                  </span>
                  <p className={`m-0 max-w-[44ch] text-[15px] leading-relaxed text-white/80 ${rise(open)}`} style={delay(open, 1)}>
                    {item.text}
                  </p>
                  <span className={`mt-2 border-t border-white/15 pt-4 ${rise(open)}`} style={delay(open, 2)}>
                    <Stat step={item} open={open} />
                  </span>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ── Vertical integration: the six steps ──
   One open step drives both layouts; the second (weaving) opens first. */
export default function ChainSteps() {
  const [step, setStep] = useState(1);
  return (
    <>
      <Row step={step} setStep={setStep} />
      <Stack step={step} setStep={setStep} />
    </>
  );
}
