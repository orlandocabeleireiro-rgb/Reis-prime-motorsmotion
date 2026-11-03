"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { pointer, startPointerTracking } from "@/lib/pointer";

/** Brilho de luz suave que segue o cursor (só com rato; desativado com "reduzir movimento"). */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    startPointerTracking();
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    const tick = (_t: number, dt: number) => {
      if (pointer.source !== "mouse") return;
      const k = 1 - Math.pow(1 - 0.16, Math.min(dt, 64) / 16.67);
      x += (pointer.x - x) * k;
      y += (pointer.y - y) * k;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (el.dataset.on !== "true") el.dataset.on = "true";
    };
    const hide = () => (el.dataset.on = "false");
    document.addEventListener("mouseleave", hide);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      document.removeEventListener("mouseleave", hide);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
