import { useEffect, useState } from "react";

export type ViewportMode = "horizontal" | "vertical";

// Horizontal mode requires fine pointer + landscape + width >= 1024.
const QUERY = "(min-width: 1024px) and (pointer: fine) and (orientation: landscape)";

export function useViewportMode(): ViewportMode {
  const [mode, setMode] = useState<ViewportMode>("vertical");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(QUERY);
    const apply = () => setMode(mql.matches ? "horizontal" : "vertical");
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return mode;
}
