"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BRANDS } from "@/data/brands";
import type { BrandId } from "@/types/car";
import { BrandMark } from "@/components/ui/BrandMark";
import { BRAND_ICON_PATHS } from "@/data/brand-icons";

/**
 * Barra de marcas: scroll lateral (roda, toque ou arrastar com o rato),
 * logótipos monocromáticos e contagem de viaturas por marca.
 */
export function BrandBar({
  selected,
  counts,
  onSelect,
}: {
  selected: BrandId | null;
  counts: Record<string, number>;
  onSelect: (b: BrandId | null) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, x: 0, left: 0, lastX: 0, lastT: 0, v: 0 });
  const inertia = useRef(0);

  // arrastar com o rato e soltar com inércia (desacelera suavemente)
  const startInertia = (v: number) => {
    cancelAnimationFrame(inertia.current);
    const el = scroller.current;
    if (!el || Math.abs(v) < 0.05) return;
    let vel = v; // px por ms
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      el.scrollLeft -= vel * dt;
      vel *= Math.pow(0.94, dt / 16.67);
      const atEdge = el.scrollLeft <= 0 || el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      if (Math.abs(vel) > 0.02 && !atEdge) inertia.current = requestAnimationFrame(step);
      else el.style.scrollSnapType = "";
    };
    el.style.scrollSnapType = "none";
    inertia.current = requestAnimationFrame(step);
  };
  const [edges, setEdges] = useState({ start: false, end: true });

  const updateEdges = () => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, []);

  // trazer a marca selecionada para a vista (só scroll horizontal da barra, nunca da página)
  useEffect(() => {
    const bar = scroller.current;
    const el = bar?.querySelector<HTMLElement>(`[data-brand="${selected ?? "all"}"]`);
    if (!bar || !el) return;
    const left = el.offsetLeft - bar.clientWidth / 2 + el.clientWidth / 2;
    bar.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [selected]);

  const items: { id: BrandId | null; name: string }[] = [{ id: null, name: "Todas" }, ...BRANDS];

  return (
    <div className="relative">
      <div
        ref={scroller}
        data-lenis-prevent-wheel=""
        onScroll={updateEdges}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") return;
          cancelAnimationFrame(inertia.current);
          const now = performance.now();
          drag.current = { active: true, moved: false, x: e.clientX, left: scroller.current!.scrollLeft, lastX: e.clientX, lastT: now, v: 0 };
          scroller.current!.style.scrollSnapType = "none";
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.active) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4) d.moved = true;
          scroller.current!.scrollLeft = d.left - dx;
          const now = performance.now();
          const dt = Math.max(1, now - d.lastT);
          d.v = d.v * 0.6 + ((e.clientX - d.lastX) / dt) * 0.4;
          d.lastX = e.clientX;
          d.lastT = now;
        }}
        onPointerUp={() => {
          const d = drag.current;
          if (!d.active) return;
          d.active = false;
          if (d.moved) startInertia(d.v);
          else scroller.current!.style.scrollSnapType = "";
        }}
        onPointerLeave={() => {
          const d = drag.current;
          if (!d.active) return;
          d.active = false;
          startInertia(d.v);
        }}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = false;
          }
        }}
        className="no-scrollbar relative flex cursor-grab touch-pan-x snap-x scroll-px-5 gap-1 overflow-x-auto px-5 md:scroll-px-10 select-none active:cursor-grabbing md:px-10"
        style={{
          maskImage: `linear-gradient(90deg, ${edges.start ? "transparent" : "#000"}, #000 6%, #000 94%, ${edges.end ? "transparent" : "#000"})`,
        }}
        role="toolbar"
        aria-label="Filtrar por marca"
      >
        {items.map((b) => {
          const active = selected === b.id;
          const count = counts[b.id ?? "all"] ?? 0;
          const disabled = count === 0 && !active;
          return (
            <button
              key={b.id ?? "all"}
              type="button"
              data-brand={b.id ?? "all"}
              aria-pressed={active}
              disabled={disabled}
              aria-label={`${b.name} (${count} ${count === 1 ? "viatura" : "viaturas"})`}
              onClick={() => onSelect(active && b.id ? null : b.id)}
              className={`group relative flex h-[4.5rem] min-w-[5.5rem] shrink-0 snap-start flex-col items-center justify-center gap-1.5 rounded-xl px-3 transition-colors duration-300 ${
                active ? "text-paper" : disabled ? "cursor-not-allowed text-paper/25" : "text-paper/55 hover:text-paper"
              }`}
            >
              <span
                className={`relative grid h-7 place-items-center transition-[filter,transform] duration-500 ${
                  active
                    ? "scale-110 drop-shadow-[0_0_10px_rgba(217,220,224,0.65)]"
                    : "group-hover:drop-shadow-[0_0_8px_rgba(217,220,224,0.45)]"
                }`}
              >
                {b.id ? (
                  <BrandMark id={b.id} name={b.name} className="size-6" />
                ) : (
                  <span className="font-display text-[0.65rem] font-semibold tracking-[0.18em] uppercase">Todas</span>
                )}
              </span>
              <span className="flex items-center gap-1 text-[0.62rem] tracking-[0.12em] whitespace-nowrap uppercase">
                {b.id && BRAND_ICON_PATHS[b.id] && <span className="hidden sm:inline">{b.name}</span>}
                <span className="tabular-nums opacity-60">{count}</span>
              </span>
              {active && (
                <motion.span
                  layoutId="brand-indicator"
                  className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-silver-dark via-white to-silver-dark shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
