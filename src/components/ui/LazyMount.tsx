"use client";

import { startTransition, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Só monta `children` quando o bloco se aproxima do ecrã (rootMargin), em render
 * concorrente (startTransition) para não bloquear a thread principal durante a intro.
 */
export function LazyMount({ children, fallback, rootMargin = "200% 0px" }: { children: ReactNode; fallback: ReactNode; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          startTransition(() => setShow(true));
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{show ? children : fallback}</div>;
}
