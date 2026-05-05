export const trackWidthPx = (vw: number, count: number) => vw * count;
export const maxXPx = (vw: number, count: number) => -(trackWidthPx(vw, count) - vw);
export const xForIndex = (vw: number, index: number) => -index * vw;
export const pageHeightPx = (vw: number, count: number, vh: number) =>
  vh + (trackWidthPx(vw, count) - vw); // vh of pin + horizontal travel distance
export const indexFromProgress = (p: number, count: number) =>
  Math.min(count - 1, Math.max(0, Math.round(p * (count - 1))));
