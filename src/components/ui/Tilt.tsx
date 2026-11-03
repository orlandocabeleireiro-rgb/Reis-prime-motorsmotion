"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Inclinação 3D com o rato + reflexo de luz que segue o cursor.
 * Só com rato (em toque não faz nada) e desligado com "reduzir movimento".
 */
export function Tilt({ children, className = "", max = 7, radius = "1.25rem" }: { children: ReactNode; className?: string; max?: number; radius?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rx = useSpring(0, spring);
  const ry = useSpring(0, spring);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useSpring(0, { stiffness: 200, damping: 30 });
  const background = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.16), rgba(217,220,224,0.05) 30%, transparent 55%)`;

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000, transformStyle: "preserve-3d" }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * max * 2);
        rx.set((0.5 - py) * max * 2);
        gx.set(px * 100);
        gy.set(py * 100);
        glare.set(1);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
        glare.set(0);
      }}
    >
      {children}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] mix-blend-screen"
        style={{ background, opacity: glare, borderRadius: radius }}
      />
    </motion.div>
  );
}
