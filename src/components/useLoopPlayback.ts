import { useCallback, useEffect, useRef } from "react";
import { canPlayBackgroundVideo } from "../lib/videoPolicy";

/** Plays a set of decorative loops only while they are on screen, at most
    `max` at once: the one the visitor points at or focuses comes first,
    otherwise the first ones in view. One IntersectionObserver watches them
    all. Where background video is off (small screens, slow connections,
    reduced motion) nothing plays and nothing is fetched (preload="none"), so
    the posters stand in. A hidden tab pauses everything. */
export default function useLoopPlayback(max = 2) {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const inView = useRef(new Set<number>());
  const active = useRef<number | null>(null);
  const enabled = useRef(false);

  const sync = useCallback(() => {
    if (!enabled.current) return;
    const play =
      active.current !== null && inView.current.has(active.current)
        ? [active.current]
        : [...inView.current].sort((a, b) => a - b).slice(0, max);
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (!document.hidden && play.includes(i)) void video.play().catch(() => {});
      else video.pause();
    });
  }, [max]);

  useEffect(() => {
    enabled.current = canPlayBackgroundVideo();
    if (!enabled.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = videos.current.indexOf(entry.target as HTMLVideoElement);
          if (i < 0) continue;
          if (entry.isIntersecting) inView.current.add(i);
          else inView.current.delete(i);
        }
        sync();
      },
      { threshold: 0.25 },
    );
    for (const video of videos.current) if (video) io.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      for (const video of videos.current) video?.pause();
    };
  }, [sync]);

  return {
    /** Ref setter for loop `i` */
    loop: (i: number) => (el: HTMLVideoElement | null) => {
      videos.current[i] = el;
    },
    /** The card the visitor points at or focuses (null when none) */
    setActive: (i: number | null) => {
      active.current = i;
      sync();
    },
  };
}
