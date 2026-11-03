import { useEffect, useRef, useState } from "react";
import { CONTACT_VIDEO, EMAIL } from "../data/facts";
import { canPlayBackgroundVideo } from "../lib/videoPolicy";
import Eyebrow from "./Eyebrow";

const pill =
  "btn-ring inline-flex min-h-12 items-center rounded-xs border border-white px-8 text-xs font-semibold tracking-widest transition-colors duration-300";

/* Dark closing band: "Sourcing from Bangladesh?" with the two pill buttons.
   The fabric still is the background; on a wide, willing screen a film fades
   in over it once the band scrolls into view. */
export default function ContactCta({ id }: { id?: string }) {
  // The film is heavy, so it is opt-in: only wide screens that are not on a
  // metered or slow connection and have not asked for less motion load it.
  // Everywhere else the still is the background, which costs nothing extra.
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => setShowVideo(canPlayBackgroundVideo()), []);

  // This band closes the page, so the file is only fetched once it comes into
  // view, and playback stops again when it leaves.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // preload="none", so the first approach is what starts the download
          if (!video.currentSrc) video.load();
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [showVideo]);

  return (
    <section id={id} className="relative flex min-h-svh items-center overflow-hidden text-white bg-(--ink) [--ring:#fff]">
      {/* The section is already full-bleed, so inset-0 is the full screen
          width: w-full matches it exactly, where 100vw would overshoot by the
          scrollbar. The band fills the screen height (min-h-svh), so object-cover
          crops a 16:9 frame far less than a wide strip did (only the sides on a phone); centring keeps the subject. */}
      <img
        src={`/media/${CONTACT_VIDEO.poster}`}
        alt=""
        className="absolute inset-0 size-full object-cover object-center"
      />
      {showVideo && (
        <video
          ref={videoRef}
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-center opacity-0 transition-opacity duration-700 data-ready:opacity-100 motion-reduce:transition-none"
          muted
          loop
          playsInline
          preload="none"
          poster={`/media/${CONTACT_VIDEO.poster}`}
          onPlaying={(e) => e.currentTarget.setAttribute("data-ready", "")}
        >
          <source src={CONTACT_VIDEO.src} type="video/mp4" />
        </video>
      )}
      {/* A lighter wash so the fabric shows, and a scrim that stays dark behind the copy */}
      <div aria-hidden="true" className="absolute inset-0 bg-[rgba(10,14,18,0.55)]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_50%,rgba(10,14,18,0.6)_0%,rgba(10,14,18,0.3)_65%,transparent_100%)]"
      />
      <div data-reveal className="wrap relative z-1 flex w-full flex-col items-center justify-center section-y text-center">
         <Eyebrow className="text-white!">WORK WITH US</Eyebrow>
        <h2 className="mt-head-eyebrow text-balance font-['Fira_Sans_Condensed'] text-statement font-black tracking-widest [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
          Sourcing from
          <br />
          Bangladesh?
        </h2>
        <p className="mt-head-intro max-w-[60ch] text-pretty text-intro text-[#d9dadb] [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
          One partner from yarn to vessel. Tell us what you make
          <br className="hidden sm:inline" /> and we will tell you where it fits.
        </p>
        <div className="mt-cta flex flex-wrap justify-center gap-3">
          <a className={`${pill} bg-white text-(--ink) hover:bg-transparent hover:text-white`} href={`mailto:${EMAIL.sales}`}>
            TALK TO SALES
          </a>
          <a className={`${pill} bg-black text-white hover:bg-white hover:text-(--ink)`} href={`mailto:${EMAIL.careers}`}>
            CAREERS
          </a>
        </div>
      </div>
    </section>
  );
}
