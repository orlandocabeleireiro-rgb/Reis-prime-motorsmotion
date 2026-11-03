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
  stagger = 0.1,
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
          rotateX: -50,
          transformOrigin: "50% 100%",
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.05,
          scrollTrigger: { trigger: root, start: "top 78%" },
        });
      }
      // entradas ligadas ao scroll (scrub): sobem, endireitam-se em 3D e ganham opacidade;
      // ao voltar para cima fazem o inverso. Elementos seguidos entram ligeiramente desfasados.
      root.querySelectorAll<HTMLElement>("[data-reveal='up'], [data-reveal='']").forEach((el, i) => {
        const lag = (i % 3) * 5;
        gsap.fromTo(
          el,
          { y: 110, rotateX: 18, scale: 0.94, opacity: 0, transformPerspective: 1100, transformOrigin: "50% 0%" },
          {
            y: 0,
            rotateX: 0,
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: `top ${100 + lag}%`, end: `top ${66 - lag}%`, scrub: 0.6 },
          },
        );
      });
      // parallax: elementos com data-speed deslocam-se a velocidades diferentes
      root.querySelectorAll<HTMLElement>("[data-speed]").forEach((el) => {
        const speed = Number(el.dataset.speed) || 0;
        gsap.fromTo(
          el,
          { yPercent: speed * 12 },
          { yPercent: -speed * 12, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
      const fades = root.querySelectorAll<HTMLElement>("[data-reveal='fade']");
      if (fades.length) {
        gsap.from(fades, { opacity: 0, duration: 1.4, ease: "power2.out", stagger, scrollTrigger: { trigger: root, start: "top 75%" } });
      }
      root.querySelectorAll<HTMLElement>("[data-reveal='line']").forEach((el) => {
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 55%", scrub: true } });
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
