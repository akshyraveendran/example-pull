import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { indexFromProgress } from "@/utils/scrollMath";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Args {
  enabled: boolean;
  pinRef: React.RefObject<HTMLDivElement | null>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  sectionCount: number;
}

interface Api {
  progress: number;
  activeIndex: number;
  scrollToIndex: (i: number) => void;
}

export function useHorizontalScroll({ enabled, pinRef, trackRef, sectionCount }: Args): Api {
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tickerCb = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - window.innerWidth;

      tweenRef.current = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          pin: true,
          scrub: 0.5,
          start: "top top",
          end: () => `+=${distance()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setProgress(self.progress);
            setActiveIndex((prev) => {
              const next = indexFromProgress(self.progress, sectionCount);
              return next === prev ? prev : next;
            });
          },
        },
      });
      stRef.current = tweenRef.current.scrollTrigger ?? null;
    }, pin);

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const ro = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
    });
    ro.observe(pin);

    const onVis = () => {
      if (document.hidden) lenis.stop();
      else lenis.start();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      gsap.ticker.remove(tickerCb);
      ctx.revert();
      lenis.destroy();
      lenisRef.current = null;
      stRef.current = null;
      tweenRef.current = null;
    };
  }, [enabled, pinRef, trackRef, sectionCount]);

  const scrollToIndex = useCallback(
    (i: number) => {
      const st = stRef.current;
      const lenis = lenisRef.current;
      if (!st || !lenis) return;
      const clamped = Math.max(0, Math.min(sectionCount - 1, i));
      const ratio = sectionCount > 1 ? clamped / (sectionCount - 1) : 0;
      const target = st.start + (st.end - st.start) * ratio;
      lenis.scrollTo(target, { duration: 1.2 });
    },
    [sectionCount],
  );

  return { progress, activeIndex, scrollToIndex };
}
