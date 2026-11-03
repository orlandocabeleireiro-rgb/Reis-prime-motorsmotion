"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Anima os descendentes com [data-reveal] quando a secção entra no ecrã (GSAP + ScrollTrigger).
 * data-reveal="fade" | "up" (por omissão) | "line" (linha que cresce) | "words" (título palavra a palavra)
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  id,
  stagger = 0.08,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  id?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const words = root.querySelectorAll<HTMLElement>("[data-reveal='words'] .w > span");
      if (words.length) {
        gsap.from(words, {
          yPercent: 110,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.05,
          scrollTrigger: { trigger: root, start: "top 78%" },
        });
      }
      const ups = root.querySelectorAll<HTMLElement>("[data-reveal='up'], [data-reveal='']");
      if (ups.length) {
        gsap.from(ups, {
          y: 60,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger,
          scrollTrigger: { trigger: root, start: "top 75%" },
        });
      }
      const fades = root.querySelectorAll<HTMLElement>("[data-reveal='fade']");
      if (fades.length) {
        gsap.from(fades, { opacity: 0, duration: 1.4, ease: "power2.out", stagger, scrollTrigger: { trigger: root, start: "top 75%" } });
      }
      root.querySelectorAll<HTMLElement>("[data-reveal='line']").forEach((el) => {
        gsap.from(el, { scaleX: 0, transformOrigin: "left center", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 90%" } });
      });
    }, root);
    return () => ctx.revert();
  }, [stagger]);

  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}

/** Título dividido em palavras (para data-reveal="words"). */
export function SplitWords({ text, className }: { text: string; className?: string }) {
  return (
    <span data-reveal="words">
      {text.split(" ").map((w, i) => (
        <span key={i} className="w inline-block overflow-hidden pb-[0.08em] align-top">
          {/* a classe (ex.: text-metal) vai para a palavra em si: background-clip:text não atravessa filhos transformados */}
          <span className={`inline-block ${className ?? ""}`}>{w}</span>
          {"\u00a0"}
        </span>
      ))}
    </span>
  );
}
