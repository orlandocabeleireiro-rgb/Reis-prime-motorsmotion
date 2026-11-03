"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Faixa de texto gigante (contorno prateado) que desliza com o scroll. */
export function ScrollMarquee({ words }: { words: string[] }) {
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const st = { trigger: rowA.current!.parentElement!, start: "top bottom", end: "bottom top", scrub: 0.6 };
      gsap.fromTo(rowA.current, { xPercent: 0 }, { xPercent: -25, ease: "none", scrollTrigger: st });
      gsap.fromTo(rowB.current, { xPercent: -25 }, { xPercent: 0, ease: "none", scrollTrigger: st });
    });
    return () => ctx.revert();
  }, []);

  const line = [...words, ...words, ...words];
  return (
    <div aria-hidden="true" className="pointer-events-none flex flex-col gap-2 select-none">
      <div ref={rowA} className="flex gap-10 whitespace-nowrap will-change-transform">
        {line.map((w, i) => (
          <span
            key={i}
            className="font-display text-[clamp(3rem,10vw,9rem)] leading-none font-extrabold tracking-[-0.03em] text-transparent uppercase"
            style={{ WebkitTextStroke: "1px rgba(217,220,224,0.28)" }}
          >
            {w} <span className="text-silver-dark/40">·</span>
          </span>
        ))}
      </div>
      <div ref={rowB} className="flex gap-10 whitespace-nowrap will-change-transform">
        {line.map((w, i) => (
          <span
            key={i}
            className={`font-display text-[clamp(3rem,10vw,9rem)] leading-none font-extrabold tracking-[-0.03em] uppercase ${i % 2 ? "text-metal-static" : "text-transparent"}`}
            style={i % 2 ? undefined : { WebkitTextStroke: "1px rgba(217,220,224,0.18)" }}
          >
            {w} <span className="text-silver-dark/40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
