// Hero frame sequence — pipeline shape only. Animation wired later.
export const FRAME_COUNT = 1; // bump when frames are added under public/frames/hero/
export const frameUrl = (i: number) =>
  `/frames/hero/frame_${String(i + 1).padStart(4, "0")}.webp`;
