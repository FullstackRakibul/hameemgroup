import { useEffect, useRef, useState } from "react";
import type { TransitionEvent } from "react";
import { VIDEOS, type VideoId } from "../data/videos";
import { canPlayBackgroundVideo } from "../lib/videoPolicy";

const media = "/media/";
const FADE = "transition-[opacity,scale] duration-700 ease-[cubic-bezier(.22,1,.36,1)]";

/* ── Stat video backdrop ──
   The About stats band's film. The active poster always lies underneath and
   crossfades in at once on a change, so a frame is never empty. Two <video>
   elements take turns (A/B) above it: on a change the shown film fades out to
   that poster while the next loads into the other element, which fades in
   once it can play; the one left behind is paused when its fade ends. A
   change that arrives mid-load replaces the stale one, so at most two films
   are ever loading. Where films are off (small screens, slow connections,
   reduced motion) the posters alone crossfade. Films play only while the band
   is on screen and the tab is visible. */
export default function StatVideoBackdrop({ activeId }: { activeId: VideoId }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);
  const els = [a, b];
  const [films, setFilms] = useState(false);
  const [live, setLive] = useState(false); // on screen and the tab visible
  const [shown, setShown] = useState<0 | 1 | null>(null);
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const slot = useRef<0 | 1>(0); // where the next film loads
  const seq = useRef(0);
  // Posters mount the first time they are needed, then stay for the crossfade
  const [seen, setSeen] = useState<VideoId[]>([activeId]);
  useEffect(() => setSeen((s) => (s.includes(activeId) ? s : [...s, activeId])), [activeId]);

  useEffect(() => setFilms(canPlayBackgroundVideo()), []);

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

  // Bring the active film in, or keep the shown one playing
  useEffect(() => {
    if (!films) return;
    if (!live) {
      els.forEach((r) => r.current?.pause());
      return;
    }
    const token = ++seq.current;
    const current = shownRef.current;
    // Already loaded in either element (the shown one, or one just left): show it
    const ready = ([0, 1] as const).find((i) => {
      const v = els[i].current;
      return v?.dataset.id === activeId && v.readyState >= 3;
    });
    if (ready !== undefined) {
      void els[ready].current!.play().catch(() => {});
      setShown(ready);
      return;
    }
    const next: 0 | 1 = current === null ? slot.current : current === 0 ? 1 : 0;
    slot.current = next;
    const v = els[next].current;
    if (!v) return;
    // The shown film fades out to the new poster while this one loads
    setShown(null);
    if (v.dataset.id !== activeId) {
      v.dataset.id = activeId;
      v.src = VIDEOS[activeId].src;
      v.load();
    }
    const onReady = () => {
      if (token !== seq.current) return; // a newer change took over
      void v.play().catch(() => {});
      setShown(next);
    };
    v.addEventListener("canplay", onReady, { once: true });
    return () => v.removeEventListener("canplay", onReady);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, films, live]);

  // A film that has faded out stops
  const onFaded = (i: 0 | 1) => (e: TransitionEvent<HTMLVideoElement>) => {
    if (e.propertyName === "opacity" && shownRef.current !== i) els[i].current?.pause();
  };

  return (
    <div ref={boxRef} aria-hidden="true" className="pointer-events-none absolute inset-0 isolate overflow-hidden">
      {seen.map((id) => (
        <img
          key={id}
          src={`${media}${VIDEOS[id].poster}`}
          alt=""
          decoding="async"
          className={`absolute inset-0 size-full object-cover ${FADE} motion-reduce:transition-none ${
            id === activeId ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
          }`}
        />
      ))}
      {films &&
        ([0, 1] as const).map((i) => (
          <video
            key={i}
            ref={els[i]}
            muted
            loop
            playsInline
            preload="none"
            onTransitionEnd={onFaded(i)}
            className={`absolute inset-0 size-full object-cover ${FADE} ${
              shown === i ? "z-2 scale-100 opacity-100" : "z-1 scale-[1.04] opacity-0"
            }`}
          />
        ))}
    </div>
  );
}
