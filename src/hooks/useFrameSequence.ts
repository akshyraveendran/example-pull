import { useEffect, useRef, useState } from "react";
import { FRAME_COUNT, frameUrl } from "@/utils/frames";

// Stub — preload pipeline ready, animation wired later.
export function useFrameSequence(enabled: boolean) {
  const framesRef = useRef<HTMLImageElement[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const img = new Image();
    img.src = frameUrl(0);
    img.onload = () => {
      if (cancelled) return;
      framesRef.current[0] = img;
      setReady(true);
    };
    return () => {
      cancelled = true;
      framesRef.current = [];
    };
  }, [enabled]);

  return {
    ready,
    getFrame: (i: number) => framesRef.current[Math.min(i, FRAME_COUNT - 1)] ?? null,
  };
}
