"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Entrada ligada ao scroll (scrub): o elemento sobe, endireita-se em 3D e ganha opacidade
 * à medida que entra no ecrã — e faz o inverso ao voltar para cima.
 * `stagger` (0–0.5) atrasa a entrada (ex.: colunas da grelha).
 */
export function ScrollIn({ children, stagger = 0, className }: { children: ReactNode; stagger?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 102%", "start 58%"] });
  const p = useTransform(scrollYProgress, [stagger, 1], [0, 1], { clamp: true });
  const y = useTransform(p, [0, 1], [140, 0]);
  const rotateX = useTransform(p, [0, 1], [24, 0]);
  const scale = useTransform(p, [0, 1], [0.88, 1]);
  const opacity = useTransform(p, [0, 0.55], [0, 1]);

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} className={className} style={{ y, rotateX, scale, opacity, transformPerspective: 1200, transformOrigin: "50% 0%" }}>
      {children}
    </motion.div>
  );
}
