import { useEffect, useRef } from "react";
import { FRAME_COUNT } from "@/utils/frames";

interface Props {
  progress: number;
  ready: boolean;
  getFrame: (i: number) => HTMLImageElement | null;
}

// Canvas-backed frame container. Currently draws frame 0 only.
// When the frame sequence is populated, animation logic attaches here.
export function HeroFrameCanvas({ progress, ready, getFrame }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Resize canvas to container * DPR (capped 2).
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Draw current frame whenever progress or readiness changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const idx = Math.min(FRAME_COUNT - 1, Math.floor(progress * (FRAME_COUNT - 1)));
    const img = getFrame(idx);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (img) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [progress, ready, getFrame]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
