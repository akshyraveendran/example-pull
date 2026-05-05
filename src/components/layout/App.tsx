import { useEffect, useRef } from "react";
import { FixedNavbar } from "@/components/layout/FixedNavbar";
import { SECTIONS, SECTION_COUNT } from "@/utils/sections";
import { useViewportMode } from "@/hooks/useViewportMode";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";

export function App() {
  const mode = useViewportMode();
  return mode === "horizontal" ? <HorizontalApp /> : <VerticalApp />;
}

function HorizontalApp() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const { progress, activeIndex, scrollToIndex } = useHorizontalScroll({
    enabled: true,
    pinRef,
    trackRef,
    sectionCount: SECTION_COUNT,
  });

  // Body scroll lock would break the spacer height — body scroll IS the input.
  // Just kill horizontal overflow.
  useEffect(() => {
    const prev = document.body.style.overflowX;
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = prev;
    };
  }, []);

  return (
    <>
      <FixedNavbar activeIndex={activeIndex} onJump={scrollToIndex} />
      <div
        ref={pinRef}
        className="relative h-screen w-screen overflow-hidden bg-background"
      >
        <div
          ref={trackRef}
          className="flex h-full flex-nowrap will-change-transform"
          style={{ width: `${SECTION_COUNT * 100}vw` }}
        >
          {SECTIONS.map((s, i) => {
            const Comp = s.Component;
            const localProgress = Math.max(
              0,
              Math.min(1, progress * (SECTION_COUNT - 1) - i + 0.5),
            );
            return (
              <Comp key={s.id} progress={localProgress} active={i === activeIndex} />
            );
          })}
        </div>
      </div>
    </>
  );
}

function VerticalApp() {
  return (
    <>
      <FixedNavbar activeIndex={0} onJump={() => {}} />
      <main className="flex flex-col">
        {SECTIONS.map((s) => {
          const Comp = s.Component;
          return (
            <div key={s.id} className="min-h-screen w-screen">
              <Comp progress={0} active={true} />
            </div>
          );
        })}
      </main>
    </>
  );
}
