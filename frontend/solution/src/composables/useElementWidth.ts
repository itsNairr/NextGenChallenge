"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

// Describe the composable result.
export interface UseElementWidthResult<T extends HTMLElement> {
  readonly ref: RefObject<T | null>;
  readonly width: number;
}

// Measure an element so the chart can draw at real pixel sizes.
// The fallback width keeps server rendering and the first paint stable.
export function useElementWidth<T extends HTMLElement>(
  fallbackWidth: number
): UseElementWidthResult<T> {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number>(fallbackWidth);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width ?? 0;
      if (measured > 0) {
        setWidth(Math.round(measured));
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
